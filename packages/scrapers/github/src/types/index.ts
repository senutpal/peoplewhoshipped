/**
 * @fileoverview Type definitions for the GitHub scraper package
 * @module @leaderboard/scraper-github/types
 *
 * This module contains all TypeScript interfaces and type definitions
 * used throughout the GitHub scraper package for type safety and documentation.
 */

// =============================================================================
// Re-exports from @leaderboard/database
// =============================================================================

/**
 * Re-export core types from database package for convenience.
 * Consumers can import these directly from the GitHub scraper package.
 */
export type { Activity } from "@leaderboard/database";

// =============================================================================
// Repository Types
// =============================================================================

/**
 * Represents a GitHub repository with essential metadata.
 *
 * @remarks
 * This interface models the repository data needed for scraping activities.
 * It contains only the fields required for processing, not the full GitHub
 * repository response.
 *
 * @example
 * ```typescript
 * const repo: Repository = {
 *   name: "my-project",
 *   url: "https://github.com/org/my-project",
 *   defaultBranch: "main"
 * };
 * ```
 */
export interface Repository {
  /**
   * The repository name (without owner).
   * @example "my-project"
   */
  name: string;

  /**
   * Full URL to the repository on GitHub.
   * @example "https://github.com/org/my-project"
   */
  url: string;

  /**
   * The default branch name for the repository.
   * @example "main" or "master"
   */
  defaultBranch: string;
}

// =============================================================================
// Pull Request Types
// =============================================================================

/**
 * Represents a review on a pull request.
 *
 * @remarks
 * Reviews can have different states: APPROVED, CHANGES_REQUESTED, COMMENTED, etc.
 * Only reviews with APPROVED, CHANGES_REQUESTED, or COMMENTED states generate activities.
 */
export interface PullRequestReview {
  /**
   * Unique identifier for the review (GraphQL node ID).
   */
  id: string;

  /**
   * GitHub username of the reviewer.
   * May be null for deleted users.
   */
  author: string | null;

  /**
   * Review state: APPROVED, CHANGES_REQUESTED, COMMENTED, DISMISSED, PENDING.
   */
  state: string;

  /**
   * ISO 8601 timestamp when the review was submitted.
   */
  submitted_at: string | null;

  /**
   * URL to the review on GitHub.
   */
  html_url: string | null;
}

/**
 * Represents a pull request with its reviews.
 *
 * @remarks
 * This interface contains all the data needed to generate PR-related activities:
 * opened, merged, and reviewed.
 *
 * @example
 * ```typescript
 * const pr: PullRequest = {
 *   number: 42,
 *   title: "Add new feature",
 *   url: "https://github.com/org/repo/pull/42",
 *   author: "developer",
 *   updated_at: "2024-01-15T10:00:00Z",
 *   created_at: "2024-01-10T09:00:00Z",
 *   merged_at: "2024-01-15T11:00:00Z",
 *   merged_by: "maintainer",
 *   reviews: []
 * };
 * ```
 */
export interface PullRequest {
  /**
   * Pull request number (unique within repo).
   */
  number: number;

  /**
   * Pull request title.
   */
  title: string;

  /**
   * URL to the pull request on GitHub.
   */
  url: string;

  /**
   * GitHub username of the PR author.
   * May be null for deleted users.
   */
  author: string | null;

  /**
   * ISO 8601 timestamp of last update.
   */
  updated_at: string;

  /**
   * ISO 8601 timestamp when PR was created.
   */
  created_at: string;

  /**
   * ISO 8601 timestamp when PR was merged, or null if not merged.
   */
  merged_at: string | null;

  /**
   * GitHub username of the user who merged the PR.
   * Null if not merged or user deleted.
   */
  merged_by: string | null;

  /**
   * Array of reviews on this pull request.
   */
  reviews: PullRequestReview[];
}

// =============================================================================
// Issue Types
// =============================================================================

/**
 * Represents an assignment event on an issue.
 *
 * @remarks
 * Tracked to credit users when they are assigned to issues.
 */
export interface IssueAssignEvent {
  /**
   * ISO 8601 timestamp when the assignment occurred.
   */
  createdAt: string;

  /**
   * GitHub username of the assigned user.
   * May be null for deleted users.
   */
  assignee: string | null;
}

/**
 * Represents a GitHub issue with timeline events.
 *
 * @remarks
 * This interface contains issue data along with assignment and close events
 * needed to generate issue-related activities.
 *
 * @example
 * ```typescript
 * const issue: Issue = {
 *   number: 123,
 *   title: "Bug: Login fails",
 *   url: "https://github.com/org/repo/issues/123",
 *   author: "reporter",
 *   closed_at: null,
 *   closed: false,
 *   closed_by: null,
 *   created_at: "2024-01-10T09:00:00Z",
 *   assign_events: []
 * };
 * ```
 */
export interface Issue {
  /**
   * Issue number (unique within repo).
   */
  number: number;

  /**
   * Issue title.
   */
  title: string;

  /**
   * URL to the issue on GitHub.
   */
  url: string;

  /**
   * GitHub username of the issue author.
   * May be null for deleted users.
   */
  author: string | null;

  /**
   * ISO 8601 timestamp when issue was closed, or null if open.
   */
  closed_at: string | null;

  /**
   * Whether the issue is currently closed.
   */
  closed: boolean;

