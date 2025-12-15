/**
 * @fileoverview Pre-build static data export for Next.js static generation
 * @module @leaderboard/db-scripts/prebuild-static-data
 *
 * Exports database data to JSON files that can be read during Next.js
 * static generation, avoiding PGlite bundling issues.
 */

import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import {
  initDb,
  getAllContributorUsernames,
  getAllContributorsWithAvatars,
  getContributorProfile,
  getLeaderboard,
  getTopContributorsByActivity,
  getRecentActivitiesGroupedByType,
  listActivityDefinitions,
} from "@leaderboard/database";
import { getDateRange } from "@leaderboard/utils";
import { getYamlConfigSync, getHiddenRoles } from "@leaderboard/config";

// =============================================================================
// Types
// =============================================================================

interface StaticDataOutput {
  /** All contributor usernames for generateStaticParams */
  usernames: string[];
  /** Contributor profiles indexed by username */
  profiles: Record<string, unknown>;
  /** People page data */
  people: unknown[];
  /** Home page recent activities */
  recentActivities: unknown[];
  /** Leaderboard data by period */
  leaderboard: Record<string, unknown>;
  /** Activity definitions */
  activityDefinitions: unknown[];
}

// =============================================================================
// Constants
// =============================================================================

const PERIODS = ["week", "month", "year"] as const;

// =============================================================================
// Export Functions
// =============================================================================

/**
 * Export all static data needed for Next.js pages.
 */
export async function exportStaticData(outputDir: string): Promise<void> {
  console.log(`Exporting static data to: ${outputDir}`);

  // Ensure output directory exists
  const staticDir = join(outputDir, "static");
  const profilesDir = join(staticDir, "profiles");
  
  if (!existsSync(staticDir)) {
    mkdirSync(staticDir, { recursive: true });
  }
  if (!existsSync(profilesDir)) {
    mkdirSync(profilesDir, { recursive: true });
  }

  // Ensure database is initialized (waits for WASM to be ready)
  await initDb();

  // Get config
  const config = getYamlConfigSync();
  const topContributorsConfig = config.leaderboard.top_contributors || [];

  // 1. Export usernames
  console.log("Exporting usernames...");
  const usernames = await getAllContributorUsernames();
  writeFileSync(join(staticDir, "usernames.json"), JSON.stringify(usernames, null, 2));
  console.log(`     Found ${usernames.length} contributors`);

  // 2. Export activity definitions
  console.log("Exporting activity definitions...");
  const activityDefinitions = await listActivityDefinitions();
  writeFileSync(join(staticDir, "activity-definitions.json"), JSON.stringify(activityDefinitions, null, 2));

  // 3. Export people page data
  console.log("Exporting people data...");
  const people = await getAllContributorsWithAvatars(getHiddenRoles(config));
  writeFileSync(join(staticDir, "people.json"), JSON.stringify(people, null, 2));

  // 4. Export recent activities for home page
  console.log("Exporting recent activities...");
  const recentActivities = await getRecentActivitiesGroupedByType(7);
  // Serialize dates
  const serializedActivities = recentActivities.map(group => ({
    ...group,
    activities: group.activities.map(a => ({
      ...a,
      occured_at: a.occured_at.toISOString(),
    })),
  }));
  writeFileSync(join(staticDir, "recent-activities.json"), JSON.stringify(serializedActivities, null, 2));

  // 5. Export leaderboard data for each period
  console.log("Exporting leaderboard data...");
  for (const period of PERIODS) {
    const { startDate, endDate } = getDateRange(period);
    const [entries, topByActivity] = await Promise.all([
      getLeaderboard(startDate, endDate),
      getTopContributorsByActivity(startDate, endDate, topContributorsConfig),
    ]);
    
    const leaderboardData = {
      entries,
      topByActivity,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
    
    writeFileSync(join(staticDir, `leaderboard-${period}.json`), JSON.stringify(leaderboardData, null, 2));
    console.log(`     ${period}: ${entries.length} entries`);
  }

  // 6. Export individual contributor profiles
  console.log("Exporting contributor profiles...");
  for (const username of usernames) {
    const profile = await getContributorProfile(username);
    
    // Serialize dates in activities
    const serializedProfile = {
      ...profile,
      activities: profile.activities.map(a => ({
        ...a,
        occured_at: a.occured_at.toISOString(),
      })),
    };
    
    writeFileSync(join(profilesDir, `${username}.json`), JSON.stringify(serializedProfile, null, 2));
  }
  console.log(`Exported ${usernames.length} profiles`);

  console.log("Static data export completed!");
}

// =============================================================================
// CLI Entry Point
// =============================================================================

if (import.meta.main) {
  const dataPath = process.env.LEADERBOARD_DATA_PATH || process.cwd();
  
  exportStaticData(dataPath)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Failed to export static data:", error);
      process.exit(1);
    });
}
