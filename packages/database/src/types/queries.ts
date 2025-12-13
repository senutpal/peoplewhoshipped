/**
 * @fileoverview Query type definitions for leaderboard operations
 * @module @leaderboard/database/types/queries
 *
 * This module contains type definitions for query results used
 * in leaderboard display, contributor profiles, and activity statistics.
 */

import type { Activity, Contributor } from "./index";

// =============================================================================
// Leaderboard Types
// =============================================================================

/**
 * Leaderboard entry with contributor details and activity breakdown.
 *
 * @remarks
 * This represents a single row in the leaderboard ranking table.
 * Contains aggregate statistics and activity breakdown for time-based filtering.
 */
export interface LeaderboardEntry {
  /** Contributor's username */
  username: string;
  /** Display name */
  name: string | null;
  /** Avatar URL */
  avatar_url: string | null;
  /** Role in the organization */
  role: string | null;
  /** Total points earned in the period */
  total_points: number;
  /** Breakdown of points by activity type */
  activity_breakdown: Record<string, { count: number; points: number }>;
  /** Daily activity for sparkline/graph */
  daily_activity: Array<{ date: string; count: number; points: number }>;
}

// =============================================================================
// Activity Types
// =============================================================================

/**
 * Activity with contributor details attached.
 *
 * @remarks
 * Used when displaying activities in feeds where contributor info is needed.
 */
export interface ActivityWithContributor extends Activity {
  /** Contributor's display name */
  contributor_name: string | null;
  /** Contributor's avatar URL */
  contributor_avatar_url: string | null;
  /** Contributor's role */
  contributor_role: string | null;
}

/**
 * Activity group by activity definition.
 *
 * @remarks
 * Used for displaying activities grouped by type (e.g., PRs, issues, EODs).
 */
export interface ActivityGroup {
  /** Activity definition slug */
  activity_definition: string;
  /** Activity type display name */
  activity_name: string;
  /** Activity type description */
  activity_description: string | null;
  /** Default points for this activity type */
  activity_points: number | null;
  /** Activities of this type */
  activities: ActivityWithContributor[];
}

/**
 * Activity with full details for contributor timeline.
 */
export interface ContributorActivity extends Activity {
  /** Activity type display name */
  activity_name: string;
  /** Activity type description */
  activity_description: string | null;
  /** Default points for this activity type */
  activity_points: number | null;
  /** Icon name for the activity type */
  activity_icon: string | null;
}

// =============================================================================
// Contributor Profile Types
// =============================================================================

/**
 * Complete contributor profile with activities and statistics.
 *
 * @remarks
 * Used for individual contributor profile pages.
 */
export interface ContributorProfile {
  /** Contributor details */
  contributor: Contributor | null;
  /** All activities by this contributor */
  activities: ContributorActivity[];
  /** Total points earned (all time) */
  totalPoints: number;
  /** Activity count by date for contribution graph */
  activityByDate: Record<string, number>;
}

// =============================================================================
// Top Contributors Types
// =============================================================================

/**
 * Top contributor entry for a specific activity type.
 */
export interface TopContributorEntry {
  /** Contributor's username */
  username: string;
  /** Display name */
  name: string | null;
  /** Avatar URL */
  avatar_url: string | null;
  /** Total points for this activity type */
  points: number;
  /** Number of activities of this type */
  count: number;
}

/**
 * Top contributors grouped by activity type.
 */
export type TopContributorsByActivity = Record<string, TopContributorEntry[]>;

// =============================================================================
// Contributor List Types
// =============================================================================

/**
 * Contributor with avatar for listing pages.
 */
export interface ContributorWithAvatar {
  /** Contributor's username */
  username: string;
  /** Display name */
  name: string | null;
  /** Avatar URL */
  avatar_url: string;
  /** Role in the organization */
  role: string | null;
  /** Total points earned (all time) */
  total_points: number;
}
