/**
 * @fileoverview Slack WebClient singleton and configuration utilities
 * @module @leaderboard/scraper-slack/client
 *
 * This module provides a singleton instance of the Slack WebClient
 * with proper configuration validation and error handling.
 */

import { WebClient } from "@slack/web-api";

// =============================================================================
// Module State
// =============================================================================

/**
 * Singleton instance of the Slack WebClient.
 * Initialized lazily on first access via getSlackClient().
 */
let slackClient: WebClient | null = null;

// =============================================================================
// Environment Variables
// =============================================================================

/**
 * Gets the Slack API token from environment variables.
 *
 * @returns The Slack API token string
 * @throws {Error} When SLACK_API_TOKEN environment variable is not set
 *
 * @example
 * ```typescript
 * try {
 *   const token = getSlackToken();
 *   console.log("Token retrieved successfully");
 * } catch (error) {
 *   console.error("Please configure SLACK_API_TOKEN");
 * }
 * ```
 */
export function getSlackToken(): string {
  const token = process.env.SLACK_API_TOKEN;

  if (!token) {
    throw new Error(
      "SLACK_API_TOKEN environment variable is not set. " +
        "Please set this to your Slack Bot User OAuth Token. " +
        "You can find this in your Slack App settings under OAuth & Permissions."
    );
  }

  return token;
}

/**
 * Gets the target Slack channel ID from environment variables.
 *
 * @returns The Slack channel ID string
 * @throws {Error} When SLACK_CHANNEL environment variable is not set
 *
 * @remarks
 * The channel ID should be the internal Slack ID (e.g., "C12345678"),
 * not the channel name. You can find this by right-clicking a channel
 * in Slack and selecting "Copy link" - the ID is in the URL.
 *
 * @example
 * ```typescript
 * const channelId = getSlackChannel();
 * console.log(`Fetching messages from channel: ${channelId}`);
 * ```
 */
export function getSlackChannel(): string {
  const channel = process.env.SLACK_CHANNEL;

  if (!channel) {
    throw new Error(
      "SLACK_CHANNEL environment variable is not set. " +
        "Please set this to the Slack channel ID where EOD updates are posted. " +
        "The channel ID looks like 'C12345678' and can be found in the channel URL."
    );
  }

  return channel;
}

// =============================================================================
// Slack Client
// =============================================================================

/**
 * Gets the Slack WebClient singleton instance.
 *
 * @returns A configured WebClient instance ready for API calls
 * @throws {Error} When required environment variables are not set
 *
 * @remarks
 * This function implements the singleton pattern - the WebClient is
 * initialized only once and reused across all subsequent calls.
 * This is important for maintaining connection efficiency and
 * respecting Slack's rate limits.
 *
 * Required environment variables:
 * - `SLACK_API_TOKEN`: Bot User OAuth Token
 * - `SLACK_CHANNEL`: Target channel ID
 *
 * @example
 * ```typescript
 * const client = getSlackClient();
 *
 * // Use the client to make API calls
 * const result = await client.conversations.history({
 *   channel: getSlackChannel(),
 *   limit: 100
 * });
 * ```
 */
export function getSlackClient(): WebClient {
  if (slackClient) {
    return slackClient;
  }

  // Validate both required environment variables
  const token = getSlackToken();
  getSlackChannel(); // Validate channel is set (throws if not)

  slackClient = new WebClient(token);
  return slackClient;
}

/**
 * Resets the Slack client singleton (primarily for testing).
 *
 * @remarks
 * This function clears the cached WebClient instance, allowing
 * a new client to be created on the next getSlackClient() call.
 * This is mainly useful for testing scenarios where you need to
 * reinitialize the client with different credentials.
 *
 * @internal
 */
export function resetSlackClient(): void {
  slackClient = null;
}
