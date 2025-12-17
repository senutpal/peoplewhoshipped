/**
 * @fileoverview Leaderboard client view component with filtering.
 * @module @leaderboard/web/app/leaderboard/LeaderboardClient
 */

"use client";

import { useState, useMemo, useCallback } from "react";
import type { LeaderboardEntry, TopContributorsByActivity } from "@leaderboard/database";
import {
  PeriodTabs,
  LeaderboardFilters,
  LeaderboardCard,
  TopContributorsSidebar,
  type LeaderboardPeriod,
} from "@/components/leaderboard";

/**
 * Props for the LeaderboardClient component.
 */
export interface LeaderboardClientProps {
  /** Leaderboard entries */
  entries: LeaderboardEntry[];
  /** Current time period */
  period: LeaderboardPeriod;
  /** Start date for the period */
  startDate: Date;
  /** End date for the period */
  endDate: Date;
  /** Top contributors by activity type */
  topByActivity: TopContributorsByActivity;
}

/**
 * Client-side leaderboard view with filtering and search.
 *
 * @param props - Component props
 * @returns LeaderboardClient component
 */
export function LeaderboardClient({
  entries,
  period,
  startDate,
  endDate,
  topByActivity,
}: LeaderboardClientProps): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter entries by search query only
  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) {
      return entries;
    }

    const query = searchQuery.toLowerCase();
    return entries.filter((entry) => {
      const name = (entry.name || entry.username).toLowerCase();
      const username = entry.username.toLowerCase();
      return name.includes(query) || username.includes(query);
    });
  }, [entries, searchQuery]);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
  }, []);

  const periodLabels: Record<LeaderboardPeriod, string> = {
    week: "Weekly",
    month: "Monthly",
    year: "Yearly",
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 mt-20 sm:mt-24">
      <div className="flex flex-col xl:flex-row gap-6 xl:gap-8">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">
                  {periodLabels[period]} Leaderboard
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {filteredEntries.length} of {entries.length} contributors
                  {searchQuery && " (filtered)"}
                </p>
              </div>

              <LeaderboardFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onClearFilters={clearFilters}
              />
            </div>
          </div>

          {/* Period Selector */}
          <PeriodTabs currentPeriod={period} />

          {/* Leaderboard */}
          {filteredEntries.length === 0 ? (
            <div className="rounded-lg border bg-card p-8 sm:p-12 text-center text-muted-foreground">
              {entries.length === 0
                ? "No contributors with points in this period"
                : "No contributors match the search query"}
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredEntries.map((entry, index) => (
                <LeaderboardCard
                  key={entry.username}
                  entry={entry}
                  rank={index + 1}
                  startDate={startDate}
                  endDate={endDate}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar - visible on all screens, stacks below on mobile/tablet */}
        <TopContributorsSidebar topByActivity={topByActivity} />
      </div>
    </div>
  );
}
