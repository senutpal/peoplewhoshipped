/**
 * @fileoverview Leaderboard query operations
 * @module @leaderboard/database/operations/queries
 *
 * This module provides read operations for retrieving leaderboard data,
 * contributor profiles, activity statistics, and rankings.
 */

import { getDb } from "../connection";
import type { Contributor, Activity } from "../types";
import type {
  LeaderboardEntry,
  ActivityGroup,
  ActivityWithContributor,
  ContributorActivity,
  ContributorProfile,
  TopContributorsByActivity,
  ContributorWithAvatar,
} from "../types/queries";

// =============================================================================
// Contributor Queries
// =============================================================================

/**
 * Get a single contributor by username.
 *
 * @param username - The username of the contributor
 * @returns The contributor or null if not found
 *
 * @example
 * ```typescript
 * const contributor = await getContributor("johndoe");
 * if (contributor) {
 *   console.log(`Found: ${contributor.name}`);
 * }
 * ```
 */
export async function getContributor(
  username: string
): Promise<Contributor | null> {
  const db = getDb();

  const result = await db.query<Contributor>(
    "SELECT * FROM contributor WHERE username = $1;",
    [username]
  );

  return result.rows[0] ?? null;
}

/**
 * List all contributors from the database.
 *
 * @returns The list of all contributors
 *
 * @deprecated Consider using paginated queries for large datasets
 */
export async function listContributors(): Promise<Contributor[]> {
  const db = getDb();

  const result = await db.query<Contributor>("SELECT * FROM contributor;");

  return result.rows;
}

/**
 * Get all contributor usernames for static generation.
 *
 * @returns List of all contributor usernames
 */
export async function getAllContributorUsernames(): Promise<string[]> {
  const db = getDb();

  const result = await db.query<{ username: string }>(
    "SELECT username FROM contributor ORDER BY username;"
  );

  return result.rows.map((row) => row.username);
}

/**
 * Get all contributors with avatars sorted by total points.
 *
 * @param excludeRoles - Optional array of role names to exclude (e.g., ["bot"])
 * @returns List of contributors with avatar URLs and total points
 *
 * @example
 * ```typescript
 * // Get all visible contributors (excluding bots)
 * const contributors = await getAllContributorsWithAvatars(["bot"]);
 * ```
 */
export async function getAllContributorsWithAvatars(
  excludeRoles?: string[]
): Promise<ContributorWithAvatar[]> {
  const db = getDb();

  const whereConditions = ["c.avatar_url IS NOT NULL"];
  const params: string[] = [];

  if (excludeRoles && excludeRoles.length > 0) {
    params.push(...excludeRoles);
    const placeholders = excludeRoles.map((_, i) => `$${i + 1}`).join(", ");
    whereConditions.push(`(c.role IS NULL OR c.role NOT IN (${placeholders}))`);
  }

  const whereClause = whereConditions.join(" AND ");

  const result = await db.query<{
    username: string;
    name: string | null;
    avatar_url: string;
    role: string | null;
    total_points: string;
  }>(
    `
    SELECT 
      c.username,
      c.name,
      c.avatar_url,
      c.role,
      COALESCE(SUM(COALESCE(a.points, ad.points)), 0) as total_points
    FROM contributor c
    LEFT JOIN activity a ON c.username = a.contributor
    LEFT JOIN activity_definition ad ON a.activity_definition = ad.slug
    WHERE ${whereClause}
    GROUP BY c.username, c.name, c.avatar_url, c.role
    ORDER BY total_points DESC, c.username ASC;
  `,
    params
  );

  return result.rows.map((row) => ({
    ...row,
    total_points: Number(row.total_points),
  }));
}

// =============================================================================
// Activity Definition Queries
// =============================================================================

/**
 * List all activity definitions from the database.
 *
 * @returns The list of all activity definitions
 */
export async function listActivityDefinitions(): Promise<
  Array<{
    slug: string;
    name: string;
    description: string | null;
    points: number | null;
    icon: string | null;
  }>
> {
  const db = getDb();

  const result = await db.query<{
    slug: string;
    name: string;
    description: string | null;
    points: number | null;
    icon: string | null;
  }>("SELECT * FROM activity_definition;");

  return result.rows;
}

// =============================================================================
// Leaderboard Queries
// =============================================================================

