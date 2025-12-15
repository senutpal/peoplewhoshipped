/**
 * Database test utilities for creating isolated test instances.
 *
 * @module @leaderboard/database/__tests__/utils/test-db
 *
 * This module provides utilities for creating in-memory PGlite databases
 * for testing. Each test gets an isolated database to prevent state pollution.
 *
 * @example
 * ```typescript
 * import { createTestDatabase, TEST_SCHEMA, seedTestData } from "./test-db";
 *
 * let db: PGlite;
 *
 * beforeEach(async () => {
 *   db = await createTestDatabase();
 * });
 *
 * afterEach(async () => {
 *   await db.close();
 * });
 * ```
 */

import { PGlite } from "@electric-sql/pglite";

// =============================================================================
// Schema Definition
// =============================================================================

/**
 * Database schema for test instances.
 * This should match the production schema.
 */
export const TEST_SCHEMA = `
-- Contributors table
CREATE TABLE IF NOT EXISTS contributor (
  username        VARCHAR PRIMARY KEY,
  avatar_url      VARCHAR,
  role            VARCHAR DEFAULT 'contributor',
  meta            JSONB,
  social_profiles JSONB
);

-- Activity definitions table
CREATE TABLE IF NOT EXISTS activity_definition (
  slug        VARCHAR PRIMARY KEY,
  name        VARCHAR NOT NULL,
  description VARCHAR,
  points      INTEGER,
  icon        VARCHAR
);

-- Activities table
CREATE TABLE IF NOT EXISTS activity (
  slug                VARCHAR PRIMARY KEY,
  contributor         VARCHAR NOT NULL REFERENCES contributor(username),
  activity_definition VARCHAR NOT NULL REFERENCES activity_definition(slug),
  title               VARCHAR NOT NULL,
  occured_at          TIMESTAMP NOT NULL,
  link                VARCHAR,
  text                TEXT,
  points              INTEGER,
  meta                JSONB
);

CREATE INDEX IF NOT EXISTS idx_activity_contributor ON activity(contributor);
CREATE INDEX IF NOT EXISTS idx_activity_occured_at ON activity(occured_at);

-- Slack EOD queue table
CREATE TABLE IF NOT EXISTS slack_eod_update (
  id        BIGINT PRIMARY KEY,
  user_id   VARCHAR NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  text      TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_slack_eod_update_timestamp ON slack_eod_update(timestamp);
CREATE INDEX IF NOT EXISTS idx_slack_eod_update_user_id ON slack_eod_update(user_id);
`;

// =============================================================================
// Test Database Factory
// =============================================================================

/**
 * Creates an isolated in-memory PGlite instance for testing.
 *
 * @returns Promise resolving to configured test database instance
 *
 * @remarks
 * Each call creates a completely new database with the test schema.
 * Always call `db.close()` in afterEach to clean up.
 *
 * @example
 * ```typescript
 * let db: PGlite;
 *
 * beforeEach(async () => {
 *   db = await createTestDatabase();
 * });
 *
 * afterEach(async () => {
 *   await db.close();
 * });
 *
 * it("should insert contributor", async () => {
 *   await db.query("INSERT INTO contributor ...");
 * });
 * ```
 */
export async function createTestDatabase(): Promise<PGlite> {
  const db = await PGlite.create();
  await db.exec(TEST_SCHEMA);
  return db;
}

// =============================================================================
// Seed Data Utilities
// =============================================================================

/**
 * Seed data type definitions.
 */
export interface TestSeedData {
  contributors?: Array<{
    username: string;
    avatar_url?: string;
    role?: string;
    meta?: Record<string, unknown>;
  }>;
  activityDefinitions?: Array<{
    slug: string;
    name: string;
    description?: string;
    points?: number;
    icon?: string;
  }>;
  activities?: Array<{
    slug: string;
    contributor: string;
    activity_definition: string;
    title: string;
    occured_at: Date;
    link?: string;
    text?: string;
    points?: number;
    meta?: Record<string, unknown>;
  }>;
}

/**
 * Seeds the test database with provided fixtures.
 *
 * @param db - PGlite database instance
 * @param data - Seed data to insert
 *
 * @example
 * ```typescript
 * await seedTestData(db, {
 *   contributors: [
 *     { username: "alice", avatar_url: "https://..." },
 *     { username: "bob" }
 *   ],
 *   activityDefinitions: [
 *     { slug: "pr-merged", name: "PR Merged", points: 15 }
 *   ],
 *   activities: [
 *     {
 *       slug: "pr-1",
 *       contributor: "alice",
 *       activity_definition: "pr-merged",
 *       title: "Fix bug",
 *       occured_at: new Date()
 *     }
 *   ]
 * });
 * ```
 */
export async function seedTestData(
  db: PGlite,
  data: TestSeedData
): Promise<void> {
  // Insert contributors
  if (data.contributors) {
    for (const c of data.contributors) {
      await db.query(
        `INSERT INTO contributor (username, avatar_url, role, meta)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (username) DO NOTHING`,
        [
          c.username,
          c.avatar_url ?? `https://avatars.githubusercontent.com/${c.username}`,
          c.role ?? "contributor",
          c.meta ? JSON.stringify(c.meta) : null,
        ]
      );
    }
  }

  // Insert activity definitions
  if (data.activityDefinitions) {
    for (const d of data.activityDefinitions) {
      await db.query(
        `INSERT INTO activity_definition (slug, name, description, points, icon)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (slug) DO NOTHING`,
        [d.slug, d.name, d.description ?? null, d.points ?? 0, d.icon ?? null]
      );
    }
  }

  // Insert activities
  if (data.activities) {
    for (const a of data.activities) {
      await db.query(
        `INSERT INTO activity (slug, contributor, activity_definition, title, occured_at, link, text, points, meta)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (slug) DO NOTHING`,
        [
          a.slug,
          a.contributor,
          a.activity_definition,
          a.title,
          a.occured_at.toISOString(),
          a.link ?? null,
          a.text ?? null,
          a.points ?? null,
          a.meta ? JSON.stringify(a.meta) : null,
        ]
      );
    }
  }
}

/**
 * Default activity definitions for testing.
 */
export const DEFAULT_ACTIVITY_DEFINITIONS = [
  { slug: "pr-opened", name: "PR Opened", points: 10 },
  { slug: "pr-merged", name: "PR Merged", points: 15 },
  { slug: "pr-reviewed", name: "PR Reviewed", points: 5 },
  { slug: "issue-opened", name: "Issue Opened", points: 5 },
  { slug: "commit", name: "Commit", points: 2 },
  { slug: "eod-update", name: "EOD Update", points: 3 },
];

/**
 * Seeds database with default activity definitions.
 *
 * @param db - PGlite database instance
 */
export async function seedDefaultDefinitions(db: PGlite): Promise<void> {
  await seedTestData(db, { activityDefinitions: DEFAULT_ACTIVITY_DEFINITIONS });
}
