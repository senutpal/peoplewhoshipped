/**
 * @fileoverview Dynamic leaderboard page for different time periods.
 * @module @leaderboard/web/app/leaderboard/[period]/page
 */

import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getLeaderboardData } from "@/lib/static-data";
import { getYamlConfigSync, getHiddenRoles } from "@leaderboard/config";
import { LeaderboardClient } from "../LeaderboardClient";
import type { LeaderboardPeriod } from "@/components/leaderboard";

const config = getYamlConfigSync();

/** Valid periods for static generation */
const VALID_PERIODS: LeaderboardPeriod[] = ["week", "month", "year"];

/**
 * Generate static params for all valid periods.
 */
export function generateStaticParams(): Array<{ period: string }> {
  return VALID_PERIODS.map((period) => ({ period }));
}

/**
 * Props for the LeaderboardPeriodPage component.
 */
interface LeaderboardPeriodPageProps {
  params: Promise<{ period: string }>;
}

/**
 * Type guard to check if period is valid.
 */
function isValidPeriod(period: string): period is LeaderboardPeriod {
  return VALID_PERIODS.includes(period as LeaderboardPeriod);
}

/**
 * Dynamic leaderboard page for week/month/year periods.
 *
 * @param props - Component props
 * @returns Leaderboard page component
 */
export default async function LeaderboardPeriodPage({
  params,
}: LeaderboardPeriodPageProps): Promise<React.ReactElement> {
  const { period } = await params;

  if (!isValidPeriod(period)) {
    notFound();
  }

  // Get pre-built leaderboard data for this period
  const { entries, topByActivity, startDate, endDate } = getLeaderboardData(period);

  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
      <LeaderboardClient
        entries={entries}
        period={period}
        startDate={startDate}
        endDate={endDate}
        topByActivity={topByActivity}
        hiddenRoles={getHiddenRoles(config)}
      />
    </Suspense>
  );
}
