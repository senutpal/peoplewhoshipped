/**
 * Tests for environment variable utility functions.
 *
 * @group unit
 * @group config
 *
 * Test Coverage:
 * - getRequiredEnv: throws on missing, returns valid values
 * - getOptionalEnv: returns defaults, returns set values
 * - getOptionalEnvInt: handles strings, numbers, invalid values
 *
 * @module @leaderboard/config/__tests__/env-parser
 */

import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import {
  getRequiredEnv,
  getOptionalEnv,
  getOptionalEnvInt,
} from "../env";

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
});

afterEach(() => {
  // Restore original environment
  process.env = originalEnv;
});

// =============================================================================
// getRequiredEnv Tests
// =============================================================================

describe("getRequiredEnv", () => {
  /**
   * Test: Returns value when environment variable is set
   */
  it("should return the value when environment variable is set", () => {
    process.env.TEST_REQUIRED = "test-value";

    const result = getRequiredEnv("TEST_REQUIRED");

    expect(result).toBe("test-value");
  });

  /**
   * Test: Throws error when environment variable is not set
   */
  it("should throw error when environment variable is not set", () => {
    delete process.env.MISSING_VAR;

    expect(() => getRequiredEnv("MISSING_VAR")).toThrow(
      "Required environment variable 'MISSING_VAR' is not set"
    );
  });

  /**
   * Test: Throws error when environment variable is empty string
   */
  it("should throw error when environment variable is empty string", () => {
    process.env.EMPTY_VAR = "";

    expect(() => getRequiredEnv("EMPTY_VAR")).toThrow(
      "Required environment variable 'EMPTY_VAR' is not set"
    );
  });

  /**
   * Test: Preserves whitespace in values
   */
  it("should preserve whitespace in values", () => {
    process.env.WHITESPACE_VAR = "  value with spaces  ";

    const result = getRequiredEnv("WHITESPACE_VAR");

    expect(result).toBe("  value with spaces  ");
  });

  /**
   * Test: Returns value with special characters
   */
  it("should return value with special characters", () => {
    process.env.SPECIAL_VAR = "value@with#special$chars!";

    const result = getRequiredEnv("SPECIAL_VAR");

    expect(result).toBe("value@with#special$chars!");
  });
});

// =============================================================================
// getOptionalEnv Tests
// =============================================================================

describe("getOptionalEnv", () => {
  /**
   * Test: Returns value when environment variable is set
   */
  it("should return the value when environment variable is set", () => {
    process.env.TEST_OPTIONAL = "actual-value";

    const result = getOptionalEnv("TEST_OPTIONAL", "default");

    expect(result).toBe("actual-value");
  });

  /**
   * Test: Returns default when environment variable is not set
   */
  it("should return default when environment variable is not set", () => {
    delete process.env.UNSET_OPTIONAL;

    const result = getOptionalEnv("UNSET_OPTIONAL", "default-value");

    expect(result).toBe("default-value");
  });

  /**
   * Test: Returns empty string when set to empty (not default)
   */
  it("should return empty string when environment variable is empty", () => {
    process.env.EMPTY_OPTIONAL = "";

    const result = getOptionalEnv("EMPTY_OPTIONAL", "default");

    // Empty string is a valid value, should be returned (not default)
    expect(result).toBe("");
  });

  /**
   * Test: Handles various default value types
   */
  it("should work with different default values", () => {
    delete process.env.DYNAMIC_DEFAULT;

    expect(getOptionalEnv("DYNAMIC_DEFAULT", "info")).toBe("info");
    expect(getOptionalEnv("DYNAMIC_DEFAULT", "debug")).toBe("debug");
    expect(getOptionalEnv("DYNAMIC_DEFAULT", "")).toBe("");
  });
});

// =============================================================================
// getOptionalEnvInt Tests
// =============================================================================

describe("getOptionalEnvInt", () => {
  /**
   * Test: Parses valid integer string
   */
  it("should parse valid integer string", () => {
    process.env.TEST_INT = "42";

    const result = getOptionalEnvInt("TEST_INT", 0);

    expect(result).toBe(42);
  });

  /**
   * Test: Returns default when environment variable is not set
   */
  it("should return default when environment variable is not set", () => {
    delete process.env.UNSET_INT;

    const result = getOptionalEnvInt("UNSET_INT", 100);

    expect(result).toBe(100);
  });

  /**
   * Test: Returns default when environment variable is empty
   */
  it("should return default when environment variable is empty", () => {
    process.env.EMPTY_INT = "";

    const result = getOptionalEnvInt("EMPTY_INT", 500);

    expect(result).toBe(500);
  });

  /**
   * Test: Returns default when value is not a valid integer
   */
  it("should return default when value is not a valid integer", () => {
    process.env.INVALID_INT = "not-a-number";

    const result = getOptionalEnvInt("INVALID_INT", 1000);

    expect(result).toBe(1000);
  });

  /**
   * Test: Handles negative integers
   */
  it("should handle negative integers", () => {
    process.env.NEGATIVE_INT = "-50";

    const result = getOptionalEnvInt("NEGATIVE_INT", 0);

    expect(result).toBe(-50);
  });

  /**
   * Test: Handles zero
   */
  it("should handle zero as a valid value", () => {
    process.env.ZERO_INT = "0";

    const result = getOptionalEnvInt("ZERO_INT", 100);

    expect(result).toBe(0);
  });

  /**
   * Test: Truncates floating point numbers
   */
  it("should truncate floating point numbers", () => {
    process.env.FLOAT_INT = "3.14159";

    const result = getOptionalEnvInt("FLOAT_INT", 0);

    expect(result).toBe(3);
  });

  /**
   * Test: Handles large integers
   */
  it("should handle large integers", () => {
    process.env.LARGE_INT = "999999999";

    const result = getOptionalEnvInt("LARGE_INT", 0);

    expect(result).toBe(999999999);
  });

  /**
   * Test: Handles whitespace around numbers
   */
  it("should handle values with leading/trailing non-numeric chars", () => {
    process.env.WHITESPACE_INT = "123abc";

    const result = getOptionalEnvInt("WHITESPACE_INT", 0);

    // parseInt stops at first non-digit, so "123abc" → 123
    expect(result).toBe(123);
  });
});
