/**
 * @fileoverview SlackScraper class implementation
 * @module @leaderboard/scraper-slack/scraper
 *
 * This module provides the main SlackScraper class that orchestrates
 * the full EOD update scraping workflow.
 */

import { subDays } from "date-fns";
import {
  createSlackEodTable,
  upsertActivityDefinitions,
} from "@leaderboard/database";
import {
  BaseScraper,
  SLACK_ACTIVITY_DEFINITIONS,
  type ScraperResult,
} from "@leaderboard/scraper-core";
import { loadConfig, validateSlackConfig } from "@leaderboard/config";
import { fetchSlackMessages } from "./services/message-fetcher";
import { ingestEodUpdates } from "./services/eod-ingestion";

// =============================================================================
// SlackScraper Class
// =============================================================================

/**
 * Scraper for Slack EOD (End of Day) updates.
 *
 * @description
 * The SlackScraper connects to a configured Slack channel, fetches
 * messages within a configurable date range, and converts them to
 * contributor activities. It extends the BaseScraper class for
 * consistent logging and error handling.
 *
 * @extends BaseScraper
 *
 * @remarks
 * **Workflow**:
 * 1. Validate Slack configuration (token, channel)
 * 2. Fetch messages from Slack channel
 * 3. Store messages in database queue
 * 4. Process queue and create activities
 * 5. Match activities to registered contributors
 *
 * **Configuration**: Requires the following environment variables:
 * - `SLACK_API_TOKEN`: Slack Bot User OAuth Token
 * - `SLACK_CHANNEL`: Target channel ID
 *
 * **Scrape Days**: Configurable via `scrapeDays` in the leaderboard config
 *
 * @example
 * ```typescript
 * import { SlackScraper } from "@leaderboard/scraper-slack";
 *
 * const scraper = new SlackScraper();
 * const result = await scraper.scrape();
 *
 * console.log(`Processed ${result.stats.processed} messages`);
 * console.log(`Created ${result.contributions.length} activities`);
 * ```
 */
export class SlackScraper extends BaseScraper {
  /**
   * The display name of this scraper, used in logs.
   */
  name = "Slack";

  /**
   * Executes the Slack scraping workflow.
   *
   * @description
   * Fetches EOD updates from the configured Slack channel and
   * converts them to contributor activities. The scrape period
   * is determined by the `scrapeDays` configuration option.
   *
   * @returns Promise resolving to ScraperResult with contributions and stats
   *
   * @example
   * ```typescript
   * const scraper = new SlackScraper();
   * const result = await scraper.scrape();
   *
   * if (result.errors.length > 0) {
   *   console.error("Scrape completed with errors:", result.errors);
   * }
   * ```
   */
  async scrape(): Promise<ScraperResult> {
    const config = loadConfig();
    const result = this.createEmptyResult();

    // Validate Slack configuration
    if (!validateSlackConfig(config)) {
      this.error("Slack configuration is incomplete");
      result.errors.push(new Error("Slack configuration is incomplete"));
      return result;
    }

    // Calculate the start date for scraping
    const since = config.scrapeDays
      ? subDays(new Date(), config.scrapeDays)
      : undefined;

    this.log(`Starting Slack scrape (last ${config.scrapeDays} days)...`);

    try {
      // Step 1: Fetch messages from Slack and store in queue
      await fetchSlackMessages(since);

      // Step 2: Process queued messages and convert to activities
      const { processed, skipped, activities } = await ingestEodUpdates();

      // Aggregate results
      result.contributions.push(...activities);
      result.stats.processed = processed;
      result.stats.skipped = skipped;
    } catch (error) {
      this.error("Failed to complete Slack scrape", error as Error);
      result.errors.push(error as Error);
      result.stats.failed++;
    }

    this.log(`Slack scrape complete: ${result.stats.processed} messages processed`);
    return result;
  }
}

// =============================================================================
// Main Execution
// =============================================================================

/**
 * Main entry point for CLI execution.
 *
 * @description
 * Prepares the database (creates tables, registers activity definitions)
 * and runs the Slack scraper. This function is called when the package
 * is executed directly via `bun run scrape` or `bun run src/index.ts`.
 *
 * @returns Promise that resolves when scraping is complete
 *
 * @example
 * ```bash
 * # Run the scraper
 * cd packages/scrapers/slack
 * bun run scrape
 * ```
 */
export async function main(): Promise<void> {
  // Prepare database tables and activity definitions
  console.log("Preparing database...");
  await createSlackEodTable();
  await upsertActivityDefinitions(SLACK_ACTIVITY_DEFINITIONS);

  // Run the scraper
  const scraper = new SlackScraper();
  await scraper.scrape();
}
