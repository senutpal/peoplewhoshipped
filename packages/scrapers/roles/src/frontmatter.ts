/**
 * @fileoverview Frontmatter extraction utilities
 * @module @leaderboard/scraper-roles/frontmatter
 *
 * This module provides functions for extracting role and Slack user ID
 * information from YAML frontmatter in markdown contributor files.
 */

// =============================================================================
// Types
// =============================================================================

/**
 * Data extracted from markdown frontmatter.
 */
export interface FrontmatterData {
  /** Contributor role (e.g., "contributor", "maintainer", "core") */
  role: string | null;
  /** Slack user ID (e.g., "U12345678") */
  slack: string | null;
}

// =============================================================================
// Frontmatter Extraction
// =============================================================================

/**
 * Extract role and slack from markdown frontmatter.
 *
 * @param markdown - The markdown content with frontmatter
 * @returns Object containing the extracted role and slack user ID
 *
 * @remarks
 * The function parses YAML frontmatter between `---` delimiters and extracts
 * the `role` and `slack` fields. Values can be quoted or unquoted.
 *
 * @example
 * ```typescript
 * const markdown = `---
 * name: John Doe
 * role: contributor
 * slack: U12345678
 * ---
 *
 * Bio content here
 * `;
 *
 * const { role, slack } = extractFrontmatterData(markdown);
 * console.log(role);  // "contributor"
 * console.log(slack); // "U12345678"
 * ```
 *
 * @example
 * ```typescript
 * // Handles quoted values
 * const markdown = `---
 * role: "maintainer"
 * slack: 'U67890ABC'
 * ---`;
 *
 * const { role, slack } = extractFrontmatterData(markdown);
 * console.log(role);  // "maintainer"
 * console.log(slack); // "U67890ABC"
 * ```
 */
export function extractFrontmatterData(markdown: string): FrontmatterData {
  // Match frontmatter between --- delimiters
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---/;
  const match = markdown.match(frontmatterRegex);

  if (!match || !match[1]) {
    return { role: null, slack: null };
  }

  const frontmatter = match[1];

  // Extract role field from frontmatter
  const roleRegex = /^role:\s*(.+)$/m;
  const roleMatch = frontmatter.match(roleRegex);
  const role = roleMatch?.[1]?.trim().replace(/^["']|["']$/g, "") || null;

  // Extract slack field from frontmatter
  const slackRegex = /^slack:\s*(.+)$/m;
  const slackMatch = frontmatter.match(slackRegex);
  let slack = slackMatch?.[1]?.trim().replace(/^["']|["']$/g, "") || null;

  // If slack is empty string, treat it as null
  if (slack === "") {
    slack = null;
  }

  return { role, slack };
}
