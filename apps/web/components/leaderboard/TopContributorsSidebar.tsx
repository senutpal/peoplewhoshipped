/**
 * @fileoverview TopContributorsSidebar component for activity-specific top contributors.
 * @module @leaderboard/web/components/leaderboard/TopContributorsSidebar
 */

import Link from "next/link";
import { Medal, Trophy } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@leaderboard/ui";
import type { TopContributorsByActivity } from "@leaderboard/database";

/**
 * Props for the TopContributorsSidebar component.
 */
export interface TopContributorsSidebarProps {
  /** Top contributors grouped by activity type */
  readonly topByActivity: Readonly<TopContributorsByActivity>;
}

/**
 * Sidebar displaying top contributors for each activity type.
 *
 * @param props - Component props
 * @returns TopContributorsSidebar component
 *
 * @example
 * ```tsx
 * <TopContributorsSidebar topByActivity={topByActivity} />
 * ```
 */
export function TopContributorsSidebar({
  topByActivity,
}: TopContributorsSidebarProps): React.ReactElement | null {
  const activityEntries = Object.entries(topByActivity);

  if (activityEntries.length === 0) {
    return null;
  }

  return (
    <aside className="w-full xl:w-80 shrink-0" aria-label="Top contributors by activity type">
      <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Top Contributors</h2>
      
      {/* Mobile/Tablet: Horizontal scroll */}
      <div className="xl:hidden">
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
          {activityEntries.map(([activityName, contributors]) => (
            <div key={activityName} className="rounded-lg border bg-card overflow-hidden min-w-[280px] snap-start shrink-0">
              <div className="bg-muted/50 px-4 py-2.5 border-b">
                <h3 className="font-semibold text-sm text-foreground">
                  {activityName}
                </h3>
              </div>
              <div className="p-3 space-y-2">
                {contributors.map((contributor, index) => (
                  <Link
                    key={contributor.username}
                    href={`/${contributor.username}`}
                    className="flex items-center gap-2.5 p-2 rounded-md hover:bg-accent transition-colors group"
                  >
                    <div className="flex items-center justify-center w-5 h-5 shrink-0">
                      {index === 0 && (
                        <Trophy className="h-4 w-4 text-yellow-500" />
                      )}
                      {index === 1 && <Medal className="h-4 w-4 text-gray-400" />}
                      {index === 2 && (
                        <Medal className="h-4 w-4 text-amber-600" />
                      )}
                    </div>
                    <Avatar className="h-8 w-8 shrink-0 border">
                      <AvatarImage
                        src={contributor.avatar_url || undefined}
                        alt={contributor.name || contributor.username}
                      />
                      <AvatarFallback className="text-xs">
                        {(contributor.name || contributor.username)
                          .substring(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors leading-tight">
                        {contributor.name || contributor.username}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {contributor.count}{" "}
                        {contributor.count === 1 ? "activity" : "activities"} ·{" "}
                        {contributor.points} pts
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: Vertical stack */}
      <div className="hidden xl:block space-y-4">
        {activityEntries.map(([activityName, contributors]) => (
          <div key={activityName} className="rounded-lg border bg-card overflow-hidden">
            <div className="bg-muted/50 px-4 py-2.5 border-b">
              <h3 className="font-semibold text-sm text-foreground">
                {activityName}
              </h3>
            </div>
            <div className="p-3 space-y-2">
              {contributors.map((contributor, index) => (
                <Link
                  key={contributor.username}
                  href={`/${contributor.username}`}
                  className="flex items-center gap-2.5 p-2 rounded-md hover:bg-accent transition-colors group"
                >
                  <div className="flex items-center justify-center w-5 h-5 shrink-0">
                    {index === 0 && (
                      <Trophy className="h-4 w-4 text-yellow-500" />
                    )}
                    {index === 1 && <Medal className="h-4 w-4 text-gray-400" />}
                    {index === 2 && (
                      <Medal className="h-4 w-4 text-amber-600" />
                    )}
                  </div>
                  <Avatar className="h-9 w-9 shrink-0 border">
                    <AvatarImage
                      src={contributor.avatar_url || undefined}
                      alt={contributor.name || contributor.username}
                    />
                    <AvatarFallback className="text-xs">
                      {(contributor.name || contributor.username)
                        .substring(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors leading-tight">
                      {contributor.name || contributor.username}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {contributor.count}{" "}
                      {contributor.count === 1 ? "activity" : "activities"} ·{" "}
                      {contributor.points} pts
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
