/**
 * @fileoverview Octokit client singleton for GitHub API access
 * @module @leaderboard/scraper-github/client
 *
 * This module provides a singleton Octokit client instance for interacting
 * with the GitHub API. It handles environment variable validation and
 * provides helper functions for accessing configuration.
 */

import { Octokit } from "octokit";

// =============================================================================
// Client Singleton
// =============================================================================

/**
 * Singleton Octokit client instance.
 * @internal
 */
let octokitInstance: Octokit | null = null;

/**
 * Returns the GitHub organization name from environment variables.
 *
 * @description
 * Reads the `GITHUB_ORG` environment variable which specifies the
 * GitHub organization to scrape repositories from.
 *
 * @returns The configured GitHub organization name
 * @throws {Error} If `GITHUB_ORG` environment variable is not set
 *
 * @example
 * ```typescript
 * const org = getGitHubOrg();
 * console.log(`Scraping organization: ${org}`);
 * ```
 */
export function getGitHubOrg(): string {
  const org = process.env.GITHUB_ORG;

  if (!org) {
    throw new Error("'GITHUB_ORG' environment variable is not set");
  }

  return org;
}

/**
 * Returns the GitHub API token from environment variables.
 *
 * @description
 * Reads the `GITHUB_TOKEN` environment variable which provides
 * authentication for the GitHub API. This token should have
 * appropriate scopes for reading repository data.
 *
 * @returns The configured GitHub API token
 * @throws {Error} If `GITHUB_TOKEN` environment variable is not set
 *
 * @example
 * ```typescript
 * const token = getGitHubToken();
 * // Token is used internally by getOctokit()
 * ```
 */
export function getGitHubToken(): string {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    throw new Error("'GITHUB_TOKEN' environment variable is not set");
  }

  return token;
}

/**
 * Returns the Octokit client singleton.
 *
 * @description
 * Creates and returns a singleton Octokit instance authenticated with
 * the configured GitHub token. The instance is reused across all API
 * calls to maintain rate limit state and connection pooling.
 *
 * @returns The Octokit client instance
 * @throws {Error} If required environment variables are not set
 *
 * @example
 * ```typescript
 * const octokit = getOctokit();
 *
 * const response = await octokit.request("GET /repos/{owner}/{repo}", {
 *   owner: "org",
 *   repo: "my-repo"
 * });
 * ```
 */
export function getOctokit(): Octokit {
  if (octokitInstance) {
    return octokitInstance;
  }

  // Validate environment variables (will throw if not set)
  getGitHubOrg();
  const token = getGitHubToken();

  octokitInstance = new Octokit({ auth: token });
  return octokitInstance;
}

/**
 * Resets the Octokit client singleton.
 *
 * @description
 * Clears the cached Octokit instance, allowing a fresh client to be
 * created on the next call to `getOctokit()`. Primarily used for
 * testing purposes to reset state between tests.
 *
 * @example
 * ```typescript
 * // In test teardown
 * resetOctokitClient();
 * ```
 */
export function resetOctokitClient(): void {
  octokitInstance = null;
}
