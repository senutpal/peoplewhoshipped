/**
 * @fileoverview DateRangeFilter component for filtering by date range.
 * @module @leaderboard/web/components/shared/DateRangeFilter
 */

"use client";

import { Calendar } from "lucide-react";
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Input,
} from "@leaderboard/ui";

/**
 * Props for the DateRangeFilter component.
 */
export interface DateRangeFilterProps {
  /** Start date value (YYYY-MM-DD format) */
  startDate: string;
  /** End date value (YYYY-MM-DD format) */
  endDate: string;
  /** Callback when start date changes */
  onStartDateChange: (date: string) => void;
  /** Callback when end date changes */
  onEndDateChange: (date: string) => void;
  /** Optional ID prefix for form elements */
  idPrefix?: string;
}

/**
 * Date range filter with start and end date inputs in a popover.
 *
 * @param props - Component props
 * @returns DateRangeFilter component
 *
 * @example
 * ```tsx
 * const [startDate, setStartDate] = useState("");
 * const [endDate, setEndDate] = useState("");
 *
 * <DateRangeFilter
 *   startDate={startDate}
 *   endDate={endDate}
 *   onStartDateChange={setStartDate}
 *   onEndDateChange={setEndDate}
 *   idPrefix="timeline"
 * />
 * ```
 */
export function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  idPrefix = "filter",
}: DateRangeFilterProps): React.ReactElement {
  const hasDateFilter = startDate !== "" || endDate !== "";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <Calendar className="h-4 w-4 mr-2" />
          Date Range
          {hasDateFilter && (
            <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-primary text-primary-foreground">
              •
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Filter by Date Range</h4>
          <div className="grid gap-4">
            <div className="space-y-2">
              <label
                htmlFor={`${idPrefix}-start-date`}
                className="text-sm font-medium"
              >
                Start Date
              </label>
              <Input
                id={`${idPrefix}-start-date`}
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor={`${idPrefix}-end-date`}
                className="text-sm font-medium"
              >
                End Date
              </label>
              <Input
                id={`${idPrefix}-end-date`}
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                className="h-9"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
