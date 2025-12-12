/**
 * @fileoverview Slack EOD message queue operations
 * @module @leaderboard/database/operations/slack-eod
 *
 * This module provides operations for managing the Slack End-of-Day (EOD)
 * message queue. Messages are fetched from Slack, stored in a queue table,
 * and then processed into activities in batches.
 */

import { getDb } from "../connection";
import { batchArray, getSqlPositionalParamPlaceholders } from "../utils/batch";
import type { SlackEodMessage, PendingEodUpdate } from "../types";

// =============================================================================
// Table Management
// =============================================================================

/**
 * Creates the Slack EOD update queue table if it doesn't exist.
 *
 * @remarks
 * This function should be called during database initialization or
 * before the first Slack scrape operation. The table uses the following schema:
 *
 * - `id`: Primary key derived from Slack message timestamp
 * - `user_id`: Slack user ID of the message author
 * - `timestamp`: When the message was posted
 * - `text`: The message content
 *
 * Indexes are created on `timestamp` and `user_id` for efficient querying.
 *
 * @returns A promise that resolves when the table is created
 *
 * @example
 * ```typescript
 * // During app initialization
 * await createSlackEodTable();
 *
 * // Now safe to add messages
 * await addSlackEodMessages(messages);
 * ```
 */
export async function createSlackEodTable(): Promise<void> {
  const db = getDb();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS slack_eod_update (
      id                      BIGINT PRIMARY KEY,
      user_id                 VARCHAR NOT NULL,
      timestamp               TIMESTAMP NOT NULL,
      text                    TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_slack_eod_update_timestamp ON slack_eod_update(timestamp);
    CREATE INDEX IF NOT EXISTS idx_slack_eod_update_user_id ON slack_eod_update(user_id);
  `);
}

// =============================================================================
// Message Operations
// =============================================================================

/**
 * Adds Slack messages to the EOD queue table.
 *
 * @remarks
 * Messages are inserted in batches for efficiency. Duplicate messages
 * (same ID) are ignored using `ON CONFLICT DO NOTHING`. This allows
 * the scraper to safely re-process time ranges without creating duplicates.
 *
 * @param messages - Array of SlackEodMessage objects to add to the queue
 *
 * @returns A promise that resolves when all messages have been added
 *
 * @example
 * ```typescript
 * const messages: SlackEodMessage[] = [
 *   {
 *     id: 1702400000123456,
 *     user_id: "U12345678",
 *     timestamp: new Date("2024-01-15T18:00:00Z"),
 *     text: "Today I completed the API integration..."
 *   }
 * ];
 * await addSlackEodMessages(messages);
 * // Console: "Added 1/1 Slack EOD messages"
 * ```
 */
export async function addSlackEodMessages(
  messages: SlackEodMessage[]
): Promise<void> {
  const db = getDb();

  for (const batch of batchArray(messages, 1000)) {
    const result = await db.query(
      `
      INSERT INTO slack_eod_update (id, user_id, timestamp, text)
      VALUES ${getSqlPositionalParamPlaceholders(batch.length, 4)}
      ON CONFLICT DO NOTHING;
    `,
      batch.flatMap((m) => [m.id, m.user_id, m.timestamp.toISOString(), m.text])
    );

    console.log(`Added ${result.affectedRows}/${batch.length} Slack EOD messages`);
  }
}

/**
 * Deletes processed Slack EOD messages from the queue.
 *
 * @remarks
 * After messages have been successfully converted to activities,
 * they should be removed from the queue to prevent reprocessing.
 * This function accepts an array of message IDs to delete.
 *
 * @param ids - Array of message IDs to delete from the queue
 *
 * @returns A promise that resolves when deletion is complete
 *
 * @example
 * ```typescript
 * // After processing pending updates
 * const pendingUpdates = await getPendingEodUpdates();
 * for (const update of pendingUpdates) {
 *   await processEodUpdate(update);
 *   await deleteSlackEodMessages(update.ids);
 * }
 * ```
 */
export async function deleteSlackEodMessages(ids: number[]): Promise<void> {
  const db = getDb();

  const result = await db.query(
    `DELETE FROM slack_eod_update WHERE id = ANY($1);`,
    [ids]
  );

  console.log(`Deleted ${result.affectedRows} processed EOD messages`);
}

// =============================================================================
// Query Operations
// =============================================================================

/**
 * Gets all pending EOD updates grouped by user_id.
 *
 * @remarks
 * This function aggregates pending messages by Slack user ID, returning
 * arrays of IDs, texts, and timestamps for each user. This grouping allows
 * for efficient batch processing where all messages from a user are
 * processed together to create daily activity summaries.
 *
 * Messages within each group are ordered chronologically by timestamp.
 *
 * @returns Array of grouped pending updates, one per Slack user
 *
 * @example
 * ```typescript
 * const pendingUpdates = await getPendingEodUpdates();
 *
 * for (const update of pendingUpdates) {
 *   console.log(`User ${update.user_id} has ${update.texts.length} pending messages`);
 *
 *   // Merge texts and create activity
 *   const mergedText = update.texts.join("\n\n");
 *   await createActivity({
 *     user_id: update.user_id,
 *     text: mergedText,
 *     timestamp: update.timestamps[0] // First message time
 *   });
 *
 *   // Clean up processed messages
 *   await deleteSlackEodMessages(update.ids);
 * }
 * ```
 */
export async function getPendingEodUpdates(): Promise<PendingEodUpdate[]> {
  const db = getDb();

  const result = await db.query<{
    user_id: string;
    ids: number[];
    texts: string[];
    timestamps: string[];
  }>(
    `
    SELECT 
      user_id,
      array_agg(id ORDER BY timestamp) as ids,
      array_agg(text ORDER BY timestamp) as texts,
      array_agg(timestamp ORDER BY timestamp) as timestamps
    FROM slack_eod_update
    GROUP BY user_id;
  `
  );

  return result.rows.map((row) => ({
    user_id: row.user_id,
    ids: row.ids,
    texts: row.texts,
    timestamps: row.timestamps.map((ts) => new Date(ts)),
  }));
}

/**
 * Gets all Slack EOD messages for export or debugging.
 *
 * @remarks
 * Returns all messages in the queue table ordered by timestamp.
 * This is useful for debugging the queue state or for exporting
 * raw message data before processing.
 *
 * @returns Array of all SlackEodMessage objects in the queue
 *
 * @example
 * ```typescript
 * // Debug: Check queue state
 * const allMessages = await getAllSlackEodMessages();
 * console.log(`Queue contains ${allMessages.length} messages`);
 *
 * // Export for backup
 * const json = JSON.stringify(allMessages, null, 2);
 * await writeFile("slack-queue-backup.json", json);
 * ```
 */
export async function getAllSlackEodMessages(): Promise<SlackEodMessage[]> {
  const db = getDb();

  const result = await db.query<{
    id: number;
    user_id: string;
    timestamp: string;
    text: string;
  }>(
    `SELECT id, user_id, timestamp, text FROM slack_eod_update ORDER BY timestamp;`
  );

  return result.rows.map((row) => ({
    id: row.id,
    user_id: row.user_id,
    timestamp: new Date(row.timestamp),
    text: row.text,
  }));
}
