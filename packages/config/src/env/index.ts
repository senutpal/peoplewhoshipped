/**
 * @fileoverview Environment variable utility functions
 * @module @leaderboard/config/env
 *
 * This module provides type-safe functions for reading environment variables
 * with proper error handling and default value support.
 *
 * @remarks
 * These utilities are designed to:
 * - Provide clear error messages when required variables are missing
 * - Support type-safe default values for optional variables
 * - Handle type conversions (e.g., string to number) safely
 *
 * @example
 * ```typescript
 * import { getRequiredEnv, getOptionalEnv, getOptionalEnvInt } from "@leaderboard/config";
 *
 * // Required variable - throws if not set
 * const apiKey = getRequiredEnv("API_KEY");
 *
 * // Optional string with default
 * const logLevel = getOptionalEnv("LOG_LEVEL", "info");
 *
 * // Optional integer with default
 * const timeout = getOptionalEnvInt("TIMEOUT_MS", 5000);
 * ```
 */

// =============================================================================
// Required Environment Variables
// =============================================================================

/**
 * Retrieves a required environment variable or throws an error if not set.
 *
 * @param name - The name of the environment variable to retrieve
 * @returns The value of the environment variable
 * @throws {Error} When the environment variable is not set or is empty
 *
 * @example
 * ```typescript
 * // Throws if GITHUB_TOKEN is not set
 * const token = getRequiredEnv("GITHUB_TOKEN");
 *
 * try {
 *   const secret = getRequiredEnv("MISSING_VAR");
 * } catch (error) {
 *   console.error("Required variable not set");
 * }
 * ```
 *
 * @remarks
 * Use this for variables that are absolutely required for the application
 * to function. The application should fail fast if these are missing
 * rather than continuing with undefined behavior.
 */
export function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Required environment variable '${name}' is not set`);
  }
  return value;
}

// =============================================================================
// Optional Environment Variables
// =============================================================================

/**
 * Retrieves an optional environment variable with a default fallback value.
 *
 * @param name - The name of the environment variable to retrieve
 * @param defaultValue - The default value to return if the variable is not set
 * @returns The environment variable value or the default value
 *
 * @example
 * ```typescript
 * // Returns "production" if NODE_ENV is not set
 * const env = getOptionalEnv("NODE_ENV", "development");
 *
 * // Returns the actual value if set
 * process.env.LOG_LEVEL = "debug";
 * const level = getOptionalEnv("LOG_LEVEL", "info"); // "debug"
 * ```
 *
 * @remarks
 * Use this for configuration values that have sensible defaults.
 * The nullish coalescing operator ensures that only `undefined` or `null`
 * values trigger the default - empty strings are preserved.
 */
export function getOptionalEnv(name: string, defaultValue: string): string {
  return process.env[name] ?? defaultValue;
}

/**
 * Retrieves an optional integer environment variable with a default fallback value.
 *
 * @param name - The name of the environment variable to retrieve
 * @param defaultValue - The default integer value to return if the variable is not set or not a valid integer
 * @returns The parsed integer value or the default value
 *
 * @example
 * ```typescript
 * // Returns 1000 if BATCH_SIZE is not set
 * const batchSize = getOptionalEnvInt("BATCH_SIZE", 1000);
 *
 * // Handles invalid integers gracefully
 * process.env.TIMEOUT = "not-a-number";
 * const timeout = getOptionalEnvInt("TIMEOUT", 5000); // returns 5000
 *
 * // Parses valid integers
 * process.env.PORT = "3000";
 * const port = getOptionalEnvInt("PORT", 8080); // returns 3000
 * ```
 *
 * @remarks
 * This function safely handles:
 * - Missing environment variables (returns default)
 * - Empty string values (returns default)
 * - Non-numeric strings (returns default)
 * - Valid integer strings (returns parsed integer)
 *
 * The parsing uses radix 10 to avoid octal interpretation issues.
 */
export function getOptionalEnvInt(name: string, defaultValue: number): number {
  const value = process.env[name];
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}
