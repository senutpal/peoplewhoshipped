/**
 * @fileoverview StatsCards component for displaying contributor statistics.
 * @module @leaderboard/web/components/profile/StatsCards
 */

import { Award, Activity, Calendar } from "lucide-react";

/**
 * Props for the StatsCards component.
 */
export interface StatsCardsProps {
  /** Total points earned */
  totalPoints: number;
  /** Total number of activities */
  totalActivities: number;
  /** Number of unique activity types */
  activityTypes: number;
}

/**
 * Stat card component for individual stats.
 */
interface StatCardProps {
  /** Card title */
  title: string;
  /** Main value to display */
  value: number | string;
  /** Subtitle/description */
  subtitle: string;
  /** Icon component */
  icon: React.ReactNode;
}

/**
 * Individual stat card.
 */
function StatCard({
  title,
  value,
  subtitle,
  icon,
}: StatCardProps): React.ReactElement {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="text-sm font-medium">{title}</h3>
        <div className="h-4 w-4 text-muted-foreground">{icon}</div>
      </div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

/**
 * Grid of stat cards showing contributor statistics.
 *
 * @param props - Component props
 * @returns StatsCards component
 *
 * @example
 * ```tsx
 * <StatsCards
 *   totalPoints={1500}
 *   totalActivities={42}
 *   activityTypes={5}
 * />
 * ```
 */
export function StatsCards({
  totalPoints,
  totalActivities,
  activityTypes,
}: StatsCardsProps): React.ReactElement {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatCard
        title="Total Points"
        value={totalPoints}
        subtitle="All time"
        icon={<Award className="h-4 w-4" />}
      />
      <StatCard
        title="Total Activities"
        value={totalActivities}
        subtitle="All time"
        icon={<Activity className="h-4 w-4" />}
      />
      <StatCard
        title="Activity Types"
        value={activityTypes}
        subtitle="Different types"
        icon={<Calendar className="h-4 w-4" />}
      />
    </div>
  );
}
