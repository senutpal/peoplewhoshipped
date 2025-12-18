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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pt-24 sm:pt-28">
      <div className="flex flex-col xl:flex-row gap-8 xl:gap-10">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="mb-6 sm:mb-8 animate-fade-up">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium mb-2 md:mb-4 font-[family-name:var(--font-jakarta)]">
              {periodLabels[period]} Leaderboard
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              <span className="text-[var(--emerald)] font-medium">{filteredEntries.length}</span>
              {" "}of {entries.length} contributors
              {searchQuery && (
                <span className="text-muted-foreground/70"> (filtered)</span>
              )}
            </p>
          </div>

          {/* Period Tabs + Search - aligned in same row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8 animate-fade-up delay-100">
            <PeriodTabs currentPeriod={period} />
            <LeaderboardFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onClearFilters={clearFilters}
            />
          </div>

          {/* Leaderboard */}
          {filteredEntries.length === 0 ? (
            <div className="rounded-2xl border border-border/50 bg-card p-12 sm:p-16 text-center animate-fade-up delay-200">
              <div className="w-12 h-12 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                {entries.length === 0 ? "No contributors yet" : "No results found"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                {entries.length === 0
                  ? "There are no contributors with points in this period."
                  : "Try adjusting your search query."}
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredEntries.map((entry, index) => (
                <div 
                  key={entry.username}
                  className="animate-fade-up"
                  style={{ animationDelay: `${200 + index * 50}ms` }}
                >
                  <LeaderboardCard
                    entry={entry}
                    rank={index + 1}
                    startDate={startDate}
                    endDate={endDate}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="animate-slide-in delay-300">
          <TopContributorsSidebar topByActivity={topByActivity} />
        </div>
      </div>
    </div>
  );
}
