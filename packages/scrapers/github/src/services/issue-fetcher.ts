/**
 * @fileoverview Issue fetching service using GraphQL
 * @module @leaderboard/scraper-github/services/issue-fetcher
 *
 * This module provides functionality to fetch issues with their timeline
 * events (assignments and closures) from a repository using GitHub's
 * GraphQL API.
 */

import { getOctokit, getGitHubOrg } from "../client";
import { trackBotUser } from "./bot-tracker";
import { isBot, getLogin } from "@leaderboard/scraper-core";
import type {
  Issue,
  IssuesGraphQLResponse,
  AssignedEvent,
  ClosedEvent,
} from "../types";

// =============================================================================
// GraphQL Query
// =============================================================================

/**
 * GraphQL query for fetching issues with timeline events.
 * @internal
 */
const ISSUES_QUERY = `
  query($owner: String!, $repo: String!, $cursor: String) {
    repository(owner: $owner, name: $repo) {
      issues(first: 50, orderBy: { field: UPDATED_AT, direction: DESC }, after: $cursor) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          number
          title
          url
          updatedAt
          author {
            __typename
            login
          }
          closed
          closedAt
          createdAt
          timelineItems(itemTypes: [ASSIGNED_EVENT, CLOSED_EVENT], first: 50) {
            nodes {
              ... on AssignedEvent {
                createdAt
                assignee {
                  __typename
                  ... on User { login }
                  ... on Bot { login }
                  ... on Mannequin { login }
                }
              }
              ... on ClosedEvent {
                createdAt
                actor {
                  __typename
                  login
                }
              }
            }
          }
        }
      }
    }
  }
`;

// =============================================================================
// Issue Fetching
// =============================================================================

/**
 * Fetches all issues with timeline events from a repository.
 *
 * @description
 * Uses GitHub's GraphQL API to fetch issues along with their assignment
 * and close events. This allows tracking of:
 * - Who opened the issue
 * - Who was assigned to the issue (and when)
 * - Who closed the issue (and when)
 *
 * Bot users are automatically detected and tracked for later role updates.
 *
 * @param repo - The repository name (without owner)
 * @param since - Optional ISO 8601 date string to filter by last update
 * @returns Promise resolving to array of Issue objects with events
 *
 * @example
 * ```typescript
 * const since = subDays(new Date(), 7).toISOString();
 * const issues = await getIssues("my-repo", since);
 *
 * for (const issue of issues) {
 *   console.log(`Issue #${issue.number}: ${issue.title}`);
 *   console.log(`  Opened by: ${issue.author}`);
 *   console.log(`  Assignments: ${issue.assign_events.length}`);
 * }
 * ```
 */
export async function getIssues(
  repo: string,
  since?: string
): Promise<Issue[]> {
  const octokit = getOctokit();
  const org = getGitHubOrg();
  const issues: Issue[] = [];

  let hasNextPage = true;
  let cursor: string | null = null;

  console.log(`Fetching issues from ${repo}...`);

  while (hasNextPage) {
    const response: IssuesGraphQLResponse = await octokit.graphql(
      ISSUES_QUERY,
      { owner: org, repo, cursor }
    );

    const allIssues = response.repository.issues.nodes;

    for (const issue of allIssues) {
      // Stop if issue is older than since parameter
      if (since && new Date(issue.updatedAt) < new Date(since)) {
        return issues;
      }

      // Track bot users
      if (issue.author?.login && isBot(issue.author)) {
        trackBotUser(issue.author.login);
      }

      for (const event of issue.timelineItems.nodes) {
        if ("assignee" in event && event.assignee?.login && isBot(event.assignee)) {
          trackBotUser(event.assignee.login);
        }
        if ("actor" in event && event.actor?.login && isBot(event.actor)) {
          trackBotUser(event.actor.login);
        }
      }

      const assignedEvents: AssignedEvent[] = [];
      let closedEvent: ClosedEvent | undefined;

      for (const event of issue.timelineItems.nodes) {
        if ("assignee" in event && event.createdAt !== undefined) {
          assignedEvents.push(event as AssignedEvent);
        }
        if (!("assignee" in event) && "actor" in event) {
          closedEvent = event as ClosedEvent;
        }
      }

      issues.push({
        number: issue.number,
        title: issue.title,
        url: issue.url,
        author: getLogin(issue.author),
        closed_at: issue.closedAt,
        closed: issue.closed,
        closed_by: closedEvent?.actor?.login ?? null,
        created_at: issue.createdAt,
        assign_events: assignedEvents.map((e) => ({
          createdAt: e.createdAt,
          assignee: e.assignee?.login ?? null,
        })),
      });
    }

    hasNextPage = response.repository.issues.pageInfo.hasNextPage;
    cursor = response.repository.issues.pageInfo.endCursor;
  }

  return issues;
}
