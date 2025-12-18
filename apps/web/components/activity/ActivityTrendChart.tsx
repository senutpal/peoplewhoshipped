/**
 * @fileoverview ActivityTrendChart component for sparkline visualization.
 * @module @leaderboard/web/components/activity/ActivityTrendChart
 */

import { useMemo } from "react";

/**
 * Daily activity data point for the trend chart.
 */
export interface DailyActivityData {
  /** Date in YYYY-MM-DD format */
  date: string;
  /** Number of activities */
  count: number;
  /** Points earned */
  points: number;
}

/**
 * Props for the ActivityTrendChart component.
 */
export interface ActivityTrendChartProps {
  /** Array of daily activity data */
  readonly dailyActivity: readonly DailyActivityData[];
  /** Start date of the range */
  readonly startDate: Date;
  /** End date of the range */
  readonly endDate: Date;
  /** Whether to display points or count */
  readonly mode: "points" | "count";
  /** Maximum number of data points to display */
  readonly maxDataPoints?: number;
  /** Width of the SVG */
  readonly width?: number;
  /** Height of the SVG */
  readonly height?: number;
}

/**
 * Small SVG sparkline chart showing activity trends over time.
 *
 * @param props - Component props
 * @returns ActivityTrendChart component
 */
export function ActivityTrendChart({
  dailyActivity,
  startDate,
  endDate,
  mode,
  maxDataPoints = 32,
  width = 60,
  height = 20,
}: ActivityTrendChartProps): React.ReactElement {
  const dateRange = useMemo(() => {
    const dates: string[] = [];
    const current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
      const dateStr = current.toISOString().split("T")[0];
      if (dateStr) dates.push(dateStr);
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }, [startDate, endDate]);

  const fullActivityData = useMemo(() => {
    const activityMap = new Map(
      dailyActivity.map((d) => [d.date, mode === "points" ? d.points : d.count])
    );
    return dateRange.map((date) => activityMap.get(date) || 0);
  }, [dailyActivity, dateRange, mode]);

  const activityData = useMemo(() => {
    if (fullActivityData.length <= maxDataPoints) return fullActivityData;
    const batchSize = Math.ceil(fullActivityData.length / maxDataPoints);
    const downsampled: number[] = [];
    for (let i = 0; i < fullActivityData.length; i += batchSize) {
      const batch = fullActivityData.slice(i, i + batchSize);
      const average = batch.reduce((sum, val) => sum + val, 0) / batch.length;
      downsampled.push(average);
    }
    return downsampled;
  }, [fullActivityData, maxDataPoints]);

  const maxValue = useMemo(() => Math.max(...activityData, 1), [activityData]);
  const padding = 1;

  const { pathData, areaPathData } = useMemo(() => {
    if (activityData.length === 0) return { pathData: "", areaPathData: "" };

    const points = activityData.map((value, index) => {
      const x = padding + (index / (activityData.length - 1 || 1)) * (width - padding * 2);
      const y = height - padding - (value / maxValue) * (height - padding * 2);
      return { x, y };
    });

    const firstX = padding;
    const lastX = padding + (width - padding * 2);
    const bottomY = height - padding;
    const firstPoint = points[0];

    if (!firstPoint) return { pathData: "", areaPathData: "" };

    let d = `M ${firstPoint.x},${firstPoint.y}`;
    if (points.length > 1) {
      for (let i = 0; i < points.length - 1; i++) {
        const current = points[i];
        const next = points[i + 1];
        if (!current || !next) continue;
        const tension = 0.2;
        const cp1x = current.x + (next.x - current.x) * tension;
        const cp1y = current.y;
        const cp2x = next.x - (next.x - current.x) * tension;
        const cp2y = next.y;
        d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${next.x},${next.y}`;
      }
    }

    const areaD = `${d} L ${lastX},${bottomY} L ${firstX},${bottomY} Z`;
    return { pathData: d, areaPathData: areaD };
  }, [activityData, maxValue, width, height, padding]);

  const totalValue = activityData.reduce((sum, val) => sum + val, 0);

  if (totalValue === 0) {
    return (
      <div className="opacity-20" role="img" aria-label="No activity data available">
        <svg width={width} height={height} aria-hidden="true">
          <line x1="0" y1={height/2} x2={width} y2={height/2} stroke="currentColor" strokeWidth="1" strokeDasharray="2,2" />
        </svg>
      </div>
    );
  }

  return (
    <svg
      width={width}
      height={height}
      className="overflow-visible"
      style={{ color: "var(--emerald)" }}
      role="img"
      aria-label={`Activity trend showing ${totalValue.toFixed(0)} total ${mode}`}
    >
      <defs>
        <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPathData} fill="url(#trendGradient)" stroke="none" />
      <path d={pathData} fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}