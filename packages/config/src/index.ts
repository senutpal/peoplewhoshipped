/**
 * @leaderboard/config - Configuration management for the leaderboard monorepo
 *
 * @packageDocumentation
 *
 * This package provides centralized configuration loading, validation,
 * and management for all leaderboard packages. It handles environment
 * variable parsing, service-specific configuration, and type-safe
 * runtime validation.
 *
 * ## Features
 *
 * - Type-safe environment variable parsing
 * - Service-specific configuration loaders (GitHub, Slack, Database)
 * - Runtime validation with TypeScript type guards
 * - Configurable constants for API pagination and batching
 *
 * ## Configuration
 *
 * Required environment variables:
 * - `PGLITE_DB_PATH`: Path to the PGlite database
 *
 * Optional environment variables:
 * - `GITHUB_TOKEN`: GitHub Personal Access Token
 * - `GITHUB_ORG`: GitHub organization slug
 * - `SLACK_API_TOKEN`: Slack Bot User OAuth Token
 * - `SLACK_CHANNEL`: Slack channel ID
 * - `LEADERBOARD_DATA_PATH`: Path for exported data
 * - `SCRAPE_DAYS`: Number of days to scrape (default: 1)
 *
 * ## Usage
 *
 * ```typescript
 * import {
 *   loadConfig,
 *   validateConfig,
 *   validateGitHubConfig,
 *   validateSlackConfig
 * } from "@leaderboard/config";
 *
 * const config = loadConfig();
 *
 * if (!validateConfig(config)) {
 *   process.exit(1);
 * }
 *
 * if (validateGitHubConfig(config)) {
 *   // Run GitHub scraper
 *   console.log(`Scraping GitHub org: ${config.github.org}`);
 * }
 *
 * if (validateSlackConfig(config)) {
 *   // Run Slack scraper
 *   console.log(`Scraping Slack channel: ${config.slack.channel}`);
 * }
 * ```
 *
 * @module @leaderboard/config
 */

// =============================================================================
// Type Exports
// =============================================================================

export type {
  GitHubConfig,
  SlackConfig,
  DatabaseConfig,
  LeaderboardConfig,
} from "./types";

// =============================================================================
// Environment Variable Helpers
// =============================================================================

export {
  getRequiredEnv,
  getOptionalEnv,
  getOptionalEnvInt,
} from "./env";

// =============================================================================
// Configuration Loaders
// =============================================================================

export {
  loadGitHubConfig,
  loadSlackConfig,
  loadDatabaseConfig,
  loadConfig,
} from "./loaders";

// =============================================================================
// Validation Functions
// =============================================================================

export {
  validateGitHubConfig,
  validateSlackConfig,
  validateConfig,
} from "./validators";

// =============================================================================
// Configuration Constants
// =============================================================================

export {
  DEFAULT_BATCH_SIZE,
  DEFAULT_PAGE_LIMIT,
  MAX_CONCURRENT_REQUESTS,
} from "./constants";

// =============================================================================
// YAML Configuration
// =============================================================================

/**
 * YAML configuration types for config.yaml files.
 */
export type {
  YamlConfig,
  OrgConfig,
  MetaConfig,
  RoleConfig,
  SocialProfileConfig,
  LeaderboardYamlConfig,
  ScraperInstanceConfig,
  ScraperYamlConfig,
} from "./types/yaml";

/**
 * YAML configuration loaders and helpers.
 */
export {
  getYamlConfig,
  getYamlConfigSync,
  clearYamlConfigCache,
  getHiddenRoles,
  getVisibleRoles,
} from "./loaders/yaml";
