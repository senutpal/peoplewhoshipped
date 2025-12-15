/**
 * Tests for YAML configuration loading and helpers.
 *
 * @group unit
 * @group config
 *
 * Test Coverage:
 * - getYamlConfig: async loading, caching, error handling
 * - getYamlConfigSync: synchronous loading
 * - clearYamlConfigCache: cache invalidation
 * - getHiddenRoles: role filtering
 * - getVisibleRoles: role filtering
 *
 * @module @leaderboard/config/__tests__/yaml-loader
 */

import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { writeFileSync, mkdirSync, rmSync, existsSync } from "fs";
import { join } from "path";
import {
  getYamlConfig,
  getYamlConfigSync,
  clearYamlConfigCache,
  getHiddenRoles,
  getVisibleRoles,
} from "../loaders/yaml";
import type { YamlConfig } from "../types/yaml";

// =============================================================================
// Test Setup
// =============================================================================

const TEST_CONFIG_DIR = join(process.cwd(), "test-fixtures-yaml");
const TEST_CONFIG_PATH = join(TEST_CONFIG_DIR, "config.yaml");

/**
 * Valid YAML configuration for testing.
 */
const VALID_YAML = `
org:
  name: "Test Organization"
  description: "A test organization"
  url: "https://test-org.com"
  logo_url: "https://test-org.com/logo.png"

meta:
  title: "Team Leaderboard"
  description: "Track team contributions"
  image_url: "https://test-org.com/og.png"
  site_url: "https://test-org.com"
  favicon_url: "https://test-org.com/favicon.ico"

leaderboard:
  data_source: "https://github.com/test-org/data"
  roles:
    developer:
      name: "Developer"
      hidden: false
    bot:
      name: "Bot"
      hidden: true
    intern:
      name: "Intern"
      hidden: false
    test:
      name: "Test Account"
      hidden: true
`;

/**
 * Invalid YAML configuration (missing required sections).
 */
const INVALID_YAML_MISSING_SECTIONS = `
org:
  name: "Test Organization"
  description: "A test organization"
  url: "https://test-org.com"
  logo_url: "https://test-org.com/logo.png"
# Missing meta and leaderboard sections
`;

// Store original environment
let originalEnv: NodeJS.ProcessEnv;

beforeEach(() => {
  originalEnv = { ...process.env };
  clearYamlConfigCache();

  // Create test directory
  if (!existsSync(TEST_CONFIG_DIR)) {
    mkdirSync(TEST_CONFIG_DIR, { recursive: true });
  }
});

afterEach(() => {
  process.env = originalEnv;
  clearYamlConfigCache();

  // Clean up test directory
  if (existsSync(TEST_CONFIG_DIR)) {
    rmSync(TEST_CONFIG_DIR, { recursive: true, force: true });
  }
});

// =============================================================================
// getYamlConfig Tests
// =============================================================================

