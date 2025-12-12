/**
 * @leaderboard/scraper-github - GitHub contribution scraper
 *
 * @packageDocumentation
 *
 * This package scrapes GitHub activity from a configured organization
 * and converts them to contributor activities for the leaderboard.
 *
 * ## Features
 *
 * - Fetches repositories from a GitHub organization
 * - Scrapes issues, pull requests, comments, and commits
 * - Uses GraphQL API for efficient data retrieval
 * - Tracks bot users for role assignment
 * - Handles pagination automatically
 * - Parallel fetching within repositories
 *
 * ## Scraped Activities
 *
 * - **Issues**: opened, assigned, closed
 * - **Pull Requests**: opened, merged, reviewed
 * - **Comments**: on issues and PRs
 * - **Commits**: from push events
 *
 * ## Configuration
 *
 * Required environment variables:
 * - `GITHUB_TOKEN`: GitHub Personal Access Token
 * - `GITHUB_ORG`: GitHub Organization name
 *
 * ## Usage
 *
 * ```typescript
 * import { GitHubScraper } from "@leaderboard/scraper-github";
 *
 * const scraper = new GitHubScraper();
 * const result = await scraper.scrape();
 *
 * console.log(`Processed ${result.stats.processed} activities`);
 * console.log(`Created ${result.contributions.length} contributions`);
 * ```
 *
 * @module @leaderboard/scraper-github
 */

// =============================================================================
// Type Exports
// =============================================================================

export type {
  Activity,
  Repository,
  PullRequest,
  PullRequestReview,
  Issue,
  IssueAssignEvent,
  Comment,
  Commit,
  GitHubUser,
} from "./types";

// =============================================================================
// Client Exports
// =============================================================================

export {
  getOctokit,
  getGitHubOrg,
  getGitHubToken,
  resetOctokitClient,
} from "./client";

// =============================================================================
// Service Exports - Fetchers
// =============================================================================

export { getRepositories } from "./services/repository-fetcher";
export { getPullRequestsAndReviews } from "./services/pr-fetcher";
export { getIssues } from "./services/issue-fetcher";
export { getComments } from "./services/comment-fetcher";
export { getCommitsFromPushEvents } from "./services/commit-fetcher";

// =============================================================================
// Service Exports - Bot Tracking
// =============================================================================

export {
  trackBotUser,
  getBotUsers,
  getBotUserCount,
  clearBotUsers,
} from "./services/bot-tracker";

// =============================================================================
// Service Exports - Activity Generators
// =============================================================================

export {
  activitiesFromIssues,
  activitiesFromComments,
  activitiesFromPullRequests,
  activitiesFromCommits,
} from "./services/activity-generators";

// =============================================================================
// Scraper Exports
// =============================================================================

export { GitHubScraper, main } from "./scraper";

// =============================================================================
// CLI Entry Point
// =============================================================================

// Run if executed directly (e.g., `bun run src/index.ts`)
if (import.meta.main) {
  const { main: runMain } = await import("./scraper");
  runMain().catch(console.error);
}
