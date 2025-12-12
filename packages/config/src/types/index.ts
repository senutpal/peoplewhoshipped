/**
 * @fileoverview Type definitions for the configuration package
 * @module @leaderboard/config/types
 *
 * This module contains all TypeScript interfaces and type definitions
 * used throughout the configuration package for type safety and documentation.
 *
 * @remarks
 * All configuration interfaces are designed to be:
 * - Immutable: Configuration should not change at runtime
 * - Optional-aware: Service-specific configs are optional
 * - Validated: Type guards ensure runtime safety
 */

// =============================================================================
// GitHub Configuration
// =============================================================================

/**
 * Configuration for GitHub API integration.
 *
 * @remarks
 * Required for scraping GitHub activity data including pull requests,
 * issues, and repository contributions. Both token and organization
 * are required for the GitHub scraper to function.
 *
 * @example
 * ```typescript
 * const githubConfig: GitHubConfig = {
 *   token: "ghp_xxxxxxxxxxxx",
 *   org: "my-organization"
 * };
 * ```
 *
 * @see {@link https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens}
 */
export interface GitHubConfig {
  /**
   * GitHub Personal Access Token for API authentication.
   *
   * @remarks
   * The token should have the following scopes:
   * - `repo` - Full control of private repositories
   * - `read:org` - Read organization membership
   *
   * @example "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
   */
  token: string;

  /**
   * GitHub organization name to scrape activity from.
   *
   * @remarks
   * This is the organization slug as it appears in GitHub URLs,
   * not the display name.
   *
   * @example "my-organization"
   */
  org: string;
}

// =============================================================================
// Slack Configuration
// =============================================================================

/**
 * Configuration for Slack API integration.
 *
 * @remarks
 * Required for scraping Slack EOD (End of Day) updates from a designated
 * channel. Both token and channel ID are required for the Slack scraper
 * to function.
 *
 * @example
 * ```typescript
 * const slackConfig: SlackConfig = {
 *   token: "xoxb-xxxxxxxxxxxx",
 *   channel: "C12345678"
 * };
 * ```
 *
 * @see {@link https://api.slack.com/authentication/token-types}
 */
export interface SlackConfig {
  /**
   * Slack Bot User OAuth Token for API authentication.
   *
   * @remarks
   * The bot token should have the following scopes:
   * - `channels:history` - View messages in public channels
   * - `channels:read` - View basic channel information
   * - `users:read` - View user information
   *
   * @example "xoxb-xxxxxxxxxxxx-xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx"
   */
  token: string;

  /**
   * Slack channel ID to scrape EOD updates from.
   *
   * @remarks
   * This is the channel ID (not the name). To find the channel ID:
   * 1. Right-click the channel in Slack
   * 2. Select "Copy link"
   * 3. The ID is the last segment of the URL
   *
   * @example "C12345678"
   */
  channel: string;
}

// =============================================================================
// Database Configuration
// =============================================================================

/**
 * Configuration for PGlite database connection.
 *
 * @remarks
 * The leaderboard uses PGlite (PostgreSQL compiled to WebAssembly)
 * for local data persistence. The path specifies where the database
 * files will be stored on disk.
 *
 * @example
 * ```typescript
 * const databaseConfig: DatabaseConfig = {
 *   path: "./data/leaderboard.db"
 * };
 * ```
 */
export interface DatabaseConfig {
  /**
   * File system path where the PGlite database files will be stored.
   *
   * @remarks
   * This can be a relative or absolute path. The directory will be
   * created if it doesn't exist. Ensure the application has write
   * permissions to this location.
   *
   * @example "./data/leaderboard.db" or "/var/lib/leaderboard/db"
   */
  path: string;
}

// =============================================================================
// Complete Application Configuration
// =============================================================================

/**
 * Complete configuration for the leaderboard application.
 *
 * @remarks
 * This is the root configuration interface that aggregates all
 * service-specific configurations. GitHub and Slack configurations
 * are optional to allow running the system with only some scrapers
 * enabled.
 *
 * @example
 * ```typescript
 * const config: LeaderboardConfig = {
 *   github: { token: "ghp_xxx", org: "my-org" },
 *   slack: { token: "xoxb-xxx", channel: "C12345" },
 *   database: { path: "./data/leaderboard.db" },
 *   scrapeDays: 7
 * };
 * ```
 */
export interface LeaderboardConfig {
  /**
   * GitHub API configuration.
   * Optional - if not provided, GitHub scraping will be disabled.
   */
  github?: GitHubConfig;

  /**
   * Slack API configuration.
   * Optional - if not provided, Slack scraping will be disabled.
   */
  slack?: SlackConfig;

  /**
   * Database configuration.
   * Required - the database is essential for data persistence.
   */
  database: DatabaseConfig;

  /**
   * Path to the leaderboard data directory.
   *
   * @remarks
   * Used for storing exported leaderboard data, reports,
   * and other generated artifacts.
   */
  leaderboardDataPath?: string;

  /**
   * Number of days to scrape activity data for.
   *
   * @remarks
   * Limits how far back in time the scrapers will fetch data.
   * Higher values increase API usage and processing time.
   *
   * @default 1
   */
  scrapeDays: number;
}
