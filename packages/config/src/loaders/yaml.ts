/**
 * @fileoverview YAML configuration loader and validator
 * @module @leaderboard/config/loaders/yaml
 *
 * This module provides functions for loading and validating YAML
 * configuration files with JSON schema validation.
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";
import type { YamlConfig } from "../types/yaml";

// =============================================================================
// YAML Parsing (using js-yaml dynamically)
// =============================================================================

// Note: js-yaml is imported dynamically to avoid bundling issues
let yaml: typeof import("js-yaml") | null = null;

async function getYaml() {
  if (!yaml) {
    yaml = await import("js-yaml");
  }
  return yaml;
}

// =============================================================================
// Configuration Cache
// =============================================================================

let cachedConfig: YamlConfig | null = null;

// =============================================================================
// Configuration Loading
// =============================================================================

/**
 * Load and parse the config.yaml file.
 *
 * @param configPath - Optional path to the config file (defaults to process.cwd()/config.yaml)
 * @returns Parsed configuration object
 *
 * @throws {Error} If the config file is not found
 * @throws {Error} If the config file is invalid YAML
 *
 * @example
 * ```typescript
 * const config = await getYamlConfig();
 * console.log(config.org.name);
 * ```
 */
export async function getYamlConfig(configPath?: string): Promise<YamlConfig> {
  if (cachedConfig) {
    return cachedConfig;
  }

  const resolvedPath = configPath ?? join(process.cwd(), "config.yaml");

  if (!existsSync(resolvedPath)) {
    throw new Error(`Configuration file not found: ${resolvedPath}`);
  }

  const fileContents = readFileSync(resolvedPath, "utf8");
  const jsYaml = await getYaml();
  
  const rawConfig = jsYaml.load(fileContents, {
    schema: jsYaml.JSON_SCHEMA,
  }) as YamlConfig;

  // Basic validation
  if (!rawConfig.org || !rawConfig.meta || !rawConfig.leaderboard) {
    throw new Error(
      "Invalid configuration: missing required sections (org, meta, leaderboard)"
    );
  }

  cachedConfig = rawConfig;
  return cachedConfig;
}

/**
 * Clear the cached YAML configuration.
 * Useful for testing or when configuration needs to be reloaded.
 */
export function clearYamlConfigCache(): void {
  cachedConfig = null;
}

// =============================================================================
// Role Helpers
// =============================================================================

/**
 * Get all role names that are marked as hidden.
 *
 * @param config - The YAML configuration object
 * @returns Array of hidden role slugs
 *
 * @example
 * ```typescript
 * const config = await getYamlConfig();
 * const hiddenRoles = getHiddenRoles(config);
 * // ["bot", "test"]
 * ```
 */
export function getHiddenRoles(config: YamlConfig): string[] {
  return Object.entries(config.leaderboard.roles)
    .filter(([, roleConfig]) => roleConfig.hidden === true)
    .map(([slug]) => slug);
}

/**
 * Get all role names that are not hidden.
 *
 * @param config - The YAML configuration object
 * @returns Array of visible role slugs
 *
 * @example
 * ```typescript
 * const config = await getYamlConfig();
 * const visibleRoles = getVisibleRoles(config);
 * // ["core", "contributor", "intern"]
 * ```
 */
export function getVisibleRoles(config: YamlConfig): string[] {
  return Object.entries(config.leaderboard.roles)
    .filter(([, roleConfig]) => roleConfig.hidden !== true)
    .map(([slug]) => slug);
}

// =============================================================================
// Synchronous Loading (for compatibility)
// =============================================================================

/**
 * Load and parse the config.yaml file synchronously.
 *
 * @param configPath - Optional path to the config file
 * @returns Parsed configuration object
 *
 * @remarks
 * This function uses dynamic import with a workaround for synchronous loading.
 * Prefer `getYamlConfig()` for async contexts.
 *
 * @throws {Error} If the config file is not found
 * @throws {Error} If the config file is invalid YAML
 */
export function getYamlConfigSync(configPath?: string): YamlConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  const resolvedPath = configPath ?? join(process.cwd(), "config.yaml");

  if (!existsSync(resolvedPath)) {
    throw new Error(`Configuration file not found: ${resolvedPath}`);
  }

  const fileContents = readFileSync(resolvedPath, "utf8");
  
  // Use require for synchronous loading (Bun/Node compatible)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const jsYaml = require("js-yaml");
  
  const rawConfig = jsYaml.load(fileContents, {
    schema: jsYaml.JSON_SCHEMA,
  }) as YamlConfig;

  // Basic validation
  if (!rawConfig.org || !rawConfig.meta || !rawConfig.leaderboard) {
    throw new Error(
      "Invalid configuration: missing required sections (org, meta, leaderboard)"
    );
  }

  cachedConfig = rawConfig;
  return cachedConfig;
}
