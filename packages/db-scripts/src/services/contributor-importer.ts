/**
 * @fileoverview Contributor import service
 * @module @leaderboard/db-scripts/services/contributor-importer
 *
 * This module handles importing contributor data from markdown files
 * in the data directory to the database.
 */

import { readdir, readFile } from "node:fs/promises";
import { join, basename, extname } from "node:path";
import matter from "gray-matter";
import { addContributors } from "@leaderboard/database";
import type { ContributorMeta, ImportResult } from "../types";

// =============================================================================
// Constants
// =============================================================================

/**
 * Directory name for contributor files relative to data path.
 * @internal
 */
const CONTRIBUTORS_DIR = "contributors";

/**
 * File extension for contributor markdown files.
 * @internal
 */
const MARKDOWN_EXT = ".md";

/**
 * Prefix for files that should be skipped (e.g., _sample.md).
 * @internal
 */
const SKIP_PREFIX = "_";

// =============================================================================
// Import Functions
// =============================================================================

/**
 * Import contributors from markdown files in data/contributors/.
 *
 * @description
 * Reads all markdown files from the contributors directory (excluding
 * files starting with `_`), extracts the GitHub username from the
 * filename, and imports them into the database.
 *
 * Each contributor file should have YAML frontmatter with optional
 * metadata like name, role, title, and social profiles.
 *
 * @param dataPath - Path to the data directory
 *
 * @returns Array of imported GitHub usernames
 *
 * @example
 * ```typescript
 * import { importContributors } from "./services/contributor-importer";
 *
 * const contributors = await importContributors("./data");
 * console.log(`Imported: ${contributors.join(", ")}`);
 * ```
 */
export async function importContributors(dataPath: string): Promise<string[]> {
  const contributorsDir = join(dataPath, CONTRIBUTORS_DIR);
  const contributors: string[] = [];

  try {
    const files = await readdir(contributorsDir);
    const mdFiles = files.filter(
      (f) => extname(f) === MARKDOWN_EXT && !f.startsWith(SKIP_PREFIX)
    );

    for (const file of mdFiles) {
      const filePath = join(contributorsDir, file);
      const content = await readFile(filePath, "utf-8");
      const { data } = matter(content) as { data: ContributorMeta };

      // Extract GitHub username from filename (e.g., "username.md" -> "username")
      const github = basename(file, MARKDOWN_EXT);
      contributors.push(github);

      console.log(`   📝 Found contributor: ${github} (${data.name || "N/A"})`);
    }

    if (contributors.length > 0) {
      await addContributors(contributors);
      console.log(`   ✅ Imported ${contributors.length} contributors`);
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      console.log("   ⚠️  No contributors directory found, skipping...");
    } else {
      throw error;
    }
  }

  return contributors;
}

/**
 * Get contributor metadata from a markdown file.
 *
 * @description
 * Reads a single contributor markdown file and returns its
 * parsed frontmatter metadata.
 *
 * @param filePath - Absolute path to the contributor markdown file
 *
 * @returns Parsed contributor metadata from frontmatter
 *
 * @example
 * ```typescript
 * import { getContributorMeta } from "./services/contributor-importer";
 *
 * const meta = await getContributorMeta("./data/contributors/johndoe.md");
 * console.log(meta.name); // "John Doe"
 * ```
 */
export async function getContributorMeta(
  filePath: string
): Promise<ContributorMeta> {
  const content = await readFile(filePath, "utf-8");
  const { data } = matter(content) as { data: ContributorMeta };
  return data;
}
