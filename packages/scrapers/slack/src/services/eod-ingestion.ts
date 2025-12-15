/**
 * @fileoverview EOD (End of Day) update ingestion service
 * @module @leaderboard/scraper-slack/services/eod-ingestion
 *
 * This module handles processing pending EOD updates from the message queue,
 * matching them to contributors, and creating activity records.
 */

import {
  addActivities,
  deleteSlackEodMessages,
  getContributorsBySlackUserIds,
  getPendingEodUpdates,
  type Activity,
} from "@leaderboard/database";
import { SlackActivityDefinition, getDateString } from "@leaderboard/scraper-core";
import type { EodIngestionResult, DateGroupedMessages } from "../types";

// =============================================================================
// Main Ingestion Function
// =============================================================================

/**
 * Processes pending EOD updates and converts them to contributor activities.
 *
 * @description
 * This function retrieves all pending EOD messages from the queue,
 * matches Slack user IDs to registered contributors, groups messages
 * by date, and creates activities. Multiple messages from the same
 * contributor on the same day are merged into a single activity.
 *
 * @returns Promise resolving to an EodIngestionResult with processing statistics
 *
 * @remarks
 * **Processing Flow**:
 * 1. Fetch all pending EOD updates grouped by Slack user ID
 * 2. Bulk lookup contributor usernames by Slack user IDs
 * 3. Skip messages from unknown Slack users (logged as warnings)
 * 4. Group remaining messages by date for each contributor
 * 5. Create activities with merged text for each date
 * 6. Bulk insert activities and delete processed messages
 *
 * **Message Merging**: If a contributor posts multiple EOD updates
 * on the same day, they are merged with double newlines between them.
 *
 * **Activity Slugs**: Generated using format:
 * `eod_update_YYYY-MM-DD_contributor_username`
 *
 * @example
 * ```typescript
 * import { ingestEodUpdates } from "@leaderboard/scraper-slack";
 *
 * const result = await ingestEodUpdates();
 * console.log(`Processed ${result.processed} messages`);
 * console.log(`Skipped ${result.skipped} messages (unknown users)`);
 * console.log(`Created ${result.activities.length} activities`);
 * ```
 */
export async function ingestEodUpdates(): Promise<EodIngestionResult> {
  console.log("Starting EOD updates ingestion...");

  const pendingUpdates = await getPendingEodUpdates();
  console.log(`Found ${pendingUpdates.length} users with pending EOD updates`);

  if (pendingUpdates.length === 0) {
    console.log("No pending EOD updates to process.");
    return { processed: 0, skipped: 0, activities: [] };
  }

  // Bulk lookup all contributors by their Slack user IDs
  const slackUserIds = pendingUpdates.map((u) => u.user_id);
  const contributorMap = await getContributorsBySlackUserIds(slackUserIds);

  // Process each user's pending updates
  const processingResult = processUserUpdates(pendingUpdates, contributorMap);

  // Bulk insert all activities at once with text merging enabled
  if (processingResult.activities.length > 0) {
    await addActivities(processingResult.activities, { mergeText: true });
    console.log(`\nInserted ${processingResult.activities.length} total EOD activities`);
  }

  // Bulk delete all processed messages at once
  if (processingResult.processedMessageIds.length > 0) {
    await deleteSlackEodMessages(processingResult.processedMessageIds);
  }

  // Log summary
  logIngestionSummary(processingResult);

  return {
    processed: processingResult.processedCount,
    skipped: processingResult.skippedCount,
    activities: processingResult.activities,
  };
}

// =============================================================================
// Internal Types
// =============================================================================

/**
 * Pending update data structure from the database.
 * @internal
 */
interface PendingUpdate {
  user_id: string;
  ids: number[];
  texts: string[];
  timestamps: Date[];
}

/**
 * Result from processing all user updates.
 * @internal
 */
interface ProcessingResult {
  processedCount: number;
  skippedCount: number;
  warnings: string[];
  activities: Activity[];
  processedMessageIds: number[];
}

// =============================================================================
// Processing Functions
// =============================================================================

/**
 * Processes all pending user updates and creates activities.
 *
 * @param pendingUpdates - Array of pending updates grouped by user
 * @param contributorMap - Map of Slack user IDs to contributor usernames
 * @returns Processing result with counts and activities
 *
 * @internal
 */
