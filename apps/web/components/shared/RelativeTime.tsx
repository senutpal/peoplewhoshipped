/**
 * @fileoverview RelativeTime component for displaying dates as relative time.
 * @module @leaderboard/web/components/shared/RelativeTime
 */

"use client";

import { useEffect, useState } from "react";
import { formatTimeAgo } from "@leaderboard/utils";

/**
 * Props for the RelativeTime component.
 */
export interface RelativeTimeProps {
  /** The date to display relative to now */
  readonly date: Date;
  /** Optional CSS class name */
  readonly className?: string;
}

/**
 * Displays a date as relative time (e.g., "2 hours ago").
 * Updates every minute to keep the display current.
 *
 * @param props - Component props
 * @returns RelativeTime component
 *
 * @example
 * ```tsx
 * <RelativeTime date={new Date("2024-01-15T10:00:00Z")} className="text-sm" />
 * ```
 */
export function RelativeTime({
  date,
  className,
}: RelativeTimeProps): React.ReactElement {
  const [timeAgo, setTimeAgo] = useState<string>(() => formatTimeAgo(date));

  useEffect(() => {
    // Update every minute
    const interval = setInterval(() => {
      setTimeAgo(formatTimeAgo(date));
    }, 60000);

    return () => clearInterval(interval);
  }, [date]);

  return (
    <time
      dateTime={date.toISOString()}
      className={className}
      title={date.toLocaleString()}
      aria-label={`${timeAgo}, on ${date.toLocaleDateString()}`}
    >
      {timeAgo}
    </time>
  );
}
