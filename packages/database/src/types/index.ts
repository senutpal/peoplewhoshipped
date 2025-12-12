/**
 * @fileoverview Type definitions for the database package
 * @module @leaderboard/database/types
 *
 * This module contains all TypeScript interfaces and type definitions
 * used throughout the database package for type safety and documentation.
 */

// =============================================================================
// Core Activity Types
// =============================================================================

/**
 * Represents a single contribution event from any platform (GitHub, Slack, etc.).
 *
 * @remarks
 * Activities are the core data model for the leaderboard system. Each activity
 * represents a discrete contribution action that earns points for a contributor.
 * The `slug` field serves as a unique identifier and should be deterministically
 * generated based on the activity type and source data.
 *
 * @example
 * ```typescript
 * const activity: Activity = {
 *   slug: "github-pr-opened-1234",
 *   contributor: "johndoe",
 *   activity_definition: "github-pr-opened",
 *   title: "Add new feature",
 *   occured_at: new Date("2024-01-15"),
 *   link: "https://github.com/org/repo/pull/1234",
 *   text: null,
 *   points: 10,
 *   meta: { repository: "repo-name" }
 * };
 * ```
 */
export interface Activity {
  /**
   * Unique identifier for the activity.
   * Should be deterministically generated (e.g., "github-pr-opened-1234").
   */
  slug: string;

  /**
   * Username of the contributor who performed this activity.
   * Must match a `username` in the `contributor` table.
   */
  contributor: string;

  /**
   * The type of activity performed.
   * Must match a `slug` in the `activity_definition` table.
   *
   * @example "github-pr-opened", "slack-eod-update"
   */
  activity_definition: string;

  /**
   * Human-readable title for the activity.
   * For PRs/issues, this is typically the PR/issue title.
   */
  title: string | null;

  /**
   * When the activity occurred.
   * Used for chronological ordering and date-based grouping.
   */
  occured_at: Date;

  /**
   * URL link to the source of the activity.
   * For GitHub activities, this links to the PR/issue/commit.
   */
  link: string | null;

  /**
   * Text content associated with the activity.
   * For EOD updates, this contains the update text.
   * For commits, this might contain the commit message.
   */
  text: string | null;

  /**
   * Points awarded for this activity.
   * If null, points are derived from the activity_definition.
   */
  points: number | null;

  /**
   * Additional metadata stored as JSON.
   * Platform-specific data that doesn't fit other fields.
   *
   * @example { repository: "repo-name", labels: ["bug", "priority-high"] }
   */
  meta: Record<string, unknown> | null;
}

// =============================================================================
// Contributor Types
// =============================================================================

/**
 * Represents a user who makes contributions to the project.
 *
 * @remarks
 * Contributors are tracked across multiple platforms. The `username` is the
 * primary identifier, typically matching the GitHub username. Platform-specific
 * identifiers are stored in the `meta` field (e.g., Slack user ID).
 *
 * @example
 * ```typescript
 * const contributor: Contributor = {
 *   username: "johndoe",
 *   name: "John Doe",
 *   role: "contributor",
 *   avatar_url: "https://avatars.githubusercontent.com/johndoe",
 *   social_profiles: { github: "https://github.com/johndoe" },
 *   meta: { slack_user_id: "U12345678" }
 * };
 * ```
 */
export interface Contributor {
  /**
   * Unique identifier for the contributor.
   * Typically matches the GitHub username.
   */
  username: string;

  /**
   * Display name of the contributor.
   */
  name?: string;

  /**
   * Role of the contributor in the project.
   * Common values: "contributor", "maintainer", "bot"
   */
  role?: string;

  /**
   * Job title or position of the contributor.
   */
  title?: string;

  /**
   * URL to the contributor's avatar image.
   * Typically points to GitHub's avatar service.
   */
  avatar_url?: string;

  /**
   * Short biography or description of the contributor.
   */
  bio?: string;

  /**
   * Map of social platform names to profile URLs.
   *
   * @example { github: "https://github.com/johndoe", twitter: "https://twitter.com/johndoe" }
   */
  social_profiles?: Record<string, string>;

  /**
   * Date when the contributor joined the project.
   */
  joining_date?: Date;

