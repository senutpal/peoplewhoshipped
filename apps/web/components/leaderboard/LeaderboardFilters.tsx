/**
 * @fileoverview LeaderboardFilters component for search functionality.
 * @module @leaderboard/web/components/leaderboard/LeaderboardFilters
 */

"use client";

import { X, Search } from "lucide-react";
import { Button, Input } from "@leaderboard/ui";

/**
 * Props for the LeaderboardFilters component.
 */
export interface LeaderboardFiltersProps {
  /** Current search query */
  readonly searchQuery: string;
  /** Callback when search query changes */
  readonly onSearchChange: (query: string) => void;
  /** Callback to clear all filters */
  readonly onClearFilters: () => void;
}

/**
 * Search filter controls for the leaderboard.
 *
 * @param props - Component props
 * @returns LeaderboardFilters component
 *
 * @example
 * ```tsx
 * <LeaderboardFilters
 *   searchQuery={searchQuery}
 *   onSearchChange={setSearchQuery}
 *   onClearFilters={clearFilters}
 * />
 * ```
 */
export function LeaderboardFilters({
  searchQuery,
  onSearchChange,
  onClearFilters,
}: LeaderboardFiltersProps): React.ReactElement {
  const hasActiveFilters = searchQuery.trim() !== "";

  return (
    <div className="flex items-center gap-2 w-full sm:w-auto">
      {/* Search Bar */}
      <div className="relative flex-1 sm:flex-none">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search contributors..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-9 w-full sm:w-64"
        />
      </div>

      {/* Clear Button */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClearFilters} className="shrink-0">
          <X className="h-4 w-4 sm:mr-1" />
          <span className="hidden sm:inline">Clear</span>
        </Button>
      )}
    </div>
  );
}