/**
 * Get leaderboard for a specific date range.
 *
 * @param startDate - Start date of the range
 * @param endDate - End date of the range
 * @param excludeRoles - Optional array of role names to exclude (e.g., ["bot"])
 * @returns Leaderboard entries sorted by total points (descending)
 *
 * @example
 * ```typescript
 * const startDate = new Date();
 * startDate.setDate(startDate.getDate() - 7);
 * const endDate = new Date();
 *
 * const leaderboard = await getLeaderboard(startDate, endDate, ["bot"]);
 * leaderboard.forEach((entry, rank) => {
 *   console.log(`#${rank + 1}: ${entry.username} - ${entry.total_points} points`);
 * });
 * ```
 */
export async function getLeaderboard(
  startDate: Date,
  endDate: Date,
  excludeRoles?: string[]
): Promise<LeaderboardEntry[]> {
  const db = getDb();

  // Build WHERE clause with optional role exclusion
  const whereConditions = ["a.occured_at >= $1", "a.occured_at <= $2"];
  const params: string[] = [startDate.toISOString(), endDate.toISOString()];

  if (excludeRoles && excludeRoles.length > 0) {
    params.push(...excludeRoles);
    const placeholders = excludeRoles.map((_, i) => `$${i + 3}`).join(", ");
    whereConditions.push(`(c.role IS NULL OR c.role NOT IN (${placeholders}))`);
  }

  const whereClause = whereConditions.join(" AND ");

  // Get all activities in the date range with contributor info
  const result = await db.query<{
    username: string;
    name: string | null;
    avatar_url: string | null;
    role: string | null;
    activity_definition: string;
    activity_name: string;
    points: string | null;
    occured_at: string;
  }>(
    `
    SELECT 
      c.username,
      c.name,
      c.avatar_url,
      c.role,
      a.activity_definition,
      ad.name as activity_name,
      COALESCE(a.points, ad.points) as points,
      a.occured_at
    FROM activity a
    JOIN contributor c ON a.contributor = c.username
    JOIN activity_definition ad ON a.activity_definition = ad.slug
    WHERE ${whereClause}
    ORDER BY c.username, a.occured_at;
  `,
    params
  );

  // Group by contributor and calculate totals
  const leaderboardMap: Record<string, LeaderboardEntry> = {};

  result.rows.forEach((row) => {
    const username = row.username;
    if (!leaderboardMap[username]) {
      leaderboardMap[username] = {
        username: row.username,
        name: row.name,
        avatar_url: row.avatar_url,
        role: row.role,
        total_points: 0,
        activity_breakdown: {},
        daily_activity: [],
      };
    }

    const points = row.points ? Number(row.points) : 0;
    leaderboardMap[username].total_points += points;

    const activityKey = row.activity_name;
    if (!leaderboardMap[username].activity_breakdown[activityKey]) {
      leaderboardMap[username].activity_breakdown[activityKey] = {
        count: 0,
        points: 0,
      };
    }
    leaderboardMap[username].activity_breakdown[activityKey].count += 1;
    leaderboardMap[username].activity_breakdown[activityKey].points += points;

    // Group by date for daily activity
    const dateKey = new Date(row.occured_at).toISOString().split("T")[0];
    if (dateKey) {
      const existingDay = leaderboardMap[username].daily_activity.find(
        (d) => d.date === dateKey
      );
      if (existingDay) {
        existingDay.count += 1;
        existingDay.points += points;
      } else {
        leaderboardMap[username].daily_activity.push({
          date: dateKey,
          count: 1,
          points: points,
        });
      }
    }
  });

  // Filter contributors with points > 0 and sort by total points
  return Object.values(leaderboardMap)
    .filter((entry) => entry.total_points > 0)
    .sort((a, b) => b.total_points - a.total_points);
}

// =============================================================================
// Activity Queries
// =============================================================================

/**
 * Get recent activities grouped by activity type.
 *
 * @param days - Number of days to look back
 * @param excludeRoles - Optional array of role names to exclude (e.g., ["bot"])
 * @returns Activities grouped by activity definition
 *
 * @example
 * ```typescript
 * const groups = await getRecentActivitiesGroupedByType(7, ["bot"]);
 * groups.forEach((group) => {
 *   console.log(`${group.activity_name}: ${group.activities.length} activities`);
 * });
 * ```
 */
