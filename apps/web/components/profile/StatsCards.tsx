/**
 * @fileoverview StatsCards component for displaying contributor statistics.
 * @module @leaderboard/web/components/profile/StatsCards
 */

import React from "react";
import { Award, Activity, Calendar } from "lucide-react";

/**
 * Props for the StatsCards component.
 */
export interface StatsCardsProps {
  /** Total points earned */
  readonly totalPoints: number;
  /** Total number of activities */
  readonly totalActivities: number;
  /** Number of unique activity types */
  readonly activityTypes: number;
}

/**
 * Stat card component for individual stats.
 * @internal Used internally by StatsCards component.
 */
interface StatCardProps {
  /** Card title */
  readonly title: string;
  /** Main value to display */
  readonly value: number | string;
  /** Subtitle/description */
  readonly subtitle: string;
  /** Icon component */
  readonly icon: React.ReactNode;
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
    <div className="group relative overflow-hidden rounded-2xl bg-white p-6 md:p-8 border border-zinc-100 transition-all duration-300 hover:border-green-500/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:bg-black dark:border-zinc-800 dark:hover:border-green-400/20 dark:hover:shadow-[0_8px_30px_rgb(74,222,128,0.05)]">
      <div className="absolute right-0 top-0 -mr-6 -mt-6 h-24 w-24 rounded-full bg-green-500/5 blur-2xl transition-all duration-500 group-hover:bg-green-500/10 dark:bg-green-400/5 dark:group-hover:bg-green-400/10" />
      
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex items-start justify-between mb-4">
          <div className="rounded-xl bg-zinc-50 p-2.5 text-zinc-600 ring-1 ring-inset ring-zinc-100 transition-colors group-hover:bg-green-50 group-hover:text-green-600 group-hover:ring-green-100 dark:bg-zinc-900 dark:text-zinc-400 dark:ring-zinc-800 dark:group-hover:bg-green-900/20 dark:group-hover:text-green-400 dark:group-hover:ring-green-900/30">
            {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { 
              className: "h-5 w-5 md:h-6 md:w-6 stroke-[1.5px]" 
            })}
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-sm font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
            {title}
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {value}
            </span>
          </div>
          <p className="text-sm text-zinc-400 dark:text-zinc-500 pt-1">
            {subtitle}
          </p>
        </div>
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
    <section className="w-full" aria-label="Contributor statistics">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6 lg:gap-8">
        <StatCard
          title="Total Points"
          value={totalPoints.toLocaleString()}
          subtitle="Lifetime contribution"
          icon={<Award />}
        />
        <StatCard
          title="Total Activities"
          value={totalActivities.toLocaleString()}
          subtitle="Events & engagements"
          icon={<Activity />}
        />
        <StatCard
          title="Activity Types"
          value={activityTypes}
          subtitle="Unique categories"
          icon={<Calendar />}
        />
      </div>
    </section>
  );
}