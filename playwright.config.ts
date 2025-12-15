/**
 * Playwright E2E testing configuration.
 *
 * @module playwright.config
 *
 * Test Browsers:
 * - Chromium (desktop & mobile)
 * - Firefox
 * - WebKit (Safari)
 *
 * @see {@link https://playwright.dev/docs/test-configuration}
 */

import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  // ==========================================================================
  // Test Discovery
  // ==========================================================================

  /** Directory containing E2E test files */
  testDir: "./apps/web/e2e",

  /** Test file pattern - use .e2e.ts to avoid conflicts with Bun's test runner */
  testMatch: "**/*.e2e.ts",

  // ==========================================================================
  // Execution Settings
  // ==========================================================================

  /** Run tests in files in parallel */
  fullyParallel: true,

  /** Fail the build on CI if test.only was accidentally left in */
  forbidOnly: !!process.env.CI,

  /** Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /** Use single worker for stable sequential execution */
  workers: 1,

  /** Test timeout (60 seconds) */
  timeout: 60000,

  /** Expect timeout (5 seconds) */
  expect: {
    timeout: 5000,
  },

  // ==========================================================================
  // Reporting
  // ==========================================================================

  reporter: [
    ["html", { outputFolder: "playwright-report" }],
    ["json", { outputFile: "test-results/e2e-results.json" }],
    ["junit", { outputFile: "test-results/e2e-junit.xml" }],
    ["list"],
  ],

  // ==========================================================================
  // Shared Settings
  // ==========================================================================

  use: {
    /** Base URL for navigation */
    baseURL: "http://localhost:3000",

    /** Collect trace when retrying */
    trace: "on-first-retry",

    /** Take screenshot on failure */
    screenshot: "only-on-failure",

    /** Record video on failure */
    video: "retain-on-failure",

    /** Consistent viewport */
    viewport: { width: 1280, height: 720 },


  },

  // ==========================================================================
  // Projects (Browser Configurations)
  // ==========================================================================

  projects: [
    // Desktop Browsers
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },

    // Mobile Browsers
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 13"] },
    },
  ],

  // ==========================================================================
  // Web Server
  // ==========================================================================

  webServer: {
    // Build and serve the production app (NOT the dev server - HMR breaks E2E tests)
    command: "bun run --filter @leaderboard/web build && bun run --filter @leaderboard/web start",
    url: "http://localhost:3000",
    // Always start a fresh production server - dev server with HMR causes timeouts
    // Set PLAYWRIGHT_REUSE_SERVER=true to reuse an existing production server
    reuseExistingServer: !!process.env.PLAYWRIGHT_REUSE_SERVER,
    timeout: 180000, // 3 minutes to build and start
  },

  // ==========================================================================
  // Output Directories
  // ==========================================================================

  outputDir: "test-results/e2e",
});
