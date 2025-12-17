/**
 * @leaderboard/scraper-core - Activity Definitions
 *
 * @packageDocumentation
 *
 * This module contains all activity definition enums and their associated
 * metadata configurations. These definitions are used across all scrapers
 * to standardize activity types and their scoring.
 *
 * @module @leaderboard/scraper-core/definitions
 */

import type { ActivityDefinitionConfig } from "../types";

// =============================================================================
// GitHub Activity Definitions
// =============================================================================

/**
 * GitHub activity type identifiers.
 *
 * These enum values are used as activity type slugs when creating
 * activity records from GitHub data.
 *
 * @example
 * ```typescript
 * const activity = {
 *   type: GitHubActivityDefinition.PR_MERGED,
 *   // ...
 * };
 * ```
 */
export enum GitHubActivityDefinition {
  /**
   * User opened a new issue.
   * Awarded when a contributor creates a new issue in a repository.
   */
  ISSUE_OPENED = "issue_opened",

  /**
   * Issue was closed.
   * Awarded when an issue is marked as closed (by any means).
   */
  ISSUE_CLOSED = "issue_closed",

  /**
   * User was assigned to an issue.
   * Awarded when a contributor is assigned to handle an issue.
   */
  ISSUE_ASSIGNED = "issue_assigned",

  /**
   * User labeled/triaged an issue.
   * Awarded when a contributor adds labels to an issue for triage.
   */
  ISSUE_LABELED = "issue_labeled",

  /**
   * User opened a pull request.
   * Awarded when a contributor creates a new pull request.
   */
  PR_OPENED = "pr_opened",

  /**
   * Pull request was closed without merging.
   * Tracked but typically not scored.
   */
  PR_CLOSED = "pr_closed",

  /**
   * Pull request was merged.
   * This is usually the highest-scoring activity as it represents
   * completed, accepted contributions.
   */
  PR_MERGED = "pr_merged",

  /**
   * User reviewed a pull request.
   * Awarded when a contributor submits a review on a PR.
   */
  PR_REVIEWED = "pr_reviewed",

  /**
   * User collaborated on a pull request.
   * Awarded to co-authors and significant contributors to a PR.
   */
  PR_COLLABORATED = "pr_collaborated",

  /**
   * User created a comment.
   * Awarded for comments on issues or pull requests.
   */
  COMMENT_CREATED = "comment_created",

  /**
   * User created a commit.
   * Awarded when commits are pushed to a repository.
   */
  COMMIT_CREATED = "commit_created",
}

// =============================================================================
// Slack Activity Definitions
// =============================================================================

/**
 * Slack activity type identifiers.
 *
 * These enum values are used as activity type slugs when creating
 * activity records from Slack data.
 *
 * @example
 * ```typescript
 * const activity = {
 *   type: SlackActivityDefinition.EOD_UPDATE,
 *   // ...
 * };
 * ```
 */
export enum SlackActivityDefinition {
  /**
   * End-of-day update posted in Slack.
   * Awarded when a contributor posts their daily update message.
   */
  EOD_UPDATE = "eod_update",
}

// =============================================================================
// Combined Activity Definitions
// =============================================================================

/**
 * All activity definitions combined for convenience.
 *
 * This object spreads both GitHub and Slack activity definitions
 * into a single namespace for cases where you need to reference
 * any activity type without knowing the source.
 *
 * @example
 * ```typescript
 * // Check if this is a PR-related activity
 * if (type === AllActivityDefinitions.PR_MERGED) {
 *   // Handle merged PR
 * }
 * ```
 */
export const AllActivityDefinitions = {
  ...GitHubActivityDefinition,
  ...SlackActivityDefinition,
} as const;

// =============================================================================
// Activity Definition Metadata
// =============================================================================

