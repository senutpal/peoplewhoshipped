/**
 * @fileoverview Date utility functions
 * @module @leaderboard/utils/date
 *
 * This module provides date manipulation and formatting utilities
 * for the leaderboard system.
 */

import { formatDistanceToNow } from "date-fns";

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
 * // startDate: 30 days ago
 * // endDate: now
 * ```
 */
export function getDateRange(period: DateRangePeriod): {
  startDate: Date;
  endDate: Date;
} {
  const endDate = new Date();
  const startDate = new Date();

  switch (period) {
    case "week":
      startDate.setDate(endDate.getDate() - 7);
      break;
    case "month":
      startDate.setDate(endDate.getDate() - 30);
      break;
    case "year":
      startDate.setDate(endDate.getDate() - 365);
      break;
  }

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
