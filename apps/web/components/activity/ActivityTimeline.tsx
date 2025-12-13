/**
 * @fileoverview ActivityTimeline component for paginated activity display.
 * @module @leaderboard/web/components/activity/ActivityTimeline
 */

"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Filter, X, ChevronDown } from "lucide-react";
import {
  Button,
  Checkbox,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@leaderboard/ui";
import {
  groupActivitiesByMonth,
  formatMonthHeader,
  type MonthKey,
} from "@leaderboard/utils";
import type { ContributorActivity } from "@leaderboard/database";
import { ActivityTimelineItem } from "./ActivityTimelineItem";
import { DateRangeFilter } from "../shared/DateRangeFilter";

/** Local storage key for activity type filter persistence */
const ACTIVITY_FILTER_STORAGE_KEY = "leaderboard_activity_type_filter";

/**
 * Activity definition for filtering.
 */
export interface ActivityDefinitionData {
  /** Activity type name */
  name: string;
}

/**
 * Props for the ActivityTimeline component.
 */
export interface ActivityTimelineProps {
  /** Array of activities to display */
  activities: ContributorActivity[];
  /** Activity definitions for filter options */
  activityDefinitions: ActivityDefinitionData[];
}

/**
 * Paginated activity timeline with filtering by date and activity type.
 * Groups activities by month and supports lazy loading.
 *
 * @param props - Component props
 * @returns ActivityTimeline component
 *
 * @example
 * ```tsx
 * <ActivityTimeline
 *   activities={activities}
 *   activityDefinitions={definitions}
 * />
 * ```
 */
export function ActivityTimeline({
  activities,
  activityDefinitions,
}: ActivityTimelineProps): React.ReactElement {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [visibleMonths, setVisibleMonths] = useState<number>(1);
  const [selectedActivityTypes, setSelectedActivityTypes] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();

    try {
      const stored = localStorage.getItem(ACTIVITY_FILTER_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return new Set(parsed);
        }
      }
    } catch {
      // Ignore localStorage errors
    }
    return new Set();
  });

  // Persist activity type filter to localStorage
  useEffect(() => {
    try {
      if (selectedActivityTypes.size > 0) {
        localStorage.setItem(
          ACTIVITY_FILTER_STORAGE_KEY,
          JSON.stringify(Array.from(selectedActivityTypes))
        );
      } else {
        localStorage.removeItem(ACTIVITY_FILTER_STORAGE_KEY);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [selectedActivityTypes]);

  // Get activity types from definitions
  const activityTypes = useMemo(() => {
    return activityDefinitions.map((def) => def.name).sort();
  }, [activityDefinitions]);

  // Filter activities
  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      // Filter by date range
      if (startDate) {
        const activityDate = new Date(activity.occured_at);
        const start = new Date(startDate);
        if (activityDate < start) return false;
      }
      if (endDate) {
        const activityDate = new Date(activity.occured_at);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (activityDate > end) return false;
      }

      // Filter by activity type
      if (
        selectedActivityTypes.size > 0 &&
        !selectedActivityTypes.has(activity.activity_name)
      ) {
        return false;
      }

      return true;
    });
  }, [activities, startDate, endDate, selectedActivityTypes]);

  // Group filtered activities by month and paginate
  const { visibleActivities, totalMonths, nextMonthName, shouldResetMonths } =
    useMemo(() => {
      const grouped = groupActivitiesByMonth(filteredActivities);
      const monthKeys = Array.from(grouped.keys());

      const needsReset =
        visibleMonths > monthKeys.length && monthKeys.length > 0;

      const visibleMonthKeys = monthKeys.slice(0, visibleMonths);

      const visible: Array<
        | ContributorActivity
        | { isMonthHeader: true; monthKey: MonthKey; count: number }
      > = [];
      visibleMonthKeys.forEach((monthKey) => {
        const monthActivities = grouped.get(monthKey) || [];
        visible.push({
          isMonthHeader: true,
          monthKey,
          count: monthActivities.length,
        });
        visible.push(...monthActivities);
      });

      const nextMonth = monthKeys[visibleMonths];
      const nextMonthFormatted = nextMonth
        ? formatMonthHeader(nextMonth)
        : null;

      return {
        visibleActivities: visible,
        totalMonths: monthKeys.length,
        nextMonthName: nextMonthFormatted,
        shouldResetMonths: needsReset,
      };
    }, [filteredActivities, visibleMonths]);

  // Reset visible months when filters reduce available data
  useEffect(() => {
    if (shouldResetMonths && visibleMonths !== 1) {
      setVisibleMonths(1);
    }
  }, [shouldResetMonths, visibleMonths]);

  const toggleActivityType = useCallback((activityType: string) => {
    setSelectedActivityTypes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(activityType)) {
        newSet.delete(activityType);
      } else {
        newSet.add(activityType);
      }
      return newSet;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setStartDate("");
    setEndDate("");
    setSelectedActivityTypes(new Set());
    setVisibleMonths(1);
  }, []);

  const hasActiveFilters =
    startDate !== "" || endDate !== "" || selectedActivityTypes.size > 0;

  const loadMore = useCallback(() => {
    setVisibleMonths((prev) => prev + 1);
  }, []);

  const hasMore = visibleMonths < totalMonths;

  const visibleActivityCount = visibleActivities.filter(
    (item) => !("isMonthHeader" in item)
  ).length;

  return (
    <div className="rounded-lg border bg-card">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Activity Timeline</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {visibleActivityCount} of {filteredActivities.length} activities
              {hasActiveFilters && " (filtered)"}
              {totalMonths > 0 && (
                <span className="ml-1">
                  · {visibleMonths} of {totalMonths} month
                  {totalMonths !== 1 ? "s" : ""}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}

            <DateRangeFilter
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              idPrefix="timeline"
            />

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Activity Type
                  {selectedActivityTypes.size > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-primary text-primary-foreground">
                      {selectedActivityTypes.size}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64" align="end">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Filter by Activity Type</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {activityTypes.map((activityType) => (
                      <div
                        key={activityType}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={activityType}
                          checked={selectedActivityTypes.has(activityType)}
                          onCheckedChange={() => toggleActivityType(activityType)}
                        />
                        <label
                          htmlFor={activityType}
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          {activityType}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {visibleActivities.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {activities.length === 0
                ? "No activities yet"
                : "No activities match the selected filters"}
            </p>
          ) : (
            <>
              {visibleActivities.map((item, index) => {
                if ("isMonthHeader" in item) {
                  return (
                    <div
                      key={`month-${item.monthKey}`}
                      className="sticky top-0 z-10 -mx-6 px-6 py-3 bg-muted/50 backdrop-blur-sm border-y"
                    >
                      <h3 className="text-sm font-semibold">
                        {formatMonthHeader(item.monthKey)}
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          {item.count} activit{item.count !== 1 ? "ies" : "y"}
                        </span>
                      </h3>
                    </div>
                  );
                }
                return (
                  <ActivityTimelineItem key={item.slug || index} activity={item} />
                );
              })}
              {hasMore && (
                <div className="pt-4 text-center">
                  <Button variant="outline" onClick={loadMore} className="w-full sm:w-auto">
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Load More ({nextMonthName})
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
