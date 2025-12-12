/**
 * @fileoverview Activity import service
 * @module @leaderboard/db-scripts/services/activity-importer
 *
 * This module handles importing activity data from JSON files
 * in the data directory to the database.
 */

import { readdir, readFile } from "node:fs/promises";
import { join, extname } from "node:path";
import { addContributors, addActivities, type Activity } from "@leaderboard/database";

// =============================================================================
// Constants
// =============================================================================

/**
 * File extension for activity JSON files.
 * @internal
 */
const JSON_EXT = ".json";

/**
 * Subdirectory name for activity files.
 * @internal
 */
const ACTIVITIES_SUBDIR = "activities";

// =============================================================================
// Import Functions
// =============================================================================

/**
 * Import activities from JSON files in a directory.
 *
 * @description
 * Reads all JSON files from the specified directory, parses them
 * as activity arrays, and imports them into the database.
 * Also ensures all referenced contributors exist.
 *
 * @param dirPath - Path to the directory containing activity JSON files
 * @param label - Label for logging (e.g., "GitHub", "Slack")
 *
 * @returns Number of activities imported
 *
 * @example
 * ```typescript
 * import { importActivitiesFromDir } from "./services/activity-importer";
 *
 * const count = await importActivitiesFromDir(
 *   "./data/github/activities",
 *   "GitHub"
 * );
 * console.log(`Imported ${count} GitHub activities`);
 * ```
 */
export async function importActivitiesFromDir(
  dirPath: string,
  label: string
): Promise<number> {
  const activities: Activity[] = [];

  try {
    const files = await readdir(dirPath);
    const jsonFiles = files.filter((f) => extname(f) === JSON_EXT);

    for (const file of jsonFiles) {
      const filePath = join(dirPath, file);
      const content = await readFile(filePath, "utf-8");
      const fileActivities = JSON.parse(content) as Activity[];

      if (Array.isArray(fileActivities)) {
        activities.push(...fileActivities);
      }
    }

    if (activities.length > 0) {
      // Ensure all contributors exist before importing activities
      const contributors = [...new Set(activities.map((a) => a.contributor))];
      await addContributors(contributors);

      await addActivities(activities);
      console.log(`   ✅ Imported ${activities.length} ${label} activities`);
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      console.log(`   ⚠️  No ${label} activities directory found, skipping...`);
    } else {
      throw error;
    }
  }

  return activities.length;
}

/**
 * Import GitHub activities from data/github/activities/.
 *
 * @description
 * Convenience function that imports all GitHub-related activities
 * from the standard location in the data directory.
 *
 * @param dataPath - Path to the data directory
 *
 * @returns Number of GitHub activities imported
 *
 * @example
 * ```typescript
 * import { importGitHubActivities } from "./services/activity-importer";
 *
 * const count = await importGitHubActivities("./data");
 * ```
 */
export async function importGitHubActivities(dataPath: string): Promise<number> {
  const activitiesDir = join(dataPath, "github", ACTIVITIES_SUBDIR);
  return importActivitiesFromDir(activitiesDir, "GitHub");
}

/**
 * Import Slack activities from data/slack/activities/.
 *
 * @description
 * Convenience function that imports all Slack-related activities
 * from the standard location in the data directory.
 *
 * @param dataPath - Path to the data directory
 *
 * @returns Number of Slack activities imported
 *
 * @example
 * ```typescript
 * import { importSlackActivities } from "./services/activity-importer";
 *
 * const count = await importSlackActivities("./data");
 * ```
 */
export async function importSlackActivities(dataPath: string): Promise<number> {
  const activitiesDir = join(dataPath, "slack", ACTIVITIES_SUBDIR);
  return importActivitiesFromDir(activitiesDir, "Slack");
}
