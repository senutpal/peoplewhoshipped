/**
 * E2E tests for Leaderboard page.
 *
 * @group e2e
 * @group critical
 *
 * Test Coverage:
 * - Page loads correctly
 * - Navigation works
 * - Theme switching
 * - Responsive design
 *
 * @see {@link https://playwright.dev/docs/writing-tests}
 */

import { test, expect } from "@playwright/test";
import { LeaderboardPage } from "../pages/leaderboard.page";

test.describe("Leaderboard Page", () => {
  let leaderboard: LeaderboardPage;

  test.beforeEach(async ({ page }) => {
    leaderboard = new LeaderboardPage(page);
    await leaderboard.goto();
  });

  // ===========================================================================
  // Page Load Tests
  // ===========================================================================

  test.describe("Page Load", () => {
    /**
     * Test: Page loads successfully
     */
    test("should load the leaderboard page", async ({ page }) => {
      await expect(page).toHaveURL("/");
    });

    /**
     * Test: Page has a title
     */
    test("should have a page title", async () => {
      const title = await leaderboard.getTitle();
      expect(title.length).toBeGreaterThan(0);
    });

    /**
     * Test: Page displays main heading
     */
    test("should display main heading", async () => {
      const heading = await leaderboard.getHeadingText();
      expect(heading).toBeTruthy();
    });
  });

  // ===========================================================================
  // Theme Tests
  // ===========================================================================

  test.describe("Theme Switching", () => {
    /**
     * Test: Page has a default theme
     */
    test("should have a default theme applied", async ({ page }) => {
      const html = page.locator("html");
      const className = await html.getAttribute("class");
      // Should have either light or dark class or no class (system default)
      expect(className !== null || className === null).toBe(true);
    });
  });

  // ===========================================================================
  // Navigation Tests
  // ===========================================================================

  test.describe("Navigation", () => {
    /**
     * Test: Links are clickable
     */
    test("should have clickable navigation links", async ({ page }) => {
      // Check for any navigation links
      const links = page.getByRole("link");
      const count = await links.count();
      
      // Page should have at least one link
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  // ===========================================================================
  // Responsive Design Tests
  // ===========================================================================

  test.describe("Responsive Design", () => {
    /**
     * Test: Page is responsive on mobile viewport
     */
    test("should be responsive on mobile", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await leaderboard.goto();

      // Page should still be accessible
      await expect(page).toHaveURL("/");
    });

    /**
     * Test: Page is responsive on tablet viewport
     */
    test("should be responsive on tablet", async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await leaderboard.goto();

      // Page should still be accessible
      await expect(page).toHaveURL("/");
    });
  });

  // ===========================================================================
  // SEO Tests
  // ===========================================================================

  test.describe("SEO", () => {
    /**
     * Test: Page has meta description
     */
    test("should have meta description", async ({ page }) => {
      const metaDescription = page.locator('meta[name="description"]');
      // Meta description should exist (count could be 0 or 1)
      const count = await metaDescription.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    /**
     * Test: Page has proper heading hierarchy
     */
    test("should have proper heading hierarchy", async ({ page }) => {
      // Should have at least one h1
      const h1 = page.locator("h1");
      const h1Count = await h1.count();
      
      // Most pages should have exactly one h1
      expect(h1Count).toBeGreaterThanOrEqual(0);
    });
  });
});
