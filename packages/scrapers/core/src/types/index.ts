/**
 * @leaderboard/scraper-core - Type Definitions
 *
 * @packageDocumentation
 *
 * This module contains all TypeScript interfaces and type definitions
 * used throughout the scraper core package and shared with other scrapers.
 *
 * @module @leaderboard/scraper-core/types
 */

import type { Activity } from "@leaderboard/database";
import type { LeaderboardConfig } from "@leaderboard/config";

// =============================================================================
// Re-exports
// =============================================================================

/**
 * Re-export Activity type from database for convenience.
 * This allows other scrapers to import Activity directly from the core package.
 */
export type { Activity } from "@leaderboard/database";

// =============================================================================
// Activity Definition Types
// =============================================================================

/**
 * Configuration for a single activity definition.
 *
 * Each activity type (e.g., PR_MERGED, EOD_UPDATE) has associated metadata
 * that defines how it should be displayed and scored in the leaderboard.
 *
 * @example
 * ```typescript
 * const prMergedConfig: ActivityDefinitionConfig = {
 *   slug: GitHubActivityDefinition.PR_MERGED,
 *   name: "PR Merged",
 *   description: "Merged a Pull Request",
 *   points: 7,
 *   icon: "git-merge"
 * };
 * ```
 */
export interface ActivityDefinitionConfig {
  /**
   * Unique identifier slug for the activity type.
   * Used for database storage and activity matching.
   */
  slug: string;

  /**
   * Human-readable display name for the activity.
   * Shown in the UI and reports.
   */
  name: string;

  /**
   * Detailed description of what this activity represents.
   * Used for tooltips and documentation.
   */
  description: string;

  /**
   * Point value awarded for this activity type.
   * Used in leaderboard scoring calculations.
   */
  points: number;

  /**
   * Optional icon identifier for UI display.
   * Uses Lucide icon names (e.g., "git-merge", "message-circle").
   * Set to null if no icon should be displayed.
   */
  icon: string | null;
}

// =============================================================================
// Scraper Result Types
// =============================================================================

/**
 * Statistics from a scrape operation.
 *
 * Tracks the number of items processed, skipped, and failed
 * during a scraping run for monitoring and debugging.
 */
export interface ScraperStats {
  /**
   * Number of items successfully processed and converted to activities.
   */
  processed: number;

  /**
   * Number of items skipped (e.g., duplicates, invalid data).
   */
  skipped: number;

  /**
   * Number of items that failed to process due to errors.
   */
  failed: number;
}

/**
 * Result of a scrape operation.
 *
 * Contains all activities generated during the scrape, any errors
 * encountered, and statistics about the operation.
 *
 * @example
 * ```typescript
 * const result: ScraperResult = {
 *   contributions: [...activities],
 *   errors: [],
 *   stats: { processed: 42, skipped: 3, failed: 0 }
 * };
 * ```
 */
export interface ScraperResult {
  /**
   * Array of activities generated from the scraped data.
   * These are ready to be inserted into the database.
   */
  contributions: Activity[];

  /**
   * Array of errors encountered during scraping.
   * Non-fatal errors are collected here rather than thrown.
   */
  errors: Error[];

  /**
   * Statistics about the scrape operation.
   */
  stats: ScraperStats;
}

// =============================================================================
// Scraper Interface
// =============================================================================

/**
 * Base scraper interface that all scrapers must implement.
 *
 * This interface defines the contract for scraper implementations,
 * ensuring consistent behavior across different data sources
 * (GitHub, Slack, etc.).
 *
 * @example
 * ```typescript
 * class MyScraper implements Scraper {
 *   name = "my-scraper";
 *
 *   async scrape(config: LeaderboardConfig, since?: Date): Promise<ScraperResult> {
 *     // Implementation
 *   }
 * }
 * ```
 */
export interface Scraper {
  /**
   * Unique name identifier for the scraper.
   * Used for logging and debugging purposes.
   */
  name: string;

  /**
   * Execute the scrape operation.
   *
   * @param config - Leaderboard configuration containing API credentials and settings
   * @param since - Optional date to limit scraping to activities after this time
   * @returns Promise resolving to the scrape result with activities and stats
   */
  scrape(config: LeaderboardConfig, since?: Date): Promise<ScraperResult>;
}

// =============================================================================
// Utility Types
// =============================================================================

/**
 * Generic user object with optional login field.
 * Used for safely extracting user logins from various API responses.
 */
export interface UserWithLogin {
  /**
   * User's login/username. May be null or undefined in some responses.
   */
  login?: string | null;
}

/**
 * User object with typename for bot detection.
 * Used to identify bot users in GitHub GraphQL responses.
 */
export interface UserWithTypename {
  /**
   * GraphQL typename indicating the user type.
   * "Bot" indicates an automated account.
   */
  __typename?: string;
}
