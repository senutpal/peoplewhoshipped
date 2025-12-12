/**
 * @leaderboard/scraper-core - Base Scraper
 *
 * @packageDocumentation
 *
 * This module provides the abstract base class for all scrapers.
 * It implements common functionality like logging, error handling,
 * and result initialization.
 *
 * @module @leaderboard/scraper-core/base
 */

import type { LeaderboardConfig } from "@leaderboard/config";
import type { Scraper, ScraperResult } from "../types";

// =============================================================================
// Base Scraper Class
// =============================================================================

/**
 * Abstract base class for all scrapers.
 *
 * Provides common logging and utility functionality that all scraper
 * implementations can use. Scrapers should extend this class and
 * implement the abstract `scrape` method.
 *
 * ## Features
 *
 * - Formatted logging with scraper name prefix
 * - Warning and error logging with visual indicators
 * - Empty result initialization helper
 *
 * @example
 * ```typescript
 * class MyCustomScraper extends BaseScraper {
 *   name = "my-custom-scraper";
 *
 *   async scrape(config: LeaderboardConfig, since?: Date): Promise<ScraperResult> {
 *     this.log("Starting scrape...");
 *
 *     try {
 *       // Scrape implementation
 *       const activities = await this.fetchActivities(config, since);
 *       this.log(`Found ${activities.length} activities`);
 *
 *       return {
 *         contributions: activities,
 *         errors: [],
 *         stats: { processed: activities.length, skipped: 0, failed: 0 }
 *       };
 *     } catch (error) {
 *       this.error("Scrape failed", error as Error);
 *       const result = this.createEmptyResult();
 *       result.errors.push(error as Error);
 *       return result;
 *     }
 *   }
 * }
 * ```
 *
 * @abstract
 * @implements {Scraper}
 */
export abstract class BaseScraper implements Scraper {
  /**
   * Unique name identifier for the scraper.
   *
   * Used as a prefix in log messages to identify which scraper
   * generated the output. Should be set by implementing classes.
   *
   * @example
   * ```typescript
   * class GitHubScraper extends BaseScraper {
   *   name = "github-scraper";
   * }
   * // Logs will appear as: [github-scraper] Message...
   * ```
   */
  abstract name: string;

  /**
   * Execute the scrape operation.
   *
   * This abstract method must be implemented by all scraper subclasses.
   * The implementation should:
   * 1. Validate configuration
   * 2. Fetch data from the external source
   * 3. Convert data to Activity records
   * 4. Return a ScraperResult with statistics
   *
   * @param config - Leaderboard configuration containing API credentials
   * @param since - Optional date to limit scraping to recent activities
   * @returns Promise resolving to the scrape result
   */
  abstract scrape(config: LeaderboardConfig, since?: Date): Promise<ScraperResult>;

  // ===========================================================================
  // Logging Methods
  // ===========================================================================

  /**
   * Log an informational message.
   *
   * Outputs a message prefixed with the scraper name for easy
   * identification in console output.
   *
   * @param message - The message to log
   *
   * @example
   * ```typescript
   * this.log("Starting to fetch repositories...");
   * // Output: [github-scraper] Starting to fetch repositories...
   * ```
   *
   * @protected
   */
  protected log(message: string): void {
    console.log(`[${this.name}] ${message}`);
  }

  /**
   * Log a warning message.
   *
   * Outputs a warning message with a visual indicator (⚠️) for
   * situations that aren't errors but should be noted.
   *
   * @param message - The warning message to log
   *
   * @example
   * ```typescript
   * this.warn("Rate limit approaching, slowing down requests");
   * // Output: [github-scraper] ⚠️  Rate limit approaching...
   * ```
   *
   * @protected
   */
  protected warn(message: string): void {
    console.warn(`[${this.name}] ⚠️  ${message}`);
  }

  /**
   * Log an error message.
   *
   * Outputs an error message with a visual indicator (❌) and
   * optionally includes the error message from an Error object.
   *
   * @param message - The error description
   * @param error - Optional Error object for additional context
   *
   * @example
   * ```typescript
   * try {
   *   await riskyOperation();
   * } catch (err) {
   *   this.error("Failed to fetch data", err as Error);
   *   // Output: [github-scraper] ❌ Failed to fetch data Network error
   * }
   * ```
   *
   * @protected
   */
  protected error(message: string, error?: Error): void {
    console.error(`[${this.name}] ❌ ${message}`, error?.message ?? "");
  }

  // ===========================================================================
  // Utility Methods
  // ===========================================================================

  /**
   * Create an empty scraper result.
   *
   * Returns a ScraperResult with empty arrays and zeroed statistics.
   * Useful for initializing results or returning on early exit.
   *
   * @returns Empty ScraperResult object
   *
   * @example
   * ```typescript
   * async scrape(config: LeaderboardConfig): Promise<ScraperResult> {
   *   if (!config.github?.token) {
   *     this.warn("No GitHub token configured, skipping scrape");
   *     return this.createEmptyResult();
   *   }
   *   // Continue with normal scraping...
   * }
   * ```
   *
   * @protected
   */
  protected createEmptyResult(): ScraperResult {
    return {
      contributions: [],
      errors: [],
      stats: {
        processed: 0,
        skipped: 0,
        failed: 0,
      },
    };
  }
}
