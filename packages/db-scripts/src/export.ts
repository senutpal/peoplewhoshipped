/**
 * @fileoverview Database export orchestration
 * @module @leaderboard/db-scripts/export
 *
 * This module orchestrates exporting data from the PGlite database
 * to flat files in the data directory. Delegates to individual
 * service modules for each data type.
 *
 * @example
 * ```bash
 * # CLI usage
 * PGLITE_DB_PATH=./db-data LEADERBOARD_DATA_PATH=./data bun run db:export
 * ```
 *
 * @example
 * ```typescript
 * // Programmatic usage
 * import { exportData } from "@leaderboard/db-scripts";
 *
 * await exportData();
 * ```
 */

import { getDb } from "@leaderboard/database";
import { getDataPath } from "./config";
import { exportGitHubActivities } from "./services/github-exporter";
import { exportSlackActivities } from "./services/slack-exporter";
import { exportSlackEodMessages } from "./services/eod-exporter";

// =============================================================================
// Re-exports for backward compatibility
// =============================================================================

// Re-export service functions for direct access
export { exportGitHubActivities } from "./services/github-exporter";
export { exportSlackActivities } from "./services/slack-exporter";
export { exportSlackEodMessages } from "./services/eod-exporter";

// =============================================================================
// Main Export Function
// =============================================================================

/**
 * Export all data from database to flat files.
 *
 * @description
 * Orchestrates the complete export workflow:
 * 1. Exports GitHub activities to JSON files
 * 2. Exports Slack activities to JSON files
 * 3. Exports Slack EOD messages to JSON files
 *
 * Each data type is exported to its own subdirectory under the
 * data path, organized by contributor/user.
 *
 * @returns Promise that resolves when all exports are complete
 *
 * @throws {Error} If database connection fails or export operations error
 *
 * @example
 * ```typescript
 * import { exportData } from "@leaderboard/db-scripts";
 *
 * try {
 *   await exportData();
 *   console.log("All data exported successfully");
 * } catch (error) {
 *   console.error("Export failed:", error);
 * }
 * ```
 */
export async function exportData(): Promise<void> {
  const dataPath = getDataPath();
  console.log(`📤 Exporting data to: ${dataPath}`);

  // Ensure database is initialized
  getDb();

  console.log("\n🐙 Exporting GitHub activities...");
  await exportGitHubActivities(dataPath);

  console.log("\n💬 Exporting Slack activities...");
  await exportSlackActivities(dataPath);

  console.log("\n📋 Exporting Slack EOD messages...");
  await exportSlackEodMessages(dataPath);

  console.log("\n✅ Data export completed!");
}

// =============================================================================
// CLI Entry Point
// =============================================================================

// Run if called directly (e.g., `bun run src/export.ts`)
if (import.meta.main) {
  exportData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Failed to export data:", error);
      process.exit(1);
    });
}
