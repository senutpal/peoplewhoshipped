/**
 * @fileoverview Database connection management
 * @module @leaderboard/database/connection
 *
 * This module provides PGlite database connection management using the
 * singleton pattern. It handles database initialization, configuration
 * from environment variables, and provides instance reset capability for testing.
 */

import { PGlite } from "@electric-sql/pglite";
import { resolve } from "path";

// =============================================================================
// Types
// =============================================================================

/**
 * Environment configuration for the database.
 *
 * @remarks
 * Configuration values are read from environment variables.
 * The `dataPath` is required for database initialization.
 */
export interface DatabaseConfig {
  /**
   * Path to the PGlite database data directory.
   * Set via `PGLITE_DB_PATH` environment variable.
   * Use `:memory:` for in-memory database (testing).
   */
  dataPath: string | undefined;

  /**
   * Path to the leaderboard data directory for exports.
   * Set via `LEADERBOARD_DATA_PATH` environment variable.
   */
  leaderboardDataPath: string | undefined;

  /**
   * Number of days to look back when scraping.
   * Set via `SCRAPE_DAYS` environment variable.
   *
   * @default 7
   */
  scrapeDays: number;
}

// =============================================================================
// Database Singleton
// =============================================================================

/**
 * Singleton instance of the PGlite database.
 * @internal
 */
let dbInstance: PGlite | null = null;

/**
 * Promise to track initialization in progress.
 * @internal
 */
let initPromise: Promise<PGlite> | null = null;

/**
 * Retrieves the environment configuration for the database.
 *
 * @remarks
 * Reads configuration from environment variables and provides
 * sensible defaults where applicable.
 *
 * @returns The database configuration object
 *
 * @example
 * ```typescript
 * const config = getConfig();
 * console.log(`Database path: ${config.dataPath}`);
 * console.log(`Scrape days: ${config.scrapeDays}`);
 * ```
 */
export function getConfig(): DatabaseConfig {
  return {
    dataPath: process.env.PGLITE_DB_PATH,
    leaderboardDataPath: process.env.LEADERBOARD_DATA_PATH,
    scrapeDays: process.env.SCRAPE_DAYS ? parseInt(process.env.SCRAPE_DAYS) : 7,
  };
}

/**
 * Initializes the PGlite database and waits for it to be ready.
 *
 * @remarks
 * Uses `PGlite.create()` which properly awaits WASM initialization.
 * This is the recommended way to initialize PGlite in async contexts.
 *
 * @returns Promise resolving to the ready PGlite database instance
 *
 * @throws {Error} If `PGLITE_DB_PATH` environment variable is not set
 *
 * @example
 * ```typescript
 * // Initialize database asynchronously
 * const db = await initDb();
 *
 * // Execute queries safely
 * const result = await db.query("SELECT * FROM contributor");
 * ```
 */
export async function initDb(): Promise<PGlite> {
  // Return existing instance if ready
  if (dbInstance) {
    return dbInstance;
  }

  // Return existing initialization if in progress
  if (initPromise) {
    return initPromise;
  }

  const { dataPath } = getConfig();

  if (!dataPath) {
    throw new Error(
      "'PGLITE_DB_PATH' environment needs to be set with a path to the database data."
    );
  }

  // Start async initialization
  initPromise = (async () => {
    // Normalize path for Windows compatibility
    const normalizedPath = dataPath === ":memory:" ? dataPath : resolve(dataPath);

    // Use PGlite.create() which properly awaits WASM initialization
    const db = await PGlite.create(dataPath === ":memory:" ? undefined : normalizedPath);
    dbInstance = db;
    initPromise = null;
    return db;
  })();

  return initPromise;
}

/**
 * Initializes and returns the PGlite database instance.
 *
 * @remarks
 * Uses the singleton pattern to ensure only one database connection
 * is created throughout the application lifecycle. The database path
 * must be configured via the `PGLITE_DB_PATH` environment variable.
 *
 * Special values for `PGLITE_DB_PATH`:
 * - `:memory:` - Creates an in-memory database (useful for testing)
 * - Any other path - Creates/opens a persistent database at that location
 *
 * @deprecated Use `initDb()` for proper async initialization. This function
 * may return an instance before WASM is ready in some environments.
 *
 * @returns The PGlite database instance
 *
 * @throws {Error} If `PGLITE_DB_PATH` environment variable is not set
 *
 * @example
 * ```typescript
 * // Set environment variable first
 * process.env.PGLITE_DB_PATH = "./data/leaderboard.db";
 *
 * // Get the database instance
 * const db = getDb();
 *
 * // Execute queries
 * const result = await db.query("SELECT * FROM contributor");
 * ```
 */
export function getDb(): PGlite {
  const { dataPath } = getConfig();

  if (!dataPath) {
    throw new Error(
      "'PGLITE_DB_PATH' environment needs to be set with a path to the database data."
    );
  }

  if (!dbInstance) {
    // Support in-memory database for testing
    // Normalize path for Windows compatibility
    const normalizedPath = dataPath === ":memory:" ? dataPath : resolve(dataPath);
    dbInstance = dataPath === ":memory:" ? new PGlite() : new PGlite(normalizedPath);
  }

  return dbInstance;
}

/**
 * Resets the database singleton instance.
 *
 * @remarks
 * This function is primarily intended for testing purposes where
 * you need to reset the database state between test runs.
 * In production code, this should rarely be needed.
 *
 * @example
 * ```typescript
 * // In test teardown
 * afterEach(() => {
 *   resetDbInstance();
 * });
 * ```
 */
export function resetDbInstance(): void {
  dbInstance = null;
}
