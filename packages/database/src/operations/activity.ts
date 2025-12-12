/**
 * @fileoverview Activity database operations
 * @module @leaderboard/database/operations/activity
 *
 * This module provides operations for managing activities and activity
 * definitions in the leaderboard database. Activities represent
 * contribution events from various platforms.
 */

import { getDb } from "../connection";
import { batchArray, getSqlPositionalParamPlaceholders } from "../utils/batch";
import type { Activity, ActivityDefinitionData, ActivityInsertOptions } from "../types";

// =============================================================================
// Activity Operations
// =============================================================================

/**
 * Adds activities to the database with upsert behavior.
 *
 * @remarks
 * This function performs bulk upserts of activities using batched queries.
 * The behavior on conflict (duplicate slug) depends on the source:
 *
 * - **Default behavior**: Updates all fields with the new values
 * - **With `mergeText: true`**: Concatenates text content and keeps the
 *   earliest occurrence timestamp (used for Slack EOD updates)
 *
 * The text merging logic handles several edge cases:
 * - If either text is null, uses the non-null value
 * - If texts are identical, keeps one copy
 * - Otherwise, joins texts with double newlines
 *
 * @param activities - Array of Activity objects to insert/update
 * @param options - Optional configuration for the insert behavior
 *
 * @returns A promise that resolves when all activities have been processed
 *
 * @example
 * ```typescript
 * // Standard GitHub activity insert
 * const activities: Activity[] = [
 *   {
 *     slug: "github-pr-opened-123",
 *     contributor: "alice",
 *     activity_definition: "github-pr-opened",
 *     title: "Add new feature",
 *     occured_at: new Date(),
 *     link: "https://github.com/org/repo/pull/123",
 *     text: null,
 *     points: 10,
 *     meta: { repo: "my-repo" }
 *   }
 * ];
 * await addActivities(activities);
 * ```
 *
 * @example
 * ```typescript
 * // Slack EOD with text merging
 * const eodActivities: Activity[] = [...];
 * await addActivities(eodActivities, { mergeText: true });
 * ```
 */
export async function addActivities(
  activities: Activity[],
  options: ActivityInsertOptions = {}
): Promise<void> {
  const db = getDb();
  const { mergeText = false } = options;

  for (const batch of batchArray(activities, 1000)) {
    const textConflictClause = mergeText
      ? `text = CASE 
          WHEN activity.text IS NULL THEN EXCLUDED.text
          WHEN EXCLUDED.text IS NULL THEN activity.text
          WHEN activity.text = EXCLUDED.text THEN activity.text
          ELSE activity.text || E'\\n\\n' || EXCLUDED.text
        END`
      : `text = EXCLUDED.text`;

    const occuredAtClause = mergeText
      ? `occured_at = LEAST(activity.occured_at, EXCLUDED.occured_at)`
      : `occured_at = EXCLUDED.occured_at`;

    const result = await db.query(
      `
      INSERT INTO activity (slug, contributor, activity_definition, title, occured_at, link, text, points, meta)
      VALUES ${getSqlPositionalParamPlaceholders(batch.length, 9)}
      ON CONFLICT (slug) DO UPDATE SET 
        contributor = EXCLUDED.contributor, 
        activity_definition = EXCLUDED.activity_definition, 
        title = EXCLUDED.title, 
        ${occuredAtClause},
        link = EXCLUDED.link,
        ${textConflictClause};
    `,
      batch.flatMap((a) => [
        a.slug,
        a.contributor,
        a.activity_definition,
        a.title,
        a.occured_at.toISOString(),
        a.link,
        a.text,
        a.points ?? null,
        a.meta ? JSON.stringify(a.meta) : null,
      ])
    );

    console.log(`Added ${result.affectedRows}/${batch.length} new activities`);
  }
}

// =============================================================================
// Activity Definition Operations
// =============================================================================

/**
 * Upserts activity definitions to the database.
 *
 * @remarks
 * Activity definitions define the types of activities that can be tracked.
 * Each definition specifies the default points awarded and display information.
 * This function inserts new definitions or updates existing ones based on
 * the slug.
 *
 * @param definitions - Array of ActivityDefinitionData objects to upsert
 *
 * @returns A promise that resolves when all definitions have been processed
 *
 * @example
 * ```typescript
 * const definitions: ActivityDefinitionData[] = [
 *   {
 *     slug: "github-pr-opened",
 *     name: "Pull Request Opened",
 *     description: "Opened a new pull request",
 *     points: 10,
 *     icon: "🔀"
 *   },
 *   {
 *     slug: "slack-eod-update",
 *     name: "EOD Update",
 *     description: "Posted an end-of-day update",
 *     points: 5,
 *     icon: "📝"
 *   }
 * ];
 * await upsertActivityDefinitions(definitions);
 * ```
 */
export async function upsertActivityDefinitions(
  definitions: ActivityDefinitionData[]
): Promise<void> {
  const db = getDb();

  for (const def of definitions) {
    await db.query(
      `
      INSERT INTO activity_definition (slug, name, description, points, icon)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (slug) DO UPDATE SET 
        name = EXCLUDED.name, 
        description = EXCLUDED.description, 
        points = EXCLUDED.points, 
        icon = EXCLUDED.icon;
    `,
      [def.slug, def.name, def.description, def.points, def.icon]
    );
  }
}

// =============================================================================
// Activity Queries
// =============================================================================

/**
 * Retrieves activities filtered by activity definition types.
 *
 * @remarks
 * This function is primarily used for exporting activities of specific types.
 * For example, you might want to export only GitHub-related activities
 * or only Slack EOD updates.
 *
 * @param definitions - Array of activity_definition slugs to filter by
 *
 * @returns Array of matching Activity objects
 *
 * @example
 * ```typescript
 * // Export all GitHub activities
 * const githubDefs = [
 *   "github-pr-opened",
 *   "github-pr-merged",
 *   "github-issue-opened",
 *   "github-commit"
 * ];
 * const activities = await getActivitiesByDefinitions(githubDefs);
 *
 * // Process for export
 * for (const activity of activities) {
 *   console.log(`${activity.contributor}: ${activity.title}`);
 * }
 * ```
 */
export async function getActivitiesByDefinitions(
  definitions: string[]
): Promise<Activity[]> {
  const db = getDb();

  const placeholders = definitions.map((_, i) => `$${i + 1}`).join(", ");
  const result = await db.query<Activity>(
    `SELECT * FROM activity WHERE activity_definition IN (${placeholders})`,
    definitions
  );

  return result.rows;
}
