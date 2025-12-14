/**
 * @fileoverview Home page component showing recent activities overview.
 * @module @leaderboard/web/app/page
 *
 * @security This page uses dangerouslySetInnerHTML for activity.text content.
 * Ensure all activity text is sanitized at the data layer before display.
 */

import Link from "next/link";
import { Activity, Users, TrendingUp, ArrowRight } from "lucide-react";
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
    <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50/50 p-6 transition-all duration-300 hover:border-emerald-500/20 hover:bg-emerald-50/30 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-emerald-500/20 dark:hover:bg-emerald-950/20">
      <div className="flex flex-col justify-between h-full">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {title}
          </span>
          <div className="text-zinc-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {icon}
          </div>
        </div>
        <div>
          <div className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {value.toLocaleString()}
          </div>
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500 font-medium">
            {subtitle}
          </p>
        </div>
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
    <main className="min-h-screen w-full mt-12 bg-white text-zinc-900 dark:bg-black dark:text-zinc-50 selection:bg-emerald-100 dark:selection:bg-emerald-900">
      <div className="mx-auto max-w-5xl px-6 py-16 md:py-24 lg:px-8">
        {/* Hero Section */}
        <div className="mb-20 text-center md:mb-24">
          <h1 className="mb-6 text-5xl font-semibold tracking-tighter text-zinc-900 dark:text-white md:text-6xl lg:text-7xl">
            {config.org.name}
          </h1>
          <p className="mx-auto max-w-2xl text-lg font-medium leading-relaxed text-zinc-500 dark:text-zinc-400 md:text-xl">
            {config.org.description}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-20 grid gap-4 sm:grid-cols-3 md:gap-8">
          <StatCard
            title="Total Activities"
            value={totalActivities}
            subtitle="Past 7 days"
            icon={<Activity className="h-5 w-5" />}
          />
          <StatCard
            title="Active Contributors"
            value={uniqueContributors}
            subtitle="Past 7 days"
            icon={<Users className="h-5 w-5" />}
          />
          <StatCard
            title="Activity Types"
            value={totalActivityTypes}
            subtitle="Across organization"
            icon={<TrendingUp className="h-5 w-5" />}
          />
        </div>

        {/* Activity Feed */}
        <div className="space-y-16">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-8 dark:border-zinc-800">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
              Recent Updates
            </h2>
            <Link
              href="/leaderboard"
              className="group flex items-center gap-2 text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              View Leaderboard
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {activityGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-200 bg-zinc-50 py-20 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
              <div className="rounded-full bg-zinc-100 p-4 dark:bg-zinc-800">
                <Activity className="h-6 w-6 text-zinc-400" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-zinc-900 dark:text-white">
                No recent activities
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400">
                There are no activities recorded in the last 7 days.
              </p>
            </div>
          ) : (
            <div className="space-y-16">
              {activityGroups.map((group) => (
                <section key={group.activity_definition} className="group/section">
                  <div className="mb-6 flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
                        {group.activity_name}
                      </h3>
                      {group.activity_description && (
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                          {group.activity_description}
                        </p>
                      )}
                    </div>
                    <span className="mt-2 text-xs font-medium text-zinc-400 sm:mt-0">
                      {group.activities.length} {group.activities.length === 1 ? 'entry' : 'entries'}
                    </span>
                  </div>

                  <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {group.activities.slice(0, 10).map((activity) => (
                        <div
                          key={activity.slug}
                          className="flex gap-4 p-5 transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 sm:p-6"
                        >
                          <Avatar className="h-10 w-10 shrink-0 border border-zinc-100 dark:border-zinc-800">
                            <AvatarImage
                              src={activity.contributor_avatar_url || undefined}
                              alt={activity.contributor_name || activity.contributor}
                              className="object-cover"
                            />
                            <AvatarFallback className="bg-zinc-100 text-xs font-medium text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                              {(activity.contributor_name || activity.contributor)
                                .substring(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex min-w-0 flex-1 flex-col">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                              <Link
                                href={`/${activity.contributor}`}
                                className="font-semibold text-zinc-900 hover:text-emerald-600 dark:text-zinc-100 dark:hover:text-emerald-400"
                              >
                                {activity.contributor_name || activity.contributor}
                              </Link>
                              {activity.contributor_role && (
                                <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                                  {activity.contributor_role}
                                </span>
                              )}
                              <span className="text-zinc-300 dark:text-zinc-700">·</span>
                              <RelativeTime
                                date={activity.occured_at}
                                className="text-zinc-500 dark:text-zinc-500"
                              />
                            </div>

                            <div className="mt-2 space-y-1">
                              {activity.title && (
                                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                  {activity.link ? (
                                    <a
                                      href={activity.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="underline decoration-zinc-200 decoration-1 underline-offset-4 hover:decoration-emerald-500 hover:text-emerald-600 dark:decoration-zinc-700 dark:hover:decoration-emerald-400 dark:hover:text-emerald-400 transition-all"
                                    >
                                      {activity.title}
                                    </a>
                                  ) : (
                                    activity.title
                                  )}
                                </div>
                              )}
                              
                              {activity.text && (
                                <div
                                  className="prose prose-sm prose-zinc max-w-none text-zinc-600 dark:prose-invert dark:text-zinc-400 leading-relaxed [&_a]:text-emerald-600 [&_a]:no-underline [&_a]:hover:underline dark:[&_a]:text-emerald-400"
                                  dangerouslySetInnerHTML={{ __html: activity.text }}
                                />
                              )}
                            </div>
                          </div>

                          {activity.points !== null && activity.points > 0 && (
                            <div className="shrink-0 self-start">
                              <span className="inline-flex items-center rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/10 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20">
                                +{activity.points}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    {group.activities.length > 10 && (
                      <div className="border-t border-zinc-100 bg-zinc-50/50 p-3 text-center dark:border-zinc-800 dark:bg-zinc-900/30">
                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-500">
                          And {group.activities.length - 10} more entries...
                        </span>
                      </div>
                    )}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}