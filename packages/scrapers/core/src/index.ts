/**
 * @leaderboard/scraper-core - Core scraper functionality
 *
 * @packageDocumentation
 *
 * This package provides shared types, utilities, base classes, and activity
 * definitions for all scrapers in the leaderboard system.
 *
 * ## Features
 *
 * - **Base Scraper Class**: Abstract class with logging and utility methods
 * - **Activity Definitions**: Enums and metadata for GitHub and Slack activities
 * - **Utility Functions**: Date manipulation, user validation, and debugging helpers
 * - **Type Definitions**: Shared interfaces for scrapers and results
 *
 * ## Usage
 *
 * ### Creating a Custom Scraper
 *
 * ```typescript
 * import { BaseScraper, ScraperResult } from "@leaderboard/scraper-core";
 * import type { LeaderboardConfig } from "@leaderboard/config";
 *
 * class MyScraper extends BaseScraper {
 *   name = "my-scraper";
 *
 *   async scrape(config: LeaderboardConfig, since?: Date): Promise<ScraperResult> {
 *     this.log("Starting scrape...");
 *     // Implementation
 *     return this.createEmptyResult();
 *   }
 * }
 * ```
 *
 * ### Using Activity Definitions
 *
 * ```typescript
 * import {
 *   GitHubActivityDefinition,
 *   GITHUB_ACTIVITY_DEFINITIONS
 * } from "@leaderboard/scraper-core";
 *
 * const prMergedConfig = GITHUB_ACTIVITY_DEFINITIONS.find(
 *   d => d.slug === GitHubActivityDefinition.PR_MERGED
 * );
 * console.log(`PR Merged is worth ${prMergedConfig?.points} points`);
 * ```
 *
 * ### Using Utility Functions
 *
 * ```typescript
 * import {
 *   getDateRange,
 *   dateToUnixTimestamp,
 *   isBot
 * } from "@leaderboard/scraper-core";
 *
 * const { oldest, latest } = getDateRange();
 * const slackTimestamp = dateToUnixTimestamp(oldest);
 *
 * if (isBot(user)) {
 *   console.log("Skipping bot user");
 * }
 * ```
 *
 * @module @leaderboard/scraper-core
 */

// =============================================================================
// Type Exports
// =============================================================================

export type {
  Activity,
  ActivityDefinitionConfig,
  ScraperResult,
  ScraperStats,
  Scraper,
  UserWithLogin,
  UserWithTypename,
} from "./types";

// =============================================================================
// Activity Definition Exports
// =============================================================================

export {
  GitHubActivityDefinition,
  SlackActivityDefinition,
  AllActivityDefinitions,
  GITHUB_ACTIVITY_DEFINITIONS,
  SLACK_ACTIVITY_DEFINITIONS,
  ALL_ACTIVITY_DEFINITIONS,
} from "./definitions/activity-definitions";

// =============================================================================
// Base Scraper Exports
// =============================================================================

export { BaseScraper } from "./base";

// =============================================================================
// Utility Exports
// =============================================================================

export {
  dateToUnixTimestamp,
  unixTimestampToDate,
  getDateRange,
  getDateString,
  isBot,
  getLogin,
  findDuplicateSlugs,
} from "./utils";
