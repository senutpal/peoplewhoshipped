/**
 * @fileoverview Role update scraper
 * @module @leaderboard/scraper-roles/scraper
 *
 * This module provides the main functionality for updating contributor
 * roles by fetching and parsing markdown files from a data repository.
 */

import { getDb, listContributors } from "@leaderboard/database";
import { extractFrontmatterData } from "./frontmatter";

// =============================================================================
// Types
// =============================================================================

/**
 * Options for the updateRoles function.
 */
export interface UpdateRolesOptions {
  /** Base URL for contributor markdown files */
  baseUrl: string;
}

// =============================================================================
// Network Functions
// =============================================================================

/**
 * Fetch contributor markdown from a URL.
 *
 * @param baseUrl - Base URL for contributor files
 * @param username - The contributor username
 * @returns The markdown content or null if not found
 *
 * @internal
 */
async function fetchContributorMarkdown(
  baseUrl: string,
  username: string
): Promise<string | null> {
  const url = `${baseUrl}/${username}.md`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`  ⚠️  Markdown file not found for ${username}`);
        return null;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.text();
  } catch (error) {
    console.error(`  ❌ Error fetching markdown for ${username}:`, error);
    return null;
  }
}

// =============================================================================
// Database Functions
// =============================================================================

/**
 * Update contributor role and slack in database.
 *
 * @param username - The contributor's username
 * @param role - The role to set (or null to skip)
 * @param slackUserId - The Slack user ID to set (or null to skip)
 *
 * @example
 * ```typescript
 * // Update role only
 * await updateContributorRole("johndoe", "maintainer", null);
 *
 * // Update both role and Slack ID
 * await updateContributorRole("janedoe", "contributor", "U12345678");
 * ```
 */
export async function updateContributorRole(
  username: string,
  role: string | null,
  slackUserId: string | null
): Promise<void> {
  const db = getDb();

  if (role && slackUserId) {
    // Update both role and slack_user_id in meta
    await db.query(
      `UPDATE contributor 
       SET role = $1, 
           meta = COALESCE(meta, '{}'::json)::jsonb || $2::jsonb 
       WHERE username = $3;`,
      [role, JSON.stringify({ slack_user_id: slackUserId }), username]
    );
  } else if (role) {
    // Update only role
    await db.query(
      `UPDATE contributor SET role = $1 WHERE username = $2;`,
      [role, username]
    );
  } else if (slackUserId) {
    // Update only slack_user_id in meta
    await db.query(
      `UPDATE contributor 
       SET meta = COALESCE(meta, '{}'::json)::jsonb || $1::jsonb 
       WHERE username = $2;`,
      [JSON.stringify({ slack_user_id: slackUserId }), username]
    );
  }
}

// =============================================================================
// Main Update Function
// =============================================================================

/**
 * Update roles for all contributors from markdown files.
 *
 * @param options - Configuration options
 * @returns Summary of the update operation
 *
 * @remarks
 * This function:
 * 1. Fetches all contributors from the database
 * 2. For each contributor, fetches their markdown file from the data repo
 * 3. Extracts role and slack from frontmatter
 * 4. Updates the database with the extracted data
 *
 * @example
 * ```typescript
 * const result = await updateRoles({
 *   baseUrl: "https://raw.githubusercontent.com/org/leaderboard-data/main/contributors"
 * });
 *
 * console.log(`Updated: ${result.successCount}`);
 * console.log(`Not found: ${result.notFoundCount}`);
 * console.log(`Errors: ${result.errorCount}`);
 * ```
 */
export async function updateRoles(options: UpdateRolesOptions): Promise<{
  successCount: number;
  notFoundCount: number;
  noDataCount: number;
  errorCount: number;
  totalProcessed: number;
}> {
  console.log("🚀 Starting role update process...\n");

  // Get all contributors from database
  const contributors = await listContributors();
  console.log(`📊 Found ${contributors.length} contributors in database\n`);

  let successCount = 0;
  let notFoundCount = 0;
  let noDataCount = 0;
  let errorCount = 0;

  // Process each contributor
  for (const contributor of contributors) {
    const username = contributor.username;
    console.log(`Processing: ${username}`);

    try {
      // Fetch markdown file
      const markdown = await fetchContributorMarkdown(options.baseUrl, username);

      if (!markdown) {
        notFoundCount++;
        continue;
      }

      // Extract role and slack from frontmatter
      const { role, slack } = extractFrontmatterData(markdown);

      if (!role && !slack) {
        console.log(`  ⚠️  No role or slack found in frontmatter for ${username}`);
        noDataCount++;
        continue;
      }

      // Update contributor in database
      await updateContributorRole(username, role, slack);

      const updates: string[] = [];
      if (role) updates.push(`role: ${role}`);
      if (slack) updates.push(`slack_user_id: ${slack}`);

      console.log(`  ✅ Updated ${updates.join(", ")}`);
      successCount++;
    } catch (error) {
      console.error(`  ❌ Error processing ${username}:`, error);
      errorCount++;
    }

    console.log(); // Empty line for readability
  }

  // Print summary
  console.log("=".repeat(50));
  console.log("📈 Summary:");
  console.log(`  ✅ Successfully updated: ${successCount}`);
  console.log(`  ⚠️  Markdown not found: ${notFoundCount}`);
  console.log(`  ⚠️  No role or slack in frontmatter: ${noDataCount}`);
  console.log(`  ❌ Errors: ${errorCount}`);
  console.log(`  📊 Total processed: ${contributors.length}`);
  console.log("=".repeat(50));

  return {
    successCount,
    notFoundCount,
    noDataCount,
    errorCount,
    totalProcessed: contributors.length,
  };
}

// =============================================================================
// CLI Entry Point
// =============================================================================

// Run if called directly
if (import.meta.main) {
  const baseUrl = process.env.CONTRIBUTOR_BASE_URL ??
    "https://raw.githubusercontent.com/ohcnetwork/leaderboard-data/refs/heads/main/contributors";

  updateRoles({ baseUrl })
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
}
