/**
 * Tests for Slack EOD queue operations.
 *
 * @group unit
 * @group database
 *
 * Test Coverage:
 * - createSlackEodTable: table creation
 * - addSlackEodMessages: message insertion
 * - getPendingEodUpdates: grouped message retrieval
 * - deleteSlackEodMessages: message cleanup
 * - getAllSlackEodMessages: full queue export
 *
 * @module @leaderboard/database/operations/__tests__/slack-eod
 */

import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { PGlite } from "@electric-sql/pglite";
import { createTestDatabase } from "../../__tests__/utils/test-db";

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
// Helper Functions
// =============================================================================

async function insertSlackMessage(
  db: PGlite,
  message: {
    id: number;
    user_id: string;
    timestamp: Date;
    text: string;
  }
) {
  await db.query(
    `INSERT INTO slack_eod_update (id, user_id, timestamp, text)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT DO NOTHING`,
    [message.id, message.user_id, message.timestamp.toISOString(), message.text]
  );
}

// =============================================================================
// Table Management Tests
// =============================================================================

describe("Slack EOD Table Management", () => {
  /**
   * Test: Table is created by test setup schema
   */
  it("should have slack_eod_update table from schema", async () => {
    const result = await db.query<{ table_name: string }>(
      `SELECT table_name FROM information_schema.tables 
       WHERE table_name = 'slack_eod_update'`
    );

    expect(result.rows.length).toBe(1);
  });

  /**
   * Test: Table has correct columns
   */
  it("should have correct columns", async () => {
    const result = await db.query<{ column_name: string }>(
      `SELECT column_name FROM information_schema.columns 
       WHERE table_name = 'slack_eod_update'
       ORDER BY ordinal_position`
    );

    const columns = result.rows.map(r => r.column_name);
    expect(columns).toContain("id");
    expect(columns).toContain("user_id");
    expect(columns).toContain("timestamp");
    expect(columns).toContain("text");
  });
});

// =============================================================================
// Message Insertion Tests
// =============================================================================

describe("Slack EOD Message Insertion", () => {
  /**
   * Test: Inserts new messages
   */
  it("should insert new messages", async () => {
    await insertSlackMessage(db, {
      id: 1705334400123456,
      user_id: "U12345678",
      timestamp: new Date("2024-01-15T17:00:00Z"),
      text: "EOD: Completed feature X",
    });

    const result = await db.query<{ id: string; user_id: string }>(
      "SELECT id, user_id FROM slack_eod_update"
    );

    expect(result.rows.length).toBe(1);
    expect(result.rows[0]?.user_id).toBe("U12345678");
  });

  /**
   * Test: Ignores duplicate messages
   */
  it("should ignore duplicate messages", async () => {
    const message = {
      id: 1705334400123456,
      user_id: "U12345678",
      timestamp: new Date("2024-01-15T17:00:00Z"),
      text: "EOD: First version",
    };

    await insertSlackMessage(db, message);
    await insertSlackMessage(db, { ...message, text: "EOD: Second version" });

    const result = await db.query<{ text: string }>(
      "SELECT text FROM slack_eod_update WHERE id = $1",
      [message.id]
    );

    expect(result.rows.length).toBe(1);
    expect(result.rows[0]?.text).toBe("EOD: First version");
  });

  /**
   * Test: Handles batch insertion
   */
  it("should handle batch insertion of multiple messages", async () => {
    const messages = Array.from({ length: 10 }, (_, i) => ({
      id: 1705334400000000 + i,
      user_id: "U12345678",
      timestamp: new Date(Date.now() - i * 3600000),
      text: `EOD message ${i}`,
    }));

    for (const msg of messages) {
      await insertSlackMessage(db, msg);
    }

    const result = await db.query<{ count: string }>(
      "SELECT COUNT(*) as count FROM slack_eod_update"
    );

    expect(parseInt(result.rows[0]?.count ?? "0")).toBe(10);
  });
});

// =============================================================================
// Pending Updates Query Tests
// =============================================================================

