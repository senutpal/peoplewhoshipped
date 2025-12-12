/**
 * @fileoverview Slack message fetching service with pagination support
 * @module @leaderboard/scraper-slack/services/message-fetcher
 *
 * This module handles fetching messages from Slack channels using the
 * conversations.history API with proper pagination and filtering.
 */

import { toHTML } from "slack-markdown";
import { addSlackEodMessages, type SlackEodMessage } from "@leaderboard/database";
import { dateToUnixTimestamp, getDateRange } from "@leaderboard/scraper-core";
import { getSlackClient, getSlackChannel } from "../client";
import type { ConversationHistoryResponse } from "../types";

// =============================================================================
// Constants
// =============================================================================

/**
 * Minimum message length to be considered a valid EOD update.
 * Very short messages (5 characters or less) are filtered out as they're
 * typically not meaningful EOD updates (reactions, single emojis, etc.).
 */
const MINIMUM_MESSAGE_LENGTH = 5;

/**
 * Number of messages to fetch per API request.
 * This is the maximum allowed by Slack's API.
 */
const MESSAGES_PER_PAGE = 100;

// =============================================================================
// Message Fetching
// =============================================================================

/**
 * Fetches Slack messages from the configured channel for a given date range.
 *
 * @description
 * This function retrieves all messages from the configured Slack channel
 * within the specified date range, filters them to include only valid
 * user messages, converts Slack markdown to HTML, and stores them in
 * the database queue for later processing.
 *
 * @param since - Optional start date for message fetching.
 *                If not provided, defaults to start of current day.
 *
 * @returns A promise that resolves when all messages have been fetched and stored
 *
 * @throws {Error} When Slack API credentials are not configured
 * @throws {Error} When Slack API returns an error response
 *
 * @remarks
 * **Pagination**: The function automatically handles Slack's cursor-based
 * pagination, making multiple API requests if necessary to retrieve all
 * messages in the date range.
 *
 * **Filtering**: Messages are filtered to include only:
 * - Messages of type "message" (not system events)
 * - Messages with a user ID (not bot messages without user)
 * - Messages with text content longer than 5 characters
 *
 * **Storage**: Fetched messages are inserted into the `slack_eod_messages`
 * table with a unique ID derived from the Slack timestamp.
 *
 * @example
 * ```typescript
 * import { fetchSlackMessages } from "@leaderboard/scraper-slack";
 * import { subDays } from "date-fns";
 *
 * // Fetch messages from the last 7 days
 * await fetchSlackMessages(subDays(new Date(), 7));
 *
 * // Fetch messages from today only
 * await fetchSlackMessages();
 * ```
 */
export async function fetchSlackMessages(since?: Date): Promise<void> {
  const slack = getSlackClient();
  const channel = getSlackChannel();
  const { oldest, latest } = getDateRange(since);

  console.log(
    `Fetching Slack messages from ${channel} between ${oldest.toISOString()} and ${latest.toISOString()}...`
  );

  for await (const page of slack.paginate("conversations.history", {
    channel,
    oldest: dateToUnixTimestamp(oldest),
    latest: dateToUnixTimestamp(latest),
    limit: MESSAGES_PER_PAGE,
  })) {
    const response = page as unknown as ConversationHistoryResponse;

    if (!response.messages) {
      console.log("No messages in this page");
      continue;
    }

    const messages = processMessagePage(response.messages);

    if (messages.length > 0) {
      console.log(`Writing ${messages.length} messages to database`);
      await addSlackEodMessages(messages);
    }
  }
}

// =============================================================================
// Message Processing
// =============================================================================

/**
 * Processes a page of raw Slack messages into database-ready format.
 *
 * @param rawMessages - Array of raw messages from Slack API
 * @returns Array of processed messages ready for database insertion
 *
 * @internal
 */
function processMessagePage(
  rawMessages: ConversationHistoryResponse["messages"]
): SlackEodMessage[] {
  return rawMessages
    .filter(isValidEodMessage)
    .map(transformToSlackEodMessage);
}

/**
 * Validates whether a message qualifies as a valid EOD update.
 *
 * @param msg - The raw Slack message to validate
 * @returns True if the message should be included, false otherwise
 *
 * @internal
 */
function isValidEodMessage(msg: ConversationHistoryResponse["messages"][0]): boolean {
  return (
    msg.type === "message" &&
    msg.user !== undefined &&
    msg.text !== undefined &&
    msg.text.trim().length > MINIMUM_MESSAGE_LENGTH
  );
}

/**
 * Transforms a raw Slack message into database format.
 *
 * @param msg - The validated Slack message to transform
 * @returns A SlackEodMessage object ready for database insertion
 *
 * @remarks
 * The message ID is derived from Slack's timestamp to ensure uniqueness.
 * The timestamp is in "seconds.microseconds" format, so we multiply by 1000
 * to get milliseconds and use that as the integer ID.
 *
 * @internal
 */
function transformToSlackEodMessage(
  msg: ConversationHistoryResponse["messages"][0]
): SlackEodMessage {
  return {
    // Convert Slack's ts (seconds.microseconds) to milliseconds for unique ID
    id: parseInt((parseFloat(msg.ts) * 1000).toString()),
    user_id: msg.user!,
    // Convert Slack markdown to HTML for display
    text: toHTML(msg.text ?? "") as string,
    timestamp: new Date(Number(msg.ts) * 1000),
  };
}
