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
 */
export function LeaderboardFilters({
  searchQuery,
  onSearchChange,
  onClearFilters,
}: LeaderboardFiltersProps): React.ReactElement {
  const hasActiveFilters = searchQuery.trim() !== "";

  return (
    <div className="flex items-center gap-2 w-full sm:w-auto dark:bg-zinc-900">
      {/* Search Bar */}
      <div className="relative flex-1 sm:flex-none group">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-[var(--emerald)] transition-colors" />
        <Input
          type="text"
          placeholder="Search contributors..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-10 w-full sm:w-72 rounded-xl border-border/50 bg-secondary/30 placeholder:text-muted-foreground/70 focus:border-[var(--emerald)]/50 focus:ring-[var(--emerald)]/20 transition-all"
        />
      </div>

      {/* Clear Button */}
      {hasActiveFilters && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClearFilters} 
          className="shrink-0 h-10 px-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary"
        >
          <X className="h-4 w-4" />
          <span className="hidden sm:inline ml-1.5">Clear</span>
        </Button>
      )}
    </div>
  );
}