/**
 * GitHub activity definition configurations with points and icons.
 *
 * Each configuration defines:
 * - `slug`: Unique identifier matching the enum value
 * - `name`: Human-readable display name
 * - `description`: Detailed description of the activity
 * - `points`: Score value for leaderboard calculations
 * - `icon`: Lucide icon name for UI display (null if none)
 *
 * @example
 * ```typescript
 * // Find the configuration for PR merged activities
 * const prMergedConfig = GITHUB_ACTIVITY_DEFINITIONS.find(
 *   d => d.slug === GitHubActivityDefinition.PR_MERGED
 * );
 * console.log(prMergedConfig?.points); // 7
 * ```
 */
export const GITHUB_ACTIVITY_DEFINITIONS: ActivityDefinitionConfig[] = [
  {
    slug: GitHubActivityDefinition.COMMENT_CREATED,
    name: "Commented",
    description: "Commented on an Issue/PR",
    points: 0,
    icon: "message-circle",
  },
  {
    slug: GitHubActivityDefinition.ISSUE_ASSIGNED,
    name: "Issue Assigned",
    description: "Got an issue assigned",
    points: 1,
    icon: "user-round-check",
  },
  {
    slug: GitHubActivityDefinition.PR_REVIEWED,
    name: "PR Reviewed",
    description: "Reviewed a Pull Request",
    points: 10,
    icon: "eye",
  },
  {
    slug: GitHubActivityDefinition.ISSUE_OPENED,
    name: "Issue Opened",
    description: "Raised an Issue",
    points: 2,
    icon: "circle-dot",
  },
  {
    slug: GitHubActivityDefinition.PR_OPENED,
    name: "PR Opened",
    description: "Opened a Pull Request",
    points: 5,
    icon: "git-pull-request-create-arrow",
  },
  {
    slug: GitHubActivityDefinition.PR_MERGED,
    name: "PR Merged",
    description: "Merged a Pull Request",
    points: 7,
    icon: "git-merge",
  },
  {
    slug: GitHubActivityDefinition.PR_COLLABORATED,
    name: "PR Collaborated",
    description: "Collaborated on a Pull Request",
    points: 2,
    icon: null,
  },
  {
    slug: GitHubActivityDefinition.ISSUE_CLOSED,
    name: "Issue Closed",
    description: "Closed an Issue",
    points: 0,
    icon: null,
  },
  {
    slug: GitHubActivityDefinition.ISSUE_LABELED,
    name: "Issue Labeled",
    description: "Labeled/triaged an Issue",
    points: 2,
    icon: "tag",
  },
  {
    slug: GitHubActivityDefinition.COMMIT_CREATED,
    name: "Commit Created",
    description: "Pushed a commit",
    points: 0,
    icon: "git-commit-horizontal",
  },
];

/**
 * Slack activity definition configurations with points and icons.
 *
 * Each configuration defines:
 * - `slug`: Unique identifier matching the enum value
 * - `name`: Human-readable display name
 * - `description`: Detailed description of the activity
 * - `points`: Score value for leaderboard calculations
 * - `icon`: Lucide icon name for UI display
 *
 * @example
 * ```typescript
 * // Get points for EOD updates
 * const eodConfig = SLACK_ACTIVITY_DEFINITIONS.find(
 *   d => d.slug === SlackActivityDefinition.EOD_UPDATE
 * );
 * console.log(eodConfig?.points); // 2
 * ```
 */
export const SLACK_ACTIVITY_DEFINITIONS: ActivityDefinitionConfig[] = [
  {
    slug: SlackActivityDefinition.EOD_UPDATE,
    name: "EOD Update",
    description: "Dropped an EOD Update",
    points: 2,
    icon: "message-square",
  },
];

/**
 * All activity definitions combined (GitHub + Slack).
 *
 * Useful for displaying all possible activity types in the UI
 * or for looking up activity metadata without knowing the source.
 */
export const ALL_ACTIVITY_DEFINITIONS: ActivityDefinitionConfig[] = [
  ...GITHUB_ACTIVITY_DEFINITIONS,
  ...SLACK_ACTIVITY_DEFINITIONS,
];
