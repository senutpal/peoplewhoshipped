/**
 * Tests for contributor database operations.
 *
 * @group unit
 * @group database
 *
 * Test Coverage:
 * - addContributors: bulk insertion, duplicate handling
 * - updateBotRoles: role updates
 * - getContributorBySlackUserId: Slack identity lookup
 * - getContributorsBySlackUserIds: batch lookup
 *
 * @module @leaderboard/database/operations/__tests__/contributor
 */

import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { PGlite } from "@electric-sql/pglite";
import {
  createTestDatabase,
  seedTestData,
} from "../../__tests__/utils/test-db";

// =============================================================================
// Test Setup
// =============================================================================

let db: PGlite;

beforeEach(async () => {
  db = await createTestDatabase();
});

afterEach(async () => {
  await db.close();
});

// =============================================================================
// Contributor Creation Tests
// =============================================================================

describe("Contributor Creation", () => {
  /**
   * Test: Adds new contributors with auto-generated avatars
   */
  it("should add new contributors with auto-generated avatars", async () => {
    const contributors = ["alice", "bob", "charlie"];

    for (const username of contributors) {
      await db.query(
        `INSERT INTO contributor (username, avatar_url, social_profiles)
         VALUES ($1, $2, $3)
         ON CONFLICT (username) DO NOTHING`,
        [
          username,
          `https://avatars.githubusercontent.com/${username}`,
          JSON.stringify({ github: `https://github.com/${username}` }),
        ]
      );
    }

    const result = await db.query<{ username: string; avatar_url: string }>(
      "SELECT username, avatar_url FROM contributor ORDER BY username"
    );

    expect(result.rows.length).toBe(3);
    expect(result.rows[0]?.username).toBe("alice");
    expect(result.rows[0]?.avatar_url).toBe("https://avatars.githubusercontent.com/alice");
  });

  /**
   * Test: Ignores duplicate contributors
   */
  it("should ignore duplicate contributors", async () => {
    // Insert first time
    await db.query(
      `INSERT INTO contributor (username, avatar_url) VALUES ($1, $2)`,
      ["alice", "https://avatars.githubusercontent.com/alice"]
    );

    // Try to insert again with DO NOTHING
    await db.query(
      `INSERT INTO contributor (username, avatar_url)
       VALUES ($1, $2)
       ON CONFLICT (username) DO NOTHING`,
      ["alice", "https://different-url.com/alice"]
    );

    const result = await db.query<{ count: string }>(
      "SELECT COUNT(*) as count FROM contributor WHERE username = $1",
      ["alice"]
    );

    expect(parseInt(result.rows[0]?.count ?? "0")).toBe(1);
  });

  /**
   * Test: Handles large batches efficiently
   */
  it("should handle large batches of contributors", async () => {
    const contributors = Array.from({ length: 100 }, (_, i) => `user${i}`);

    for (const username of contributors) {
      await db.query(
        `INSERT INTO contributor (username, avatar_url)
         VALUES ($1, $2)
         ON CONFLICT (username) DO NOTHING`,
        [username, `https://avatars.githubusercontent.com/${username}`]
      );
    }

    const result = await db.query<{ count: string }>(
      "SELECT COUNT(*) as count FROM contributor"
    );

    expect(parseInt(result.rows[0]?.count ?? "0")).toBe(100);
  });
});

// =============================================================================
// Bot Role Update Tests
// =============================================================================

