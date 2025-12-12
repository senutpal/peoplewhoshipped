/**
 * @leaderboard/database - Database management for the leaderboard monorepo
 *
 * @packageDocumentation
 *
 * This package provides PGlite database operations for storing and managing
 * contributor activities across different platforms (GitHub, Slack, etc.).
 *
 * ## Features
 *
 * - PGlite-based embedded PostgreSQL database
 * - Singleton pattern for database connection management
 * - Batch operations for efficient bulk inserts
 * - Type-safe interfaces for all data models
 * - Contributor management with cross-platform identity linking
 * - Activity tracking and querying
 * - Slack EOD message queue for batch processing
 *
 * ## Configuration
 *
 * Required environment variables:
 * - `PGLITE_DB_PATH`: Path to the database data directory (use `:memory:` for testing)
 *
 * Optional environment variables:
 * - `LEADERBOARD_DATA_PATH`: Path for data exports
 * - `SCRAPE_DAYS`: Number of days to look back when scraping (default: 1)
 *
 * ## Usage
 *
 * ```typescript
 * import {
 *   getDb,
 *   addContributors,
 *   addActivities,
 *   type Activity,
 *   type Contributor
 * } from "@leaderboard/database";
 *
 * // Initialize database
 * process.env.PGLITE_DB_PATH = "./data/leaderboard.db";
 * const db = getDb();
 *
 * // Add contributors
 * await addContributors(["alice", "bob", "charlie"]);
 *
 * // Add activities
 * const activities: Activity[] = [
 *   {
 *     slug: "github-pr-opened-123",
 *     contributor: "alice",
 *     activity_definition: "github-pr-opened",
 *     title: "Add new feature",
 *     occured_at: new Date(),
 *     link: "https://github.com/org/repo/pull/123",
 *     text: null,
 *     points: 10,
 *     meta: null
 *   }
 * ];
 * await addActivities(activities);
 * ```
 *
 * @module @leaderboard/database
 */

// =============================================================================
// Type Exports
// =============================================================================

/**
 * Core type definitions for the database package.
 * These interfaces define the shape of data stored in the database.
 */
export type {
  Activity,
  Contributor,
  SlackEodMessage,
  ActivityDefinitionData,
  ActivityInsertOptions,
  ContributorQueryResult,
  PendingEodUpdate,
} from "./types";

// =============================================================================
// Connection Exports
// =============================================================================

/**
 * Database connection management.
 * Uses singleton pattern for efficient connection reuse.
 */
export {
  getDb,
  resetDbInstance,
  getConfig,
  type DatabaseConfig,
} from "./connection";

// =============================================================================
// Utility Exports
// =============================================================================

/**
 * Batch processing utilities for bulk database operations.
 */
export {
  batchArray,
  getSqlPositionalParamPlaceholders,
} from "./utils/batch";

// =============================================================================
// Contributor Operations
// =============================================================================

/**
 * Operations for managing contributors in the database.
 */
export {
  addContributors,
  updateBotRoles,
  getContributorBySlackUserId,
  getContributorsBySlackUserIds,
} from "./operations/contributor";

// =============================================================================
// Activity Operations
// =============================================================================

/**
 * Operations for managing activities and activity definitions.
 */
export {
  addActivities,
  upsertActivityDefinitions,
  getActivitiesByDefinitions,
} from "./operations/activity";

// =============================================================================
// Slack EOD Operations
// =============================================================================

/**
 * Operations for managing the Slack EOD message queue.
 */
export {
  createSlackEodTable,
  addSlackEodMessages,
  getPendingEodUpdates,
  deleteSlackEodMessages,
  getAllSlackEodMessages,
} from "./operations/slack-eod";