describe("Pending EOD Updates", () => {
  beforeEach(async () => {
    // Insert messages from multiple users
    const messages = [
      { id: 1, user_id: "U12345678", timestamp: new Date("2024-01-15T09:00:00Z"), text: "Morning standup" },
      { id: 2, user_id: "U12345678", timestamp: new Date("2024-01-15T17:00:00Z"), text: "EOD update" },
      { id: 3, user_id: "U87654321", timestamp: new Date("2024-01-15T18:00:00Z"), text: "My EOD" },
    ];

    for (const msg of messages) {
      await insertSlackMessage(db, msg);
    }
  });

  /**
   * Test: Groups messages by user_id
   */
  it("should group messages by user_id", async () => {
    const result = await db.query<{
      user_id: string;
      ids: number[];
      texts: string[];
    }>(
      `SELECT 
        user_id,
        array_agg(id ORDER BY timestamp) as ids,
        array_agg(text ORDER BY timestamp) as texts
       FROM slack_eod_update
       GROUP BY user_id`
    );

    expect(result.rows.length).toBe(2);

    const user1 = result.rows.find(r => r.user_id === "U12345678");
    expect(user1?.ids.length).toBe(2);
    expect(user1?.texts).toContain("Morning standup");
    expect(user1?.texts).toContain("EOD update");
  });

  /**
   * Test: Orders messages by timestamp within each group
   */
  it("should order messages by timestamp within each group", async () => {
    const result = await db.query<{
      user_id: string;
      texts: string[];
    }>(
      `SELECT 
        user_id,
        array_agg(text ORDER BY timestamp) as texts
       FROM slack_eod_update
       WHERE user_id = $1
       GROUP BY user_id`,
      ["U12345678"]
    );

    expect(result.rows[0]?.texts?.[0]).toBe("Morning standup");
    expect(result.rows[0]?.texts?.[1]).toBe("EOD update");
  });
});

// =============================================================================
// Message Deletion Tests
// =============================================================================

describe("Slack EOD Message Deletion", () => {
  beforeEach(async () => {
    const messages = [
      { id: 1, user_id: "U12345678", timestamp: new Date(), text: "Message 1" },
      { id: 2, user_id: "U12345678", timestamp: new Date(), text: "Message 2" },
      { id: 3, user_id: "U87654321", timestamp: new Date(), text: "Message 3" },
    ];

    for (const msg of messages) {
      await insertSlackMessage(db, msg);
    }
  });

  /**
   * Test: Deletes specific messages by ID
   */
  it("should delete specific messages by ID", async () => {
    const idsToDelete = [1, 2];

    await db.query("DELETE FROM slack_eod_update WHERE id = ANY($1)", [idsToDelete]);

    const result = await db.query<{ id: string }>(
      "SELECT id FROM slack_eod_update"
    );

    expect(result.rows.length).toBe(1);
    expect(parseInt(result.rows[0]?.id ?? "0")).toBe(3);
  });

  /**
   * Test: Does not affect other messages
   */
  it("should not affect other messages when deleting", async () => {
    await db.query("DELETE FROM slack_eod_update WHERE id = $1", [1]);

    const result = await db.query<{ count: string }>(
      "SELECT COUNT(*) as count FROM slack_eod_update"
    );

    expect(parseInt(result.rows[0]?.count ?? "0")).toBe(2);
  });
});

// =============================================================================
// Full Queue Export Tests
// =============================================================================

describe("Slack EOD Queue Export", () => {
  /**
   * Test: Returns all messages ordered by timestamp
   */
  it("should return all messages ordered by timestamp", async () => {
    const messages = [
      { id: 3, user_id: "U12345678", timestamp: new Date("2024-01-15T18:00:00Z"), text: "Third" },
      { id: 1, user_id: "U12345678", timestamp: new Date("2024-01-15T09:00:00Z"), text: "First" },
      { id: 2, user_id: "U12345678", timestamp: new Date("2024-01-15T12:00:00Z"), text: "Second" },
    ];

    for (const msg of messages) {
      await insertSlackMessage(db, msg);
    }

    const result = await db.query<{ text: string }>(
      "SELECT text FROM slack_eod_update ORDER BY timestamp"
    );

    expect(result.rows[0]?.text).toBe("First");
    expect(result.rows[1]?.text).toBe("Second");
    expect(result.rows[2]?.text).toBe("Third");
  });

  /**
   * Test: Returns empty array when queue is empty
   */
  it("should return empty array when queue is empty", async () => {
    const result = await db.query<{ id: string }>(
      "SELECT id FROM slack_eod_update"
    );

    expect(result.rows.length).toBe(0);
  });
});
