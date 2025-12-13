/**
 * @leaderboard/utils - Shared utilities for the leaderboard monorepo
 *
 * @packageDocumentation
 *
 * This package provides common utility functions used across the leaderboard
 * system including date manipulation, activity graph generation, and CSS
 * class merging utilities.
 *
 * ## Features
 *
 * - **Date Utilities**: Date range calculations, time formatting
 * - **Activity Graph**: GitHub-style contribution graph generation
 * - **Month Utilities**: Month boundaries, keys, and grouping
 * - **CSS Utilities**: Tailwind class merging with clsx
 *
 * ## Usage
 *
 * ```typescript
 * import {
 *   getDateRange,
 *   formatTimeAgo,
 *   generateActivityGraphData,
 *   groupActivitiesByMonth,
 *   cn
 * } from "@leaderboard/utils";
 *
 * // Get date range for last week
 * const { startDate, endDate } = getDateRange("week");
 *
 * // Format a date as "2 hours ago"
 * const timeAgo = formatTimeAgo(new Date());
 *
 * // Generate activity graph data
 * const graphData = generateActivityGraphData({ "2024-01-15": 5 }, 365);
 *
 * // Merge Tailwind classes
 * const className = cn("base-class", condition && "conditional-class");
 * ```
 *
 * @module @leaderboard/utils
 */

// =============================================================================
// Date Utilities
// =============================================================================

export {
  getDateRange,
  formatTimeAgo,
  type DateRangePeriod,
} from "./date";

// =============================================================================
// Activity Graph Utilities
// =============================================================================

export {
  generateActivityGraphData,
  type ActivityGraphDataPoint,
} from "./activity-graph";

// =============================================================================
// Month Utilities
// =============================================================================

export {
  getMonthBoundaries,
  getMonthKey,
  formatMonthHeader,
  groupActivitiesByMonth,
  type MonthKey,
} from "./month";

// =============================================================================
// CSS Utilities
// =============================================================================

export { cn } from "./cn";
