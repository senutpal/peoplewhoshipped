/**
 * @fileoverview DateRangeFilter component for filtering by date range.
 * @module @leaderboard/web/components/shared/DateRangeFilter
 */

"use client";

import { Calendar, X } from "lucide-react";
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Input,
  cn,
} from "@leaderboard/ui";

/**
 * Props for the DateRangeFilter component.
 */
export interface DateRangeFilterProps {
  /** Start date value (YYYY-MM-DD format) */
  readonly startDate: string;
  /** End date value (YYYY-MM-DD format) */
  readonly endDate: string;
  /** Callback when start date changes */
  readonly onStartDateChange: (date: string) => void;
  /** Callback when end date changes */
  readonly onEndDateChange: (date: string) => void;
  /** Optional ID prefix for form elements */
  readonly idPrefix?: string;
}

/**
 * Date range filter with start and end date inputs in a popover.
 *
 * @param props - Component props
 * @returns DateRangeFilter component
 */
export function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  idPrefix = "filter",
}: DateRangeFilterProps): React.ReactElement {
  const hasDateFilter = startDate !== "" || endDate !== "";

  const today = new Date().toLocaleDateString("en-CA");

  const handleStartDateChange = (date: string) => {
    onStartDateChange(date);
    if (endDate && date > endDate) {
      onEndDateChange(date);
    }
  };

  const handleEndDateChange = (date: string) => {
    onEndDateChange(date);
    if (startDate && date < startDate) {
      onStartDateChange(date);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "h-8 w-8 rounded-full border border-zinc-200 bg-transparent text-zinc-500 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors",
            hasDateFilter &&
              "border-emerald-500/50 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 dark:text-emerald-400",
          )}
        >
          <Calendar className="h-4 w-4" />
          <span className="sr-only">Filter dates</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 bg-background" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
              Date Range
            </h4>
            {hasDateFilter && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                onClick={() => {
                  onStartDateChange("");
                  onEndDateChange("");
                }}
              >
                Reset
              </Button>
            )}
          </div>
          <div className="grid gap-3">
            <div className="space-y-1.5">
              <label
                htmlFor={`${idPrefix}-start-date`}
                className="text-xs font-medium text-zinc-500 dark:text-zinc-400"
              >
                Start
              </label>
              <Input
                id={`${idPrefix}-start-date`}
                type="date"
                value={startDate}
                max={endDate || today}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="h-9 font-mono text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor={`${idPrefix}-end-date`}
                className="text-xs font-medium text-zinc-500 dark:text-zinc-400"
              >
                End
              </label>
              <Input
                id={`${idPrefix}-end-date`}
                type="date"
                value={endDate}
                min={startDate}
                max={today}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="h-9 font-mono text-sm"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
