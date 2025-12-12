/**
 * @leaderboard/db-scripts - Database scripts for import/export operations
 *
 * @packageDocumentation
 *
 * This package provides CLI scripts and programmatic APIs for managing
 * the leaderboard database:
 *
 * ## Features
 *
 * - **Schema Management**: Initialize and update database schema
 * - **Data Import**: Import contributors, activities, and messages from flat files
 * - **Data Export**: Export database contents to organized JSON files
 * - **Modular Services**: Individual functions for granular control
 *
 * ## CLI Scripts
 *
 * | Script | Description |
 * |--------|-------------|
 * | `db:prepare` | Initialize database schema |
 * | `db:import` | Import flat files to database |
 * | `db:export` | Export database to flat files |
 *
 * ## Configuration
 *
 * Required environment variables:
 * - `PGLITE_DB_PATH`: Path to the PGlite database directory
 * - `LEADERBOARD_DATA_PATH`: Path to the data directory (optional, defaults to `./data`)
 *
 * ## Usage
 *
 * ```typescript
 * import {
 *   prepareDatabase,
 *   importData,
 *   exportData,
 * } from "@leaderboard/db-scripts";
 *
 * // Initialize schema
 * await prepareDatabase();
 *
 * // Import all data
 * await importData();
 *
 * // Export all data
 * await exportData();
 * ```
 *
 * @module @leaderboard/db-scripts
 */

// =============================================================================
// Type Exports
// =============================================================================

export type {
  ActivityRow,
  EodMessageRow,
  ContributorMeta,
  ExportResult,
  ImportResult,
} from "./types";

// =============================================================================
// Config Exports
// =============================================================================

export { getDataPath, getPgliteDbPath, validateConfig } from "./config";

// =============================================================================
// Service Exports - Import
// =============================================================================

export {
  importContributors,
  getContributorMeta,
} from "./services/contributor-importer";

export {
  importActivitiesFromDir,
  importGitHubActivities,
  importSlackActivities,
} from "./services/activity-importer";

export { importSlackEodMessages } from "./services/eod-importer";

// =============================================================================
// Service Exports - Export
// =============================================================================

export { exportGitHubActivities } from "./services/github-exporter";
export { exportSlackActivities } from "./services/slack-exporter";
export { exportSlackEodMessages } from "./services/eod-exporter";

// =============================================================================
// Main Script Exports
// =============================================================================

export { prepareDatabase } from "./prepare";
export { importData } from "./import";
export { exportData } from "./export";
