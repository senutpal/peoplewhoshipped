/**
 * @fileoverview Slack activity export service
 * @module @leaderboard/db-scripts/services/slack-exporter
 *
 * This module handles exporting Slack activity data from the database
 * to JSON files in the data directory.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { getActivitiesByDefinitions } from "@leaderboard/database";
import { SlackActivityDefinition } from "@leaderboard/scraper-core";
import type { ActivityRow, ExportResult } from "../types";

// =============================================================================
// Constants
// =============================================================================

/**
 * Output directory path for Slack activities relative to data path.
 * @internal
 */
const SLACK_ACTIVITIES_PATH = ["slack", "activities"];

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Group activities by contributor username.
 *
 * @param activities - Array of activity rows to group
 *
 * @returns Map of contributor username to their activities
 *
 * @internal
 */
function groupByContributor(
  activities: ActivityRow[]
): Map<string, ActivityRow[]> {
  const grouped = new Map<string, ActivityRow[]>();

  for (const activity of activities) {
    const existing = grouped.get(activity.contributor) || [];
    existing.push(activity);
    grouped.set(activity.contributor, existing);
  }

  return grouped;
}

/**
 * Format an activity row for JSON export.
 *
 * @param activity - Activity row to format
 *
 * @returns Formatted activity object for JSON serialization
 *
 * @internal
 */
function formatActivityForExport(activity: ActivityRow): Record<string, unknown> {
  return {
    slug: activity.slug,
    contributor: activity.contributor,
    activity_definition: activity.activity_definition,
    title: activity.title,
    occured_at:
      activity.occured_at instanceof Date
        ? activity.occured_at.toISOString()
        : activity.occured_at,
    link: activity.link,
    text: activity.text,
    points: activity.points,
    meta: activity.meta,
  };
}

// =============================================================================
// Export Functions
// =============================================================================

/**
 * Export Slack activities to data/slack/activities/.
 *
 * @description
 * Fetches all Slack-related activities from the database and exports
 * them to JSON files organized by contributor. Each contributor gets
 * their own JSON file named `{username}.json`.
 *
 * @param dataPath - Path to the data directory
 *
 * @returns Export result with count of exported records and contributors
 *
 * @example
 * ```typescript
 * import { exportSlackActivities } from "./services/slack-exporter";
 *
 * const result = await exportSlackActivities("./data");
 * console.log(`Exported ${result.exported} activities for ${result.contributors} contributors`);
 * ```
 */
export async function exportSlackActivities(
  dataPath: string
): Promise<ExportResult> {
  const outputDir = join(dataPath, ...SLACK_ACTIVITIES_PATH);
  await mkdir(outputDir, { recursive: true });

  // Get all Slack activity definition slugs
  const definitions = Object.values(SlackActivityDefinition);
  const activities = await getActivitiesByDefinitions(definitions);

  const grouped = groupByContributor(activities as ActivityRow[]);
  let totalExported = 0;

  for (const [contributor, contributorActivities] of grouped) {
    const outputFile = join(outputDir, `${contributor}.json`);
    const formatted = contributorActivities.map(formatActivityForExport);

    await writeFile(outputFile, JSON.stringify(formatted, null, 2));
    totalExported += contributorActivities.length;
  }

  console.log(
    `Exported ${totalExported} Slack activities for ${grouped.size} contributors`
  );

  return {
    exported: totalExported,
    contributors: grouped.size,
  };
}
