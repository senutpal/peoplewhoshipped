/**
 * @fileoverview Database schema preparation
 * @module @leaderboard/db-scripts/prepare
 *
 * This module initializes the database schema by creating all required
 * tables and inserting activity definitions.
 *
 * @example
 * ```bash
 * # CLI usage
 * PGLITE_DB_PATH=./db-data bun run db:prepare
 * ```
 *
 * @example
 * ```typescript
 * // Programmatic usage
 * import { prepareDatabase } from "@leaderboard/db-scripts";
 *
 * await prepareDatabase();
 * ```
 */

import {
  getDb,
  createSlackEodTable,
  upsertActivityDefinitions,
} from "@leaderboard/database";
import { ALL_ACTIVITY_DEFINITIONS } from "@leaderboard/scraper-core";

// =============================================================================
// Schema Definition
// =============================================================================

/**
 * SQL statements to create the core database schema.
 *
 * @description
 * This SQL creates the following tables:
 * - `contributors` - Registered contributors with GitHub and Slack IDs
 * - `activity_definitions` - Types of activities that can be tracked
 * - `activities` - Individual activity records linked to contributors
 *
 * Also creates indexes for common query patterns.
 *
 * @internal
 */
const SCHEMA_SQL = `
-- Contributors table
-- Stores contributor information with GitHub username as primary identifier
CREATE TABLE IF NOT EXISTS contributors (
  id SERIAL PRIMARY KEY,
  github TEXT UNIQUE NOT NULL,
  slack_user_id TEXT UNIQUE,
  role TEXT DEFAULT 'contributor',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity definitions table
-- Defines the types of activities (e.g., pr_merged, issue_opened)
CREATE TABLE IF NOT EXISTS activity_definitions (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  points INTEGER DEFAULT 0,
  ordinal INTEGER DEFAULT 0,
  repo TEXT
);

-- Activities table
-- Individual activity records linked to contributors and definitions
CREATE TABLE IF NOT EXISTS activities (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  contributor TEXT NOT NULL REFERENCES contributors(github),
  activity_definition TEXT NOT NULL REFERENCES activity_definitions(slug),
  title TEXT NOT NULL,
  occured_at TIMESTAMP NOT NULL,
  link TEXT,
  text TEXT,
  points INTEGER,
  meta JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance indexes
-- Optimizes common query patterns for activity retrieval
CREATE INDEX IF NOT EXISTS idx_activities_contributor ON activities(contributor);
CREATE INDEX IF NOT EXISTS idx_activities_definition ON activities(activity_definition);
CREATE INDEX IF NOT EXISTS idx_activities_occured_at ON activities(occured_at);
CREATE INDEX IF NOT EXISTS idx_contributors_slack_user_id ON contributors(slack_user_id);
`;

// =============================================================================
// Main Function
// =============================================================================

/**
 * Prepare the database by creating all required tables and definitions.
 *
 * @description
 * This function performs the following steps:
 * 1. Creates core schema tables (contributors, activity_definitions, activities)
 * 2. Creates the Slack EOD queue table
 * 3. Inserts/updates all activity definitions
 *
 * This should be run before any import operations to ensure the
 * database schema exists.
 *
 * @returns Promise that resolves when preparation is complete
 *
 * @throws {Error} If database connection fails or schema creation errors
 *
 * @example
 * ```typescript
 * import { prepareDatabase } from "@leaderboard/db-scripts";
 *
 * try {
 *   await prepareDatabase();
 *   console.log("Database ready");
 * } catch (error) {
 *   console.error("Failed to prepare database:", error);
 * }
 * ```
 */
export async function prepareDatabase(): Promise<void> {
  console.log("🗄️  Preparing database schema...");

  const db = getDb();

  // Create main schema tables
  console.log("   Creating core tables...");
  await db.exec(SCHEMA_SQL);

  // Create Slack EOD table (separate function for modularity)
  console.log("   Creating Slack EOD table...");
  await createSlackEodTable();

  // Upsert activity definitions
  console.log("   Inserting activity definitions...");
  await upsertActivityDefinitions(ALL_ACTIVITY_DEFINITIONS);

  console.log("✅ Database schema prepared successfully!");
}

// =============================================================================
// CLI Entry Point
// =============================================================================

// Run if called directly (e.g., `bun run src/prepare.ts`)
if (import.meta.main) {
  prepareDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Failed to prepare database:", error);
      process.exit(1);
    });
}
