/**
 * @fileoverview Leaderboard client view component with filtering.
 * @module @leaderboard/web/app/leaderboard/LeaderboardClient
 */

"use client";

import { useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  /** Roles that should be hidden by default */
  hiddenRoles: string[];
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
  hiddenRoles,
}: LeaderboardClientProps): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");

  // Get selected roles from query params
  const selectedRoles = useMemo(() => {
    const rolesParam = searchParams.get("roles");
    if (rolesParam) {
      return new Set(rolesParam.split(","));
    }
    // Default: exclude hidden roles
    const allRoles = new Set<string>();
    entries.forEach((entry) => {
      if (entry.role && !hiddenRoles.includes(entry.role)) {
        allRoles.add(entry.role);
      }
    });
    return allRoles;
  }, [searchParams, entries, hiddenRoles]);

  // Get unique roles from entries
  const availableRoles = useMemo(() => {
    const roles = new Set<string>();
    entries.forEach((entry) => {
      if (entry.role) {
        roles.add(entry.role);
      }
    });
    return Array.from(roles).sort();
  }, [entries]);

  // Filter entries by selected roles and search query
  const filteredEntries = useMemo(() => {
    let filtered = entries;

    // Filter by roles
    if (selectedRoles.size > 0) {
      filtered = filtered.filter(
        (entry) => entry.role && selectedRoles.has(entry.role)
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((entry) => {
        const name = (entry.name || entry.username).toLowerCase();
        const username = entry.username.toLowerCase();
        return name.includes(query) || username.includes(query);
      });
    }

    return filtered;
  }, [entries, selectedRoles, searchQuery]);

  const toggleRole = useCallback(
    (role: string) => {
      const newSelected = new Set(selectedRoles);
      if (newSelected.has(role)) {
        newSelected.delete(role);
      } else {
        newSelected.add(role);
      }

      const params = new URLSearchParams(searchParams.toString());
      if (newSelected.size > 0) {
        params.set("roles", Array.from(newSelected).join(","));
      } else {
        params.delete("roles");
      }
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [selectedRoles, searchParams, router]
  );

  const clearFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("roles");
    router.push(`?${params.toString()}`, { scroll: false });
    setSearchQuery("");
  }, [searchParams, router]);

  // Filter top contributors by selected roles
  const filteredTopByActivity = useMemo(() => {
    if (selectedRoles.size === 0) {
      return topByActivity;
    }

    const filtered: TopContributorsByActivity = {};

    for (const [activityName, contributors] of Object.entries(topByActivity)) {
      const filteredContributors = contributors.filter((contributor) => {
        const entry = entries.find((e) => e.username === contributor.username);
        return entry?.role && selectedRoles.has(entry.role);
      });

      if (filteredContributors.length > 0) {
        filtered[activityName] = filteredContributors;
      }
    }

    return filtered;
  }, [topByActivity, selectedRoles, entries]);

  const periodLabels: Record<LeaderboardPeriod, string> = {
    week: "Weekly",
    month: "Monthly",
    year: "Yearly",
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  {periodLabels[period]} Leaderboard
                </h1>
                <p className="text-muted-foreground">
                  {filteredEntries.length} of {entries.length} contributors
                  {(selectedRoles.size > 0 || searchQuery) && " (filtered)"}
                </p>
              </div>

              <LeaderboardFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                roles={availableRoles}
                selectedRoles={selectedRoles}
                onRoleToggle={toggleRole}
                onClearFilters={clearFilters}
              />
            </div>
          </div>

          {/* Period Selector */}
          <PeriodTabs currentPeriod={period} />

          {/* Leaderboard */}
          {filteredEntries.length === 0 ? (
            <div className="rounded-lg border bg-card p-12 text-center text-muted-foreground">
              {entries.length === 0
                ? "No contributors with points in this period"
                : "No contributors match the selected filters"}
            </div>
          ) : (
            <div className="space-y-4">
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

        {/* Sidebar */}
        <TopContributorsSidebar topByActivity={filteredTopByActivity} />
      </div>
    </div>
  );
}
