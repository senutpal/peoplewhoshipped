/**
 * @fileoverview Static data readers for pre-built JSON files
 * @module @leaderboard/web/lib/static-data
 *
 * Reads pre-generated JSON files instead of accessing PGlite database
 * during Next.js static generation to avoid WASM bundling issues.
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";

// =============================================================================
// Types (matching database types)
// =============================================================================

export interface ContributorWithAvatar {
  username: string;
  name: string | null;
  avatar_url: string;
  role: string | null;
  total_points: number;
}

export interface ActivityGroup {
  activity_definition: string;
  activity_name: string;
  activity_description: string | null;
  activity_points: number | null;
  activities: Array<{
    slug: string;
    contributor: string;
    activity_definition: string;
    title: string | null;
    occured_at: Date;
    link: string | null;
    text: string | null;
    points: number | null;
    meta: Record<string, unknown> | null;
    contributor_name: string | null;
    contributor_avatar_url: string | null;
    contributor_role: string | null;
  }>;
}

export interface LeaderboardEntry {
  username: string;
  name: string | null;
  avatar_url: string | null;
  role: string | null;
  total_points: number;
  activity_breakdown: Record<string, { count: number; points: number }>;
  daily_activity: Array<{ date: string; count: number; points: number }>;
}

export interface TopContributorEntry {
  username: string;
  name: string | null;
  avatar_url: string | null;
  points: number;
  count: number;
}

export type TopContributorsByActivity = Record<string, TopContributorEntry[]>;

export interface ContributorActivity {
  slug: string;
  contributor: string;
  activity_definition: string;
  title: string | null;
  occured_at: Date;
  link: string | null;
  text: string | null;
  points: number | null;
  meta: Record<string, unknown> | null;
  activity_name: string;
  activity_description: string | null;
  activity_points: number | null;
  activity_icon: string | null;
}

export interface Contributor {
  username: string;
  name?: string;
  avatar_url?: string;
  role?: string;
  bio?: string;
  social_profiles?: Record<string, string>;
  meta?: Record<string, unknown>;
}

export interface ContributorProfile {
  contributor: Contributor | null;
  activities: ContributorActivity[];
  totalPoints: number;
  activityByDate: Record<string, number>;
}

export interface ActivityDefinition {
  slug: string;
  name: string;
  description: string | null;
  points: number | null;
  icon: string | null;
}

// =============================================================================
// Path Resolution
// =============================================================================

/**
 * Get the path to the static data directory.
 * Uses LEADERBOARD_DATA_PATH env var or falls back to project data directory.
 */
function getStaticDataPath(): string {
  const dataPath = process.env.LEADERBOARD_DATA_PATH || join(process.cwd(), "../..", "data");
  return join(dataPath, "static");
}

/**
 * Read and parse a JSON file from the static data directory.
 */
function readStaticJson<T>(filename: string): T {
  const filePath = join(getStaticDataPath(), filename);
  
  if (!existsSync(filePath)) {
    throw new Error(`Static data file not found: ${filePath}. Run 'bun run db:prebuild-static' first.`);
  }
  
  const content = readFileSync(filePath, "utf-8");
  return JSON.parse(content) as T;
}

// =============================================================================
// Data Readers
// =============================================================================

/**
 * Get all contributor usernames for static generation.
 */
export function getAllContributorUsernames(): string[] {
  return readStaticJson<string[]>("usernames.json");
}

/**
 * Get all contributors with avatars for the people page.
 */
export function getAllContributorsWithAvatars(): ContributorWithAvatar[] {
  return readStaticJson<ContributorWithAvatar[]>("people.json");
}

/**
 * Get activity definitions.
 */
export function listActivityDefinitions(): ActivityDefinition[] {
  return readStaticJson<ActivityDefinition[]>("activity-definitions.json");
}

/**
 * Get recent activities grouped by type for home page.
 */
export function getRecentActivitiesGroupedByType(): ActivityGroup[] {
  const raw = readStaticJson<Array<{
    activity_definition: string;
    activity_name: string;
    activity_description: string | null;
    activity_points: number | null;
    activities: Array<{
      slug: string;
      contributor: string;
      activity_definition: string;
      title: string | null;
      occured_at: string; // ISO string
      link: string | null;
      text: string | null;
      points: number | null;
      meta: Record<string, unknown> | null;
      contributor_name: string | null;
      contributor_avatar_url: string | null;
      contributor_role: string | null;
    }>;
  }>>("recent-activities.json");

  // Convert date strings back to Date objects
  return raw.map(group => ({
    ...group,
    activities: group.activities.map(a => ({
      ...a,
      occured_at: new Date(a.occured_at),
    })),
  }));
}

/**
 * Get leaderboard data for a specific period.
 */
export function getLeaderboardData(period: "week" | "month" | "year"): {
  entries: LeaderboardEntry[];
  topByActivity: TopContributorsByActivity;
  startDate: Date;
  endDate: Date;
} {
  const raw = readStaticJson<{
    entries: LeaderboardEntry[];
    topByActivity: TopContributorsByActivity;
    startDate: string;
    endDate: string;
  }>(`leaderboard-${period}.json`);

  return {
    ...raw,
    startDate: new Date(raw.startDate),
    endDate: new Date(raw.endDate),
  };
}

/**
 * Get a contributor's profile.
 */
export function getContributorProfile(username: string): ContributorProfile {
  const profilePath = join("profiles", `${username}.json`);
  
  try {
    const raw = readStaticJson<{
      contributor: Contributor | null;
      activities: Array<{
        slug: string;
        contributor: string;
        activity_definition: string;
        title: string | null;
        occured_at: string; // ISO string
        link: string | null;
        text: string | null;
        points: number | null;
        meta: Record<string, unknown> | null;
        activity_name: string;
        activity_description: string | null;
        activity_points: number | null;
        activity_icon: string | null;
      }>;
      totalPoints: number;
      activityByDate: Record<string, number>;
    }>(profilePath);

    // Convert date strings back to Date objects
    return {
      ...raw,
      activities: raw.activities.map(a => ({
        ...a,
        occured_at: new Date(a.occured_at),
      })),
    };
  } catch {
    // Return empty profile if not found
    return {
      contributor: null,
      activities: [],
      totalPoints: 0,
      activityByDate: {},
    };
  }
}
