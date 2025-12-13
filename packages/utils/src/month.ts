/**
 * @fileoverview Month-related utility functions
 * @module @leaderboard/utils/month
 *
 * This module provides utilities for working with months,
 * including boundaries, formatting, and activity grouping.
 */

// =============================================================================
// Types
// =============================================================================

/**
 * Month key in YYYY-MM format.
 * Used for grouping and indexing activities by month.
 */
export type MonthKey = `${number}-${string}`;

// =============================================================================
// Month Boundary Functions
// =============================================================================

/**
 * Get the start and end dates of a month for a given date.
 *
 * @param date - The date to get month boundaries for
 * @returns Object with start and end dates of the month
 *
 * @example
 * ```typescript
 * const { start, end } = getMonthBoundaries(new Date("2024-06-15"));
 * // start: 2024-06-01T00:00:00.000Z
 * // end: 2024-06-30T23:59:59.999Z
 * ```
 */
export function getMonthBoundaries(date: Date): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );
  return { start, end };
}

// =============================================================================
// Month Key Functions
// =============================================================================

/**
 * Get month identifier string (e.g., "2025-11").
 *
 * @param date - The date to get month key for
 * @returns Month key string in YYYY-MM format
 *
 * @example
 * ```typescript
 * const key = getMonthKey(new Date("2025-11-15"));
 * // Returns: "2025-11"
 * ```
 */
export function getMonthKey(date: Date): MonthKey {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}` as MonthKey;
}

/**
 * Format month for display (e.g., "November 2025").
 *
 * @param monthKey - Month key in YYYY-MM format
 * @returns Formatted month string
 *
 * @example
 * ```typescript
 * const formatted = formatMonthHeader("2025-11");
 * // Returns: "November 2025"
 * ```
 */
export function formatMonthHeader(monthKey: MonthKey): string {
  const [year, month] = monthKey.split("-");
  const date = new Date(parseInt(year!), parseInt(month!) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

// =============================================================================
// Activity Grouping
// =============================================================================

/**
 * Group activities by month with sorted month keys.
 *
 * @param activities - Array of activities with occured_at dates
 * @returns Map of month keys to arrays of activities, sorted newest to oldest
 *
 * @example
 * ```typescript
 * const activities = [
 *   { occured_at: new Date("2024-11-15"), title: "Activity 1" },
 *   { occured_at: new Date("2024-10-20"), title: "Activity 2" },
 *   { occured_at: new Date("2024-11-10"), title: "Activity 3" }
 * ];
 *
 * const grouped = groupActivitiesByMonth(activities);
 * // Map with:
 * // "2024-11" => [Activity 1, Activity 3]
 * // "2024-10" => [Activity 2]
 * ```
 */
export function groupActivitiesByMonth<T extends { occured_at: Date }>(
  activities: T[]
): Map<MonthKey, T[]> {
  const grouped = new Map<MonthKey, T[]>();

  // Group activities by month
  activities.forEach((activity) => {
    const monthKey = getMonthKey(activity.occured_at);
    if (!grouped.has(monthKey)) {
      grouped.set(monthKey, []);
    }
    grouped.get(monthKey)!.push(activity);
  });

  // Sort the map by month keys (newest to oldest)
  const sortedEntries = Array.from(grouped.entries()).sort((a, b) => {
    return b[0].localeCompare(a[0]); // Reverse chronological order
  });

  return new Map(sortedEntries);
}
