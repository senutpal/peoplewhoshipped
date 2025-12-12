/**
 * @fileoverview Configuration constants for the leaderboard application
 * @module @leaderboard/config/constants
 *
 * This module defines application-wide constants used across different
 * packages. These values control batch processing, API pagination,
 * and rate limiting behaviors.
 *
 * @remarks
 * Constants are defined here to:
 * - Provide a single source of truth for magic numbers
 * - Enable easy tuning across the entire application
 * - Document the purpose and impact of each value
 *
 * @example
 * ```typescript
 * import {
 *   DEFAULT_BATCH_SIZE,
 *   DEFAULT_PAGE_LIMIT,
 *   MAX_CONCURRENT_REQUESTS
 * } from "@leaderboard/config";
 *
 * // Use in database operations
 * for (let i = 0; i < items.length; i += DEFAULT_BATCH_SIZE) {
 *   const batch = items.slice(i, i + DEFAULT_BATCH_SIZE);
 *   await db.insertBatch(batch);
 * }
 *
 * // Use in API pagination
 * const results = await api.list({ limit: DEFAULT_PAGE_LIMIT });
 * ```
 */

// =============================================================================
// Database Constants
// =============================================================================

/**
 * Default batch size for database operations.
 *
 * @remarks
 * This value controls how many records are processed in a single
 * database transaction. Larger values improve throughput but increase
 * memory usage and transaction complexity.
 *
 * **Considerations:**
 * - PGlite has lower memory overhead than traditional PostgreSQL
 * - 1000 is a good balance between performance and reliability
 * - Adjust based on record size and available memory
 *
 * @example
 * ```typescript
 * import { DEFAULT_BATCH_SIZE } from "@leaderboard/config";
 *
 * async function insertActivities(activities: Activity[]) {
 *   for (let i = 0; i < activities.length; i += DEFAULT_BATCH_SIZE) {
 *     const batch = activities.slice(i, i + DEFAULT_BATCH_SIZE);
 *     await db.insert(activityTable).values(batch);
 *   }
 * }
 * ```
 *
 * @constant
 * @default 1000
 */
export const DEFAULT_BATCH_SIZE = 1000;

// =============================================================================
// API Pagination Constants
// =============================================================================

/**
 * Default pagination limit for API calls.
 *
 * @remarks
 * This value controls how many items are requested per API page.
 * Most APIs have their own limits - this should be set to match
 * or be below those limits.
 *
 * **API Limits:**
 * - GitHub: 100 per page (max)
 * - Slack: 100 per page (default)
 *
 * Using the maximum allowed limit reduces the number of API calls
 * needed, improving performance and reducing rate limit pressure.
 *
 * @example
 * ```typescript
 * import { DEFAULT_PAGE_LIMIT } from "@leaderboard/config";
 *
 * async function fetchAllPullRequests(org: string) {
 *   let cursor: string | undefined;
 *   const allPRs: PullRequest[] = [];
 *
 *   do {
 *     const response = await github.pullRequests.list({
 *       org,
 *       per_page: DEFAULT_PAGE_LIMIT,
 *       cursor
 *     });
 *     allPRs.push(...response.data);
 *     cursor = response.nextCursor;
 *   } while (cursor);
 *
 *   return allPRs;
 * }
 * ```
 *
 * @constant
 * @default 100
 */
export const DEFAULT_PAGE_LIMIT = 100;

// =============================================================================
// Rate Limiting Constants
// =============================================================================

/**
 * Maximum number of concurrent API requests.
 *
 * @remarks
 * This value limits parallel API calls to prevent overwhelming
 * external services and triggering rate limits. The optimal value
 * depends on the specific API's rate limits and server capacity.
 *
 * **Rate Limit Considerations:**
 * - GitHub: 5000 requests/hour for authenticated users
 * - Slack: Varies by method, but burst limits apply
 *
 * A value of 5 provides good throughput while leaving headroom
 * for other applications sharing the same API credentials.
 *
 * @example
 * ```typescript
 * import { MAX_CONCURRENT_REQUESTS } from "@leaderboard/config";
 * import PQueue from "p-queue";
 *
 * const queue = new PQueue({ concurrency: MAX_CONCURRENT_REQUESTS });
 *
 * const results = await Promise.all(
 *   repos.map(repo =>
 *     queue.add(() => fetchRepoActivity(repo))
 *   )
 * );
 * ```
 *
 * @constant
 * @default 5
 */
export const MAX_CONCURRENT_REQUESTS = 5;
