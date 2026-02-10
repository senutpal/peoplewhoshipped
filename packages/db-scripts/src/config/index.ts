/**
 * @fileoverview Configuration helpers for database scripts
 * @module @leaderboard/db-scripts/config
 */

import { isAbsolute, resolve } from "path";

// =============================================================================
// Environment Constants
// =============================================================================

const ENV_PGLITE_DB_PATH = "PGLITE_DB_PATH";
const ENV_DATA_PATH = "LEADERBOARD_DATA_PATH";
const DEFAULT_DATA_PATH = "./data";

// =============================================================================
// Path Resolution
// =============================================================================

function resolvePath(inputPath: string): string {
  return isAbsolute(inputPath) ? inputPath : resolve(process.cwd(), inputPath);
}

// =============================================================================
// Configuration Functions
// =============================================================================

export function getDataPath(): string {
  const dataPath = process.env[ENV_DATA_PATH] || DEFAULT_DATA_PATH;
  return resolvePath(dataPath);
}

export function getPgliteDbPath(): string {
  const dbPath = process.env[ENV_PGLITE_DB_PATH];
  if (!dbPath) {
    throw new Error(
      `Environment variable ${ENV_PGLITE_DB_PATH} is required but not set.`,
    );
  }
  return resolvePath(dbPath);
}

export function validateConfig(): boolean {
  getPgliteDbPath();
  return true;
}
