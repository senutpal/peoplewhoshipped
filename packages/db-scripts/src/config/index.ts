/**
 * @fileoverview Configuration helpers for database scripts
 * @module @leaderboard/db-scripts/config
 *
 * This module provides centralized configuration access for all
 * database script operations. It reads from environment variables
 * with sensible defaults.
 */

// =============================================================================
// Environment Constants
// =============================================================================

/**
 * Environment variable name for PGlite database path.
 * @internal
 */
const ENV_PGLITE_DB_PATH = "PGLITE_DB_PATH";

/**
 * Environment variable name for leaderboard data directory path.
 * @internal
 */
const ENV_DATA_PATH = "LEADERBOARD_DATA_PATH";

/**
 * Default path for the data directory when not specified.
 * @internal
 */
const DEFAULT_DATA_PATH = "./data";

// =============================================================================
// Configuration Functions
// =============================================================================

/**
 * Get the data directory path from environment.
 *
 * @description
 * Retrieves the path to the data directory containing contributor
 * markdown files, activity JSON files, and other flat file data.
 *
 * @returns The data directory path from `LEADERBOARD_DATA_PATH` env var,
 *          or `"./data"` if not set.
 *
 * @example
 * ```typescript
 * import { getDataPath } from "./config";
 *
 * const dataPath = getDataPath();
 * // => "./data" or value of LEADERBOARD_DATA_PATH
 * ```
 */
export function getDataPath(): string {
  return process.env[ENV_DATA_PATH] || DEFAULT_DATA_PATH;
}

/**
 * Get the PGlite database path from environment.
 *
 * @description
 * Retrieves the path to the PGlite database directory.
 * This is required for database operations and will throw
 * if not set.
 *
 * @returns The database path from `PGLITE_DB_PATH` env var.
 *
 * @throws {Error} If `PGLITE_DB_PATH` is not set.
 *
 * @example
 * ```typescript
 * import { getPgliteDbPath } from "./config";
 *
 * const dbPath = getPgliteDbPath();
 * // => value of PGLITE_DB_PATH
 * ```
 */
export function getPgliteDbPath(): string {
  const dbPath = process.env[ENV_PGLITE_DB_PATH];
  if (!dbPath) {
    throw new Error(
      `Environment variable ${ENV_PGLITE_DB_PATH} is required but not set.`
    );
  }
  return dbPath;
}

/**
 * Validate that required environment variables are set.
 *
 * @description
 * Checks that all required configuration is available before
 * running database operations.
 *
 * @returns `true` if all required configuration is valid.
 *
 * @throws {Error} If any required environment variable is missing.
 *
 * @example
 * ```typescript
 * import { validateConfig } from "./config";
 *
 * try {
 *   validateConfig();
 *   console.log("Configuration valid");
 * } catch (error) {
 *   console.error("Missing configuration:", error.message);
 * }
 * ```
 */
export function validateConfig(): boolean {
  getPgliteDbPath(); // Will throw if not set
  return true;
}
