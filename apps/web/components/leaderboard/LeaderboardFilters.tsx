/**
 * @fileoverview LeaderboardFilters component for search and role filtering.
 * @module @leaderboard/web/components/leaderboard/LeaderboardFilters
 */

"use client";

import { Filter, X, Search } from "lucide-react";
import {
  Button,
  Checkbox,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@leaderboard/ui";

/**
 * Props for the LeaderboardFilters component.
 */
export interface LeaderboardFiltersProps {
  /** Current search query */
  searchQuery: string;
  /** Callback when search query changes */
  onSearchChange: (query: string) => void;
  /** Available roles for filtering */
  roles: string[];
  /** Currently selected roles */
  selectedRoles: Set<string>;
  /** Callback to toggle a role */
  onRoleToggle: (role: string) => void;
  /** Callback to clear all filters */
  onClearFilters: () => void;
}

/**
 * Search and role filter controls for the leaderboard.
 *
 * @param props - Component props
 * @returns LeaderboardFilters component
 *
 * @example
 * ```tsx
 * <LeaderboardFilters
 *   searchQuery={searchQuery}
 *   onSearchChange={setSearchQuery}
 *   roles={availableRoles}
 *   selectedRoles={selectedRoles}
 *   onRoleToggle={toggleRole}
 *   onClearFilters={clearFilters}
 * />
 * ```
 */
export function LeaderboardFilters({
  searchQuery,
  onSearchChange,
  roles,
  selectedRoles,
  onRoleToggle,
  onClearFilters,
}: LeaderboardFiltersProps): React.ReactElement {
  const hasActiveFilters = selectedRoles.size > 0 || searchQuery.trim() !== "";

  return (
    <div className="flex items-center gap-2">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search contributors..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-9 w-64"
        />
      </div>

      {/* Role Filter */}
      {roles.length > 0 && (
        <>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Role
                {selectedRoles.size > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-primary text-primary-foreground">
                    {selectedRoles.size}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="end">
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Filter by Role</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {roles.map((role) => (
                    <div key={role} className="flex items-center space-x-2">
                      <Checkbox
                        id={`role-${role}`}
                        checked={selectedRoles.has(role)}
                        onCheckedChange={() => onRoleToggle(role)}
                      />
                      <label
                        htmlFor={`role-${role}`}
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {role}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </>
      )}
    </div>
  );
}
