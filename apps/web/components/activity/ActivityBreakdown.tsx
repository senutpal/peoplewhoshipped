/**
 * @fileoverview ActivityBreakdown component for activity type visualization.
 * @module @leaderboard/web/components/activity/ActivityBreakdown
 */

"use client";

import { useMemo, useState, useCallback } from "react";
import { X } from "lucide-react";
import { Button, cn, Tooltip, TooltipContent, TooltipTrigger } from "@leaderboard/ui";
import { DateRangeFilter } from "../shared/DateRangeFilter";
import { ActivityTrendChart } from "./ActivityTrendChart";

const COLORS = [
  "bg-[var(--emerald)]",
  "bg-[var(--gold)]",
  "bg-blue-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-orange-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-rose-500",
];

/**
 * Activity data for the breakdown.
 */
export interface BreakdownActivity {
  /** Activity type name */
  activity_definition_name: string;
  /** When the activity occurred */
  occured_at: Date;
  /** Points earned */
  points: number;
}

/**
 * Props for the ActivityBreakdown component.
 */
export interface ActivityBreakdownProps {
  /** Array of activities to analyze */
  activities: BreakdownActivity[];
  /** Start date for the range */
  startDate?: Date;
  /** End date for the range */
  endDate?: Date;
}

/**
 * Activity breakdown visualization with bar chart and legend.
 *
 * @param props - Component props
 * @returns ActivityBreakdown component
 */
export function ActivityBreakdown({
  activities,
  startDate: initialStartDate,
  endDate: initialEndDate,
}: ActivityBreakdownProps): React.ReactElement {
  const [filterStartDate, setFilterStartDate] = useState<string>("");
  const [filterEndDate, setFilterEndDate] = useState<string>("");

  const filteredActivities = useMemo(() => {
    if (!filterStartDate && !filterEndDate) {
      return activities;
    }

    return activities.filter((activity) => {
      const activityDate = new Date(activity.occured_at);

      if (filterStartDate) {
        const start = new Date(filterStartDate);
        if (activityDate < start) return false;
      }

      if (filterEndDate) {
        const end = new Date(filterEndDate);
        end.setHours(23, 59, 59, 999);
        if (activityDate > end) return false;
      }

      return true;
    });
  }, [activities, filterStartDate, filterEndDate]);

  const filteredBreakdown = useMemo(() => {
    return filteredActivities.reduce((acc, activity) => {
      const key = activity.activity_definition_name;
      if (!acc[key]) {
        acc[key] = { count: 0, points: 0 };
      }
      acc[key].count += 1;
      acc[key].points += activity.points;
      return acc;
    }, {} as Record<string, { count: number; points: number }>);
  }, [filteredActivities]);

  const entries = Object.entries(filteredBreakdown)
    .filter(([, data]) => data.points > 0)
    .sort((a, b) => b[1].points - a[1].points);

  const totalActivities = entries.reduce(
    (sum, [, data]) => sum + data.count,
    0
  );
  const totalPoints = entries.reduce((sum, [, data]) => sum + data.points, 0);

  const clearFilters = useCallback(() => {
    setFilterStartDate("");
    setFilterEndDate("");
  }, []);

  const hasActiveFilters = filterStartDate !== "" || filterEndDate !== "";

  const dateRange = useMemo(() => {
    if (initialStartDate && initialEndDate) {
      return { startDate: initialStartDate, endDate: initialEndDate };
    }

    if (filteredActivities.length === 0) {
      const now = new Date();
      return {
        startDate: new Date(now.getFullYear(), 0, 1),
        endDate: now,
      };
    }

    const dates = filteredActivities.map((a) => new Date(a.occured_at));
    return {
      startDate: new Date(Math.min(...dates.map((d) => d.getTime()))),
      endDate: new Date(Math.max(...dates.map((d) => d.getTime()))),
    };
  }, [filteredActivities, initialStartDate, initialEndDate]);

  const activityTrendData = useMemo(() => {
    const trendMap: Record<
      string,
      Array<{ date: string; count: number; points: number }>
    > = {};

    filteredActivities.forEach((activity) => {
      const activityName = activity.activity_definition_name;
      const dateKey = new Date(activity.occured_at).toISOString().split("T")[0];

      if (!trendMap[activityName]) {
        trendMap[activityName] = [];
      }

      const existingDay = trendMap[activityName].find(
        (d) => d.date === dateKey
      );
      if (existingDay) {
        existingDay.count += 1;
        existingDay.points += activity.points;
      } else if (dateKey) {
        trendMap[activityName].push({
          date: dateKey,
          count: 1,
          points: activity.points,
        });
      }
    });

    return trendMap;
  }, [filteredActivities]);

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No activities to display
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header with filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="text-xs text-muted-foreground">
          <span className="text-[var(--emerald)] font-medium">{totalActivities}</span> activities · <span className="text-[var(--emerald)] font-medium">{totalPoints}</span> pts
          {hasActiveFilters && " (filtered)"}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="h-7 px-2 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
          <DateRangeFilter
            startDate={filterStartDate}
            endDate={filterEndDate}
            onStartDateChange={setFilterStartDate}
            onEndDateChange={setFilterEndDate}
            idPrefix="breakdown"
          />
        </div>
      </div>

      {/* Proportional Bar Chart */}
      {totalPoints > 0 && (
        <div className="space-y-4">
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-secondary/50">
            {entries.map(([activityName, data], index) => {
              const percentage = (data.points / totalPoints) * 100;
              return (
                <Tooltip key={activityName}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "transition-all duration-300 hover:opacity-80 cursor-pointer first:rounded-l-full last:rounded-r-full",
                        COLORS[index % COLORS.length]
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs">
                      <div className="font-medium">{activityName}</div>
                      <div className="text-muted-foreground">
                        {data.count} activities · {data.points} pts ({percentage.toFixed(1)}%)
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>

          {/* Legend with Trend Charts */}
          <div className="space-y-2">
            {entries.map(([activityName, data], index) => {
              const percentage = (data.points / totalPoints) * 100;
              const trendData = activityTrendData[activityName] || [];

              return (
                <div
                  key={activityName}
                  className="flex items-center gap-3 p-2.5 rounded-xl border border-border/30 bg-secondary/20 hover:bg-secondary/40 transition-colors"
                >
                  <div
                    className={cn(
                      "w-2.5 h-2.5 rounded-full shrink-0",
                      COLORS[index % COLORS.length]
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {activityName}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{data.count}×</span>
                      <span>·</span>
                      <span className="text-[var(--emerald)] font-medium">
                        +{data.points} pts
                      </span>
                      <span className="text-muted-foreground/50">
                        ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <ActivityTrendChart
                      dailyActivity={trendData}
                      startDate={dateRange.startDate}
                      endDate={dateRange.endDate}
                      mode="count"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
