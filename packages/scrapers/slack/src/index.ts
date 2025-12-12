/**
 * @leaderboard/scraper-slack - Slack activity scraper
 *
 * @packageDocumentation
 *
 * This package scrapes Slack EOD (End of Day) updates from a specified
 * channel and converts them to contributor activities for the leaderboard.
 *
 * ## Features
 *
 * - Fetches messages from Slack channels using the Web API
 * - Cursor-based pagination for large message volumes
 * - Converts Slack markdown to HTML for display
 * - Groups messages by date and merges same-day updates
 * - Maps Slack user IDs to registered contributors
 * - Creates activity records with proper slugs
 *
 * ## Configuration
 *
 * Required environment variables:
 * - `SLACK_API_TOKEN`: Slack Bot User OAuth Token
 * - `SLACK_CHANNEL`: Target channel ID (e.g., "C12345678")
 *
 * ## Usage
 *
 * ```typescript
 * import { SlackScraper } from "@leaderboard/scraper-slack";
 *
 * const scraper = new SlackScraper();
 * const result = await scraper.scrape();
 *
 * console.log(`Processed ${result.stats.processed} messages`);
 * console.log(`Created ${result.contributions.length} activities`);
 * ```
 *
 * @module @leaderboard/scraper-slack
 */

// =============================================================================
// Type Exports
// =============================================================================

export type {
  Activity,
  SlackEodMessage,
  ConversationHistoryResponse,
  SlackApiMessage,
  EodIngestionResult,
  DateGroupedMessages,
} from "./types";

// =============================================================================
// Client Exports
// =============================================================================

export {
  getSlackClient,
  getSlackChannel,
  getSlackToken,
  resetSlackClient,
} from "./client";

// =============================================================================
// Service Exports
// =============================================================================

export { fetchSlackMessages } from "./services/message-fetcher";
export { ingestEodUpdates } from "./services/eod-ingestion";

// =============================================================================
// Scraper Exports
// =============================================================================

export { SlackScraper, main } from "./scraper";

// =============================================================================
// CLI Entry Point
// =============================================================================

// Run if executed directly (e.g., `bun run src/index.ts`)
if (import.meta.main) {
  const { main: runMain } = await import("./scraper");
  runMain().catch(console.error);
}
