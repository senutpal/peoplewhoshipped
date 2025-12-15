/**
 * Shared test fixtures and factory functions.
 *
 * @module test/fixtures
 *
 * This module provides reusable test data and factory functions for
 * generating test fixtures. Use these instead of creating ad-hoc test
 * data to ensure consistency across tests.
 *
 * @example
 * ```typescript
 * import {
 *   createMockContributor,
 *   createMockActivity,
 *   MOCK_CONTRIBUTORS
 * } from "../../../test/fixtures";
 *
 * const contributor = createMockContributor({ username: "alice" });
 * const activity = createMockActivity({
 *   contributor: "alice",
 *   activity_definition: "github-pr-merged"
 * });
 * ```
 */

// =============================================================================
// Type Imports
// =============================================================================

import type { Activity, Contributor } from "@leaderboard/database";

// =============================================================================
// Mock Contributors
// =============================================================================

/**
 * Default mock contributors for testing.
 */
export const MOCK_CONTRIBUTORS: Contributor[] = [
  {
    username: "alice",
    avatar: "https://avatars.githubusercontent.com/u/1",
    slack_user_id: "U12345678",
    is_bot: false,
  },
  {
    username: "bob",
    avatar: "https://avatars.githubusercontent.com/u/2",
    slack_user_id: "U87654321",
    is_bot: false,
  },
  {
    username: "charlie",
    avatar: "https://avatars.githubusercontent.com/u/3",
    slack_user_id: "U11111111",
    is_bot: false,
  },
  {
    username: "ci-bot",
    avatar: null,
    slack_user_id: null,
    is_bot: true,
  },
];

/**
 * Factory function to create a mock contributor.
 *
 * @param {Partial<Contributor>} overrides - Properties to override
 * @returns {Contributor} Mock contributor
 *
 * @example
 * const contributor = createMockContributor({ username: "newuser" });
 */
export function createMockContributor(
  overrides: Partial<Contributor> = {}
): Contributor {
  return {
    username: "testuser",
    avatar: "https://avatars.githubusercontent.com/u/12345",
    slack_user_id: "U12345678",
    is_bot: false,
    ...overrides,
  };
}

// =============================================================================
// Mock Activities
// =============================================================================

/**
 * Activity definition identifiers used in tests.
 */
export const ACTIVITY_DEFINITIONS = {
  PR_OPENED: "github-pr-opened",
  PR_MERGED: "github-pr-merged",
  PR_REVIEWED: "github-pr-reviewed",
  ISSUE_OPENED: "github-issue-opened",
  ISSUE_CLOSED: "github-issue-closed",
  COMMIT: "github-commit",
  EOD_UPDATE: "slack-eod-update",
} as const;

/**
 * Default mock activities for testing.
 */
export const MOCK_ACTIVITIES: Activity[] = [
  {
    slug: "github-pr-merged-123",
    contributor: "alice",
    activity_definition: ACTIVITY_DEFINITIONS.PR_MERGED,
    title: "feat: Add leaderboard component",
    occured_at: new Date("2024-01-15T12:00:00Z"),
    link: "https://github.com/org/repo/pull/123",
    text: null,
    points: 15,
    meta: JSON.stringify({ pr_number: 123 }),
  },
  {
    slug: "github-pr-reviewed-123-bob",
    contributor: "bob",
    activity_definition: ACTIVITY_DEFINITIONS.PR_REVIEWED,
    title: "Reviewed: feat: Add leaderboard component",
    occured_at: new Date("2024-01-15T11:30:00Z"),
    link: "https://github.com/org/repo/pull/123#pullrequestreview-456",
    text: null,
    points: 5,
    meta: null,
  },
  {
    slug: "slack-eod-update-charlie-20240115",
    contributor: "charlie",
    activity_definition: ACTIVITY_DEFINITIONS.EOD_UPDATE,
    title: "EOD Update",
    occured_at: new Date("2024-01-15T17:00:00Z"),
    link: "https://slack.com/archives/C123/p1705334400",
    text: "Completed dashboard feature, fixed tests",
    points: 3,
    meta: null,
  },
];

/**
 * Factory function to create a mock activity.
 *
 * @param {Partial<Activity>} overrides - Properties to override
 * @returns {Activity} Mock activity
 *
 * @example
 * const activity = createMockActivity({
 *   contributor: "alice",
 *   activity_definition: "github-pr-merged",
 *   points: 20
 * });
 */
