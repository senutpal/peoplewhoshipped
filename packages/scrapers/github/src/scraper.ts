/**
 * @fileoverview GitHubScraper class implementation
 * @module @leaderboard/scraper-github/scraper
 *
 * This module provides the main GitHubScraper class that orchestrates
 * the full GitHub activity scraping workflow.
 */

import { subDays } from "date-fns";
import {
  addActivities,
  addContributors,
  updateBotRoles,
  upsertActivityDefinitions,
  type Activity,
} from "@leaderboard/database";
import {
  BaseScraper,
  GITHUB_ACTIVITY_DEFINITIONS,
  findDuplicateSlugs,
  type ScraperResult,
} from "@leaderboard/scraper-core";
import { loadConfig, validateGitHubConfig } from "@leaderboard/config";

// Import services
import { getRepositories } from "./services/repository-fetcher";
import { getPullRequestsAndReviews } from "./services/pr-fetcher";
import { getIssues } from "./services/issue-fetcher";
import { getComments } from "./services/comment-fetcher";
import { getCommitsFromPushEvents } from "./services/commit-fetcher";
import { getBotUsers, getBotUserCount, clearBotUsers } from "./services/bot-tracker";
import {
  activitiesFromIssues,
  activitiesFromComments,
  activitiesFromPullRequests,
  activitiesFromCommits,
} from "./services/activity-generators";

// =============================================================================
// GitHubScraper Class
// =============================================================================

/**
 * Scraper for GitHub contribution activities.
 *
 * @description
 * The GitHubScraper connects to a GitHub organization, fetches
 * activity data from all repositories, and converts them to
 * contributor activities. It extends the BaseScraper class for
 * consistent logging and error handling.
 *
 * @extends BaseScraper
 *
 * @remarks
 * **Scraped Activities**:
 * - Issues: opened, assigned, closed
 * - Pull Requests: opened, merged, reviewed
 * - Comments on issues/PRs
 * - Commits from push events
 *
 * **Bot Detection**: Automatically detects and tracks bot users
 * based on their __typename in GraphQL responses.
 *
 * **Configuration**: Requires the following environment variables:
 * - `GITHUB_TOKEN`: GitHub Personal Access Token
 * - `GITHUB_ORG`: GitHub Organization name
 *
 * **Scrape Days**: Configurable via `scrapeDays` in the leaderboard config
 *
 * @example
 * ```typescript
 * import { GitHubScraper } from "@leaderboard/scraper-github";
 *
 * const scraper = new GitHubScraper();
 * const result = await scraper.scrape();
 *
 * console.log(`Processed ${result.stats.processed} activities`);
 * console.log(`From ${result.contributions.length} total contributions`);
 * ```
 */
export class GitHubScraper extends BaseScraper {
  /**
   * The display name of this scraper, used in logs.
   */
  name = "GitHub";

  /**
   * Executes the GitHub scraping workflow.
   *
   * @description
   * Fetches contribution data from all repositories in the configured
   * organization and converts them to contributor activities. The
   * scrape period is determined by the `scrapeDays` configuration option.
   *
   * **Workflow**:
   * 1. Validate GitHub configuration
   * 2. Fetch all recently updated repositories
   * 3. For each repository, fetch in parallel:
   *    - Issues with timeline events
   *    - Comments on issues/PRs
   *    - Pull requests with reviews
   *    - Commits from push events
   * 4. Convert fetched data to activities
   * 5. Save activities to database
   * 6. Update bot user roles
   *
   * @returns Promise resolving to ScraperResult with contributions and stats
   *
   * @example
   * ```typescript
   * const scraper = new GitHubScraper();
   * const result = await scraper.scrape();
   *
   * if (result.errors.length > 0) {
   *   console.error("Scrape completed with errors:", result.errors);
   * }
   * ```
   */
  async scrape(): Promise<ScraperResult> {
    const config = loadConfig();
    const result = this.createEmptyResult();

    // Clear previous bot tracking
    clearBotUsers();

    // Validate GitHub configuration
    if (!validateGitHubConfig(config)) {
      this.error("GitHub configuration is incomplete");
      result.errors.push(new Error("GitHub configuration is incomplete"));
      return result;
    }

    // Calculate the start date for scraping
    const since = config.scrapeDays
      ? subDays(new Date(), config.scrapeDays).toISOString()
      : undefined;

    this.log(`Starting GitHub scrape (last ${config.scrapeDays} days)...`);

    const org = config.github.org;
    const repos = await getRepositories(org, since);
    this.log(`Found ${repos.length} repositories to process`);

    for (const repo of repos) {
      this.log(`Processing repository: ${repo.name}`);

      try {
        // Parallelize fetching from repository
        const [issues, comments, pullRequests, commits] = await Promise.all([
          getIssues(repo.name, since),
          getComments(repo.name, since),
          getPullRequestsAndReviews(repo.name, since),
          getCommitsFromPushEvents(repo.name, since),
        ]);

        // Generate activities from fetched data
        const activities: Activity[] = [
          ...activitiesFromIssues(issues, repo.name),
          ...activitiesFromComments(comments, repo.name),
          ...activitiesFromPullRequests(pullRequests, repo.name),
          ...activitiesFromCommits(commits),
        ];

        // Check for duplicate slugs (warning only)
        findDuplicateSlugs(activities);

        // Add contributors and activities to database
        await addContributors(activities.map((a) => a.contributor));
        await addActivities(activities);

        result.contributions.push(...activities);
        result.stats.processed += activities.length;
      } catch (error) {
        this.error(`Failed to process repository ${repo.name}`, error as Error);
        result.errors.push(error as Error);
        result.stats.failed++;
      }
    }

    // Update all bot contributors' roles
    this.log(`Found ${getBotUserCount()} bot users`);
    await updateBotRoles(getBotUsers());

    this.log(`GitHub scrape complete: ${result.stats.processed} activities processed`);
    return result;
  }
}

// =============================================================================
// Main Execution
// =============================================================================

/**
 * Main entry point for CLI execution.
 *
 * @description
 * Prepares the database (registers activity definitions) and runs
 * the GitHub scraper. This function is called when the package
 * is executed directly via `bun run scrape` or `bun run src/index.ts`.
 *
 * @returns Promise that resolves when scraping is complete
 *
 * @example
 * ```bash
 * # Run the scraper
 * cd packages/scrapers/github
 * bun run scrape
 * ```
 */
export async function main(): Promise<void> {
  // Prepare activity definitions
  console.log("Preparing activity definitions...");
  await upsertActivityDefinitions(GITHUB_ACTIVITY_DEFINITIONS);

  // Run the scraper
  const scraper = new GitHubScraper();
  await scraper.scrape();
}
