/**
 * @fileoverview Slack EOD message export service
 * @module @leaderboard/db-scripts/services/eod-exporter
 *
 * This module handles exporting Slack EOD (End of Day) messages
 * from the database to JSON files in the data directory.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { getAllSlackEodMessages } from "@leaderboard/database";
import type { EodMessageRow, ExportResult } from "../types";

// =============================================================================
// Constants
// =============================================================================

/**
 * Output directory path for EOD messages relative to data path.
 * @internal
 */
const EOD_MESSAGES_PATH = ["slack", "eod_messages"];

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Group EOD messages by Slack user ID.
 *
 * @param messages - Array of EOD message rows to group
 *
 * @returns Map of user ID to their messages
 *
 * @internal
 */
function groupByUserId(
  messages: EodMessageRow[]
): Map<string, EodMessageRow[]> {
  const grouped = new Map<string, EodMessageRow[]>();

  for (const msg of messages) {
    const existing = grouped.get(msg.user_id) || [];
    existing.push(msg);
    grouped.set(msg.user_id, existing);
  }

  return grouped;
}

/**
 * Format an EOD message for JSON export.
 *
 * @param message - EOD message row to format
 *
 * @returns Formatted message object for JSON serialization
 *
 * @internal
 */
function formatMessageForExport(message: EodMessageRow): Record<string, unknown> {
  return {
    id: message.id,
    user_id: message.user_id,
    timestamp:
      message.timestamp instanceof Date
        ? message.timestamp.toISOString()
        : message.timestamp,
    text: message.text,
  };
}

// =============================================================================
// Export Functions
// =============================================================================

/**
 * Export Slack EOD messages to data/slack/eod_messages/.
 *
 * @description
 * Fetches all EOD messages from the database and exports them to
 * JSON files organized by Slack user ID. Each user gets their own
 * JSON file named `{user_id}.json`.
 *
 * @param dataPath - Path to the data directory
 *
 * @returns Export result with count of exported records and users
 *
 * @example
 * ```typescript
 * import { exportSlackEodMessages } from "./services/eod-exporter";
 *
 * const result = await exportSlackEodMessages("./data");
 * console.log(`Exported ${result.exported} messages for ${result.contributors} users`);
 * ```
 */
export async function exportSlackEodMessages(
  dataPath: string
): Promise<ExportResult> {
  const outputDir = join(dataPath, ...EOD_MESSAGES_PATH);
  await mkdir(outputDir, { recursive: true });

  const messages = (await getAllSlackEodMessages()) as EodMessageRow[];
  const grouped = groupByUserId(messages);
  let totalExported = 0;

  for (const [userId, userMessages] of grouped) {
    const outputFile = join(outputDir, `${userId}.json`);
    const formatted = userMessages.map(formatMessageForExport);

    await writeFile(outputFile, JSON.stringify(formatted, null, 2));
    totalExported += userMessages.length;
  }

  console.log(
    `Exported ${totalExported} Slack EOD messages for ${grouped.size} users`
  );

  return {
    exported: totalExported,
    contributors: grouped.size,
  };
}