function processUserUpdates(
  pendingUpdates: PendingUpdate[],
  contributorMap: Map<string, string>
): ProcessingResult {
  let processedCount = 0;
  let skippedCount = 0;
  const warnings: string[] = [];
  const allActivities: Activity[] = [];
  const processedMessageIds: number[] = [];

  for (const userUpdate of pendingUpdates) {
    const { user_id, ids, texts, timestamps } = userUpdate;

    // Look up the contributor from our pre-fetched map
    const contributorUsername = contributorMap.get(user_id);

    if (!contributorUsername) {
      console.warn(
        `⚠️  No contributor found with slack_user_id: ${user_id} (${ids.length} messages skipped)`
      );
      warnings.push(user_id);
      skippedCount += ids.length;
      continue;
    }

    // Group messages by date and create activities
    const { activities, messageIds } = processUserMessages(
      contributorUsername,
      ids,
      texts,
      timestamps
    );

    allActivities.push(...activities);
    processedMessageIds.push(...messageIds);
    processedCount += ids.length;

    console.log(
      `✓ Prepared ${activities.length} EOD activities for ${contributorUsername}`
    );
  }

  return {
    processedCount,
    skippedCount,
    warnings,
    activities: allActivities,
    processedMessageIds,
  };
}

/**
 * Processes messages for a single user and creates their activities.
 *
 * @param contributorUsername - The contributor's username
 * @param ids - Array of message IDs
 * @param texts - Array of message texts
 * @param timestamps - Array of message timestamps
 * @returns Activities and processed message IDs
 *
 * @internal
 */
function processUserMessages(
  contributorUsername: string,
  ids: number[],
  texts: string[],
  timestamps: Date[]
): { activities: Activity[]; messageIds: number[] } {
  // Group messages by date (YYYY-MM-DD)
  const messagesByDate = groupMessagesByDate(ids, texts, timestamps);

  // Create activities for each date
  const activities = createActivitiesFromGroups(contributorUsername, messagesByDate);

  return { activities, messageIds: ids };
}

/**
 * Groups messages by their date (YYYY-MM-DD format).
 *
 * @param ids - Array of message IDs
 * @param texts - Array of message texts
 * @param timestamps - Array of message timestamps
 * @returns Map of date strings to grouped message data
 *
 * @internal
 */
function groupMessagesByDate(
  ids: number[],
  texts: string[],
  timestamps: Date[]
): Map<string, DateGroupedMessages> {
  const messagesByDate = new Map<string, DateGroupedMessages>();

  for (let i = 0; i < timestamps.length; i++) {
    const timestamp = timestamps[i];
    const text = texts[i];
    const id = ids[i];

    if (!timestamp || text === undefined || id === undefined) continue;

    const date = getDateString(timestamp);
    if (!date) continue;

    if (!messagesByDate.has(date)) {
      messagesByDate.set(date, {
        texts: [],
        timestamp: timestamp,
        ids: [],
      });
    }

    const dateEntry = messagesByDate.get(date)!;
    dateEntry.texts.push(text);
    dateEntry.ids.push(id);
  }

  return messagesByDate;
}

/**
 * Creates Activity objects from grouped messages.
 *
 * @param contributorUsername - The contributor's username
 * @param messagesByDate - Map of dates to grouped messages
 * @returns Array of Activity objects
 *
 * @internal
 */
function createActivitiesFromGroups(
  contributorUsername: string,
  messagesByDate: Map<string, DateGroupedMessages>
): Activity[] {
  const activities: Activity[] = [];

  for (const [date, { texts: dayTexts, timestamp }] of messagesByDate) {
    const mergedText = dayTexts.join("\n\n");

    activities.push({
      slug: `${SlackActivityDefinition.EOD_UPDATE}_${date}_${contributorUsername}`,
      contributor: contributorUsername,
      activity_definition: SlackActivityDefinition.EOD_UPDATE,
      title: "EOD Update",
      occured_at: timestamp,
      link: null,
      text: mergedText,
      points: null,
      meta: null,
    });
  }

  return activities;
}

/**
 * Logs a summary of the ingestion process.
 *
 * @param result - The processing result to summarize
 *
 * @internal
 */
function logIngestionSummary(result: ProcessingResult): void {
  console.log("\n=== EOD Ingestion Summary ===");
  console.log(`Processed: ${result.processedCount} messages`);
  console.log(`Skipped: ${result.skippedCount} messages`);
  if (result.warnings.length > 0) {
    console.log(
      `\nUnmatched Slack user IDs (${result.warnings.length}): ${result.warnings.join(", ")}`
    );
  }
  console.log("=============================\n");
}
