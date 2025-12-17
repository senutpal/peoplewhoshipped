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
  readonly currentPeriod: LeaderboardPeriod;
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
    <nav className="flex gap-1 sm:gap-2 mb-6 sm:mb-8 border-b overflow-x-auto scrollbar-hide" role="tablist" aria-label="Leaderboard time period">
      {periods.map((period) => (
        <Link
          key={period}
          href={`/leaderboard/${period}`}
          role="tab"
          aria-selected={currentPeriod === period}
          aria-current={currentPeriod === period ? "page" : undefined}
          className={cn(
            "px-3 sm:px-4 py-2 text-sm sm:text-base font-medium transition-colors border-b-2 capitalize whitespace-nowrap",
            currentPeriod === period
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          {period}
        </Link>
      ))}
    </nav>
  );
}
