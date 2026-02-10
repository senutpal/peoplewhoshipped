/**
 * @fileoverview Date utility functions
 * @module @leaderboard/utils/date
 *
 * This module provides date manipulation and formatting utilities
 * for the leaderboard system.
 */

import { formatDistanceToNow, subDays } from "date-fns";

// =============================================================================
// Types
// =============================================================================

/**
 * Time period options for date range calculations.
 */
export type DateRangePeriod = "week" | "month" | "year";

// =============================================================================
// Date Range Functions
// =============================================================================

const DAY_MULTIPLIERS: Record<DateRangePeriod, number> = {
  week: 7,
  month: 30,
  year: 365,
};

/**
 * Get date range for a specific period.
 *
 * @param period - The time period (week, month, or year)
 * @returns Object with startDate and endDate
 *
 * @example
 * ```typescript
 * const { startDate, endDate } = getDateRange("week");
 * // startDate: 7 days ago
 * // endDate: now
 * ```
 */
export function getDateRange(period: DateRangePeriod): {
  startDate: Date;
  endDate: Date;
} {
  const endDate = new Date();
  const days = DAY_MULTIPLIERS[period];
  const startDate = subDays(endDate, days);

  return { startDate, endDate };
}

// =============================================================================
// Formatting Functions
// =============================================================================

/**
 * Format a date as a human-readable "time ago" string.
 *
 * @param date - The date to format
 * @returns Human-readable time string (e.g., "2 hours ago")
 *
 * @example
 * ```typescript
 * const timeAgo = formatTimeAgo(new Date(Date.now() - 3600000));
 * // Returns: "about 1 hour ago"
 *
 * const dateTimeAgo = formatTimeAgo(new Date("2024-01-01"));
 * // Returns: "about 11 months ago"
 * ```
 */
export function formatTimeAgo(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true });
}
