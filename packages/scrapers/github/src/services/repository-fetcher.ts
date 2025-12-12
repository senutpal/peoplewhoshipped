/**
 * @fileoverview Repository fetching service
 * @module @leaderboard/scraper-github/services/repository-fetcher
 *
 * This module provides functionality to fetch repositories from a
 * GitHub organization, with pagination and filtering by push date.
 */

import { getOctokit } from "../client";
import type { Repository } from "../types";

// =============================================================================
// Repository Fetching
// =============================================================================

/**
 * Fetches all repositories from a GitHub organization.
 *
 * @description
 * Retrieves repositories from the specified organization using the GitHub API.
 * Repositories are sorted by push date (most recent first) and filtered to
 * only include those updated since the specified date.
 *
 * The function uses cursor-based pagination to handle organizations with
 * many repositories efficiently.
 *
 * @param org - The GitHub organization name
 * @param since - Optional ISO 8601 date string to filter by last push date
 * @returns Promise resolving to array of Repository objects
 *
 * @example
 * ```typescript
 * // Get all repos updated in the last 7 days
 * const since = subDays(new Date(), 7).toISOString();
 * const repos = await getRepositories("my-org", since);
 *
 * console.log(`Found ${repos.length} recently updated repositories`);
 * ```
 *
 * @example
 * ```typescript
 * // Get all repos (no date filter)
 * const repos = await getRepositories("my-org");
 * ```
 */
export async function getRepositories(
  org: string,
  since?: string
): Promise<Repository[]> {
  const octokit = getOctokit();
  const repos: Repository[] = [];

  for await (const response of octokit.paginate.iterator(
    "GET /orgs/{org}/repos",
    {
      org,
      sort: "pushed",
    }
  )) {
    console.log(`Found ${response.data.length} repositories`);

    for (const repo of response.data) {
      // Stop if repo is older than since parameter
      if (since && repo.pushed_at && new Date(repo.pushed_at) < new Date(since)) {
        return repos;
      }

      if (!repo.pushed_at) continue;

      repos.push({
        name: repo.name,
        url: repo.html_url,
        defaultBranch: repo.default_branch ?? "main",
      });
    }
  }

  return repos;
}
