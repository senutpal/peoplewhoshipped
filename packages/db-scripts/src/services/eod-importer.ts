/**
 * @fileoverview Slack EOD message import service
 * @module @leaderboard/db-scripts/services/eod-importer
 *
 * This module handles importing Slack EOD (End of Day) messages
 * from JSON files in the data directory to the database.
 */

import { readdir, readFile } from "node:fs/promises";
import { join, extname } from "node:path";
import { addSlackEodMessages, type SlackEodMessage } from "@leaderboard/database";

// =============================================================================
// Constants
// =============================================================================

/**
 * File extension for EOD message JSON files.
 * @internal
 */
const JSON_EXT = ".json";

/**
 * Subdirectory path for EOD message files.
 * @internal
 */
const EOD_MESSAGES_PATH = ["slack", "eod_messages"];

// =============================================================================
// Import Functions
// =============================================================================

/**
 * Import Slack EOD messages from data/slack/eod_messages/.
 *
 * @description
 * Reads all JSON files from the EOD messages directory, parses them
 * as message arrays, and imports them into the database.
 *
 * Each JSON file should contain an array of `SlackEodMessage` objects,
 * typically organized by user ID (e.g., `U12345678.json`).
 *
 * @param dataPath - Path to the data directory
 *
 * @returns Number of EOD messages imported
 *
 * @example
 * ```typescript
 * import { importSlackEodMessages } from "./services/eod-importer";
 *
 * const count = await importSlackEodMessages("./data");
 * console.log(`Imported ${count} EOD messages`);
 * ```
 */
export async function importSlackEodMessages(dataPath: string): Promise<number> {
  const eodDir = join(dataPath, ...EOD_MESSAGES_PATH);
  const messages: SlackEodMessage[] = [];

  try {
    const files = await readdir(eodDir);
    const jsonFiles = files.filter((f) => extname(f) === JSON_EXT);

    for (const file of jsonFiles) {
      const filePath = join(eodDir, file);
      const content = await readFile(filePath, "utf-8");
      const fileMessages = JSON.parse(content) as SlackEodMessage[];

      if (Array.isArray(fileMessages)) {
        messages.push(...fileMessages);
      }
    }

    if (messages.length > 0) {
      await addSlackEodMessages(messages);
      console.log(`   ✅ Imported ${messages.length} Slack EOD messages`);
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      console.log("   ⚠️  No Slack EOD messages directory found, skipping...");
    } else {
      throw error;
    }
  }

  return messages.length;
}
