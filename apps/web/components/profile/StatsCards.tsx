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
 * Individual stat card - compact for mobile.
 */
function StatCard({
  title,
  value,
  subtitle,
  icon,
  accentColor = "emerald",
}: {
  title: string;
  value: number | string;
  subtitle: string;
  icon: React.ReactNode;
  accentColor?: "emerald" | "gold";
}): React.ReactElement {
  const colorClasses = accentColor === "gold" 
    ? "group-hover:bg-[var(--gold-light)] group-hover:text-[var(--gold)] group-hover:ring-[var(--gold)]/20"
    : "group-hover:bg-[var(--emerald-light)] group-hover:text-[var(--emerald)] group-hover:ring-[var(--emerald)]/20";

  return (
    <div className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-card p-3 sm:p-5 border border-border/50 transition-all duration-300 hover:border-[var(--emerald)]/30 hover:shadow-luxury">
      {/* Subtle glow on hover */}
      <div className="absolute right-0 top-0 -mr-8 -mt-8 h-24 w-24 rounded-full bg-[var(--emerald)]/5 blur-2xl transition-all duration-500 group-hover:bg-[var(--emerald)]/10 opacity-0 group-hover:opacity-100" />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="hidden sm:flex items-start justify-between mb-3">
          <div className={`rounded-xl bg-secondary/70 p-2 sm:p-2.5 text-muted-foreground ring-1 ring-border/50 transition-all duration-300 ${colorClasses}`}>
            {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { 
              className: "h-4 w-4 sm:h-5 sm:w-5 stroke-[1.5px]" 
            })}
          </div>
        </div>

        <div className="space-y-0.5 sm:mt-auto">
          <h3 className="text-[10px] sm:text-xs font-medium tracking-wider text-muted-foreground uppercase">
            {title}
          </h3>
          <div className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground font-[family-name:var(--font-jakarta)]">
            {value}
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Grid of stat cards showing contributor statistics.
 * Responsive: compact on mobile, spacious on desktop.
 *
 * @param props - Component props
 * @returns StatsCards component
 */
export function StatsCards({
  totalPoints,
  totalActivities,
  activityTypes,
}: StatsCardsProps): React.ReactElement {
  return (
    <section className="w-full" aria-label="Contributor statistics">
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <StatCard
          title="Points"
          value={totalPoints.toLocaleString()}
          subtitle="Lifetime total"
          icon={<Award />}
          accentColor="gold"
        />
        <StatCard
          title="Activities"
          value={totalActivities.toLocaleString()}
          subtitle="All contributions"
          icon={<Activity />}
          accentColor="emerald"
        />
        <StatCard
          title="Types"
          value={activityTypes}
          subtitle="Categories"
          icon={<Calendar />}
          accentColor="emerald"
        />
      </div>
    </section>
  );
}