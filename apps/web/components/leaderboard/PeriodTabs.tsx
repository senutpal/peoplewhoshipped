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
 */
export function PeriodTabs({
  currentPeriod,
}: PeriodTabsProps): React.ReactElement {
  const periods: { value: LeaderboardPeriod; label: string }[] = [
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "year", label: "This Year" },
  ];

  return (
    <nav 
      className="flex gap-1 p-1 rounded-xl bg-secondary/50 dark:bg-zinc-900 w-full sm:w-fit overflow-x-auto scrollbar-hide" 
      role="tablist" 
      aria-label="Leaderboard time period"
    >
      {periods.map((period) => (
        <Link
          key={period.value}
          href={`/leaderboard/${period.value}`}
          role="tab"
          aria-selected={currentPeriod === period.value}
          aria-current={currentPeriod === period.value ? "page" : undefined}
          className={cn(
            "relative flex-1 sm:flex-none px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-medium transition-all duration-300 rounded-lg text-center whitespace-nowrap",
            currentPeriod === period.value
              ? "bg-card text-[var(--emerald)] shadow-sm dark:bg-[var(--emerald-light)]/70 dark:text-[var(--emerald)]"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {period.label}
        </Link>
      ))}
    </nav>
  );
}