describe("getYamlConfig", () => {
  /**
   * Test: Loads and parses valid YAML configuration
   */
  it("should load and parse valid YAML configuration", async () => {
    writeFileSync(TEST_CONFIG_PATH, VALID_YAML);

    const config = await getYamlConfig(TEST_CONFIG_PATH);

    expect(config.org.name).toBe("Test Organization");
    expect(config.org.description).toBe("A test organization");
    expect(config.meta.title).toBe("Team Leaderboard");
    expect(config.leaderboard.roles).toBeDefined();
  });

  /**
   * Test: Throws when config file is not found
   */
  it("should throw when config file is not found", async () => {
    const nonExistentPath = join(TEST_CONFIG_DIR, "nonexistent.yaml");

    await expect(getYamlConfig(nonExistentPath)).rejects.toThrow(
      /Configuration file not found/
    );
  });

  /**
   * Test: Throws when required sections are missing
   */
  it("should throw when required sections are missing", async () => {
    writeFileSync(TEST_CONFIG_PATH, INVALID_YAML_MISSING_SECTIONS);

    await expect(getYamlConfig(TEST_CONFIG_PATH)).rejects.toThrow(
      /missing required sections/
    );
  });

  /**
   * Test: Caches configuration after first load
   */
  it("should cache configuration after first load", async () => {
    writeFileSync(TEST_CONFIG_PATH, VALID_YAML);

    const config1 = await getYamlConfig(TEST_CONFIG_PATH);

    // Modify the file - cached version should be returned
    writeFileSync(TEST_CONFIG_PATH, VALID_YAML.replace("Test Organization", "Modified Org"));

    const config2 = await getYamlConfig(TEST_CONFIG_PATH);

    // Should still be the original cached value
    expect(config1).toEqual(config2);
    expect(config2.org.name).toBe("Test Organization");
  });

  /**
   * Test: Uses LEADERBOARD_DATA_PATH when set (async)
   */
  it("should use LEADERBOARD_DATA_PATH environment variable when set", async () => {
    // Create the expected directory structure
    const dataPath = join(TEST_CONFIG_DIR, "data");
    const leaderboardDir = join(dataPath, "leaderboard");
    mkdirSync(leaderboardDir, { recursive: true });
    writeFileSync(join(leaderboardDir, "config.yaml"), VALID_YAML);

    // Set environment variable
    process.env.LEADERBOARD_DATA_PATH = dataPath;

    // Load without explicit path - should use env var
    const config = await getYamlConfig();

    expect(config.org.name).toBe("Test Organization");
  });
});

// =============================================================================
// getYamlConfigSync Tests
// =============================================================================

describe("getYamlConfigSync", () => {
  /**
   * Test: Loads and parses valid YAML configuration synchronously
   */
  it("should load and parse valid YAML configuration synchronously", () => {
    writeFileSync(TEST_CONFIG_PATH, VALID_YAML);

    const config = getYamlConfigSync(TEST_CONFIG_PATH);

    expect(config.org.name).toBe("Test Organization");
    expect(config.meta.title).toBe("Team Leaderboard");
  });

  /**
   * Test: Throws when config file is not found
   */
  it("should throw when config file is not found", () => {
    const nonExistentPath = join(TEST_CONFIG_DIR, "nonexistent.yaml");

    expect(() => getYamlConfigSync(nonExistentPath)).toThrow(
      /Configuration file not found/
    );
  });

  /**
   * Test: Returns cached config on subsequent calls
   */
  it("should return cached config on subsequent calls", () => {
    writeFileSync(TEST_CONFIG_PATH, VALID_YAML);

    const config1 = getYamlConfigSync(TEST_CONFIG_PATH);
    const config2 = getYamlConfigSync(TEST_CONFIG_PATH);

    expect(config1).toEqual(config2);
  });

  /**
   * Test: Throws when required sections are missing (sync)
   */
  it("should throw when required sections are missing", () => {
    writeFileSync(TEST_CONFIG_PATH, INVALID_YAML_MISSING_SECTIONS);

    expect(() => getYamlConfigSync(TEST_CONFIG_PATH)).toThrow(
      /missing required sections/
    );
  });

  /**
   * Test: Uses LEADERBOARD_DATA_PATH when set (sync)
   */
  it("should use LEADERBOARD_DATA_PATH environment variable when set", () => {
    // Create the expected directory structure
    const dataPath = join(TEST_CONFIG_DIR, "data");
    const leaderboardDir = join(dataPath, "leaderboard");
    mkdirSync(leaderboardDir, { recursive: true });
    writeFileSync(join(leaderboardDir, "config.yaml"), VALID_YAML);

    // Set environment variable
    process.env.LEADERBOARD_DATA_PATH = dataPath;

    // Load without explicit path - should use env var
    const config = getYamlConfigSync();

    expect(config.org.name).toBe("Test Organization");
  });
});

// =============================================================================
// clearYamlConfigCache Tests
// =============================================================================

