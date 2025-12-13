/**
 * @leaderboard/scraper-roles - Contributor role synchronization
 *
 * @packageDocumentation
 *
 * This package provides functionality to synchronize contributor roles
 * from markdown frontmatter files in a leaderboard data repository.
 *
 * ## Features
 *
 * - **Frontmatter Extraction**: Parse YAML frontmatter from markdown files
 * - **Role Updates**: Update contributor roles in the database
 * - **Slack User ID Sync**: Sync Slack user IDs from frontmatter
 *
 * ## Usage
 *
 * ```typescript
 * import { updateRoles, extractFrontmatterData } from "@leaderboard/scraper-roles";
 *
 * // Run role update for all contributors
 * await updateRoles({
 *   baseUrl: "https://raw.githubusercontent.com/org/leaderboard-data/main/contributors"
 * });
 *
 * // Or extract frontmatter from markdown content
 * const data = extractFrontmatterData(markdownContent);
 * console.log(data.role); // "contributor"
 * console.log(data.slack); // "U12345678"
 * ```
 *
 * @module @leaderboard/scraper-roles
 */

export { extractFrontmatterData, type FrontmatterData } from "./frontmatter";
export { updateRoles, updateContributorRole, type UpdateRolesOptions } from "./scraper";
