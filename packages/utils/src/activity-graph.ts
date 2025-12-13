/**
 * @fileoverview Activity graph data generation utilities
 * @module @leaderboard/utils/activity-graph
 *
 * This module provides utilities for generating GitHub-style
 * activity/contribution graph data.
 */

// =============================================================================
// Types
// =============================================================================

/**
 * A single data point for the activity graph.
 */
export interface ActivityGraphDataPoint {
  /** Date in YYYY-MM-DD format */
  date: string;
  /** Number of activities on this date */
  count: number;
  /** Intensity level (0-4) for color coding like GitHub */
  level: number;
}

// =============================================================================
// Graph Generation
// =============================================================================

/**
 * Generate activity graph data for the last N days.
 *
 * @param activityByDate - Object with date keys (YYYY-MM-DD) and activity counts
 * @param days - Number of days to include (default 365)
 * @returns Array of objects with date, count, and level for each day
 *
 * @remarks
 * The level is calculated based on activity count:
 * - Level 0: No activity
 * - Level 1: 1-2 activities
 * - Level 2: 3-5 activities
 * - Level 3: 6-9 activities
 * - Level 4: 10+ activities
 *
 * @example
 * ```typescript
 * const activityByDate = {
 *   "2024-01-15": 5,
 *   "2024-01-16": 2,
 *   "2024-01-17": 12
 * };
 *
 * const graphData = generateActivityGraphData(activityByDate, 30);
 * // Returns array with 30 entries, each containing date, count, and level
 * ```
 */
export function generateActivityGraphData(
  activityByDate: Record<string, number>,
  days: number = 365
): ActivityGraphDataPoint[] {
  const data: ActivityGraphDataPoint[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateKey = date.toISOString().split("T")[0];
    
    if (!dateKey) continue;

    const count = activityByDate[dateKey] || 0;

    // Calculate level (0-4) for color intensity like GitHub
    let level = 0;
    if (count > 0) level = 1;
    if (count >= 3) level = 2;
    if (count >= 6) level = 3;
    if (count >= 10) level = 4;

    data.push({ date: dateKey, count, level });
  }

  return data;
}
