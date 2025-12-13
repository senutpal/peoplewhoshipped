/**
 * @fileoverview ActivityGraph component for GitHub-style contribution visualization.
 * @module @leaderboard/web/components/activity/ActivityGraph
 */

"use client";

import { useMemo, useState, useEffect } from "react";
import { cn } from "@leaderboard/ui";
import { Tooltip, TooltipContent, TooltipTrigger } from "@leaderboard/ui";
import type { ActivityGraphDataPoint } from "@leaderboard/utils";

/**
 * Activity data for the graph.
 */
export interface ActivityData {
  /** Activity type name */
  activity_definition_name: string;
  /** When the activity occurred */
  occured_at: Date;
}

/**
 * Activity definition for filtering.
 */
export interface ActivityDefinitionData {
  /** Activity type name */
  name: string;
}

/**
 * Props for the ActivityGraph component.
 */
export interface ActivityGraphProps {
  /** Graph data with date, count, and level */
  data: ActivityGraphDataPoint[];
  /** Raw activities for tooltip display */
  activities: ActivityData[];
  /** Activity definitions for filtering */
  activityDefinitions: ActivityDefinitionData[];
  /** Callback when selected activity types change */
  onFilterChange?: (selectedTypes: Set<string>) => void;
}

/**
 * Get color class for activity level (0-4).
 *
 * @param level - Activity level from 0-4
 * @returns Tailwind color class
 */
function getLevelColor(level: number): string {
  switch (level) {
    case 0:
      return "bg-muted";
    case 1:
      return "bg-primary/20";
    case 2:
      return "bg-primary/40";
    case 3:
      return "bg-primary/60";
    case 4:
      return "bg-primary/80";
    default:
      return "bg-muted";
  }
}

/**
 * Format a date for display in tooltip.
 *
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Formatted date string
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * GitHub-style activity/contribution graph showing activity over time.
 *
 * @param props - Component props
 * @returns ActivityGraph component
 *
 * @example
 * ```tsx
 * <ActivityGraph
 *   data={activityGraphData}
 *   activities={activities}
 *   activityDefinitions={definitions}
 * />
 * ```
 */
export function ActivityGraph({
  data,
  activities,
  activityDefinitions,
  onFilterChange,
}: ActivityGraphProps): React.ReactElement {
  const [selectedActivityTypes, setSelectedActivityTypes] = useState<Set<string>>(new Set());
  const [isAnimating, setIsAnimating] = useState(true);
  const [animatedTypes, setAnimatedTypes] = useState<Set<string>>(new Set());

  // Get unique activity types that have data
  const activeActivityTypes = useMemo(() => {
    const types = new Set<string>();
    activities.forEach((activity) => {
      types.add(activity.activity_definition_name);
    });
    return Array.from(types).sort();
  }, [activities]);

  // Animate activity types on mount
  useEffect(() => {
    if (activeActivityTypes.length === 0) {
      setIsAnimating(false);
      return;
    }

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < activeActivityTypes.length) {
        const activityType = activeActivityTypes[currentIndex];
        if (activityType) {
          setAnimatedTypes((prev) => new Set([...prev, activityType]));
        }
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsAnimating(false);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [activeActivityTypes]);

  // Group activities by date for tooltip display
  const activityByDateAndType = useMemo(() => {
    const grouped: Record<string, Record<string, number>> = {};

    activities.forEach((activity) => {
      const dateKey = new Date(activity.occured_at).toISOString().split("T")[0];
      if (dateKey) {
        if (!grouped[dateKey]) {
          grouped[dateKey] = {};
        }
        const typeName = activity.activity_definition_name;
        grouped[dateKey][typeName] = (grouped[dateKey][typeName] || 0) + 1;
      }
    });

    return grouped;
  }, [activities]);

  // Filter and recalculate graph data
  const filteredData = useMemo(() => {
    let typesToInclude: Set<string>;

    if (selectedActivityTypes.size > 0) {
      typesToInclude = selectedActivityTypes;
    } else if (isAnimating) {
      typesToInclude = animatedTypes;
    } else {
      return data.map((day) => ({
        ...day,
        activityBreakdown: activityByDateAndType[day.date] || {},
      }));
    }

    // Filter activities by included types
    const filteredActivities = activities.filter((activity) =>
      typesToInclude.has(activity.activity_definition_name)
    );

    // Group by date
    const activityByDate: Record<string, number> = {};
    const activityBreakdownByDate: Record<string, Record<string, number>> = {};

    filteredActivities.forEach((activity) => {
      const dateKey = new Date(activity.occured_at).toISOString().split("T")[0];
      if (dateKey) {
        activityByDate[dateKey] = (activityByDate[dateKey] || 0) + 1;

        if (!activityBreakdownByDate[dateKey]) {
          activityBreakdownByDate[dateKey] = {};
        }
        const typeName = activity.activity_definition_name;
        activityBreakdownByDate[dateKey][typeName] =
          (activityBreakdownByDate[dateKey][typeName] || 0) + 1;
      }
    });

    return data.map((day) => {
      const count = activityByDate[day.date] || 0;
      let level = 0;
      if (count > 0) {
        if (count >= 10) level = 4;
        else if (count >= 7) level = 3;
        else if (count >= 4) level = 2;
        else level = 1;
      }
      return {
        ...day,
        count,
        level,
        activityBreakdown: activityBreakdownByDate[day.date] || {},
      };
    });
  }, [
    data,
    activities,
    selectedActivityTypes,
    isAnimating,
    animatedTypes,
    activityByDateAndType,
  ]);

  // Group data by weeks
  const weeks: Array<
    Array<{
      date: string;
      count: number;
      level: number;
      activityBreakdown: Record<string, number>;
    }>
  > = [];
  for (let i = 0; i < filteredData.length; i += 7) {
    weeks.push(filteredData.slice(i, i + 7));
  }

  // Notify parent of filter changes
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(selectedActivityTypes);
    }
  }, [selectedActivityTypes, onFilterChange]);

  return (
    <div className="relative">
      <div className="flex gap-1 overflow-x-auto pb-4">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.map((day, dayIndex) => (
              <Tooltip key={`${weekIndex}-${dayIndex}`}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "w-3 h-3 rounded-sm cursor-pointer hover:ring-2 hover:ring-primary",
                      "transition-all duration-300 ease-in-out",
                      getLevelColor(day.level)
                    )}
                    style={{
                      opacity: day.level === 0 || !isAnimating ? 1 : 0,
                      animation:
                        day.level > 0 && isAnimating
                          ? "fadeIn 300ms ease-in-out forwards"
                          : undefined,
                    }}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-xs space-y-1">
                    <div className="font-medium">{formatDate(day.date)}</div>
                    {Object.keys(day.activityBreakdown).length > 0 ? (
                      <div className="space-y-0.5">
                        {Object.entries(day.activityBreakdown)
                          .sort((a, b) => b[1] - a[1])
                          .map(([type, count]) => (
                            <div
                              key={type}
                              className="flex items-center justify-between gap-3"
                            >
                              <span className="truncate max-w-38">{type}</span>
                              <span className="font-medium">{count}</span>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-muted-foreground">No activities</div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
        <span>Less</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={cn("w-3 h-3 rounded-sm", getLevelColor(level))}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
