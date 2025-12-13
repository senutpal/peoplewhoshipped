/**
 * @fileoverview Configuration loading functions
 * @module @leaderboard/config/loaders
 *
 * This module provides functions to load configuration from environment
 * variables for each service (GitHub, Slack, Database) and the complete
 * application configuration.
 *
 * @remarks
 * Configuration loading follows these principles:
 * - Service-specific configs return `undefined` if not fully configured
 * - Database config is required and throws if missing
 * - The main loader aggregates all configurations
 *
 * @example
 * ```typescript
 * import { loadConfig, loadGitHubConfig, loadSlackConfig } from "@leaderboard/config";
 *
 * // Load complete configuration
 * const config = loadConfig();
 *
 * // Load individual service configs
 * const githubConfig = loadGitHubConfig();
 * if (githubConfig) {
 *   console.log(`GitHub org: ${githubConfig.org}`);
 * }
 * ```
 */

import type {
  GitHubConfig,
  SlackConfig,
  DatabaseConfig,
  LeaderboardConfig,
} from "../types";
import { getRequiredEnv, getOptionalEnvInt } from "../env";

// =============================================================================
// GitHub Configuration Loader
// =============================================================================

/**
 * Loads GitHub configuration from environment variables.
 *
 * @returns The GitHub configuration if both `GITHUB_TOKEN` and `GITHUB_ORG`
 *          are set, otherwise `undefined`
 *
 * @remarks
 * This function requires both environment variables to be set for a valid
 * configuration. If either is missing, it returns `undefined` to signal
 * that GitHub scraping should be disabled.
 *
 * **Required Environment Variables:**
 * - `GITHUB_TOKEN` - Personal Access Token with repo and org read scopes
 * - `GITHUB_ORG` - Organization slug to scrape
 *
 * @example
 * ```typescript
 * const githubConfig = loadGitHubConfig();
 * if (githubConfig) {
 *   const client = new GitHubClient(githubConfig.token);
 *   await client.fetchOrgActivity(githubConfig.org);
 * } else {
 *   console.log("GitHub scraping disabled - missing configuration");
 * }
 * ```
 */
export function loadGitHubConfig(): GitHubConfig | undefined {
  const token = process.env.GITHUB_TOKEN;
  const org = process.env.GITHUB_ORG;

  if (!token || !org) {
    return undefined;
  }

  return { token, org };
}

// =============================================================================
// Slack Configuration Loader
// =============================================================================

/**
 * Loads Slack configuration from environment variables.
 *
 * @returns The Slack configuration if both `SLACK_API_TOKEN` and
 *          `SLACK_CHANNEL` are set, otherwise `undefined`
 *
 * @remarks
 * This function requires both environment variables to be set for a valid
 * configuration. If either is missing, it returns `undefined` to signal
 * that Slack scraping should be disabled.
 *
 * **Required Environment Variables:**
 * - `SLACK_API_TOKEN` - Bot User OAuth Token (starts with `xoxb-`)
 * - `SLACK_CHANNEL` - Channel ID (e.g., `C12345678`)
 *
 * @example
 * ```typescript
 * const slackConfig = loadSlackConfig();
 * if (slackConfig) {
 *   const client = new WebClient(slackConfig.token);
 *   await client.conversations.history({ channel: slackConfig.channel });
 * } else {
 *   console.log("Slack scraping disabled - missing configuration");
 * }
 * ```
 */
export function loadSlackConfig(): SlackConfig | undefined {
  const token = process.env.SLACK_API_TOKEN;
  const channel = process.env.SLACK_CHANNEL;

  if (!token || !channel) {
    return undefined;
  }

  return { token, channel };
}

// =============================================================================
// Database Configuration Loader
// =============================================================================

/**
 * Loads database configuration from environment variables.
 *
 * @returns The database configuration object
 * @throws {Error} When `PGLITE_DB_PATH` environment variable is not set
 *
 * @remarks
 * Unlike service-specific configs, the database configuration is **required**
 * for the application to function. This function will throw an error if
 * the required environment variable is not set.
 *
 * **Required Environment Variables:**
 * - `PGLITE_DB_PATH` - File system path for PGlite database storage
 *
 * @example
 * ```typescript
 * try {
 *   const dbConfig = loadDatabaseConfig();
 *   const db = new PGlite(dbConfig.path);
 * } catch (error) {
 *   console.error("Database configuration missing:", error.message);
 *   process.exit(1);
 * }
 * ```
 */
export function loadDatabaseConfig(): DatabaseConfig {
  const path = getRequiredEnv("PGLITE_DB_PATH");
  return { path };
}

// =============================================================================
// Complete Configuration Loader
// =============================================================================

/**
 * Loads the complete application configuration from environment variables.
 *
 * @returns The complete leaderboard configuration object
 * @throws {Error} When required environment variables (database) are not set
 *
 * @remarks
 * This is the primary entry point for loading configuration. It aggregates
 * all service-specific configurations and global settings.
 *
 * **Environment Variables:**
 *
 * Required:
 * - `PGLITE_DB_PATH` - Database storage path
 *
 * Optional (GitHub scraper):
 * - `GITHUB_TOKEN` - GitHub Personal Access Token
 * - `GITHUB_ORG` - GitHub organization slug
 *
 * Optional (Slack scraper):
 * - `SLACK_API_TOKEN` - Slack Bot User OAuth Token
 * - `SLACK_CHANNEL` - Slack channel ID
 *
 * Optional (General):
 * - `LEADERBOARD_DATA_PATH` - Path for exported data
 * - `SCRAPE_DAYS` - Number of days to scrape (default: 7)
 *
 * @example
 * ```typescript
 * import { loadConfig, validateConfig } from "@leaderboard/config";
 *
 * const config = loadConfig();
 *
 * if (!validateConfig(config)) {
 *   console.error("Invalid configuration");
 *   process.exit(1);
 * }
 *
 * if (config.github) {
 *   // Run GitHub scraper
 * }
 *
 * if (config.slack) {
 *   // Run Slack scraper
 * }
 * ```
 */
export function loadConfig(): LeaderboardConfig {
  return {
    github: loadGitHubConfig(),
    slack: loadSlackConfig(),
    database: loadDatabaseConfig(),
    leaderboardDataPath: process.env.LEADERBOARD_DATA_PATH,
    scrapeDays: getOptionalEnvInt("SCRAPE_DAYS", 7),
  };
}