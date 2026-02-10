/**
 * @fileoverview YAML configuration loader and validator
 * @module @leaderboard/config/loaders/yaml
 */

import { readFileSync, existsSync } from "fs";
import { join, isAbsolute, resolve } from "path";
import type { YamlConfig } from "../types/yaml";

let yaml: typeof import("js-yaml") | null = null;

async function getYaml() {
  if (!yaml) {
    yaml = await import("js-yaml");
  }
  return yaml;
}

let cachedConfig: YamlConfig | null = null;

function resolvePath(inputPath: string): string {
  return isAbsolute(inputPath) ? inputPath : resolve(process.cwd(), inputPath);
}

function findConfigPath(): string {
  const dataPath = resolvePath(process.env.LEADERBOARD_DATA_PATH || "./data");
  const configPath = join(dataPath, "leaderboard", "config.yaml");

  if (existsSync(configPath)) {
    return configPath;
  }

  let projectRoot = process.cwd();

  const packagePath = join(__dirname, "..", "..", "..");
  if (existsSync(join(packagePath, "data", "leaderboard", "config.yaml"))) {
    projectRoot = packagePath;
  } else {
    for (let i = 0; i < 5; i++) {
      const parent = join(projectRoot, "..");
      if (existsSync(join(parent, "data", "leaderboard", "config.yaml"))) {
        projectRoot = parent;
        break;
      }
      if (parent === projectRoot) break;
      projectRoot = parent;
    }
  }

  const fallbackPath = join(projectRoot, "data", "leaderboard", "config.yaml");
  if (existsSync(fallbackPath)) {
    return fallbackPath;
  }

  throw new Error(
    `Configuration file not found. Checked paths:\n` +
      `- ${configPath}\n` +
      `- ${fallbackPath}\n` +
      `Make sure data/leaderboard/config.yaml exists or LEADERBOARD_DATA_PATH is set correctly.`,
  );
}

function resolveConfigPath(configPath?: string): string {
  if (configPath) {
    return resolvePath(configPath);
  }

  if (process.env.LEADERBOARD_DATA_PATH) {
    const envPath = join(
      resolvePath(process.env.LEADERBOARD_DATA_PATH),
      "leaderboard",
      "config.yaml",
    );
    if (existsSync(envPath)) {
      return envPath;
    }
  }

  return findConfigPath();
}

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

export function clearYamlConfigCache(): void {
  cachedConfig = null;
}

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
