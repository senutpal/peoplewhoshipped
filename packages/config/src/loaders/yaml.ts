/**
 * @fileoverview YAML configuration loader and validator
 * @module @leaderboard/config/loaders/yaml
 *
 * This module provides functions for loading and validating YAML
 * configuration files with JSON schema validation.
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";
import yaml from "js-yaml";
import type { YamlConfig } from "../types/yaml";

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

  // Use LEADERBOARD_DATA_PATH if set, otherwise fall back to CWD
  const dataPath = process.env.LEADERBOARD_DATA_PATH;
  const resolvedPath =
    configPath ??
    (dataPath
      ? join(dataPath, "leaderboard", "config.yaml")
      : join(process.cwd(), "config.yaml"));

  if (!existsSync(resolvedPath)) {
    throw new Error(`Configuration file not found: ${resolvedPath}`);
  }

  const fileContents = readFileSync(resolvedPath, "utf8");

  const rawConfig = yaml.load(fileContents, {
    schema: yaml.JSON_SCHEMA,
  }) as YamlConfig;

  if (rawConfig == null) {
    throw new Error(
      "Invalid configuration: file is empty or could not be parsed",
    );
  }

  // Basic validation
  if (!rawConfig.org || !rawConfig.meta || !rawConfig.leaderboard) {
    throw new Error(
      "Invalid configuration: missing required sections (org, meta, leaderboard)",
    );
  }

  cachedConfig = rawConfig;
  return cachedConfig;
}

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

  // Use LEADERBOARD_DATA_PATH if set, otherwise fall back to CWD
  const dataPath = process.env.LEADERBOARD_DATA_PATH;
  const resolvedPath =
    configPath ??
    (dataPath
      ? join(dataPath, "leaderboard", "config.yaml")
      : join(process.cwd(), "config.yaml"));

  if (!existsSync(resolvedPath)) {
    throw new Error(`Configuration file not found: ${resolvedPath}`);
  }

  const fileContents = readFileSync(resolvedPath, "utf8");

  const rawConfig = yaml.load(fileContents, {
    schema: yaml.JSON_SCHEMA,
  }) as YamlConfig;

  if (rawConfig == null) {
    throw new Error(
      "Invalid configuration: file is empty or could not be parsed",
    );
  }

  // Basic validation
  if (!rawConfig.org || !rawConfig.meta || !rawConfig.leaderboard) {
    throw new Error(
      "Invalid configuration: missing required sections (org, meta, leaderboard)",
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
 */
export function getVisibleRoles(config: YamlConfig): string[] {
  return Object.entries(config.leaderboard.roles)
    .filter(([, roleConfig]) => roleConfig.hidden !== true)
    .map(([slug]) => slug);
}
