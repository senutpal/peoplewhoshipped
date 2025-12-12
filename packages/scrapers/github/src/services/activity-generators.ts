/**
 * @fileoverview Activity generation from GitHub data
 * @module @leaderboard/scraper-github/services/activity-generators
 *
 * This module provides functions to convert GitHub data (issues, pull requests,
 * comments, commits) into Activity records for the leaderboard system.
 */

import { GitHubActivityDefinition } from "@leaderboard/scraper-core";
import type { Activity } from "@leaderboard/database";
import type { Issue, PullRequest, Comment, Commit } from "../types";

// =============================================================================
// Issue Activity Generators
// =============================================================================

/**
 * Generates Activity records from GitHub issues.
 *
 * @description
 * Creates activities for the following issue events:
 * - **Issue Opened**: When a user opens a new issue
 * - **Issue Assigned**: When a user is assigned to an issue (latest assignment only)
 * - **Issue Closed**: When a user closes an issue
 *
 * For assignment events, only the latest assignment per issue/user combination
 * is tracked to avoid duplicate activities.
 *
 * @param issues - Array of Issue objects to process
 * @param repo - Repository name (used in activity slugs)
 * @returns Array of Activity objects
 *
 * @example
 * ```typescript
 * const issues = await getIssues("my-repo", since);
 * const activities = activitiesFromIssues(issues, "my-repo");
 *
 * console.log(`Generated ${activities.length} issue activities`);
 * ```
 */
export function activitiesFromIssues(issues: Issue[], repo: string): Activity[] {
  const activities: Activity[] = [];
  const latestIssueAssignEvents: Record<string, Omit<Activity, "slug">> = {};

  for (const issue of issues) {
    if (!issue.author) continue;

    // Issue opened
    activities.push({
      slug: `${GitHubActivityDefinition.ISSUE_OPENED}_${repo}#${issue.number}`,
      contributor: issue.author,
      activity_definition: GitHubActivityDefinition.ISSUE_OPENED,
      title: `Opened issue #${issue.number}`,
      text: issue.title,
      occured_at: new Date(issue.created_at),
      link: issue.url,
      points: null,
      meta: {},
    });

    // Issue assign events
    for (const assignEvent of issue.assign_events) {
      if (!assignEvent.assignee) continue;

      const slug = `${GitHubActivityDefinition.ISSUE_ASSIGNED}_${repo}#${issue.number}_${assignEvent.assignee}`;

      // Keep only the latest assign event for each issue
      if (
        latestIssueAssignEvents[slug] &&
        latestIssueAssignEvents[slug].occured_at > new Date(assignEvent.createdAt)
      ) {
        continue;
      }

      latestIssueAssignEvents[slug] = {
        contributor: assignEvent.assignee,
        activity_definition: GitHubActivityDefinition.ISSUE_ASSIGNED,
        title: `Issue #${issue.number} assigned`,
        text: issue.title,
        occured_at: new Date(assignEvent.createdAt),
        link: issue.url,
        points: null,
        meta: {},
      };
    }

    // Issue closed
    if (issue.closed && issue.closed_at && issue.closed_by) {
      activities.push({
        slug: `${GitHubActivityDefinition.ISSUE_CLOSED}_${repo}#${issue.number}`,
        contributor: issue.closed_by,
        activity_definition: GitHubActivityDefinition.ISSUE_CLOSED,
        title: `Closed issue #${issue.number}`,
        text: issue.title,
        occured_at: new Date(issue.closed_at),
        link: issue.url,
        points: null,
        meta: {},
      });
    }
  }

  // Append the latest assign events
  for (const [slug, activity] of Object.entries(latestIssueAssignEvents)) {
    activities.push({ slug, ...activity });
  }

  return activities;
}

// =============================================================================
// Comment Activity Generators
// =============================================================================

/**
 * Generates Activity records from GitHub comments.
 *
 * @description
 * Creates activities for comments on issues and pull requests.
 * Each comment generates a single activity for the commenter.
 *
 * @param comments - Array of Comment objects to process
 * @param repo - Repository name (used in activity slugs)
 * @returns Array of Activity objects
 *
 * @example
 * ```typescript
 * const comments = await getComments("my-repo", since);
 * const activities = activitiesFromComments(comments, "my-repo");
 *
 * console.log(`Generated ${activities.length} comment activities`);
 * ```
 */
export function activitiesFromComments(comments: Comment[], repo: string): Activity[] {
  const activities: Activity[] = [];

  for (const comment of comments) {
    if (!comment.author) continue;

    activities.push({
      slug: `${GitHubActivityDefinition.COMMENT_CREATED}_${repo}#${comment.issue_number}_${comment.id}`,
      contributor: comment.author,
      activity_definition: GitHubActivityDefinition.COMMENT_CREATED,
      title: `Commented on #${comment.issue_number}`,
      text: null,
      occured_at: new Date(comment.created_at),
      link: comment.html_url,
      points: null,
      meta: {},
    });
  }

  return activities;
}