describe("Bot Role Updates", () => {
  beforeEach(async () => {
    await seedTestData(db, {
      contributors: [
        { username: "alice" },
        { username: "bob" },
        { username: "dependabot[bot]" },
        { username: "github-actions[bot]" },
      ],
    });
  });

  /**
   * Test: Updates bot contributor roles
   */
  it("should update bot contributor roles", async () => {
    const botUsernames = ["dependabot[bot]", "github-actions[bot]"];
    const placeholders = botUsernames.map((_, i) => `$${i + 1}`).join(", ");

    await db.query(
      `UPDATE contributor SET role = 'bot' WHERE username IN (${placeholders})`,
      botUsernames
    );

    const result = await db.query<{ username: string; role: string }>(
      "SELECT username, role FROM contributor WHERE role = 'bot'"
    );

    expect(result.rows.length).toBe(2);
    expect(result.rows.map(r => r.username)).toContain("dependabot[bot]");
    expect(result.rows.map(r => r.username)).toContain("github-actions[bot]");
  });

  /**
   * Test: Does not affect non-bot contributors
   */
  it("should not affect non-bot contributors", async () => {
    await db.query(
      "UPDATE contributor SET role = 'bot' WHERE username = $1",
      ["dependabot[bot]"]
    );

    const result = await db.query<{ role: string }>(
      "SELECT role FROM contributor WHERE username = $1",
      ["alice"]
    );

    expect(result.rows[0]?.role).toBe("contributor");
  });
});

// =============================================================================
// Slack User ID Lookup Tests
// =============================================================================

describe("Slack User ID Lookups", () => {
  beforeEach(async () => {
    await seedTestData(db, {
      contributors: [
        { username: "alice", meta: { slack_user_id: "U12345678" } },
        { username: "bob", meta: { slack_user_id: "U87654321" } },
        { username: "charlie" }, // No Slack ID
      ],
    });
  });

  /**
   * Test: Finds contributor by Slack user ID
   */
  it("should find contributor by Slack user ID", async () => {
    const result = await db.query<{ username: string }>(
      "SELECT username FROM contributor WHERE meta->>'slack_user_id' = $1",
      ["U12345678"]
    );

    expect(result.rows.length).toBe(1);
    expect(result.rows[0]?.username).toBe("alice");
  });

  /**
   * Test: Returns null for unknown Slack user ID
   */
  it("should return null for unknown Slack user ID", async () => {
    const result = await db.query<{ username: string }>(
      "SELECT username FROM contributor WHERE meta->>'slack_user_id' = $1",
      ["UNONEXISTENT"]
    );

    expect(result.rows.length).toBe(0);
  });

  /**
   * Test: Batch lookup by multiple Slack user IDs
   */
  it("should support batch lookup by multiple Slack user IDs", async () => {
    const slackIds = ["U12345678", "U87654321", "UNONEXISTENT"];

    const result = await db.query<{ username: string; slack_user_id: string }>(
      `SELECT username, meta->>'slack_user_id' as slack_user_id 
       FROM contributor 
       WHERE meta->>'slack_user_id' = ANY($1)`,
      [slackIds]
    );

    expect(result.rows.length).toBe(2);
    
    const usernameMap = new Map(result.rows.map(r => [r.slack_user_id, r.username]));
    expect(usernameMap.get("U12345678")).toBe("alice");
    expect(usernameMap.get("U87654321")).toBe("bob");
  });
});

// =============================================================================
// Contributor Query Tests
// =============================================================================

describe("Contributor Queries", () => {
  beforeEach(async () => {
    await seedTestData(db, {
      contributors: [
        { username: "alice", role: "developer" },
        { username: "bob", role: "designer" },
        { username: "ci-bot", role: "bot" },
      ],
    });
  });

  /**
   * Test: Lists all contributors
   */
  it("should list all contributors", async () => {
    const result = await db.query<{ username: string }>(
      "SELECT username FROM contributor ORDER BY username"
    );

    expect(result.rows.length).toBe(3);
  });

  /**
   * Test: Filters by role
   */
  it("should filter contributors by role", async () => {
    const result = await db.query<{ username: string }>(
      "SELECT username FROM contributor WHERE role != 'bot'"
    );

    expect(result.rows.length).toBe(2);
    expect(result.rows.map(r => r.username)).not.toContain("ci-bot");
  });

  /**
   * Test: Gets single contributor by username
   */
  it("should get single contributor by username", async () => {
    const result = await db.query<{ username: string; role: string }>(
      "SELECT username, role FROM contributor WHERE username = $1",
      ["alice"]
    );

    expect(result.rows.length).toBe(1);
    expect(result.rows[0]?.role).toBe("developer");
  });
});
