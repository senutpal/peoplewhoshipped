/**
 * Tests for configuration validation functions and type guards.
 *
 * @group unit
 * @group config
 *
 * Test Coverage:
 * - validateGitHubConfig: type guard behavior
 * - validateSlackConfig: type guard behavior
 * - validateConfig: complete configuration validation
 *
 * @module @leaderboard/config/__tests__/validators
 */

import { describe, it, expect } from "bun:test";
import {
  validateGitHubConfig,
  validateSlackConfig,
  validateConfig,
} from "../validators";
import type { LeaderboardConfig } from "../types";

// =============================================================================
// Test Fixtures
// =============================================================================

/**
 * Create a minimal valid configuration for testing.
 */
function createBaseConfig(
  overrides: Partial<LeaderboardConfig> = {}
): LeaderboardConfig {
  return {
    database: { path: "/path/to/db" },
    github: undefined,
    slack: undefined,
    leaderboardDataPath: undefined,
    scrapeDays: 7,
    ...overrides,
  };
}

// =============================================================================
// validateGitHubConfig Tests
// =============================================================================

describe("validateGitHubConfig", () => {
  /**
   * Test: Returns true when GitHub config is complete and valid
   */
  it("should return true when GitHub config is complete", () => {
    const config = createBaseConfig({
      github: {
        token: "ghp_test_token",
        org: "test-org",
      },
    });

    const result = validateGitHubConfig(config);

    expect(result).toBe(true);
  });

  /**
   * Test: Returns false when GitHub config is undefined
   */
  it("should return false when GitHub config is undefined", () => {
    const config = createBaseConfig({
      github: undefined,
    });

    const result = validateGitHubConfig(config);

    expect(result).toBe(false);
  });

  /**
   * Test: Returns false when token is empty
   */
  it("should return false when token is empty", () => {
    const config = createBaseConfig({
      github: {
        token: "",
        org: "test-org",
      },
    });

    const result = validateGitHubConfig(config);

    expect(result).toBe(false);
  });

  /**
   * Test: Returns false when org is empty
   */
  it("should return false when org is empty", () => {
    const config = createBaseConfig({
      github: {
        token: "ghp_test_token",
        org: "",
      },
    });

    const result = validateGitHubConfig(config);

    expect(result).toBe(false);
  });

  /**
   * Test: Type guard narrows config type correctly
   */
  it("should narrow type when returning true", () => {
    const config = createBaseConfig({
      github: {
        token: "ghp_test_token",
        org: "test-org",
      },
    });

    if (validateGitHubConfig(config)) {
      // TypeScript should know config.github is defined here
      const org: string = config.github.org;
      expect(org).toBe("test-org");
    }
  });
});

// =============================================================================
// validateSlackConfig Tests
// =============================================================================

describe("validateSlackConfig", () => {
  /**
   * Test: Returns true when Slack config is complete and valid
   */
  it("should return true when Slack config is complete", () => {
    const config = createBaseConfig({
      slack: {
        token: "xoxb-test-token",
        channel: "C12345678",
      },
    });

    const result = validateSlackConfig(config);

    expect(result).toBe(true);
  });

  /**
   * Test: Returns false when Slack config is undefined
   */
  it("should return false when Slack config is undefined", () => {
    const config = createBaseConfig({
      slack: undefined,
    });

    const result = validateSlackConfig(config);

    expect(result).toBe(false);
  });

  /**
   * Test: Returns false when token is empty
   */
  it("should return false when token is empty", () => {
    const config = createBaseConfig({
      slack: {
        token: "",
        channel: "C12345678",
      },
    });

    const result = validateSlackConfig(config);

    expect(result).toBe(false);
  });

  /**
   * Test: Returns false when channel is empty
   */
  it("should return false when channel is empty", () => {
    const config = createBaseConfig({
      slack: {
        token: "xoxb-test-token",
        channel: "",
      },
    });

    const result = validateSlackConfig(config);

    expect(result).toBe(false);
  });

  /**
   * Test: Type guard narrows config type correctly
   */
  it("should narrow type when returning true", () => {
    const config = createBaseConfig({
      slack: {
        token: "xoxb-test-token",
        channel: "C12345678",
      },
    });

    if (validateSlackConfig(config)) {
      // TypeScript should know config.slack is defined here
      const channel: string = config.slack.channel;
      expect(channel).toBe("C12345678");
    }
  });
});

// =============================================================================
// validateConfig Tests
// =============================================================================

describe("validateConfig", () => {
  /**
   * Test: Returns true for valid minimal configuration
   */
  it("should return true for valid minimal configuration", () => {
    const config = createBaseConfig();

    const result = validateConfig(config);

    expect(result).toBe(true);
  });

  /**
   * Test: Returns true for fully configured application
   */
  it("should return true for fully configured application", () => {
    const config = createBaseConfig({
      github: { token: "ghp_token", org: "org" },
      slack: { token: "xoxb-token", channel: "C123" },
      leaderboardDataPath: "/data",
      scrapeDays: 14,
    });

    const result = validateConfig(config);

    expect(result).toBe(true);
  });

  /**
   * Test: Returns false when database path is empty
   */
  it("should return false when database path is empty", () => {
    const config: LeaderboardConfig = {
      database: { path: "" },
      github: undefined,
      slack: undefined,
      leaderboardDataPath: undefined,
      scrapeDays: 7,
    };

    // Capture console.error output
    const originalError = console.error;
    let errorMessage = "";
    console.error = (msg: string) => {
      errorMessage = msg;
    };

    const result = validateConfig(config);

    // Restore console.error
    console.error = originalError;

    expect(result).toBe(false);
    expect(errorMessage).toBe("Database path is required");
  });

  /**
   * Test: Valid config with only GitHub enabled
   */
  it("should return true with only GitHub configured", () => {
    const config = createBaseConfig({
      github: { token: "ghp_token", org: "org" },
    });

    const result = validateConfig(config);

    expect(result).toBe(true);
  });

  /**
   * Test: Valid config with only Slack enabled
   */
  it("should return true with only Slack configured", () => {
    const config = createBaseConfig({
      slack: { token: "xoxb-token", channel: "C123" },
    });

    const result = validateConfig(config);

    expect(result).toBe(true);
  });
});
