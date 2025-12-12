/**
 * @fileoverview Type definitions for database import/export operations
 * @module @leaderboard/db-scripts/types
 *
 * This module contains all TypeScript interfaces used across the db-scripts package
 * for type-safe database operations.
 */

// =============================================================================
// Activity Types
// =============================================================================

/**
 * Activity row structure from the database.
 *
 * @description
 * Represents a single activity record as stored in the database.
 * Used during both import and export operations.
 *
 * @example
 * ```typescript
 * const activity: ActivityRow = {
 *   slug: "pr_merged_repo#123",
 *   contributor: "username",
 *   activity_definition: "pr_merged",
 *   title: "Merged PR: Fix bug",
 *   occured_at: new Date(),
 *   link: "https://github.com/org/repo/pull/123",
 *   text: null,
 *   points: 5,
 *   meta: { repo: "org/repo" }
 * };
 * ```
 */
export interface ActivityRow {
  /** Unique slug identifier for the activity */
  slug: string;
  /** GitHub username of the contributor */
  contributor: string;
  /** Activity definition slug (e.g., "pr_merged", "issue_opened") */
  activity_definition: string;
  /** Human-readable title of the activity */
  title: string;
  /** When the activity occurred */
  occured_at: Date | string;
  /** Optional URL link to the activity source */
  link: string | null;
  /** Optional text content (e.g., comment body) */
  text: string | null;
  /** Points awarded for this activity */
  points: number | null;
  /** Additional metadata as JSON */
  meta: Record<string, unknown> | null;
}

// =============================================================================
// EOD Message Types
// =============================================================================

/**
 * EOD (End of Day) message row from the database.
 *
 * @description
 * Represents a Slack EOD message stored in the slack_eod_queue table.
 *
 * @example
 * ```typescript
 * const message: EodMessageRow = {
 *   id: 1,
 *   user_id: "U12345678",
 *   timestamp: new Date(),
 *   text: "Today I worked on..."
 * };
 * ```
 */
export interface EodMessageRow {
  /** Database auto-generated ID */
  id: number;
  /** Slack user ID */
  user_id: string;
  /** When the message was posted */
  timestamp: Date | string;
  /** Message content */
  text: string;
}

// =============================================================================
// Contributor Types
// =============================================================================

/**
 * Contributor metadata from markdown frontmatter.
 *
 * @description
 * Structure of the YAML frontmatter in contributor markdown files
 * located in `data/contributors/*.md`.
 *
 * @example
 * ```yaml
 * ---
 * name: John Doe
 * role: contributor
 * title: Senior Developer
 * avatar_url: https://avatars.githubusercontent.com/johndoe
 * social_profiles:
 *   github: https://github.com/johndoe
 *   linkedin: https://linkedin.com/in/johndoe
 * ---
 * ```
 */
export interface ContributorMeta {
  /** Display name of the contributor */
  name?: string;
  /** Role in the organization (e.g., "core", "contributor", "bot") */
  role?: string;
  /** Job title or description */
  title?: string;
  /** URL to contributor's avatar image */
  avatar_url?: string;
  /** Additional metadata */
  meta?: Record<string, unknown>;
  /** Social profile URLs keyed by platform name */
  social_profiles?: Record<string, string>;
}

// =============================================================================
// Operation Result Types
// =============================================================================

/**
 * Result of an export operation.
 *
 * @description
 * Returned by export functions to provide statistics about
 * what was exported.
 */
export interface ExportResult {
  /** Number of records successfully exported */
  exported: number;
  /** Number of unique contributors/users exported */
  contributors: number;
}

/**
 * Result of an import operation.
 *
 * @description
 * Returned by import functions to provide statistics about
 * what was imported.
 */
export interface ImportResult {
  /** Number of records successfully imported */
  imported: number;
  /** Number of records skipped (e.g., duplicates) */
  skipped: number;
}
