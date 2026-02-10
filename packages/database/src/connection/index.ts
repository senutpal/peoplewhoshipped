/**
 * @fileoverview Database connection management
 * @module @leaderboard/database/connection
 */

import { PGlite } from "@electric-sql/pglite";
import { isAbsolute, resolve } from "path";

export interface DatabaseConfig {
  dataPath: string | undefined;
  leaderboardDataPath: string | undefined;
  scrapeDays: number;
}

let dbInstance: PGlite | null = null;
let initPromise: Promise<PGlite> | null = null;

function resolvePath(inputPath: string): string {
  return isAbsolute(inputPath) ? inputPath : resolve(process.cwd(), inputPath);
}

export function getConfig(): DatabaseConfig {
  return {
    dataPath: process.env.PGLITE_DB_PATH,
    leaderboardDataPath: process.env.LEADERBOARD_DATA_PATH,
    scrapeDays: process.env.SCRAPE_DAYS ? parseInt(process.env.SCRAPE_DAYS) : 7,
  };
}

export async function initDb(): Promise<PGlite> {
  if (dbInstance) {
    return dbInstance;
  }

  if (initPromise) {
    return initPromise;
  }

  const { dataPath } = getConfig();

  if (!dataPath) {
    throw new Error(
      "'PGLITE_DB_PATH' environment needs to be set with a path to the database data.",
    );
  }

  initPromise = (async () => {
    const normalizedPath =
      dataPath === ":memory:" ? dataPath : resolvePath(dataPath);
    const db = await PGlite.create(
      dataPath === ":memory:" ? undefined : normalizedPath,
    );
    dbInstance = db;
    initPromise = null;
    return db;
  })();

  return initPromise;
}

export function getDb(): PGlite {
  const { dataPath } = getConfig();

  if (!dataPath) {
    throw new Error(
      "'PGLITE_DB_PATH' environment needs to be set with a path to the database data.",
    );
  }

  if (!dbInstance) {
    const normalizedPath =
      dataPath === ":memory:" ? dataPath : resolvePath(dataPath);
    dbInstance =
      dataPath === ":memory:" ? new PGlite() : new PGlite(normalizedPath);
  }

  return dbInstance;
}

export function resetDbInstance(): void {
  dbInstance = null;
}