describe("clearYamlConfigCache", () => {
  /**
   * Test: Clears the cache allowing fresh load
   */
  it("should clear the cache allowing fresh load", async () => {
    writeFileSync(TEST_CONFIG_PATH, VALID_YAML);

    // First load
    const config1 = await getYamlConfig(TEST_CONFIG_PATH);
    expect(config1.org.name).toBe("Test Organization");

    // Modify file
    writeFileSync(
      TEST_CONFIG_PATH,
      VALID_YAML.replace("Test Organization", "Updated Organization")
    );

    // Clear cache
    clearYamlConfigCache();

    // Load again - should get updated value
    const config2 = await getYamlConfig(TEST_CONFIG_PATH);
    expect(config2.org.name).toBe("Updated Organization");
  });
});

// =============================================================================
// getHiddenRoles Tests
// =============================================================================

describe("getHiddenRoles", () => {
  /**
   * Test: Returns array of hidden role slugs
   */
  it("should return array of hidden role slugs", async () => {
    writeFileSync(TEST_CONFIG_PATH, VALID_YAML);

    const config = await getYamlConfig(TEST_CONFIG_PATH);
    const hiddenRoles = getHiddenRoles(config);

    expect(hiddenRoles).toContain("bot");
    expect(hiddenRoles).toContain("test");
    expect(hiddenRoles).not.toContain("developer");
    expect(hiddenRoles).not.toContain("intern");
  });

  /**
   * Test: Returns empty array when no roles are hidden
   */
  it("should return empty array when no roles are hidden", async () => {
    const noHiddenYaml = `
org:
  name: "Test"
  description: "Test org"
  url: "https://test.com"
  logo_url: "https://test.com/logo.png"

meta:
  title: "Test"
  description: "Test"
  image_url: "https://test.com/og.png"
  site_url: "https://test.com"
  favicon_url: "https://test.com/favicon.ico"

leaderboard:
  data_source: "https://github.com/test/data"
  roles:
    developer:
      name: "Developer"
      hidden: false
`;
    writeFileSync(TEST_CONFIG_PATH, noHiddenYaml);

    const config = await getYamlConfig(TEST_CONFIG_PATH);
    const hiddenRoles = getHiddenRoles(config);

    expect(hiddenRoles).toEqual([]);
  });
});

// =============================================================================
// getVisibleRoles Tests
// =============================================================================

describe("getVisibleRoles", () => {
  /**
   * Test: Returns array of visible role slugs
   */
  it("should return array of visible role slugs", async () => {
    writeFileSync(TEST_CONFIG_PATH, VALID_YAML);

    const config = await getYamlConfig(TEST_CONFIG_PATH);
    const visibleRoles = getVisibleRoles(config);

    expect(visibleRoles).toContain("developer");
    expect(visibleRoles).toContain("intern");
    expect(visibleRoles).not.toContain("bot");
    expect(visibleRoles).not.toContain("test");
  });

  /**
   * Test: Returns all roles when none are hidden
   */
  it("should return all roles when none are hidden", async () => {
    const allVisibleYaml = `
org:
  name: "Test"
  description: "Test org"
  url: "https://test.com"
  logo_url: "https://test.com/logo.png"

meta:
  title: "Test"
  description: "Test"
  image_url: "https://test.com/og.png"
  site_url: "https://test.com"
  favicon_url: "https://test.com/favicon.ico"

leaderboard:
  data_source: "https://github.com/test/data"
  roles:
    developer:
      name: "Developer"
    designer:
      name: "Designer"
`;
    writeFileSync(TEST_CONFIG_PATH, allVisibleYaml);

    const config = await getYamlConfig(TEST_CONFIG_PATH);
    const visibleRoles = getVisibleRoles(config);

    expect(visibleRoles).toContain("developer");
    expect(visibleRoles).toContain("designer");
    expect(visibleRoles.length).toBe(2);
  });
});
