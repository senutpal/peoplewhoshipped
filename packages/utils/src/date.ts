/**
 * @fileoverview Date utility functions
 * @module @leaderboard/utils/date
 *
 * This module provides date manipulation and formatting utilities
 * for the leaderboard system.
 */

import {
  formatDistanceToNow,
  subDays,
  subMonths,
  subYears,
  startOfDay,
  endOfDay,
} from "date-fns";

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
 *
 * const { startDate, endDate } = getDateRange("month");
 * // startDate: 1 month ago
 * // endDate: now
 * ```
 */
export function getDateRange(period: DateRangePeriod): {
  startDate: Date;
  endDate: Date;
} {
  const endDate = endOfDay(new Date());

  switch (period) {
    case "week":
      return {
        startDate: startOfDay(subDays(endDate, 7)),
        endDate,
      };
    case "month":
      return {
        startDate: startOfDay(subMonths(endDate, 1)),
        endDate,
      };
    case "year":
      return {
        startDate: startOfDay(subYears(endDate, 1)),
        endDate,
      };
  }
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
