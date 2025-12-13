/**
 * @fileoverview PeriodTabs component for leaderboard period navigation.
 * @module @leaderboard/web/components/leaderboard/PeriodTabs
 */

import Link from "next/link";
import { cn } from "@leaderboard/ui";

/**
 * Valid leaderboard time periods.
 */
export type LeaderboardPeriod = "week" | "month" | "year";

/**
 * Props for the PeriodTabs component.
 */
export interface PeriodTabsProps {
  /** Currently selected period */
  currentPeriod: LeaderboardPeriod;
}

/**
 * Tab navigation for switching between leaderboard time periods.
 *
 * @param props - Component props
 * @returns PeriodTabs component
 *
 * @example
 * ```tsx
 * <PeriodTabs currentPeriod="week" />
 * ```
 */
export function PeriodTabs({
  currentPeriod,
}: PeriodTabsProps): React.ReactElement {
  const periods: LeaderboardPeriod[] = ["week", "month", "year"];

  return (
    <div className="flex gap-2 mb-8 border-b">
      {periods.map((period) => (
        <Link
          key={period}
          href={`/leaderboard/${period}`}
          className={cn(
            "px-4 py-2 font-medium transition-colors border-b-2 capitalize",
            currentPeriod === period
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          {period}
        </Link>
      ))}
    </div>
  );
}
