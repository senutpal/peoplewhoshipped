/**
 * @fileoverview Contributor database operations
 * @module @leaderboard/database/operations/contributor
 *
 * This module provides CRUD operations for managing contributors in the
 * leaderboard database. Contributors are users who make contributions
 * across different platforms (GitHub, Slack, etc.).
 */

import { getDb } from "../connection";
import { batchArray, getSqlPositionalParamPlaceholders } from "../utils/batch";
import type { ContributorQueryResult } from "../types";

// =============================================================================
// Contributor Creation
// =============================================================================

/**
 * Adds contributors to the database with GitHub-style avatar URLs.
 *
 * @remarks
 * This function performs a bulk insert of contributors using batched queries
 * to handle large datasets efficiently. Duplicate usernames are ignored
 * using PostgreSQL's `ON CONFLICT DO NOTHING` clause.
 *
 * For each contributor, the function automatically:
 * - Generates a GitHub avatar URL based on the username
 * - Creates a social_profiles entry with a link to their GitHub profile
 *
 * @param contributors - Array of contributor usernames to add
 *
 * @returns A promise that resolves when all contributors have been processed
 *
 * @example
 * ```typescript
 * // Add new contributors from a GitHub scrape
 * const newUsers = ["alice", "bob", "charlie"];
 * await addContributors(newUsers);
 * // Console: "Added 3/3 new contributors"
 *
 * // Duplicates are automatically ignored
 * await addContributors(["alice", "dave"]);
 * // Console: "Added 1/2 new contributors"
 * ```
 */
export async function addContributors(contributors: string[]): Promise<void> {
  const db = getDb();
  const uniqueContributors = [...new Set(contributors)];

  for (const batch of batchArray(uniqueContributors, 1000)) {
    const result = await db.query(
      `
      INSERT INTO contributor (username, avatar_url, social_profiles)
      VALUES ${getSqlPositionalParamPlaceholders(batch.length, 3)}
      ON CONFLICT (username) DO NOTHING;
    `,
      batch.flatMap((c) => [
        c,
        `https://avatars.githubusercontent.com/${c}`,
        JSON.stringify({ github: `https://github.com/${c}` }),
      ])
    );

    console.log(`Added ${result.affectedRows}/${batch.length} new contributors`);
  }
}

// =============================================================================
// Contributor Updates
// =============================================================================

/**
 * Updates the role of bot contributors to 'bot'.
 *
 * @remarks
 * GitHub's API identifies certain accounts as bots. This function updates
 * the role field for these accounts so they can be filtered out of
 * leaderboard rankings or displayed separately.
 *
 * The function uses batched queries to efficiently handle large numbers
 * of bot accounts.
 *
 * @param botUsernames - Array of usernames that should be marked as bots
 *
 * @returns A promise that resolves when all bot roles have been updated
 *
 * @example
 * ```typescript
 * // After scraping GitHub, update known bot accounts
 * const bots = ["dependabot[bot]", "renovate[bot]", "github-actions[bot]"];
 * await updateBotRoles(bots);
 * // Console: "Updated 3/3 bot contributors"
 * ```
 */
export async function updateBotRoles(botUsernames: string[]): Promise<void> {
  if (botUsernames.length === 0) {
    console.log("No bot users to update");
    return;
  }

  const db = getDb();
  const uniqueBotUsernames = [...new Set(botUsernames)];

  for (const batch of batchArray(uniqueBotUsernames, 1000)) {
    const placeholders = batch.map((_, i) => `$${i + 1}`).join(", ");
    const result = await db.query(
      `
      UPDATE contributor
      SET role = 'bot'
      WHERE username IN (${placeholders});
    `,
      batch
    );

    console.log(`Updated ${result.affectedRows}/${batch.length} bot contributors`);
  }
}

// =============================================================================
// Contributor Queries
// =============================================================================

/**
 * Retrieves a contributor by their Slack user ID from the meta field.
 *
 * @remarks
 * Contributors can have a Slack user ID stored in their `meta` JSON field.
 * This function queries the database using PostgreSQL's JSON arrow operators
 * to find contributors by their Slack identity.
 *
 * @param slackUserId - The Slack user ID to search for (e.g., "U12345678")
 *
 * @returns The contributor's username and meta, or null if not found
 *
 * @example
 * ```typescript
 * // Look up a contributor from a Slack message
 * const contributor = await getContributorBySlackUserId("U12345678");
 * if (contributor) {
 *   console.log(`Found contributor: ${contributor.username}`);
 * } else {
 *   console.log("No contributor found for this Slack user");
 * }
 * ```
 */
export async function getContributorBySlackUserId(
  slackUserId: string
): Promise<ContributorQueryResult | null> {
  const db = getDb();

  const result = await db.query<ContributorQueryResult>(
    `SELECT username, meta FROM contributor WHERE meta->>'slack_user_id' = $1;`,
    [slackUserId]
  );

  return result.rows[0] ?? null;
}

/**
 * Retrieves multiple contributors by their Slack user IDs in a single query.
 *
 * @remarks
 * For performance optimization when processing multiple Slack messages,
 * this function batches all Slack user ID lookups into a single database query.
 * The result is returned as a Map for O(1) lookup performance.
 *
 * @param slackUserIds - Array of Slack user IDs to look up
 *
 * @returns A Map where keys are Slack user IDs and values are contributor usernames
 *
 * @example
 * ```typescript
 * // Batch lookup for EOD message processing
 * const slackIds = ["U12345", "U67890", "U11111"];
 * const contributorMap = await getContributorsBySlackUserIds(slackIds);
 *
 * // O(1) lookup for each message
 * for (const message of messages) {
 *   const username = contributorMap.get(message.user_id);
 *   if (username) {
 *     await createActivity(username, message);
 *   }
 * }
 * ```
 */
export async function getContributorsBySlackUserIds(
  slackUserIds: string[]
): Promise<Map<string, string>> {
  const db = getDb();

  const result = await db.query<{ username: string; slack_user_id: string }>(
    `SELECT username, meta->>'slack_user_id' as slack_user_id 
     FROM contributor 
     WHERE meta->>'slack_user_id' = ANY($1);`,
    [slackUserIds]
  );

  const contributorMap = new Map<string, string>();
  for (const row of result.rows) {
    contributorMap.set(row.slack_user_id, row.username);
  }

  return contributorMap;
}
