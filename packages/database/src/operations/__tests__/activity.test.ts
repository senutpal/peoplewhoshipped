/**
 * Tests for activity database operations.
 *
 * @group unit
 * @group database
 *
 * Test Coverage:
 * - addActivities: insertion, upserts, batch processing, text merging
 * - upsertActivityDefinitions: creation and updates
 * - getActivitiesByDefinitions: filtering by type
 *
 * @module @leaderboard/database/operations/__tests__/activity
 */

import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { PGlite } from "@electric-sql/pglite";
import {
  createTestDatabase,
  seedTestData,
  seedDefaultDefinitions,
} from "../../__tests__/utils/test-db";

// =============================================================================
// Test Setup
// =============================================================================

/**
 * Note: These tests directly use the test database utilities instead of
 * the module functions because the module uses a singleton. For unit tests,
 * we need isolated databases per test.
 */

let db: PGlite;

beforeEach(async () => {
  db = await createTestDatabase();
  await seedDefaultDefinitions(db);
  await seedTestData(db, {
    contributors: [
      { username: "alice" },
      { username: "bob" },
    ],
  });
});

afterEach(async () => {
  await db.close();
});

// =============================================================================
// Activity Insertion Tests
// =============================================================================

describe("Activity Operations", () => {
  describe("addActivities (via direct SQL for isolation)", () => {
    /**
     * Test: Inserts new activities
     */
    it("should insert new activities", async () => {
      const activity = {
        slug: "test-pr-1",
        contributor: "alice",
        activity_definition: "pr-merged",
        title: "Add new feature",
        occured_at: new Date("2024-01-15T12:00:00Z"),
        link: "https://github.com/org/repo/pull/1",
        text: null,
        points: 15,
        meta: null,
      };

      await db.query(
        `INSERT INTO activity (slug, contributor, activity_definition, title, occured_at, link, text, points, meta)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          activity.slug,
          activity.contributor,
          activity.activity_definition,
          activity.title,
          activity.occured_at.toISOString(),
          activity.link,
          activity.text,
          activity.points,
          activity.meta,
        ]
      );

      const result = await db.query<{ slug: string; title: string }>(
        "SELECT slug, title FROM activity WHERE slug = $1",
        [activity.slug]
      );

      expect(result.rows.length).toBe(1);
      expect(result.rows[0]?.title).toBe("Add new feature");
    });

    /**
     * Test: Upserts existing activities (updates on conflict)
     */
    it("should update existing activity on conflict", async () => {
      // Insert first version
      await db.query(
        `INSERT INTO activity (slug, contributor, activity_definition, title, occured_at, link, text, points, meta)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        ["test-pr-1", "alice", "pr-merged", "Original title", new Date().toISOString(), null, null, 10, null]
      );

      // Upsert with new values
      await db.query(
        `INSERT INTO activity (slug, contributor, activity_definition, title, occured_at, link, text, points, meta)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (slug) DO UPDATE SET 
           title = EXCLUDED.title,
           points = EXCLUDED.points`,
        ["test-pr-1", "alice", "pr-merged", "Updated title", new Date().toISOString(), null, null, 15, null]
      );

      const result = await db.query<{ title: string; points: number }>(
        "SELECT title, points FROM activity WHERE slug = $1",
        ["test-pr-1"]
      );

      expect(result.rows[0]?.title).toBe("Updated title");
      expect(result.rows[0]?.points).toBe(15);
    });

    /**
     * Test: Handles batch insertion of multiple activities
     */
    it("should handle batch insertion of multiple activities", async () => {
      const activities = Array.from({ length: 10 }, (_, i) => ({
        slug: `batch-activity-${i}`,
        contributor: "alice",
        activity_definition: "commit",
        title: `Commit ${i}`,
        occured_at: new Date(),
      }));

      for (const a of activities) {
        await db.query(
          `INSERT INTO activity (slug, contributor, activity_definition, title, occured_at)
           VALUES ($1, $2, $3, $4, $5)`,
          [a.slug, a.contributor, a.activity_definition, a.title, a.occured_at.toISOString()]
        );
      }

      const result = await db.query<{ count: string }>(
        "SELECT COUNT(*) as count FROM activity WHERE slug LIKE 'batch-activity-%'"
      );

      expect(parseInt(result.rows[0]?.count ?? "0")).toBe(10);
    });

    /**
     * Test: Text merging for EOD updates
     */
    it("should support text merging on conflict", async () => {
      // First EOD message
      await db.query(
        `INSERT INTO activity (slug, contributor, activity_definition, title, occured_at, text)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        ["eod-alice-20240115", "alice", "eod-update", "EOD Update", "2024-01-15T17:00:00Z", "Morning: Fixed bug"]
      );

      // Merge with second message
      await db.query(
        `INSERT INTO activity (slug, contributor, activity_definition, title, occured_at, text)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (slug) DO UPDATE SET 
           text = CASE 
             WHEN activity.text IS NULL THEN EXCLUDED.text
             WHEN EXCLUDED.text IS NULL THEN activity.text
             WHEN activity.text = EXCLUDED.text THEN activity.text
             ELSE activity.text || E'\n\n' || EXCLUDED.text
           END`,
        ["eod-alice-20240115", "alice", "eod-update", "EOD Update", "2024-01-15T18:00:00Z", "Afternoon: Code review"]
      );

      const result = await db.query<{ text: string }>(
        "SELECT text FROM activity WHERE slug = $1",
        ["eod-alice-20240115"]
      );

      expect(result.rows[0]?.text).toContain("Morning: Fixed bug");
      expect(result.rows[0]?.text).toContain("Afternoon: Code review");
    });
  });
});

// =============================================================================
// Activity Definition Tests
// =============================================================================

describe("Activity Definition Operations", () => {
  /**
   * Test: Inserts new activity definitions
   */
  it("should insert new activity definitions", async () => {
    await db.query(
      `INSERT INTO activity_definition (slug, name, description, points, icon)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (slug) DO UPDATE SET 
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         points = EXCLUDED.points,
         icon = EXCLUDED.icon`,
      ["custom-activity", "Custom Activity", "A custom activity type", 20, "🎯"]
    );

    const result = await db.query<{ slug: string; name: string; points: number }>(
      "SELECT slug, name, points FROM activity_definition WHERE slug = $1",
      ["custom-activity"]
    );

    expect(result.rows[0]?.name).toBe("Custom Activity");
    expect(result.rows[0]?.points).toBe(20);
  });

  /**
   * Test: Updates existing activity definitions
   */
  it("should update existing activity definitions", async () => {
    // Default definitions were seeded, update one
    await db.query(
      `UPDATE activity_definition SET points = $1, description = $2 WHERE slug = $3`,
      [25, "Updated description", "pr-merged"]
    );

    const result = await db.query<{ points: number; description: string }>(
      "SELECT points, description FROM activity_definition WHERE slug = $1",
      ["pr-merged"]
    );

    expect(result.rows[0]?.points).toBe(25);
    expect(result.rows[0]?.description).toBe("Updated description");
  });
});

// =============================================================================
// Activity Query Tests
// =============================================================================

describe("Activity Query Operations", () => {
  beforeEach(async () => {
    // Seed some activities for query tests
    await seedTestData(db, {
      activities: [
        {
          slug: "pr-1",
          contributor: "alice",
          activity_definition: "pr-merged",
          title: "PR 1",
          occured_at: new Date("2024-01-15"),
          points: 15,
        },
        {
          slug: "pr-2",
          contributor: "bob",
          activity_definition: "pr-opened",
          title: "PR 2",
          occured_at: new Date("2024-01-15"),
          points: 10,
        },
        {
          slug: "commit-1",
          contributor: "alice",
          activity_definition: "commit",
          title: "Commit 1",
          occured_at: new Date("2024-01-15"),
          points: 2,
        },
      ],
    });
  });

  /**
   * Test: Filters activities by definition type
   */
  it("should filter activities by definition type", async () => {
    const definitions = ["pr-merged", "pr-opened"];
    const placeholders = definitions.map((_, i) => `$${i + 1}`).join(", ");

    const result = await db.query<{ slug: string; activity_definition: string }>(
      `SELECT slug, activity_definition FROM activity WHERE activity_definition IN (${placeholders})`,
      definitions
    );

    expect(result.rows.length).toBe(2);
    expect(result.rows.every(r => ["pr-merged", "pr-opened"].includes(r.activity_definition))).toBe(true);
  });

  /**
   * Test: Returns empty array when no matching definitions
   */
  it("should return empty array when no matching definitions", async () => {
    const result = await db.query<{ slug: string }>(
      "SELECT slug FROM activity WHERE activity_definition = $1",
      ["nonexistent"]
    );

    expect(result.rows.length).toBe(0);
  });

  /**
   * Test: Calculates total points per contributor
   */
  it("should calculate total points per contributor", async () => {
    const result = await db.query<{ contributor: string; total_points: string }>(
      `SELECT contributor, SUM(points) as total_points 
       FROM activity 
       GROUP BY contributor 
       ORDER BY total_points DESC`
    );

    expect(result.rows[0]?.contributor).toBe("alice");
    expect(parseInt(result.rows[0]?.total_points ?? "0")).toBe(17); // 15 + 2
    expect(result.rows[1]?.contributor).toBe("bob");
    expect(parseInt(result.rows[1]?.total_points ?? "0")).toBe(10);
  });
});
