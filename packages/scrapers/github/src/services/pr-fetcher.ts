/**
 * @fileoverview Pull request fetching service using GraphQL
 * @module @leaderboard/scraper-github/services/pr-fetcher
 *
 * This module provides functionality to fetch pull requests and their
 * reviews from a repository using GitHub's GraphQL API for efficient
 * data retrieval in a single request.
 */

import { getOctokit, getGitHubOrg } from "../client";
import { trackBotUser } from "./bot-tracker";
import { isBot, getLogin } from "@leaderboard/scraper-core";
import type {
  PullRequest,
  PullRequestsGraphQLResponse,
} from "../types";

// =============================================================================
// GraphQL Query
// =============================================================================

/**
 * GraphQL query for fetching pull requests with reviews.
 * @internal
 */
const PULL_REQUESTS_QUERY = `
  query($owner: String!, $repo: String!, $cursor: String) {
    repository(owner: $owner, name: $repo) {
      pullRequests(
        first: 100
        orderBy: { field: UPDATED_AT, direction: DESC }
        after: $cursor
      ) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          number
          title
          url
          author {
            __typename
            login
          }
          updatedAt
          createdAt
          mergedAt
          mergedBy {
            __typename
            login
          }
          reviews(first: 100) {
            nodes {
              id
              author {
                __typename
                login
              }
              state
              submittedAt
              url
            }
          }
        }
      }
    }
  }
`;

// =============================================================================
// Pull Request Fetching
// =============================================================================

/**
 * Fetches all pull requests and their reviews from a repository.
 *
 * @description
 * Uses GitHub's GraphQL API to efficiently fetch pull requests along with
 * their reviews in a single query. The function handles pagination and
 * stops when it reaches PRs older than the specified date.
 *
 * Bot users are automatically detected and tracked for later role updates.
 *
 * @param repo - The repository name (without owner)
 * @param since - Optional ISO 8601 date string to filter by last update
 * @returns Promise resolving to array of PullRequest objects with reviews
 *
 * @example
 * ```typescript
 * const since = subDays(new Date(), 7).toISOString();
 * const prs = await getPullRequestsAndReviews("my-repo", since);
 *
 * for (const pr of prs) {
 *   console.log(`PR #${pr.number}: ${pr.title}`);
 *   console.log(`  Reviews: ${pr.reviews.length}`);
 * }
 * ```
 */
export async function getPullRequestsAndReviews(
  repo: string,
  since?: string
): Promise<PullRequest[]> {
  const octokit = getOctokit();
  const org = getGitHubOrg();
  const pullRequests: PullRequest[] = [];

  let hasNextPage = true;
  let cursor: string | null = null;

  console.log(`Fetching pull requests from ${repo}...`);

  while (hasNextPage) {
    const response: PullRequestsGraphQLResponse = await octokit.graphql(
      PULL_REQUESTS_QUERY,
      { owner: org, repo, cursor }
    );

    const prs = response.repository.pullRequests.nodes;
    console.log(`Found ${prs.length} pull requests`);

    for (const pr of prs) {
      // Stop if PR is older than since parameter
      if (since && pr.updatedAt && new Date(pr.updatedAt) < new Date(since)) {
        return pullRequests;
      }

      if (!pr.updatedAt) continue;

      // Track bot users
      if (pr.author?.login && isBot(pr.author)) {
        trackBotUser(pr.author.login);
      }
      if (pr.mergedBy?.login && isBot(pr.mergedBy)) {
        trackBotUser(pr.mergedBy.login);
      }
      for (const review of pr.reviews.nodes) {
        if (review.author?.login && isBot(review.author)) {
          trackBotUser(review.author.login);
        }
      }

      pullRequests.push({
        number: pr.number,
        title: pr.title,
        url: pr.url,
        author: getLogin(pr.author),
        updated_at: pr.updatedAt,
        created_at: pr.createdAt,
        merged_at: pr.mergedAt,
        merged_by: getLogin(pr.mergedBy),
        reviews: pr.reviews.nodes.map((review) => ({
          id: review.id,
          author: getLogin(review.author),
          state: review.state,
          submitted_at: review.submittedAt,
          html_url: review.url,
        })),
      });
    }

    hasNextPage = response.repository.pullRequests.pageInfo.hasNextPage;
    cursor = response.repository.pullRequests.pageInfo.endCursor;
  }

  return pullRequests;
}