// =============================================================================
// Pull Request Activity Generators
// =============================================================================

/**
 * Title mapping for PR review states.
 * @internal
 */
const PR_REVIEW_TITLE_MAP: Record<string, string> = {
  COMMENTED: "Reviewed PR",
  APPROVED: "Approved PR",
  CHANGES_REQUESTED: "Changes requested on PR",
};

/**
 * Generates Activity records from GitHub pull requests.
 *
 * @description
 * Creates activities for the following PR events:
 * - **PR Opened**: When a user opens a new pull request
 * - **PR Merged**: When a pull request is merged (credited to PR author)
 * - **PR Reviewed**: When a user reviews a PR (COMMENTED, APPROVED, CHANGES_REQUESTED)
 *
 * Review activities are only created for actionable review states.
 * DISMISSED and PENDING reviews are ignored.
 *
 * @param pullRequests - Array of PullRequest objects to process
 * @param repo - Repository name (used in activity slugs)
 * @returns Array of Activity objects
 *
 * @example
 * ```typescript
 * const prs = await getPullRequestsAndReviews("my-repo", since);
 * const activities = activitiesFromPullRequests(prs, "my-repo");
 *
 * console.log(`Generated ${activities.length} PR activities`);
 * ```
 */
export function activitiesFromPullRequests(
  pullRequests: PullRequest[],
  repo: string
): Activity[] {
  const activities: Activity[] = [];

  for (const pr of pullRequests) {
    if (!pr.author) continue;

    // PR opened
    activities.push({
      slug: `${GitHubActivityDefinition.PR_OPENED}_${repo}#${pr.number}`,
      contributor: pr.author,
      activity_definition: GitHubActivityDefinition.PR_OPENED,
      title: `Opened pull request #${pr.number}`,
      text: pr.title,
      occured_at: new Date(pr.created_at),
      link: pr.url,
      points: null,
      meta: {},
    });

    // PR merged
    if (pr.merged_at && pr.merged_by) {
      activities.push({
        slug: `${GitHubActivityDefinition.PR_MERGED}_${repo}#${pr.number}`,
        contributor: pr.author,
        activity_definition: GitHubActivityDefinition.PR_MERGED,
        title: `Merged pull request #${pr.number}`,
        text: pr.title,
        occured_at: new Date(pr.merged_at),
        link: pr.url,
        points: null,
        meta: {},
      });
    }

    // PR review events
    for (const review of pr.reviews) {
      if (!review.author) continue;

      const titlePrefix = PR_REVIEW_TITLE_MAP[review.state];
      if (!titlePrefix) continue; // Skip DISMISSED, PENDING, etc.

      activities.push({
        slug: `${GitHubActivityDefinition.PR_REVIEWED}_${repo}#${pr.number}_${review.state}_${review.id}`,
        contributor: review.author,
        activity_definition: GitHubActivityDefinition.PR_REVIEWED,
        title: `${titlePrefix} #${pr.number}`,
        text: pr.title,
        occured_at: new Date(review.submitted_at!),
        link: review.html_url,
        points: null,
        meta: {},
      });
    }
  }

  return activities;
}

// =============================================================================
// Commit Activity Generators
// =============================================================================

/**
 * Generates Activity records from GitHub commits.
 *
 * @description
 * Creates activities for commits pushed to the repository.
 * Each commit generates a single activity for the commit author.
 *
 * @param commits - Array of Commit objects to process
 * @returns Array of Activity objects
 *
 * @example
 * ```typescript
 * const commits = await getCommitsFromPushEvents("my-repo", since);
 * const activities = activitiesFromCommits(commits);
 *
 * console.log(`Generated ${activities.length} commit activities`);
 * ```
 */
export function activitiesFromCommits(commits: Commit[]): Activity[] {
  const activities: Activity[] = [];

  for (const commit of commits) {
    if (!commit.author || !commit.committedDate) continue;

    activities.push({
      slug: `${GitHubActivityDefinition.COMMIT_CREATED}_${commit.branchName}_${commit.commitId}`,
      contributor: commit.author,
      activity_definition: GitHubActivityDefinition.COMMIT_CREATED,
      title: `Pushed commit to ${commit.branchName}`,
      text: commit.commitMessage,
      occured_at: new Date(commit.committedDate),
      link: commit.url,
      points: null,
      meta: {},
    });
  }

  return activities;
}