export function createMockActivity(overrides: Partial<Activity> = {}): Activity {
  const now = new Date();
  const slug =
    overrides.slug ||
    `test-activity-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  return {
    slug,
    contributor: "testuser",
    activity_definition: ACTIVITY_DEFINITIONS.PR_OPENED,
    title: "Test Activity",
    occured_at: now,
    link: `https://github.com/org/repo/pull/${Math.floor(Math.random() * 1000)}`,
    text: null,
    points: 10,
    meta: null,
    ...overrides,
  };
}

/**
 * Generate multiple mock activities for batch testing.
 *
 * @param {number} count - Number of activities to generate
 * @param {Partial<Activity>} template - Base properties for all activities
 * @returns {Activity[]} Array of mock activities
 *
 * @example
 * const activities = createMockActivities(50, { contributor: "alice" });
 */
export function createMockActivities(
  count: number,
  template: Partial<Activity> = {}
): Activity[] {
  return Array.from({ length: count }, (_, i) =>
    createMockActivity({
      slug: `batch-activity-${i}-${Date.now()}`,
      title: `Test Activity ${i + 1}`,
      occured_at: new Date(Date.now() - i * 3600000), // Each hour apart
      ...template,
    })
  );
}

// =============================================================================
// Mock Activity Definitions
// =============================================================================

/**
 * Mock activity definitions for database seeding.
 */
export const MOCK_ACTIVITY_DEFINITIONS = [
  {
    slug: ACTIVITY_DEFINITIONS.PR_OPENED,
    name: "Pull Request Opened",
    platform: "github",
    points: 10,
    description: "Opened a new pull request",
    icon: "git-pull-request",
  },
  {
    slug: ACTIVITY_DEFINITIONS.PR_MERGED,
    name: "Pull Request Merged",
    platform: "github",
    points: 15,
    description: "Had a pull request merged",
    icon: "git-merge",
  },
  {
    slug: ACTIVITY_DEFINITIONS.PR_REVIEWED,
    name: "Pull Request Reviewed",
    platform: "github",
    points: 5,
    description: "Reviewed a pull request",
    icon: "eye",
  },
  {
    slug: ACTIVITY_DEFINITIONS.ISSUE_OPENED,
    name: "Issue Opened",
    platform: "github",
    points: 5,
    description: "Opened a new issue",
    icon: "issue-opened",
  },
  {
    slug: ACTIVITY_DEFINITIONS.ISSUE_CLOSED,
    name: "Issue Closed",
    platform: "github",
    points: 8,
    description: "Closed an issue",
    icon: "issue-closed",
  },
  {
    slug: ACTIVITY_DEFINITIONS.COMMIT,
    name: "Commit",
    platform: "github",
    points: 2,
    description: "Made a commit",
    icon: "git-commit",
  },
  {
    slug: ACTIVITY_DEFINITIONS.EOD_UPDATE,
    name: "EOD Update",
    platform: "slack",
    points: 3,
    description: "Posted an end-of-day update",
    icon: "message-square",
  },
];

// =============================================================================
// Date Fixtures
// =============================================================================

/**
 * Fixed dates for consistent testing.
 * Using fixed dates avoids flaky tests caused by time-dependent logic.
 */
export const FIXED_DATES = {
  /** January 15, 2024 at noon UTC */
  NOW: new Date("2024-01-15T12:00:00Z"),

  /** Start of January 2024 */
  MONTH_START: new Date("2024-01-01T00:00:00Z"),

  /** End of January 2024 */
  MONTH_END: new Date("2024-01-31T23:59:59Z"),

  /** One week ago from NOW */
  WEEK_AGO: new Date("2024-01-08T12:00:00Z"),

  /** One month ago from NOW */
  MONTH_AGO: new Date("2023-12-15T12:00:00Z"),
};

// =============================================================================
// Configuration Fixtures
// =============================================================================

/**
 * Valid YAML configuration for testing config loader.
 */
export const MOCK_YAML_CONFIG = `
org:
  name: "Test Organization"
  slug: "test-org"

meta:
  title: "Team Leaderboard"
  description: "Track team contributions"

roles:
  - slug: "developer"
    name: "Developer"
    visible: true
  - slug: "bot"
    name: "Bot"
    visible: false

scrapers:
  github:
    enabled: true
    org: "test-org"
  slack:
    enabled: true
    channel: "C12345678"

leaderboard:
  pointsPerPr: 15
  pointsPerReview: 5
  pointsPerIssue: 5
`;

/**
 * Invalid YAML configuration for error testing.
 */
export const INVALID_YAML_CONFIG = `
org:
  name: [invalid yaml structure
  slug: missing quotes
`;