  /**
   * GitHub username of the user who closed the issue.
   * Null if open or closer unknown.
   */
  closed_by: string | null;

  /**
   * ISO 8601 timestamp when issue was created.
   */
  created_at: string;

  /**
   * Array of assignment events on this issue.
   */
  assign_events: IssueAssignEvent[];
}

// =============================================================================
// Comment Types
// =============================================================================

/**
 * Represents a comment on an issue or pull request.
 *
 * @example
 * ```typescript
 * const comment: Comment = {
 *   id: "IC_abc123",
 *   issue_number: "42",
 *   body: "Great work on this!",
 *   created_at: "2024-01-15T10:30:00Z",
 *   author: "reviewer",
 *   html_url: "https://github.com/org/repo/issues/42#issuecomment-123"
 * };
 * ```
 */
export interface Comment {
  /**
   * Unique identifier for the comment (node ID).
   */
  id: string;

  /**
   * Issue or PR number this comment belongs to.
   */
  issue_number: string | undefined;

  /**
   * Comment body in markdown format.
   */
  body: string | null | undefined;

  /**
   * ISO 8601 timestamp when comment was created.
   */
  created_at: string;

  /**
   * GitHub username of the comment author.
   */
  author: string | null | undefined;

  /**
   * URL to the comment on GitHub.
   */
  html_url: string;
}

// =============================================================================
// Commit Types
// =============================================================================

/**
 * Represents a commit from a push event.
 *
 * @remarks
 * Commits are extracted from push events using the compare API
 * to get full commit details including author information.
 *
 * @example
 * ```typescript
 * const commit: Commit = {
 *   commitId: "abc123def456",
 *   branchName: "feature/new-auth",
 *   commitMessage: "Add OAuth2 support",
 *   committedDate: "2024-01-15T14:30:00Z",
 *   author: "developer",
 *   url: "https://github.com/org/repo/commit/abc123def456"
 * };
 * ```
 */
export interface Commit {
  /**
   * Full commit SHA hash.
   */
  commitId: string;

  /**
   * Branch name the commit was pushed to.
   */
  branchName: string;

  /**
   * First line of the commit message.
   */
  commitMessage: string;

  /**
   * ISO 8601 timestamp when commit was made.
   * May be null if not available from API.
   */
  committedDate: string | null;

  /**
   * GitHub username of the commit author.
   * May be null if author not linked to GitHub account.
   */
  author: string | null;

  /**
   * URL to the commit on GitHub.
   */
  url: string;
}

// =============================================================================
// GraphQL Types - User
// =============================================================================

/**
 * Represents a GitHub user in GraphQL responses.
 *
 * @remarks
 * The __typename field indicates the user type: User, Bot, Organization, Mannequin.
 * This is used for bot detection.
 */
export interface GitHubUser {
  /**
   * GitHub username/login.
   */
  login: string | null;

  /**
   * GraphQL type discriminator: User, Bot, Organization, Mannequin.
   */
  __typename?: string;
}

// =============================================================================
// GraphQL Types - Pull Request
// =============================================================================

/**
 * Pull request review node from GraphQL response.
 * @internal
 */
export interface PullRequestReviewNode {
  author: GitHubUser | null;
  id: string;
  state: string;
  submittedAt: string | null;
  url: string | null;
}

/**
 * Pull request node from GraphQL response.
 * @internal
 */
export interface PullRequestNode {
  number: number;
  title: string;
  url: string;
  author: GitHubUser | null;
  updatedAt: string;
  createdAt: string;
  mergedAt: string | null;
  mergedBy: GitHubUser | null;
  reviews: {
    nodes: PullRequestReviewNode[];
  };
}

/**
 * GraphQL response for pull requests query.
 * @internal
 */
export interface PullRequestsGraphQLResponse {
  repository: {
    pullRequests: {
      nodes: PullRequestNode[];
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string | null;
      };
    };
  };
}

// =============================================================================
// GraphQL Types - Issue
// =============================================================================

/**
 * Timeline event for issues (assigned or closed).
 * @internal
 */
export interface IssueTimelineEvent {
  __typename?: "AssignedEvent" | "ClosedEvent";
  createdAt: string;
  actor?: GitHubUser;
  assignee?: GitHubUser;
}

/**
 * Assigned event from issue timeline.
 * @internal
 */
export interface AssignedEvent {
  __typename: "AssignedEvent";
  createdAt: string;
  assignee?: { login: string | null; __typename?: string };
}

/**
 * Closed event from issue timeline.
 * @internal
 */
export interface ClosedEvent {
  __typename: "ClosedEvent";
  createdAt: string;
  actor?: { login: string | null; __typename?: string };
}

/**
 * Union type for timeline events.
 */
export type TimelineEvent = AssignedEvent | ClosedEvent;

/**
 * Issue node from GraphQL response.
 * @internal
 */
export interface IssueNode {
  number: number;
  title: string;
  url: string;
  author: GitHubUser | null;
  updatedAt: string;
  closedAt: string | null;
  createdAt: string;
  closed: boolean;
  timelineItems: {
    nodes: IssueTimelineEvent[];
  };
}

/**
 * GraphQL response for issues query.
 * @internal
 */
export interface IssuesGraphQLResponse {
  repository: {
    issues: {
      nodes: IssueNode[];
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string | null;
      };
    };
  };
}
