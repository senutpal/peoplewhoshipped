/**
 * @fileoverview LeaderboardCard component for individual leaderboard entries.
 * @module @leaderboard/web/components/leaderboard/LeaderboardCard
 */

import Link from "next/link";
import { Medal, Trophy } from "lucide-react";
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

/**
 * Get icon for top 3 ranks.
 *
 * @param rank - Rank position (1-3)
 * @returns Trophy or Medal icon component, or null
 */
function getRankIcon(rank: number): React.ReactNode {
  if (rank === 1) {
    return (
      <Trophy className="h-6 w-6 text-yellow-500" aria-hidden="true" role="img" />
    );
  }
  if (rank === 2) {
    return <Medal className="h-6 w-6 text-gray-400" aria-hidden="true" role="img" />;
  }
  if (rank === 3) {
    return <Medal className="h-6 w-6 text-amber-600" aria-hidden="true" role="img" />;
  }
  return null;
}

/**
 * Individual leaderboard entry card showing contributor stats.
 *
 * @param props - Component props
 * @returns LeaderboardCard component
 *
 * @example
 * ```tsx
 * <LeaderboardCard
 *   entry={entry}
 *   rank={1}
 *   startDate={new Date()}
 *   endDate={new Date()}
 * />
 * ```
 */
export function LeaderboardCard({
  entry,
  rank,
  startDate,
  endDate,
}: LeaderboardCardProps): React.ReactElement {
  const isTopThree = rank <= 3;

  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-4 sm:p-6 transition-all hover:shadow-md",
        isTopThree && "border-primary/50"
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        {/* Top row on mobile: Rank, Avatar, Name, Points */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Rank */}
          <div
            className="flex items-center justify-center size-10 sm:size-12 shrink-0"
            aria-label={`Rank ${rank}`}
            role="text"
          >
            {getRankIcon(rank) || (
              <span className="text-xl sm:text-2xl font-bold text-muted-foreground" aria-hidden="true">
                {rank}
              </span>
            )}
          </div>

          {/* Avatar */}
          <Avatar className="size-12 sm:size-14 shrink-0">
            <AvatarImage
              src={entry.avatar_url || undefined}
              alt={entry.name || entry.username}
            />
            <AvatarFallback>
              {(entry.name || entry.username).substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Mobile: Name and Points inline */}
          <div className="flex-1 min-w-0 sm:hidden">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <Link href={`/${entry.username}`}>
                  <h3 className="text-base font-semibold hover:text-primary transition-colors truncate">
                    {entry.name || entry.username}
                  </h3>
                </Link>
                <p className="text-xs text-muted-foreground truncate">@{entry.username}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xl font-bold text-primary">
                  {entry.total_points}
                </div>
                <div className="text-xs text-muted-foreground">pts</div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop: Contributor Info */}
        <div className="hidden sm:block flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Link href={`/${entry.username}`}>
              <h3 className="text-base lg:text-lg font-semibold hover:text-primary transition-colors">
                {entry.name || entry.username}
              </h3>
            </Link>
            {entry.role && (
              <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                {entry.role}
              </span>
            )}
          </div>
          <Link
            href={`/${entry.username}`}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            @{entry.username}
          </Link>
          <div className="mb-3" />

          {/* Activity Breakdown - Desktop */}
          <div className="flex flex-wrap gap-2 lg:gap-3">
            {Object.entries(entry.activity_breakdown)
              .sort((a, b) => b[1].points - a[1].points)
              .map(([activityName, data]) => (
                <div
                  key={activityName}
                  className="text-xs bg-muted px-2 lg:px-3 py-1 rounded-full"
                >
                  <span className="font-medium">{activityName}:</span>{" "}
                  <span className="text-muted-foreground">{data.count}</span>
                  {data.points > 0 && (
                    <span className="text-primary ml-1">(+{data.points})</span>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* Mobile: Activity Breakdown + Trend Chart */}
        <div className="sm:hidden">
          {/* Activity Breakdown - Mobile */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {Object.entries(entry.activity_breakdown)
              .sort((a, b) => b[1].points - a[1].points)
              .slice(0, 4)
              .map(([activityName, data]) => (
                <div
                  key={activityName}
                  className="text-xs bg-muted px-2 py-0.5 rounded-full"
                >
                  <span className="font-medium">{activityName}:</span>{" "}
                  <span className="text-muted-foreground">{data.count}</span>
                </div>
              ))}
            {Object.entries(entry.activity_breakdown).length > 4 && (
              <div className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                +{Object.entries(entry.activity_breakdown).length - 4} more
              </div>
            )}
          </div>
          {/* Trend Chart - Mobile */}
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

        {/* Desktop: Total Points with Trend Chart */}
        <div className="hidden sm:flex items-center gap-4 shrink-0">
          {entry.daily_activity && entry.daily_activity.length > 0 && (
            <ActivityTrendChart
              dailyActivity={entry.daily_activity}
              startDate={startDate}
              endDate={endDate}
              mode="points"
            />
          )}
          <div className="text-right">
            <div className="text-2xl lg:text-3xl font-bold text-primary">
              {entry.total_points}
            </div>
            <div className="text-xs text-muted-foreground">points</div>
          </div>
        </div>
      </div>
    </div>
  );
}
