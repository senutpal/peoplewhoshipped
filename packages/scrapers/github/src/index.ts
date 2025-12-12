/**
 * @leaderboard/scraper-github - GitHub contribution scraper
 */

import { BaseScraper, type ScraperResult } from "@leaderboard/scraper-core";
import type { LeaderboardConfig } from "@leaderboard/config";

class GitHubScraper extends BaseScraper {
  name = "GitHub";

  async scrape(config: LeaderboardConfig): Promise<ScraperResult> {
    this.log("Starting GitHub scrape...");

    if (!config.github?.token) {
      this.error("No GitHub token configured");
      return { contributions: [], errors: [new Error("No GitHub token")] };
    }

    // TODO: Implement GitHub API scraping using @octokit/rest

    this.log("GitHub scrape complete");
    return { contributions: [], errors: [] };
  }
}

const scraper = new GitHubScraper();

// Main execution
if (import.meta.main) {
  console.log("Running GitHub scraper...");
  scraper.scrape({}).then((result) => {
    console.log("Result:", result);
  });
}

export { GitHubScraper };
