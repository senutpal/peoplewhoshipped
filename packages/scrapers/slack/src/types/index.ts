/**
 * @fileoverview Type definitions for the Slack scraper package
 * @module @leaderboard/scraper-slack/types
 *
 * This module contains all TypeScript interfaces and type definitions
 * used throughout the Slack scraper package for type safety and documentation.
 */

// =============================================================================
// Re-exports from @leaderboard/database
// =============================================================================

/**
 * Re-export core types from database package for convenience.
 * Consumers can import these directly from the Slack scraper package.
 */
export type { Activity, SlackEodMessage } from "@leaderboard/database";

// =============================================================================
// Slack API Response Types
// =============================================================================

/**
 * Represents a single message from Slack's conversations.history API response.
 *
 * @remarks
 * This interface models the raw message structure returned by Slack's API.
 * Not all fields are always present - user and text may be undefined for
 * system messages or bot messages without content.
 *
 * @example
 * ```typescript
 * const message: SlackApiMessage = {
 *   type: "message",
 *   user: "U12345678",
 *   text: "Completed the API integration today",
 *   ts: "1702400000.000000"
 * };
 * ```
 */
export interface SlackApiMessage {
  /**
   * The type of message. Usually "message" for regular user messages.
   */
  type: string;

  /**
   * The Slack user ID of the message author.
   * May be undefined for system messages or integration messages.
   *
   * @example "U12345678"
   */
  user?: string;

  /**
   * The message content in Slack markdown format.
   * May be undefined for attachment-only messages.
   */
  text?: string;

  /**
   * Slack timestamp in "seconds.microseconds" format.
   * Used as a unique identifier for the message.
   *
   * @example "1702400000.123456"
   */
  ts: string;
}

/**
 * Response structure from Slack's conversations.history API endpoint.
 *
 * @remarks
 * This interface represents a single page of conversation history.
 * The API uses cursor-based pagination for large result sets.
 *
 * @see {@link https://api.slack.com/methods/conversations.history}
 */
export interface ConversationHistoryResponse {
  /**
   * Array of messages in the requested time range.
   * Messages are ordered from newest to oldest by default.
   */
  messages: SlackApiMessage[];
}

// =============================================================================
// EOD Ingestion Types
// =============================================================================

/**
 * Result of the EOD (End of Day) update ingestion process.
 *
 * @remarks
 * This interface provides detailed statistics about the ingestion operation,
 * including how many messages were processed, skipped (due to missing
 * contributor mappings), and the activities that were created.
 *
 * @example
 * ```typescript
 * const result: EodIngestionResult = {
 *   processed: 25,
 *   skipped: 3,
 *   activities: [...]
 * };
 * console.log(`Ingested ${result.processed} EOD updates`);
 * ```
 */
export interface EodIngestionResult {
  /**
   * Number of messages successfully processed and converted to activities.
   */
  processed: number;

  /**
   * Number of messages skipped due to missing contributor mappings.
   * These messages came from Slack users not registered as contributors.
   */
  skipped: number;

  /**
   * Array of Activity objects created during ingestion.
   * Each activity represents one day's worth of EOD updates from a contributor.
   */
  activities: import("@leaderboard/database").Activity[];
}

// =============================================================================
// Internal Processing Types
// =============================================================================

/**
 * Grouped messages for a single date during EOD processing.
 *
 * @remarks
 * During ingestion, messages from the same user on the same day are
 * grouped together and merged into a single activity. This interface
 * represents that grouped data before activity creation.
 *
 * @internal
 */
export interface DateGroupedMessages {
  /**
   * Array of message texts for this date (will be joined with newlines).
   */
  texts: string[];

  /**
   * Timestamp of the first message in the group.
   * Used as the activity occurrence time.
   */
  timestamp: Date;

  /**
   * Array of message IDs included in this group.
   * Used for bulk deletion after processing.
   */
  ids: number[];
}
