/**
 * @fileoverview YAML configuration loader and validator
 * @module @leaderboard/config/loaders/yaml
 */

import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import type { YamlConfig } from "../types/yaml";

// =============================================================================
// YAML Parsing (using js-yaml dynamically)
// =============================================================================

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
// Configuration Paths
// =============================================================================

function findConfigPath(): string {
  if (process.env.LEADERBOARD_DATA_PATH) {
    const envPath = join(
      process.env.LEADERBOARD_DATA_PATH,
      "leaderboard",
      "config.yaml",
    );
    if (existsSync(envPath)) {
      return envPath;
    }
  }

  const possiblePaths = [
    join(process.cwd(), "data", "leaderboard", "config.yaml"),
    join(process.cwd(), "..", "data", "leaderboard", "config.yaml"),
    join(__dirname, "..", "..", "..", "data", "leaderboard", "config.yaml"),
    join(__dirname, "..", "..", "data", "leaderboard", "config.yaml"),
    join(
      __dirname,
      "..",
      "..",
      "..",
      "..",
      "data",
      "leaderboard",
      "config.yaml",
    ),
  ];

  for (const path of possiblePaths) {
    if (existsSync(path)) {
      return path;
    }
  }

  return join(process.cwd(), "config.yaml");
}

function resolveConfigPath(configPath?: string): string {
  if (configPath) {
    return configPath;
  }

  if (process.env.LEADERBOARD_DATA_PATH) {
    return join(
      process.env.LEADERBOARD_DATA_PATH,
      "leaderboard",
      "config.yaml",
    );
  }

  return findConfigPath();
}

// =============================================================================
// Async Loading
// =============================================================================

export async function getYamlConfig(configPath?: string): Promise<YamlConfig> {
  if (cachedConfig) {
    return cachedConfig;
  }

  const resolvedPath = resolveConfigPath(configPath);

  if (!existsSync(resolvedPath)) {
    throw new Error(`Configuration file not found: ${resolvedPath}`);
  }

  const fileContents = readFileSync(resolvedPath, "utf8");
  const jsYaml = await getYaml();

  const rawConfig = jsYaml.load(fileContents, {
    schema: jsYaml.JSON_SCHEMA,
  }) as YamlConfig;

  if (rawConfig == null) {
    throw new Error(
      "Invalid configuration: file is empty or could not be parsed",
    );
  }

  if (!rawConfig.org || !rawConfig.meta || !rawConfig.leaderboard) {
    throw new Error(
      "Invalid configuration: missing required sections (org, meta, leaderboard)",
    );
  }

  cachedConfig = rawConfig;
  return cachedConfig;
}

// =============================================================================
// Synchronous Loading
// =============================================================================

export function getYamlConfigSync(configPath?: string): YamlConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  const resolvedPath = resolveConfigPath(configPath);

  if (!existsSync(resolvedPath)) {
    throw new Error(`Configuration file not found: ${resolvedPath}`);
  }

  const fileContents = readFileSync(resolvedPath, "utf8");

  const jsYaml = require("js-yaml");

  const rawConfig = jsYaml.load(fileContents, {
    schema: jsYaml.JSON_SCHEMA,
  }) as YamlConfig;

  if (rawConfig == null) {
    throw new Error(
      "Invalid configuration: file is empty or could not be parsed",
    );
  }

  if (!rawConfig.org || !rawConfig.meta || !rawConfig.leaderboard) {
    throw new Error(
      "Invalid configuration: missing required sections (org, meta, leaderboard)",
    );
  }

  cachedConfig = rawConfig;
  return cachedConfig;
}

// =============================================================================
// Cache Management
// =============================================================================

export function clearYamlConfigCache(): void {
  cachedConfig = null;
}

// =============================================================================
// Role Helpers
// =============================================================================

export function getHiddenRoles(config: YamlConfig): string[] {
  return Object.entries(config.leaderboard.roles)
    .filter(([, roleConfig]) => roleConfig.hidden === true)
    .map(([slug]) => slug);
}

export function getVisibleRoles(config: YamlConfig): string[] {
  return Object.entries(config.leaderboard.roles)
    .filter(([, roleConfig]) => roleConfig.hidden !== true)
    .map(([slug]) => slug);
}