export async function getRecentActivitiesGroupedByType(
  days: number,
  excludeRoles?: string[]
): Promise<ActivityGroup[]> {
  const db = getDb();

  // Build WHERE clause with optional role exclusion
  const whereConditions = [`a.occured_at >= NOW() - INTERVAL '${days} days'`];
  const params: string[] = [];

  if (excludeRoles && excludeRoles.length > 0) {
    params.push(...excludeRoles);
    const placeholders = excludeRoles.map((_, i) => `$${i + 1}`).join(", ");
    whereConditions.push(`(c.role IS NULL OR c.role NOT IN (${placeholders}))`);
  }

  const whereClause = whereConditions.join(" AND ");

  const result = await db.query<{
    slug: string;
    contributor: string;
    activity_definition: string;
    title: string | null;
    occured_at: string;
    link: string | null;
    text: string | null;
    points: string | null;
    meta: string | null;
    contributor_name: string | null;
    contributor_avatar_url: string | null;
    contributor_role: string | null;
    activity_name: string;
    activity_description: string | null;
    activity_points: string | null;
  }>(
    `
    SELECT 
      a.slug,
      a.contributor,
      a.activity_definition,
      a.title,
      a.occured_at,
      a.link,
      a.text,
      COALESCE(a.points, ad.points) as points,
      a.meta::text,
      c.name as contributor_name,
      c.avatar_url as contributor_avatar_url,
      c.role as contributor_role,
      ad.name as activity_name,
      ad.description as activity_description,
      ad.points as activity_points
    FROM activity a
    JOIN contributor c ON a.contributor = c.username
    JOIN activity_definition ad ON a.activity_definition = ad.slug
    WHERE ${whereClause}
    ORDER BY a.occured_at DESC;
  `,
    params
  );

  // Group activities by activity_definition
  const grouped: Record<string, ActivityGroup> = {};

  result.rows.forEach((row) => {
    const key = row.activity_definition;
    if (!grouped[key]) {
      grouped[key] = {
        activity_definition: row.activity_definition,
        activity_name: row.activity_name,
        activity_description: row.activity_description,
        activity_points: row.activity_points ? Number(row.activity_points) : null,
        activities: [],
      };
    }

    grouped[key].activities.push({
      slug: row.slug,
      contributor: row.contributor,
      activity_definition: row.activity_definition,
      title: row.title,
      occured_at: new Date(row.occured_at),
      link: row.link,
      text: row.text,
      points: row.points ? Number(row.points) : null,
      meta: row.meta ? JSON.parse(row.meta) : null,
      contributor_name: row.contributor_name,
      contributor_avatar_url: row.contributor_avatar_url,
      contributor_role: row.contributor_role,
    });
  });

  return Object.values(grouped);
}

/**
 * Get top contributors by activity type for a specific date range.
 *
 * @param startDate - Start date of the range
 * @param endDate - End date of the range
 * @param activitySlugs - Optional array of activity definition slugs to filter by
 * @param excludeRoles - Optional array of role names to exclude (e.g., ["bot"])
 * @returns Top 3 contributors for each activity type
 *
 * @example
 * ```typescript
 * const topByActivity = await getTopContributorsByActivity(
 *   startDate,
 *   endDate,
 *   ["pr_merged", "pr_opened"],
 *   ["bot"]
 * );
 * ```
 */