  /**
   * Additional metadata for platform-specific identifiers.
   * Used to store Slack user ID and other cross-platform mappings.
   *
   * @example { slack_user_id: "U12345678" }
   */
  meta?: Record<string, unknown>;
}

/**
 * Result from contributor database queries.
 *
 * @remarks
 * This interface represents the raw query result when fetching
 * contributor data, particularly for Slack user ID lookups.
 */
export interface ContributorQueryResult {
  /**
   * The contributor's username.
   */
  username: string;

  /**
   * JSON string of the contributor's metadata.
   * Must be parsed to access nested properties.
   */
  meta: string;
}

// =============================================================================
// Slack EOD Types
// =============================================================================

/**
 * Represents a Slack End-of-Day (EOD) message stored in the queue table.
 *
 * @remarks
 * EOD messages are fetched from Slack and stored in a queue table before
 * being processed and converted to activities. This allows for batch
 * processing and ensures messages aren't lost if processing fails.
 *
 * @example
 * ```typescript
 * const message: SlackEodMessage = {
 *   id: 1702400000123456,
 *   user_id: "U12345678",
 *   timestamp: new Date("2024-01-15T18:00:00Z"),
 *   text: "Today I completed the API integration..."
 * };
 * ```
 */
export interface SlackEodMessage {
  /**
   * Unique identifier for the message.
   * Derived from the Slack message timestamp.
   */
  id: number;

  /**
   * Slack user ID of the message author.
   *
   * @example "U12345678"
   */
  user_id: string;

  /**
   * When the message was posted.
   */
  timestamp: Date;

  /**
   * The message content in Slack markdown format.
   */
  text: string;
}

// =============================================================================
// Activity Definition Types
// =============================================================================

/**
 * Defines a type of activity that can be tracked in the leaderboard.
 *
 * @remarks
 * Activity definitions serve as a catalog of all recognizable activities.
 * Each activity in the system references an activity definition via its slug.
 * Points can be overridden at the activity level if the definition's default
 * doesn't apply.
 *
 * @example
 * ```typescript
 * const definition: ActivityDefinitionData = {
 *   slug: "github-pr-opened",
 *   name: "Pull Request Opened",
 *   description: "Opened a new pull request",
 *   points: 10,
 *   icon: "🔀"
 * };
 * ```
 */
export interface ActivityDefinitionData {
  /**
   * Unique identifier for the activity type.
   * Used as foreign key reference from activities.
   *
   * @example "github-pr-opened", "slack-eod-update"
   */
  slug: string;

  /**
   * Human-readable name for display purposes.
   *
   * @example "Pull Request Opened"
   */
  name: string;

  /**
   * Detailed description of what this activity represents.
   */
  description: string;

  /**
   * Default points awarded for this activity type.
   * Can be overridden at the individual activity level.
   */
  points: number;

  /**
   * Optional icon (emoji or URL) for visual representation.
   *
   * @example "🔀", "💬", "✅"
   */
  icon: string | null;
}

// =============================================================================
// Operation Option Types
// =============================================================================

/**
 * Options for the activity insertion operation.
 *
 * @remarks
 * Controls how activities are upserted when conflicts occur on the slug.
 * The `mergeText` option is primarily used for Slack EOD updates where
 * multiple messages from the same day should be concatenated.
 */
export interface ActivityInsertOptions {
  /**
   * If true, concatenate text fields on conflict instead of replacing.
   * Useful for Slack EOD updates where messages are merged by day.
   *
   * @default false
   */
  mergeText?: boolean;
}

// =============================================================================
// Query Result Types
// =============================================================================

/**
 * Grouped pending EOD updates returned from the queue.
 *
 * @remarks
 * When processing EOD updates, messages are grouped by Slack user ID
 * to allow batch processing and activity creation per user.
 */
export interface PendingEodUpdate {
  /**
   * Slack user ID for this group of messages.
   */
  user_id: string;

  /**
   * Array of message IDs in chronological order.
   */
  ids: number[];

  /**
   * Array of message texts in chronological order.
   */
  texts: string[];

  /**
   * Array of message timestamps in chronological order.
   */
  timestamps: Date[];
}
