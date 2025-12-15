/**
 * Tests for configuration loading functions.
 *
 * @group unit
 * @group config
 *
 * Test Coverage:
 * - loadGitHubConfig: partial/complete configuration handling
 * - loadSlackConfig: partial/complete configuration handling
 * - loadDatabaseConfig: required field validation
 * - loadConfig: aggregation of all configurations
 *
 * @module @leaderboard/config/__tests__/config-loader
 */

import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import {
  loadGitHubConfig,
  loadSlackConfig,
  loadDatabaseConfig,
  loadConfig,
} from "../loaders";

// =============================================================================
// Test Setup
// =============================================================================

/**
 * Store original environment variables to restore after tests.
 */
let originalEnv: NodeJS.ProcessEnv;

beforeEach(() => {
  // Save original environment
  originalEnv = { ...process.env };

  // Clear all relevant environment variables
  delete process.env.GITHUB_TOKEN;
  delete process.env.GITHUB_ORG;
  delete process.env.SLACK_API_TOKEN;
  delete process.env.SLACK_CHANNEL;
  delete process.env.PGLITE_DB_PATH;
  delete process.env.LEADERBOARD_DATA_PATH;
  delete process.env.SCRAPE_DAYS;
});

afterEach(() => {
  // Restore original environment
  process.env = originalEnv;
});

// =============================================================================
// loadGitHubConfig Tests
// =============================================================================

describe("loadGitHubConfig", () => {
  /**
   * Test: Returns config when both token and org are set
   */
  it("should return config when both GITHUB_TOKEN and GITHUB_ORG are set", () => {
    process.env.GITHUB_TOKEN = "ghp_test_token";
    process.env.GITHUB_ORG = "test-org";

    const config = loadGitHubConfig();

    expect(config).toEqual({
      token: "ghp_test_token",
      org: "test-org",
    });
  });

  /**
   * Test: Returns undefined when GITHUB_TOKEN is missing
   */
  it("should return undefined when GITHUB_TOKEN is missing", () => {
    process.env.GITHUB_ORG = "test-org";

    const config = loadGitHubConfig();

    expect(config).toBeUndefined();
  });

  /**
   * Test: Returns undefined when GITHUB_ORG is missing
   */
  it("should return undefined when GITHUB_ORG is missing", () => {
    process.env.GITHUB_TOKEN = "ghp_test_token";

    const config = loadGitHubConfig();

    expect(config).toBeUndefined();
  });

  /**
   * Test: Returns undefined when both are missing
   */
  it("should return undefined when both are missing", () => {
    const config = loadGitHubConfig();

    expect(config).toBeUndefined();
  });

  /**
   * Test: Returns undefined when token is empty string
   */
  it("should return undefined when token is empty string", () => {
    process.env.GITHUB_TOKEN = "";
    process.env.GITHUB_ORG = "test-org";

    const config = loadGitHubConfig();

    expect(config).toBeUndefined();
  });
});

// =============================================================================
// loadSlackConfig Tests
// =============================================================================

describe("loadSlackConfig", () => {
  /**
   * Test: Returns config when both token and channel are set
   */
  it("should return config when both SLACK_API_TOKEN and SLACK_CHANNEL are set", () => {
    process.env.SLACK_API_TOKEN = "xoxb-test-token";
    process.env.SLACK_CHANNEL = "C12345678";

    const config = loadSlackConfig();

    expect(config).toEqual({
      token: "xoxb-test-token",
      channel: "C12345678",
    });
  });

  /**
   * Test: Returns undefined when SLACK_API_TOKEN is missing
   */
  it("should return undefined when SLACK_API_TOKEN is missing", () => {
    process.env.SLACK_CHANNEL = "C12345678";

    const config = loadSlackConfig();

    expect(config).toBeUndefined();
  });

  /**
   * Test: Returns undefined when SLACK_CHANNEL is missing
   */
  it("should return undefined when SLACK_CHANNEL is missing", () => {
    process.env.SLACK_API_TOKEN = "xoxb-test-token";

    const config = loadSlackConfig();

    expect(config).toBeUndefined();
  });

  /**
   * Test: Returns undefined when both are missing
   */
  it("should return undefined when both are missing", () => {
    const config = loadSlackConfig();

    expect(config).toBeUndefined();
  });
});

// =============================================================================
// loadDatabaseConfig Tests
// =============================================================================

describe("loadDatabaseConfig", () => {
  /**
   * Test: Returns config when PGLITE_DB_PATH is set
   */
  it("should return config when PGLITE_DB_PATH is set", () => {
    process.env.PGLITE_DB_PATH = "/path/to/db";

    const config = loadDatabaseConfig();

    expect(config).toEqual({
      path: "/path/to/db",
    });
  });

  /**
   * Test: Throws when PGLITE_DB_PATH is missing
   */
  it("should throw when PGLITE_DB_PATH is missing", () => {
    expect(() => loadDatabaseConfig()).toThrow(
      "Required environment variable 'PGLITE_DB_PATH' is not set"
    );
  });

  /**
   * Test: Handles :memory: path for testing
   */
  it("should handle :memory: path for testing", () => {
    process.env.PGLITE_DB_PATH = ":memory:";

    const config = loadDatabaseConfig();

    expect(config.path).toBe(":memory:");
  });
});

// =============================================================================
// loadConfig Tests
// =============================================================================

describe("loadConfig", () => {
  /**
   * Test: Returns complete config with all services configured
   */
  it("should return complete config when all services are configured", () => {
    process.env.PGLITE_DB_PATH = "/path/to/db";
    process.env.GITHUB_TOKEN = "ghp_token";
    process.env.GITHUB_ORG = "my-org";
    process.env.SLACK_API_TOKEN = "xoxb-token";
    process.env.SLACK_CHANNEL = "C123";
    process.env.LEADERBOARD_DATA_PATH = "/data";
    process.env.SCRAPE_DAYS = "14";

    const config = loadConfig();

    expect(config).toEqual({
      database: { path: "/path/to/db" },
      github: { token: "ghp_token", org: "my-org" },
      slack: { token: "xoxb-token", channel: "C123" },
      leaderboardDataPath: "/data",
      scrapeDays: 14,
    });
  });

  /**
   * Test: Returns config with optional services as undefined
   */
  it("should return config with optional services as undefined", () => {
    process.env.PGLITE_DB_PATH = "/path/to/db";

    const config = loadConfig();

    expect(config.database).toEqual({ path: "/path/to/db" });
    expect(config.github).toBeUndefined();
    expect(config.slack).toBeUndefined();
    expect(config.leaderboardDataPath).toBeUndefined();
    expect(config.scrapeDays).toBe(7); // default value
  });

  /**
   * Test: Throws when database config is missing
   */
  it("should throw when database config is missing", () => {
    expect(() => loadConfig()).toThrow(
      "Required environment variable 'PGLITE_DB_PATH' is not set"
    );
  });

  /**
   * Test: Uses default scrapeDays when not set
   */
  it("should use default scrapeDays when not set", () => {
    process.env.PGLITE_DB_PATH = "/path/to/db";

    const config = loadConfig();

    expect(config.scrapeDays).toBe(7);
  });

  /**
   * Test: Parses custom scrapeDays value
   */
  it("should parse custom scrapeDays value", () => {
    process.env.PGLITE_DB_PATH = "/path/to/db";
    process.env.SCRAPE_DAYS = "30";

    const config = loadConfig();

    expect(config.scrapeDays).toBe(30);
  });
});
