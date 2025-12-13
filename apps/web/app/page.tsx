/**
 * @fileoverview Home page component showing recent activities overview.
 * @module @leaderboard/web/app/page
 */

import Link from "next/link";
import { Activity, Users, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@leaderboard/ui";
import { getYamlConfigSync } from "@leaderboard/config";
import { getRecentActivitiesGroupedByType } from "@/lib/static-data";
import { RelativeTime } from "@/components/shared";

const config = getYamlConfigSync();

/**
 * Stat card component for home page.
 */
function StatCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
}): React.ReactElement {
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
 * Home page displaying organization info and recent activities.
 *
 * @returns Home page component
 */
export default async function HomePage(): Promise<React.ReactElement> {
  const activityGroups = await getRecentActivitiesGroupedByType();

  // Calculate stats
  const totalActivities = activityGroups.reduce(
    (sum, group) => sum + group.activities.length,
    0
  );
  const uniqueContributors = new Set(
    activityGroups.flatMap((group) =>
      group.activities.map((a) => a.contributor)
    )
  ).size;
  const totalActivityTypes = activityGroups.length;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">{config.org.name}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {config.org.description}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard
          title="Total Activities"
          value={totalActivities}
          subtitle="Last 7 days"
          icon={<Activity className="h-4 w-4" />}
        />
        <StatCard
          title="Active Contributors"
          value={uniqueContributors}
          subtitle="Last 7 days"
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="Activity Types"
          value={totalActivityTypes}
          subtitle="Different types"
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      {/* Activity Feed Grouped by Type */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Recent Activities</h2>
          <Link
            href="/leaderboard"
            className="text-sm text-primary hover:underline"
          >
            View Leaderboard →
          </Link>
        </div>

        {activityGroups.length === 0 ? (
          <div className="rounded-lg border bg-card p-12 text-center text-muted-foreground">
            No activities in the last 7 days
          </div>
        ) : (
          activityGroups.map((group) => (
            <div
              key={group.activity_definition}
              className="rounded-lg border bg-card"
            >
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {group.activity_name}
                    </h3>
                    {group.activity_description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {group.activity_description}
                      </p>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {group.activities.length}{" "}
                    {group.activities.length === 1 ? "activity" : "activities"}
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {group.activities.slice(0, 10).map((activity) => (
                    <div
                      key={activity.slug}
                      className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={activity.contributor_avatar_url || undefined}
                          alt={
                            activity.contributor_name || activity.contributor
                          }
                        />
                        <AvatarFallback>
                          {(activity.contributor_name || activity.contributor)
                            .substring(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/${activity.contributor}`}
                            className="font-medium hover:text-primary transition-colors"
                          >
                            {activity.contributor_name || activity.contributor}
                          </Link>
                          {activity.contributor_role && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                              {activity.contributor_role}
                            </span>
                          )}
                          <RelativeTime
                            date={activity.occured_at}
                            className="text-sm text-muted-foreground"
                          />
                        </div>
                        {activity.title && (
                          <p className="text-sm mt-1 truncate">
                            {activity.link ? (
                              <a
                                href={activity.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-primary hover:underline"
                              >
                                {activity.title}
                              </a>
                            ) : (
                              activity.title
                            )}
                          </p>
                        )}
                        {activity.text && (
                          <div
                            className="text-sm text-muted-foreground mt-1 prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: activity.text }}
                          />
                        )}
                      </div>
                      {activity.points !== null && activity.points > 0 && (
                        <div className="text-sm font-medium text-primary">
                          +{activity.points}
                        </div>
                      )}
                    </div>
                  ))}
                  {group.activities.length > 10 && (
                    <p className="text-sm text-muted-foreground text-center pt-2">
                      And {group.activities.length - 10} more...
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
