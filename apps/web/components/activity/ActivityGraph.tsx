/**
 * @fileoverview ActivityGraph component for GitHub-style contribution visualization.
 * @module @leaderboard/web/components/activity/ActivityGraph
 */

"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { cn, Tooltip, TooltipContent, TooltipTrigger } from "@leaderboard/ui";
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
 * Adheres to the Light Green / Black Light Green theme.
 *
 * @param level - Activity level from 0-4
 * @returns Tailwind color class
 */
function getLevelColor(level: number): string {
  switch (level) {
    case 0:
      return "bg-zinc-100 dark:bg-zinc-900";
    case 1:
      return "bg-emerald-100 dark:bg-emerald-900/40";
    case 2:
      return "bg-emerald-300 dark:bg-emerald-700";
    case 3:
      return "bg-emerald-500 dark:bg-emerald-500";
    case 4:
      return "bg-emerald-700 dark:bg-emerald-300";
    default:
      return "bg-zinc-100 dark:bg-zinc-900";
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
    month: "short",
    day: "numeric",
  });
}

/**
 * GitHub-style activity/contribution graph showing activity over time.
 * Designed with a minimal, premium aesthetic suitable for high-end dashboards.
 *
 * @param props - Component props
 * @returns ActivityGraph component
 */
export function ActivityGraph({
  data,
  activities,
  activityDefinitions,
  onFilterChange,
}: ActivityGraphProps): React.ReactElement {
  const [selectedActivityTypes, setSelectedActivityTypes] = useState<Set<string>>(new Set());
  const [totalCount, setTotalCount] = useState(0);

  // Group activities by date for tooltip display
  const activityByDateAndType = useMemo(() => {
    const grouped: Record<string, Record<string, number>> = {};
    activities.forEach((activity) => {
      const dateKey = new Date(activity.occured_at).toISOString().split("T")[0];
      if (dateKey) {
        if (!grouped[dateKey]) grouped[dateKey] = {};
        const typeName = activity.activity_definition_name;
        grouped[dateKey][typeName] = (grouped[dateKey][typeName] || 0) + 1;
      }
    });
    return grouped;
  }, [activities]);

  // Filter and recalculate graph data
  const filteredData = useMemo(() => {
    let typesToInclude = selectedActivityTypes;
    if (typesToInclude.size === 0) {
      // If nothing selected, include all available definitions
      typesToInclude = new Set(activityDefinitions.map((d) => d.name));
    }

    const filteredActivities = activities.filter((activity) =>
      typesToInclude.has(activity.activity_definition_name)
    );

    const activityByDate: Record<string, number> = {};
    const activityBreakdownByDate: Record<string, Record<string, number>> = {};

    filteredActivities.forEach((activity) => {
      const dateKey = new Date(activity.occured_at).toISOString().split("T")[0];
      if (dateKey) {
        activityByDate[dateKey] = (activityByDate[dateKey] || 0) + 1;
        if (!activityBreakdownByDate[dateKey]) activityBreakdownByDate[dateKey] = {};
        const typeName = activity.activity_definition_name;
        activityBreakdownByDate[dateKey][typeName] =
          (activityBreakdownByDate[dateKey][typeName] || 0) + 1;
      }
    });

    return {
      data: data.map((day) => {
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
      }),
      count: filteredActivities.length,
    };
  }, [data, activities, selectedActivityTypes, activityDefinitions]);

  // Update total count when filtered data changes
  useEffect(() => {
    setTotalCount(filteredData.count);
  }, [filteredData.count]);

  // Group data by weeks
  const weeks = useMemo(() => {
    const result = [];
    for (let i = 0; i < filteredData.data.length; i += 7) {
      result.push(filteredData.data.slice(i, i + 7));
    }
    return result;
  }, [filteredData.data]);

  const toggleFilter = useCallback((type: string) => {
    setSelectedActivityTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      onFilterChange?.(next);
      return next;
    });
  }, [onFilterChange]);

  return (
    <div className="flex flex-col gap-6 w-full p-6 bg-white dark:bg-black rounded-3xl border border-zinc-100 dark:border-zinc-900 shadow-sm">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Activity
          </h3>
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 font-mono">
            {totalCount.toLocaleString()} contributions
          </span>
        </div>

        {/* Filters */}
        {activityDefinitions.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {activityDefinitions.map((def) => {
              const isActive =
                selectedActivityTypes.size === 0 || selectedActivityTypes.has(def.name);
              return (
                <button
                  key={def.name}
                  onClick={() => toggleFilter(def.name)}
                  className={cn(
                    "px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold rounded-full transition-all duration-200 border",
                    isActive
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900/50"
                      : "bg-transparent text-zinc-400 border-zinc-100 dark:border-zinc-800 hover:text-zinc-600 dark:hover:text-zinc-300"
                  )}
                >
                  {def.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Graph Section */}
      <div className="relative group">
        <div
          ref={(node) => {
            if (node) {
              node.scrollLeft = node.scrollWidth;
            }
          }}
          className="flex overflow-x-auto pb-2 -mx-2 px-2 mask-linear-fade scroll-smooth"
        >
          <div className="flex gap-[3px] min-w-max">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-[3px]">
                {week.map((day, dayIndex) => (
                  <Tooltip key={`${weekIndex}-${dayIndex}`} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "w-2.5 h-2.5 rounded-[2px] transition-all duration-300 ease-out",
                          getLevelColor(day.level),
                          "hover:scale-125 hover:z-10 hover:shadow-sm dark:hover:shadow-emerald-900/50"
                        )}
                        style={{
                          animation: "fadeIn 0.5s ease-out forwards",
                          opacity: 0,
                          animationDelay: `${weekIndex * 15 + dayIndex * 10}ms`,
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="bg-zinc-900/95 dark:bg-zinc-800/95 text-zinc-50 border-none backdrop-blur-sm shadow-xl px-3 py-2"
                    >
                      <div className="flex flex-col gap-1.5 min-w-[140px]">
                        <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                          {formatDate(day.date)}
                        </span>
                        {day.count === 0 ? (
                          <span className="text-sm">No activity</span>
                        ) : (
                          <>
                            <span className="text-sm">{day.count} activities</span>
                            {Object.entries(day.activityBreakdown).map(
                              ([type, count]) => (
                                <span
                                  key={type}
                                  className="text-xs text-zinc-300 dark:text-zinc-400"
                                >
                                  {count} {type}
                                </span>
                              )
                            )}
                          </>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
     

      {/* Legend */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-900">
        <span className="text-[10px] text-zinc-400 font-medium">Activity Level</span>
        <div className="flex items-center gap-1.5">
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={cn("w-2 h-2 rounded-full", getLevelColor(level))}
              aria-label={`Level ${level}`}
            />
          ))}
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}