export async function getTopContributorsByActivity(
  startDate: Date,
  endDate: Date,
  activitySlugs?: string[],
  excludeRoles?: string[]
): Promise<TopContributorsByActivity> {
  const db = getDb();

  // Build WHERE clause for activity slug filtering
  let whereClause = `a.occured_at >= $1 AND a.occured_at <= $2`;
  const queryParams: (string | string[])[] = [
    startDate.toISOString(),
    endDate.toISOString(),
  ];

  let paramIndex = 3;

  if (activitySlugs && activitySlugs.length > 0) {
    whereClause += ` AND ad.slug = ANY($${paramIndex})`;
    queryParams.push(activitySlugs);
    paramIndex++;
  }

  if (excludeRoles && excludeRoles.length > 0) {
    whereClause += ` AND (c.role IS NULL OR c.role NOT IN (${excludeRoles.map((_, i) => `$${paramIndex + i}`).join(", ")}))`;
    queryParams.push(...excludeRoles);
  }

  const result = await db.query<{
    username: string;
    name: string | null;
    avatar_url: string | null;
    activity_name: string;
    activity_slug: string;
    points: string;
    count: string;
  }>(
    `
    SELECT 
      c.username,
      c.name,
      c.avatar_url,
      ad.name as activity_name,
      ad.slug as activity_slug,
      SUM(COALESCE(a.points, ad.points)) as points,
      COUNT(*) as count
    FROM activity a
    JOIN contributor c ON a.contributor = c.username
    JOIN activity_definition ad ON a.activity_definition = ad.slug
    WHERE ${whereClause}
    GROUP BY c.username, c.name, c.avatar_url, ad.name, ad.slug
    HAVING SUM(COALESCE(a.points, ad.points)) > 0
    ORDER BY ad.name, points DESC;
  `,
    queryParams
  );

  // Group by activity type and take top 3 for each
  const topByActivityMap: TopContributorsByActivity = {};

  result.rows.forEach((row) => {
    const activityName = row.activity_name;
    if (!topByActivityMap[activityName]) {
      topByActivityMap[activityName] = [];
    }
    if (topByActivityMap[activityName].length < 3) {
      topByActivityMap[activityName].push({
        username: row.username,
        name: row.name,
        avatar_url: row.avatar_url,
        points: Number(row.points),
        count: Number(row.count),
      });
    }
  });

  // If slugs are provided, return in the order specified
  if (activitySlugs && activitySlugs.length > 0) {
    const orderedResult: TopContributorsByActivity = {};

    // Create a map of slug to activity name from the results
    const slugToName = new Map<string, string>();
    result.rows.forEach((row) => {
      slugToName.set(row.activity_slug, row.activity_name);
    });

    // Add activities in the order specified by activitySlugs
    activitySlugs.forEach((slug) => {
      const activityName = slugToName.get(slug);
      if (activityName && topByActivityMap[activityName]) {
        orderedResult[activityName] = topByActivityMap[activityName];
      }
    });

    return orderedResult;
  }

  return topByActivityMap;
}

// =============================================================================
// Contributor Profile Queries
// =============================================================================

/**
 * Get contributor profile with all activities and statistics.
 *
 * @param username - The username of the contributor
 * @returns Contributor profile with activities, points, and activity graph data
 *
 * @example
 * ```typescript
 * const profile = await getContributorProfile("johndoe");
 * if (profile.contributor) {
 *   console.log(`${profile.contributor.name} has ${profile.totalPoints} points`);
 *   console.log(`${profile.activities.length} total activities`);
 * }
 * ```
 */
export async function getContributorProfile(
  username: string
): Promise<ContributorProfile> {
  const db = getDb();

  // Get contributor info
  const contributor = await getContributor(username);

  if (!contributor) {
    return {
      contributor: null,
      activities: [],
      totalPoints: 0,
      activityByDate: {},
    };
  }

  // Get all activities for this contributor
  const activitiesResult = await db.query<{
    slug: string;
    contributor: string;
    activity_definition: string;
    title: string | null;
    occured_at: string;
    link: string | null;
    text: string | null;
    points: string | null;
    meta: string | null;
    activity_name: string;
    activity_description: string | null;
    activity_points: string | null;
    activity_icon: string | null;
  }>(
    `
    SELECT 
      a.slug,
      a.contributor,
      a.activity_definition,
      a.title,
      a.occured_at,
      a.link,
      a.text,
      COALESCE(a.points, ad.points) as points,
      a.meta::text,
      ad.name as activity_name,
      ad.description as activity_description,
      ad.points as activity_points,
      ad.icon as activity_icon
    FROM activity a
    JOIN activity_definition ad ON a.activity_definition = ad.slug
    WHERE a.contributor = $1
    ORDER BY a.occured_at DESC;
  `,
    [username]
  );

  const activities: ContributorActivity[] = activitiesResult.rows.map((row) => ({
    slug: row.slug,
    contributor: row.contributor,
    activity_definition: row.activity_definition,
    title: row.title,
    occured_at: new Date(row.occured_at),
    link: row.link,
    text: row.text,
    points: row.points ? Number(row.points) : null,
    meta: row.meta ? JSON.parse(row.meta) : null,
    activity_name: row.activity_name,
    activity_description: row.activity_description,
    activity_points: row.activity_points ? Number(row.activity_points) : null,
    activity_icon: row.activity_icon,
  }));

  // Calculate total points
  const totalPoints = activities.reduce(
    (sum, activity) => sum + (activity.points || 0),
    0
  );

  // Group activities by date for the activity graph
  const activityByDate: Record<string, number> = {};
  activities.forEach((activity) => {
    const dateKey = activity.occured_at.toISOString().split("T")[0];
    if (dateKey) {
      activityByDate[dateKey] = (activityByDate[dateKey] || 0) + 1;
    }
  });

  return {
    contributor,
    activities,
    totalPoints,
    activityByDate,
  };
}
