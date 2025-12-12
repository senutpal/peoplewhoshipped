/**
 * @fileoverview Commit fetching service using Events and Compare APIs
 * @module @leaderboard/scraper-github/services/commit-fetcher
 *
 * This module provides functionality to fetch commits from push events
 * using GitHub's Events API and Compare API to get full commit details.
 */

import { getOctokit, getGitHubOrg } from "../client";
import { trackBotUser } from "./bot-tracker";
import type { Commit } from "../types";

// =============================================================================
// Commit Fetching
// =============================================================================

/**
 * Fetches all commits from push events of a repository.
 *
 * @description
 * Uses GitHub's Events API to find PushEvents, then uses the Compare API
 * to fetch full commit details including author information. This approach
 * captures commits pushed to the repository regardless of branch.
 *
 * **Limitations**:
 * - Events API only returns events from the last 90 days
 * - Events API returns at most 300 events per repository
 *
 * Bot users are automatically detected and tracked for later role updates.
 *
 * @param repo - The repository name (without owner)
 * @param since - Optional ISO 8601 date string to filter by event date
 * @returns Promise resolving to array of Commit objects
 *
 * @example
 * ```typescript
 * const since = subDays(new Date(), 7).toISOString();
 * const commits = await getCommitsFromPushEvents("my-repo", since);
 *
 * for (const commit of commits) {
 *   console.log(`${commit.commitId.slice(0, 7)}: ${commit.commitMessage}`);
 *   console.log(`  Branch: ${commit.branchName}`);
 *   console.log(`  Author: ${commit.author}`);
 * }
 * ```
 */
export async function getCommitsFromPushEvents(
  repo: string,
  since?: string
): Promise<Commit[]> {
  const octokit = getOctokit();
  const org = getGitHubOrg();
  const commits: Commit[] = [];

  for await (const response of octokit.paginate.iterator(
    "GET /repos/{owner}/{repo}/events",
    {
      owner: org,
      repo,
      per_page: 100,
    }
  )) {
    for (const event of response.data) {
      // Stop if event is older than since parameter
      if (since && event.created_at && new Date(event.created_at) < new Date(since)) {
        return commits;
      }

      // Only process PushEvents
      if (event.type !== "PushEvent") continue;

      const payload = event.payload as {
        head?: string;
        before?: string;
        ref?: string;
      };

      if (!payload.head || !payload.before || !payload.ref) continue;

      const branchName = payload.ref.replace("refs/heads/", "");

      try {
        const compareResponse = await octokit.request(
          "GET /repos/{owner}/{repo}/compare/{basehead}",
          {
            owner: org,
            repo,
            basehead: `${payload.before}...${payload.head}`,
          }
        );

        for (const commit of compareResponse.data.commits) {
          // Track bot users
          if (commit.author?.login && commit.author?.type === "Bot") {
            trackBotUser(commit.author.login);
          }

          commits.push({
            commitId: commit.sha,
            branchName,
            commitMessage: commit.commit.message?.split("\n")[0] ?? "",
            committedDate: commit.commit.committer?.date ?? null,
            author: commit.author?.login ?? null,
            url: commit.html_url,
          });
        }
      } catch (error) {
        console.error(
          `Failed to compare ${payload.before}...${payload.head} in ${repo}:`,
          error
        );
        continue;
      }
    }
  }

  return commits;
}
