/**
 * Page Object Model for Leaderboard page.
 *
 * @module e2e/pages/leaderboard
 *
 * Responsibilities:
 * - Encapsulate page interactions
 * - Provide type-safe selectors
 * - Reusable test actions
 *
 * @example
 * const leaderboard = new LeaderboardPage(page);
 * await leaderboard.goto();
 * const topContributor = await leaderboard.getTopContributor();
 */

import { type Page, type Locator, expect } from "@playwright/test";

/**
 * Leaderboard page object.
 *
 * @class LeaderboardPage
 */
export class LeaderboardPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly contributorCards: Locator;
  readonly searchInput: Locator;
  readonly themeToggle: Locator;
  readonly loadingSpinner: Locator;

  /**
   * Initialize page object with locators.
   *
   * @param {Page} page - Playwright page instance
   */
  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { level: 1 });
    this.contributorCards = page.locator("[data-testid='contributor-card']");
    this.searchInput = page.getByPlaceholder(/search/i);
    this.themeToggle = page.getByRole("button", { name: /theme/i });
    this.loadingSpinner = page.locator("[data-loading='true']");
  }

  /**
   * Navigate to leaderboard page.
   */
  async goto() {
    // Use domcontentloaded instead of load to avoid HMR WebSocket hanging
    await this.page.goto("/", { waitUntil: "domcontentloaded" });
  }

  /**
   * Wait for the page to fully load.
   */
  async waitForLoad() {
    await this.page.waitForLoadState("domcontentloaded");
    const spinnerCount = await this.loadingSpinner.count();
    if (spinnerCount > 0) {
      await expect(this.loadingSpinner).toHaveCount(0, { timeout: 10000 });
    }
  }

  /**
   * Get the page title.
   *
   * @returns {Promise<string>} Page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Get the main heading text.
   *
   * @returns {Promise<string | null>} Heading text
   */
  async getHeadingText(): Promise<string | null> {
    return await this.heading.textContent();
  }

  /**
   * Get number of visible contributor cards.
   *
   * @returns {Promise<number>} Count of visible cards
   */
  async getContributorCount(): Promise<number> {
    return await this.contributorCards.count();
  }

  /**
   * Search for a contributor by name.
   *
   * @param {string} query - Search query
   */
  async searchContributor(query: string) {
    if (await this.searchInput.isVisible()) {
      await this.searchInput.fill(query);
      try {
        await this.page.waitForSelector("[data-testid='contributor-card']", {
          state: "attached",
          timeout: 10000,
        });
      } catch (error) {
        if (error instanceof Error && error.name === "TimeoutError") {
          console.log("No contributor cards found after search");
        } else {
          console.warn(
            "Unexpected error waiting for contributor cards:",
            error,
          );
        }
      }
    }
  }

  /**
   * Toggle theme between light and dark.
   */
  async toggleTheme() {
    if (await this.themeToggle.isVisible()) {
      await this.themeToggle.click();
    }
  }

  /**
   * Get current theme (light/dark).
   *
   * @returns {Promise<string>} Current theme
   */
  async getCurrentTheme(): Promise<string> {
    const html = this.page.locator("html");
    const className = await html.getAttribute("class");
    return className?.includes("dark") ? "dark" : "light";
  }

  /**
   * Check if a specific contributor is visible.
   *
   * @param {string} name - Contributor name to check
   * @returns {Promise<boolean>} True if visible
   */
  async isContributorVisible(name: string): Promise<boolean> {
    const contributor = this.page.getByText(name, { exact: false });
    return await contributor.isVisible();
  }

  /**
   * Click on a contributor to view their profile.
   *
   * @param {string} name - Contributor name
   */
  async viewContributorProfile(name: string) {
    await this.page.getByText(name, { exact: false }).first().click();
  }
}
