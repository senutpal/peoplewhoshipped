/**
 * @fileoverview LeaderboardCard component for individual leaderboard entries.
 * @module @leaderboard/web/components/leaderboard/LeaderboardCard
 */

import Link from "next/link";
import { Medal, Crown } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback, cn } from "@leaderboard/ui";
import type { LeaderboardEntry } from "@leaderboard/database";
import { ActivityTrendChart } from "../activity/ActivityTrendChart";

/**
 * Props for the LeaderboardCard component.
 */
export interface LeaderboardCardProps {
  /** Leaderboard entry data */
  readonly entry: LeaderboardEntry;
  /** Rank position (1-indexed) */
  readonly rank: number;
  /** Start date for trend chart */
  readonly startDate: Date;
  /** End date for trend chart */
  readonly endDate: Date;
}

function getRankBadge(
  rank: number,
): { icon: React.ReactNode; gradient: string } | null {
  if (rank === 1) {
    return {
      icon: <Crown className="h-5 w-5 sm:h-6 sm:w-6" />,
      gradient: "from-amber-400 via-yellow-300 to-amber-500",
    };
  }
  if (rank === 2) {
    return {
      icon: <Medal className="h-5 w-5 sm:h-6 sm:w-6" />,
      gradient: "from-slate-300 via-gray-200 to-slate-400",
    };
  }
  if (rank === 3) {
    return {
      icon: <Medal className="h-5 w-5 sm:h-6 sm:w-6" />,
      gradient: "from-amber-600 via-orange-500 to-amber-700",
    };
  }
  return null;
}

/**
 * Individual leaderboard entry card showing contributor stats.
 *
 * @param props - Component props
 * @returns LeaderboardCard component
 */
export function LeaderboardCard({
  entry,
  rank,
  startDate,
  endDate,
}: LeaderboardCardProps): React.ReactElement {
  const isTopThree = rank <= 3;
  const rankBadge = getRankBadge(rank);

  return (
    <div
      className={cn(
        "group relative rounded-2xl border bg-card p-4 sm:p-6 transition-all duration-300 hover:shadow-luxury",
        isTopThree
          ? "border-[var(--gold)]/30 hover:border-[var(--gold)]/50"
          : "border-border/50 hover:border-[var(--emerald)]/30",
      )}
    >
      {isTopThree && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--gold-light)] to-transparent opacity-30 pointer-events-none" />
      )}

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        {/* Rank + Avatar Group */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Rank Badge */}
          <div
            className={cn(
              "flex items-center justify-center shrink-0 rounded-xl w-10 h-10 sm:w-12 sm:h-12",
              rankBadge
                ? `bg-gradient-to-br ${rankBadge.gradient} text-white shadow-sm`
                : "bg-secondary text-muted-foreground",
            )}
            aria-label={`Rank ${rank}`}
          >
            {rankBadge?.icon || (
              <span className="text-lg sm:text-xl font-semibold">{rank}</span>
            )}
          </div>

          {/* Avatar */}
          <Avatar className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 border-2 border-background shadow-sm ring-1 ring-border/50">
            <AvatarImage
              src={entry.avatar_url || undefined}
              alt={entry.name || entry.username}
            />
            <AvatarFallback className="bg-secondary text-sm font-medium">
              {(entry.name || entry.username).substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Mobile: Name, Username, Points inline */}
          <div className="flex-1 min-w-0 sm:hidden">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <Link href={`/${entry.username}`}>
                  <h3 className="text-base font-semibold truncate hover:text-[var(--emerald)] transition-colors">
                    {entry.name || entry.username}
                  </h3>
                </Link>
                <p className="text-xs text-muted-foreground truncate">
                  @{entry.username}
                </p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xl font-bold text-[var(--emerald)] font-[family-name:var(--font-jakarta)]">
                  {entry.total_points}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  pts
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop: Contributor Info */}
        <div className="hidden sm:block flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Link href={`/${entry.username}`}>
              <h3 className="text-base lg:text-lg font-semibold hover:text-[var(--emerald)] transition-colors">
                {entry.name || entry.username}
              </h3>
            </Link>
            {entry.role && (
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-[var(--emerald-light)] text-[var(--emerald)] font-medium">
                {entry.role}
              </span>
            )}
          </div>
          <Link
            href={`/${entry.username}`}
            className="text-sm text-muted-foreground hover:text-[var(--emerald)] transition-colors"
          >
            @{entry.username}
          </Link>

          {/* Activity Breakdown */}
          <div className="flex flex-wrap gap-1.5 lg:gap-2 mt-3">
            {Object.entries(entry.activity_breakdown)
              .sort((a, b) => b[1].points - a[1].points)
              .slice(0, 5)
              .map(([activityName, data]) => (
                <div
                  key={activityName}
                  className="text-xs bg-secondary/70 px-2.5 py-1 rounded-lg"
                >
                  <span className="font-medium text-foreground">
                    {activityName}
                  </span>
                  <span className="text-muted-foreground ml-1">
                    ×{data.count}
                  </span>
                  {data.points > 0 && (
                    <span className="text-[var(--emerald)] ml-1 font-medium">
                      +{data.points}
                    </span>
                  )}
                </div>
              ))}
            {Object.entries(entry.activity_breakdown).length > 5 && (
              <div className="text-xs bg-secondary/50 px-2.5 py-1 rounded-lg text-muted-foreground">
                +{Object.entries(entry.activity_breakdown).length - 5} more
              </div>
            )}
          </div>
        </div>

        {/* Mobile: Activity Breakdown + Trend */}
        <div className="sm:hidden">
          <div className="flex flex-wrap gap-1.5 mb-3">
            {Object.entries(entry.activity_breakdown)
              .sort((a, b) => b[1].points - a[1].points)
              .slice(0, 4)
              .map(([activityName, data]) => (
                <div
                  key={activityName}
                  className="text-[11px] bg-secondary/70 px-2 py-0.5 rounded-md"
                >
                  <span className="font-medium">{activityName}</span>
                  <span className="text-muted-foreground ml-1">
                    ×{data.count}
                  </span>
                </div>
              ))}
            {Object.entries(entry.activity_breakdown).length > 4 && (
              <div className="text-[11px] bg-secondary/50 px-2 py-0.5 rounded-md text-muted-foreground">
                +{Object.entries(entry.activity_breakdown).length - 4}
              </div>
            )}
          </div>
          {entry.daily_activity && entry.daily_activity.length > 0 && (
            <div className="w-full">
              <ActivityTrendChart
                dailyActivity={entry.daily_activity}
                startDate={startDate}
                endDate={endDate}
                mode="points"
              />
            </div>
          )}
        </div>

        {/* Desktop: Points + Trend Chart */}
        <div className="hidden sm:flex items-center gap-4 lg:gap-6 shrink-0">
          {entry.daily_activity && entry.daily_activity.length > 0 && (
            <ActivityTrendChart
              dailyActivity={entry.daily_activity}
              startDate={startDate}
              endDate={endDate}
              mode="points"
            />
          )}
          <div className="text-right min-w-[80px]">
            <div className="text-2xl lg:text-3xl font-bold text-[var(--emerald)] font-[family-name:var(--font-jakarta)]">
              {entry.total_points}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              points
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
