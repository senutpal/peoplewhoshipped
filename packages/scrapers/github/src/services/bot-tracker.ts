/**
 * @fileoverview Bot user tracking utilities
 * @module @leaderboard/scraper-github/services/bot-tracker
 *
 * This module provides utilities for tracking bot users detected during
 * GitHub scraping. Bot users are identified by their __typename in
 * GraphQL responses or by the "Bot" type in REST responses.
 */

// =============================================================================
// Bot User Tracking
// =============================================================================

/**
 * Set of detected bot usernames.
 * @internal
 */
const botUsers = new Set<string>();

/**
 * Tracks a bot user by adding their username to the tracking set.
 *
 * @description
 * Call this function when a bot user is detected during scraping.
 * Bot users are later updated in the database to have the "bot" role.
 *
 * @param login - The GitHub username of the bot
 *
 * @example
 * ```typescript
 * if (user.__typename === "Bot") {
 *   trackBotUser(user.login);
 * }
 * ```
 */
export function trackBotUser(login: string): void {
  botUsers.add(login);
}

/**
 * Returns all tracked bot usernames.
 *
 * @description
 * Returns an array of all bot usernames detected during the current
 * scrape session. Used to update bot roles in the database after
 * scraping is complete.
 *
 * @returns Array of bot usernames
 *
 * @example
 * ```typescript
 * const bots = getBotUsers();
 * console.log(`Found ${bots.length} bot users`);
 * await updateBotRoles(bots);
 * ```
 */
export function getBotUsers(): string[] {
  return Array.from(botUsers);
}

/**
 * Returns the count of tracked bot users.
 *
 * @description
 * Returns the number of unique bot users detected during the current
 * scrape session.
 *
 * @returns Number of tracked bot users
 *
 * @example
 * ```typescript
 * console.log(`Detected ${getBotUserCount()} bot users`);
 * ```
 */
export function getBotUserCount(): number {
  return botUsers.size;
}

/**
 * Clears all tracked bot users.
 *
 * @description
 * Resets the bot tracking set. This should be called at the start
 * of a new scrape session to ensure accurate tracking.
 *
 * @example
 * ```typescript
 * // At the start of a new scrape
 * clearBotUsers();
 * ```
 */
export function clearBotUsers(): void {
  botUsers.clear();
}
