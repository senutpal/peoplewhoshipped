/**
 * @leaderboard/scraper-core - Core scraper functionality shared between scrapers
 */

import type { Contribution } from "@leaderboard/database";
import type { LeaderboardConfig } from "@leaderboard/config";

export interface ScraperResult {
  contributions: Contribution[];
  errors: Error[];
}

export interface Scraper {
  name: string;
  scrape(config: LeaderboardConfig): Promise<ScraperResult>;
}

export abstract class BaseScraper implements Scraper {
  abstract name: string;
  abstract scrape(config: LeaderboardConfig): Promise<ScraperResult>;

  protected log(message: string): void {
    console.log(`[${this.name}] ${message}`);
  }

  protected error(message: string, error?: Error): void {
    console.error(`[${this.name}] ERROR: ${message}`, error);
  }
}
