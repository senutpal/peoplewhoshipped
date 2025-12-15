/**
 * Tests for PGlite database connection management.
 *
 * @group unit
 * @group database
 *
 * Test Coverage:
 * - getConfig: environment variable parsing
 * - initDb: async database initialization
 * - getDb: synchronous database access
 * - resetDbInstance: singleton reset for testing
 *
 * @module @leaderboard/database/__tests__/pglite-connection
 */

import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import {
  getConfig,
  initDb,
  getDb,
  resetDbInstance,
} from "../../connection";

// =============================================================================
// Test Setup
// =============================================================================

let originalEnv: NodeJS.ProcessEnv;

beforeEach(() => {
  originalEnv = { ...process.env };
  resetDbInstance();
});

afterEach(() => {
  process.env = originalEnv;
  resetDbInstance();
});

// =============================================================================
// getConfig Tests
// =============================================================================

describe("getConfig", () => {
  /**
   * Test: Returns configuration from environment variables
   */
  it("should return configuration from environment variables", () => {
    process.env.PGLITE_DB_PATH = "/test/path";
    process.env.LEADERBOARD_DATA_PATH = "/data/path";
    process.env.SCRAPE_DAYS = "14";

    const config = getConfig();

    expect(config.dataPath).toBe("/test/path");
    expect(config.leaderboardDataPath).toBe("/data/path");
    expect(config.scrapeDays).toBe(14);
  });

  /**
   * Test: Returns undefined for unset optional variables
   */
  it("should return undefined for unset optional variables", () => {
    delete process.env.PGLITE_DB_PATH;
    delete process.env.LEADERBOARD_DATA_PATH;
    delete process.env.SCRAPE_DAYS;

    const config = getConfig();

    expect(config.dataPath).toBeUndefined();
    expect(config.leaderboardDataPath).toBeUndefined();
    expect(config.scrapeDays).toBe(7); // default value
  });

  /**
   * Test: Uses default scrapeDays when not set or invalid
   */
  it("should use default scrapeDays of 7", () => {
    delete process.env.SCRAPE_DAYS;

    const config = getConfig();

    expect(config.scrapeDays).toBe(7);
  });

  /**
   * Test: Parses SCRAPE_DAYS as integer
   */
  it("should parse SCRAPE_DAYS as integer", () => {
    process.env.SCRAPE_DAYS = "30";

    const config = getConfig();

    expect(config.scrapeDays).toBe(30);
  });
});

// =============================================================================
// initDb Tests
// =============================================================================

describe("initDb", () => {
  /**
   * Test: Throws error when PGLITE_DB_PATH is not set
   */
  it("should throw error when PGLITE_DB_PATH is not set", async () => {
    delete process.env.PGLITE_DB_PATH;

    await expect(initDb()).rejects.toThrow(
      "'PGLITE_DB_PATH' environment needs to be set"
    );
  });

  /**
   * Test: Creates in-memory database with :memory: path
   */
  it("should create in-memory database with :memory: path", async () => {
    process.env.PGLITE_DB_PATH = ":memory:";

    const db = await initDb();

    expect(db).toBeDefined();
    // Verify it's a working database by running a simple query
    const result = await db.query<{ value: number }>("SELECT 1 as value");
    expect(result.rows[0]?.value).toBe(1);
  });

  /**
   * Test: Returns same instance on subsequent calls
   */
  it("should return same instance on subsequent calls", async () => {
    process.env.PGLITE_DB_PATH = ":memory:";

    const db1 = await initDb();
    const db2 = await initDb();

    expect(db1).toBe(db2);
  });
});

// =============================================================================
// getDb Tests
// =============================================================================

describe("getDb", () => {
  /**
   * Test: Throws error when PGLITE_DB_PATH is not set
   */
  it("should throw error when PGLITE_DB_PATH is not set", () => {
    delete process.env.PGLITE_DB_PATH;

    expect(() => getDb()).toThrow(
      "'PGLITE_DB_PATH' environment needs to be set"
    );
  });

  /**
   * Test: Creates database instance synchronously
   */
  it("should create database instance synchronously", () => {
    process.env.PGLITE_DB_PATH = ":memory:";

    const db = getDb();

    expect(db).toBeDefined();
  });

  /**
   * Test: Returns same instance on subsequent calls
   */
  it("should return same instance on subsequent calls", () => {
    process.env.PGLITE_DB_PATH = ":memory:";

    const db1 = getDb();
    const db2 = getDb();

    expect(db1).toBe(db2);
  });
});

// =============================================================================
// resetDbInstance Tests
// =============================================================================

describe("resetDbInstance", () => {
  /**
   * Test: Resets singleton allowing new instance creation
   */
  it("should reset singleton allowing new instance creation", () => {
    process.env.PGLITE_DB_PATH = ":memory:";

    const db1 = getDb();
    resetDbInstance();
    const db2 = getDb();

    // Different instances after reset
    expect(db1).not.toBe(db2);
  });

  /**
   * Test: Can be called multiple times safely
   */
  it("should be safe to call multiple times", () => {
    expect(() => {
      resetDbInstance();
      resetDbInstance();
      resetDbInstance();
    }).not.toThrow();
  });
});
