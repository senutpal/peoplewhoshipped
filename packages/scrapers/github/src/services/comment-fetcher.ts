/**
 * @fileoverview Comment fetching service using REST API
 * @module @leaderboard/scraper-github/services/comment-fetcher
 *
 * This module provides functionality to fetch comments on issues and
 * pull requests from a repository using GitHub's REST API.
 */

import { getOctokit, getGitHubOrg } from "../client";
import { trackBotUser } from "./bot-tracker";
import type { Comment } from "../types";

// =============================================================================
// Comment Fetching
// =============================================================================

/**
 * Fetches all comments on issues and pull requests from a repository.
 *
 * @description
 * Uses GitHub's REST API to fetch comments from the issues endpoint,
 * which includes comments on both issues and pull requests. Comments
 * are sorted by update date (newest first) and filtered by the since
 * parameter.
 *
 * Bot users are automatically detected and tracked for later role updates.
 *
 * @param repo - The repository name (without owner)
 * @param since - Optional ISO 8601 date string to filter by update date
 * @returns Promise resolving to array of Comment objects
 *
 * @example
 * ```typescript
 * const since = subDays(new Date(), 7).toISOString();
 * const comments = await getComments("my-repo", since);
 *
 * for (const comment of comments) {
 *   console.log(`Comment by ${comment.author} on #${comment.issue_number}`);
 * }
 * ```
 */
export async function getComments(
  repo: string,
  since?: string
): Promise<Comment[]> {
  const octokit = getOctokit();
  const org = getGitHubOrg();

  console.log(`Fetching comments from ${repo}...`);

  const comments = await octokit.paginate(
    "GET /repos/{owner}/{repo}/issues/comments",
    { owner: org, repo, since, sort: "updated", direction: "desc" },
    (response) =>
      response.data.map((comment) => {
        // Track bot users
        if (comment.user?.login && comment.user?.type === "Bot") {
          trackBotUser(comment.user.login);
        }

        return {
          id: comment.node_id,
          issue_number: comment.issue_url.split("/").pop(),
          body: comment.body,
          created_at: comment.created_at,
          author: comment.user?.login,
          html_url: comment.html_url,
        };
      })
  );

  console.log(`Found ${comments.length} comments`);
  return comments;
}
