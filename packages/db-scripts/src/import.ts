/**
 * @fileoverview Database import orchestration
 * @module @leaderboard/db-scripts/import
 *
 * This module orchestrates importing flat file data from the data directory
 * into the PGlite database. Delegates to individual service modules for
 * each data type.
 *
 * @example
 * ```bash
 * # CLI usage
 * PGLITE_DB_PATH=./db-data LEADERBOARD_DATA_PATH=./data bun run db:import
 * ```
 *
 * @example
 * ```typescript
 * // Programmatic usage
 * import { importData } from "@leaderboard/db-scripts";
 *
 * await importData();
 * ```
 */

import { getDb } from "@leaderboard/database";
import { getDataPath } from "./config";
import { importContributors } from "./services/contributor-importer";
import {
  importGitHubActivities,
  importSlackActivities,
} from "./services/activity-importer";
import { importSlackEodMessages } from "./services/eod-importer";

// =============================================================================
// Re-exports for backward compatibility
// =============================================================================

// Re-export service functions for direct access
export { importContributors } from "./services/contributor-importer";
export {
  importActivitiesFromDir,
  importGitHubActivities,
  importSlackActivities,
} from "./services/activity-importer";
export { importSlackEodMessages } from "./services/eod-importer";

// =============================================================================
// Main Import Function
// =============================================================================

/**
 * Import all data from flat files to database.
 *
 * @description
 * Orchestrates the complete import workflow:
 * 1. Imports contributors from markdown files (for foreign key references)
 * 2. Imports GitHub activities from JSON files
 * 3. Imports Slack activities from JSON files
 * 4. Imports Slack EOD messages from JSON files
 *
 * The import order is important as activities reference contributors
 * via foreign keys.
 *
 * @returns Promise that resolves when all imports are complete
 *
 * @throws {Error} If database connection fails or import operations error
 *
 * @example
 * ```typescript
 * import { importData } from "@leaderboard/db-scripts";
 *
 * try {
 *   await importData();
 *   console.log("All data imported successfully");
 * } catch (error) {
 *   console.error("Import failed:", error);
 * }
 * ```
 */
export async function importData(): Promise<void> {
  const dataPath = getDataPath();
  console.log(`📥 Importing data from: ${dataPath}`);

  // Ensure database is initialized
  getDb();

  // Import in order: contributors first (for foreign key references)
  console.log("\n👥 Importing contributors...");
  await importContributors(dataPath);

  console.log("\n🐙 Importing GitHub activities...");
  await importGitHubActivities(dataPath);

  console.log("\n💬 Importing Slack activities...");
  await importSlackActivities(dataPath);

  console.log("\n📋 Importing Slack EOD messages...");
  await importSlackEodMessages(dataPath);

  console.log("\n✅ Data import completed!");
}

// =============================================================================
// CLI Entry Point
// =============================================================================

// Run if called directly (e.g., `bun run src/import.ts`)
if (import.meta.main) {
  importData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Failed to import data:", error);
      process.exit(1);
    });
}
