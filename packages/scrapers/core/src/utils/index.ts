/**
 * @leaderboard/scraper-core - Utility Functions
 *
 * @packageDocumentation
 *
 * This module provides shared utility functions used across all scrapers.
 * Includes date manipulation, user validation, and debugging helpers.
 *
 * @module @leaderboard/scraper-core/utils
 */

import type { Activity } from "@leaderboard/database";
import type { UserWithLogin, UserWithTypename } from "../types";

// =============================================================================
// Date Utilities
// =============================================================================

/**
 * Generate a Unix timestamp string from a Date object.
 *
 * Converts a JavaScript Date to a Unix timestamp (seconds since epoch)
 * formatted as a string. This format is used by APIs like Slack.
 *
 * @param date - The Date object to convert
 * @returns Unix timestamp as a string (e.g., "1702425600")
 *
 * @example
 * ```typescript
 * const now = new Date("2024-12-13T00:00:00Z");
 * const timestamp = dateToUnixTimestamp(now);
 * console.log(timestamp); // "1702425600"
 * ```
 */
export function dateToUnixTimestamp(date: Date): string {
  return (date.getTime() / 1000).toString();
}

/**
 * Parse a Unix timestamp string to a Date object.
 *
 * Converts a Unix timestamp (seconds since epoch) to a JavaScript Date.
 * Accepts both string and number inputs for flexibility.
 *
 * @param timestamp - Unix timestamp as string or number
 * @returns JavaScript Date object
 *
 * @example
 * ```typescript
 * const date = unixTimestampToDate("1702425600");
 * console.log(date.toISOString()); // "2024-12-13T00:00:00.000Z"
 *
 * // Also works with numbers
 * const date2 = unixTimestampToDate(1702425600);
 * ```
 */
export function unixTimestampToDate(timestamp: string | number): Date {
  const ts = typeof timestamp === "string" ? parseFloat(timestamp) : timestamp;
  return new Date(ts * 1000);
}

/**
 * Get date range for scraping operations.
 *
 * Returns a date range suitable for scraping. If no `since` date is provided,
 * defaults to the start of the current day. The `latest` is always set to
 * the end of the current day (23:59:59.999).
 *
 * @param since - Optional start date for the range
 * @returns Object with `oldest` and `latest` Date objects
 *
 * @example
 * ```typescript
 * // Get today's range
 * const { oldest, latest } = getDateRange();
 * console.log(oldest); // Today at 00:00:00.000
 * console.log(latest); // Today at 23:59:59.999
 *
 * // Get range from a specific date
 * const customRange = getDateRange(new Date("2024-12-01"));
 * console.log(customRange.oldest); // Dec 1 at 00:00:00.000
 * ```
 */
export function getDateRange(since?: Date): { oldest: Date; latest: Date } {
  const oldest = since ? new Date(since) : new Date();
  oldest.setHours(0, 0, 0, 0);

  const latest = new Date();
  latest.setHours(23, 59, 59, 999);

  return { oldest, latest };
}

/**
 * Extract date string (YYYY-MM-DD) from a Date object.
 *
 * Returns the ISO date portion of a Date object, useful for
 * creating date-based activity slugs and grouping.
 *
 * @param date - The Date object to extract from
 * @returns Date string in YYYY-MM-DD format
 *
 * @example
 * ```typescript
 * const date = new Date("2024-12-13T15:30:00Z");
 * const dateStr = getDateString(date);
 * console.log(dateStr); // "2024-12-13"
 * ```
 */
export function getDateString(date: Date): string {
  return date.toISOString().split("T")[0] ?? "";
}

// =============================================================================
// User Utilities
// =============================================================================

/**
 * Check if a user is a bot based on their __typename (GitHub GraphQL).
 *
 * GitHub's GraphQL API includes a `__typename` field that indicates
 * the user type. This function checks if the type is "Bot".
 *
 * @param user - User object with optional __typename field
 * @returns True if the user is a bot, false otherwise
 *
 * @example
 * ```typescript
 * const prAuthor = { login: "dependabot", __typename: "Bot" };
 * if (isBot(prAuthor)) {
 *   trackBotUser(prAuthor.login);
 * }
 *
 * const humanUser = { login: "developer", __typename: "User" };
 * console.log(isBot(humanUser)); // false
 * ```
 */
export function isBot(user: UserWithTypename | null | undefined): boolean {
  return user?.__typename === "Bot";
}

/**
 * Safely extract login from a user object.
 *
 * Handles null/undefined user objects and missing login fields
 * gracefully, returning null if the login cannot be extracted.
 *
 * @param user - User object with optional login field
 * @returns The user's login string, or null if not available
 *
 * @example
 * ```typescript
 * const login1 = getLogin({ login: "developer" });
 * console.log(login1); // "developer"
 *
 * const login2 = getLogin(null);
 * console.log(login2); // null
 *
 * const login3 = getLogin({ login: null });
 * console.log(login3); // null
 * ```
 */
export function getLogin(user: UserWithLogin | null | undefined): string | null {
  return user?.login ?? null;
}

// =============================================================================
// Debugging Utilities
// =============================================================================

/**
 * Find duplicate slugs in an activity array (for debugging).
 *
 * Scans through an array of activities and logs warnings for any
 * duplicate slugs found. Useful for debugging scraper output
 * to ensure unique activity identification.
 *
 * @param activities - Array of Activity objects to check
 *
 * @example
 * ```typescript
 * const activities = await scraper.scrape(config);
 * findDuplicateSlugs(activities.contributions);
 * // Logs: "Duplicate slug found: pr_merged_repo#123" if duplicates exist
 * ```
 */
export function findDuplicateSlugs(activities: Activity[]): void {
  const slugCount = new Map<string, number>();

  for (const activity of activities) {
    const count = (slugCount.get(activity.slug) ?? 0) + 1;
    slugCount.set(activity.slug, count);

    if (count > 1) {
      console.warn(`Duplicate slug found: ${activity.slug}`);
    }
  }
}
