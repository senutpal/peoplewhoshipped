/**
 * @fileoverview Configuration validation functions and type guards
 * @module @leaderboard/config/validators
 *
 * This module provides validation functions and TypeScript type guards
 * to ensure configuration objects are complete and valid at runtime.
 *
 * @remarks
 * Type guards narrow the configuration types, allowing TypeScript to
 * understand when optional properties are guaranteed to be present.
 * This enables safer access to nested configuration properties.
 *
 * @example
 * ```typescript
 * import { loadConfig, validateGitHubConfig, validateSlackConfig } from "@leaderboard/config";
 *
 * const config = loadConfig();
 *
 * if (validateGitHubConfig(config)) {
 *   // config.github is now guaranteed to be GitHubConfig
 *   console.log(`GitHub org: ${config.github.org}`);
 * }
 *
 * if (validateSlackConfig(config)) {
 *   // config.slack is now guaranteed to be SlackConfig
 *   console.log(`Slack channel: ${config.slack.channel}`);
 * }
 * ```
 */

import type { LeaderboardConfig, GitHubConfig, SlackConfig } from "../types";

// =============================================================================
// Service-Specific Type Guards
// =============================================================================

/**
 * Type guard that validates GitHub configuration is complete and valid.
 *
 * @param config - The leaderboard configuration to validate
 * @returns `true` if the configuration has valid GitHub settings,
 *          narrow the type to include `github: GitHubConfig`
 *
 * @remarks
 * This type guard checks that:
 * - The `github` property is defined
 * - The `token` property is a non-empty string
 * - The `org` property is a non-empty string
 *
 * When this function returns `true`, TypeScript narrows the config type
 * to guarantee that `config.github` is a complete `GitHubConfig`.
 *
 * @example
 * ```typescript
 * const config = loadConfig();
 *
 * if (validateGitHubConfig(config)) {
 *   // TypeScript knows config.github is GitHubConfig, not undefined
 *   const client = new GitHubClient(config.github.token);
 *   await client.getOrganization(config.github.org);
 * }
 * ```
 */
export function validateGitHubConfig(
  config: LeaderboardConfig
): config is LeaderboardConfig & { github: GitHubConfig } {
  return (
    config.github !== undefined &&
    config.github.token !== "" &&
    config.github.org !== ""
  );
}

/**
 * Type guard that validates Slack configuration is complete and valid.
 *
 * @param config - The leaderboard configuration to validate
 * @returns `true` if the configuration has valid Slack settings,
 *          narrow the type to include `slack: SlackConfig`
 *
 * @remarks
 * This type guard checks that:
 * - The `slack` property is defined
 * - The `token` property is a non-empty string
 * - The `channel` property is a non-empty string
 *
 * When this function returns `true`, TypeScript narrows the config type
 * to guarantee that `config.slack` is a complete `SlackConfig`.
 *
 * @example
 * ```typescript
 * const config = loadConfig();
 *
 * if (validateSlackConfig(config)) {
 *   // TypeScript knows config.slack is SlackConfig, not undefined
 *   const client = new WebClient(config.slack.token);
 *   await client.conversations.history({ channel: config.slack.channel });
 * }
 * ```
 */
export function validateSlackConfig(
  config: LeaderboardConfig
): config is LeaderboardConfig & { slack: SlackConfig } {
  return (
    config.slack !== undefined &&
    config.slack.token !== "" &&
    config.slack.channel !== ""
  );
}

// =============================================================================
// Complete Configuration Validation
// =============================================================================

/**
 * Validates that the complete configuration has all required fields.
 *
 * @param config - The leaderboard configuration to validate
 * @returns `true` if the configuration is valid, `false` otherwise
 *
 * @remarks
 * This function validates the minimum required configuration for the
 * application to function. Currently, this includes:
 * - A valid database path
 *
 * Unlike the type guards above, this function does not narrow types -
 * it simply returns a boolean indicating validity and logs errors
 * for debugging purposes.
 *
 * @example
 * ```typescript
 * const config = loadConfig();
 *
 * if (!validateConfig(config)) {
 *   console.error("Configuration validation failed");
 *   process.exit(1);
 * }
 *
 * // Proceed with valid configuration
 * await initializeDatabase(config.database);
 * ```
 */
export function validateConfig(config: LeaderboardConfig): boolean {
  if (!config.database.path) {
    console.error("Database path is required");
    return false;
  }
  return true;
}
