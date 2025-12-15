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
 * - `contributor` - Registered contributors with username as primary identifier
 * - `activity_definition` - Types of activities that can be tracked
 * - `activity` - Individual activity records linked to contributors
 *
 * Also creates indexes for common query patterns.
 *
 * @internal
 */
const SCHEMA_SQL = `
-- Contributor table
-- Stores contributor information with username (GitHub username) as primary identifier
CREATE TABLE IF NOT EXISTS contributor (
  username                VARCHAR PRIMARY KEY,
  name                    VARCHAR,
  role                    VARCHAR,
  title                   VARCHAR,
  avatar_url              VARCHAR,
  bio                     TEXT,
  social_profiles         JSON,
  joining_date            DATE,
  meta                    JSON
);

-- Activity definition table
-- Defines the types of activities (e.g., pr_merged, issue_opened)
CREATE TABLE IF NOT EXISTS activity_definition (
  slug                    VARCHAR PRIMARY KEY,
  name                    VARCHAR NOT NULL,
  description             TEXT NOT NULL,
  points                  SMALLINT,
  icon                    VARCHAR
);

-- Activity table
-- Individual activity records linked to contributors and definitions
CREATE TABLE IF NOT EXISTS activity (
  slug                    VARCHAR PRIMARY KEY,
  contributor             VARCHAR REFERENCES contributor(username) NOT NULL,
  activity_definition     VARCHAR REFERENCES activity_definition(slug) NOT NULL,
  title                   VARCHAR,
  occured_at              TIMESTAMP NOT NULL,
  link                    VARCHAR,
  text                    TEXT,
  points                  SMALLINT,
  meta                    JSON
);

-- Performance indexes
-- Optimizes common query patterns for activity retrieval
CREATE INDEX IF NOT EXISTS idx_activity_occured_at ON activity(occured_at);
CREATE INDEX IF NOT EXISTS idx_activity_contributor ON activity(contributor);
CREATE INDEX IF NOT EXISTS idx_activity_definition ON activity(activity_definition);
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
  console.log("Preparing database schema...");

  const db = getDb();

  // Create main schema tables
  console.log("Creating core tables...");
  await db.exec(SCHEMA_SQL);

  // Create Slack EOD table (separate function for modularity)
  console.log("Creating Slack EOD table...");
  await createSlackEodTable();

  // Upsert activity definitions
  console.log("Inserting activity definitions...");
  await upsertActivityDefinitions(ALL_ACTIVITY_DEFINITIONS);

  console.log("Database schema prepared successfully!");
}

// =============================================================================
// CLI Entry Point
// =============================================================================

// Run if called directly (e.g., `bun run src/prepare.ts`)
if (import.meta.main) {
  prepareDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Failed to prepare database:", error);
      process.exit(1);
    });
}
