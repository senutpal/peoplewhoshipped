/**
 * @fileoverview Home page component showing recent activities overview.
 * @module @leaderboard/web/app/page
 *
 * @security This page uses dangerouslySetInnerHTML for activity.text content.
 * Ensure all activity text is sanitized at the data layer before display.
 */

import Link from "next/link";
import { Activity, Users, TrendingUp, ArrowRight, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@leaderboard/ui";
import { getYamlConfigSync } from "@leaderboard/config";
import { getRecentActivitiesGroupedByType } from "@/lib/static-data";
import { RelativeTime } from "@/components/shared";

const config = getYamlConfigSync();

/**
 * Stat card component 
 */
function StatCard({
  title,
  value,
  subtitle,
  icon,
  delay = 0,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  delay?: number;
}): React.ReactElement {
  return (
    <div 
      className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 sm:p-8 transition-all duration-500 hover:border-[var(--emerald)]/30 hover:shadow-luxury animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Subtle glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-[var(--emerald-light)] to-transparent" />
      
      <div className="relative flex flex-col justify-between h-full">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <span className="text-xs sm:text-sm font-medium tracking-wide uppercase text-muted-foreground group-hover:text-[var(--emerald)] transition-colors duration-300">
            {title}
          </span>
          <div className="text-muted-foreground/50 group-hover:text-[var(--emerald)] transition-colors duration-300">
            {icon}
          </div>
        </div>
        <div>
          <div className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground font-[family-name:var(--font-jakarta)]">
            {value.toLocaleString()}
          </div>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground font-medium">
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
    <main className="min-h-screen w-full pt-20 sm:pt-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        {/* Hero Section */}
        <div className="mb-16 sm:mb-20 lg:mb-24 text-center">
          <h1 className="mb-4 sm:mb-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-foreground font-[family-name:var(--font-jakarta)] animate-fade-up delay-100">
            {config.org.name}
          </h1>
          
          <p className="mx-auto max-w-2xl text-base sm:text-lg lg:text-xl font-normal leading-relaxed text-muted-foreground animate-fade-up delay-200">
            {config.org.description}
          </p>
          
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-fade-up delay-300">
            <Link
              href="/leaderboard/week"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-foreground text-background font-medium text-sm transition-all duration-300 hover:bg-foreground/90 hover:shadow-lg"
            >
              View Leaderboard
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/people"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border bg-card text-foreground font-medium text-sm transition-all duration-300 hover:bg-secondary hover:border-[var(--emerald)]/30"
            >
              Meet Contributors
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-16 sm:mb-20 lg:mb-24 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3">
          <StatCard
            title="Total Activities"
            value={totalActivities}
            subtitle="Past 7 days"
            icon={<Activity className="h-5 w-5" />}
            delay={400}
          />
          <StatCard
            title="Active Contributors"
            value={uniqueContributors}
            subtitle="Past 7 days"
            icon={<Users className="h-5 w-5" />}
            delay={500}
          />
          <StatCard
            title="Activity Types"
            value={totalActivityTypes}
            subtitle="Across organization"
            icon={<TrendingUp className="h-5 w-5" />}
            delay={600}
          />
        </div>

        {/* Activity Feed */}
        <div className="space-y-12 sm:space-y-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/50 animate-fade-up delay-700">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground font-[family-name:var(--font-jakarta)]">
                Recent Updates
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Latest contributions from the community
              </p>
            </div>
            <Link
              href="/leaderboard/week"
              className="group inline-flex items-center gap-2 text-sm font-medium text-[var(--emerald)] transition-colors hover:text-[var(--emerald-dark)]"
            >
              View All
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {activityGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-16 sm:py-20 text-center animate-fade-up">
              <div className="rounded-full bg-secondary p-4 mb-4">
                <Activity className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground">
                No recent activities
              </h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                There are no activities recorded in the last 7 days.
              </p>
            </div>
          ) : (
            <div className="space-y-10 sm:space-y-12">
              {activityGroups.map((group, groupIndex) => (
                <section 
                  key={group.activity_definition} 
                  className="animate-fade-up"
                  style={{ animationDelay: `${800 + groupIndex * 100}ms` }}
                >
                  <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground">
                        {group.activity_name}
                      </h3>
                      {group.activity_description && (
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {group.activity_description}
                        </p>
                      )}
                    </div>
                    <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
                      {group.activities.length} {group.activities.length === 1 ? 'entry' : 'entries'}
                    </span>
                  </div>

                  <div className="rounded-2xl border border-border/50 bg-card shadow-luxury overflow-hidden">
                    <div className="divide-y divide-border/50">
                      {group.activities.slice(0, 10).map((activity) => (
                        <div
                          key={activity.slug}
                          className="flex gap-3 sm:gap-4 p-4 sm:p-6 transition-colors hover:bg-secondary/30"
                        >
                          <Avatar className="h-10 w-10 sm:h-11 sm:w-11 shrink-0 border border-border/50 shadow-sm">
                            <AvatarImage
                              src={activity.contributor_avatar_url || undefined}
                              alt={activity.contributor_name || activity.contributor}
                              className="object-cover"
                            />
                            <AvatarFallback className="bg-secondary text-xs font-medium text-muted-foreground">
                              {(activity.contributor_name || activity.contributor)
                                .substring(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex min-w-0 flex-1 flex-col">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                              <Link
                                href={`/${activity.contributor}`}
                                className="font-semibold text-foreground hover:text-[var(--emerald)] transition-colors"
                              >
                                {activity.contributor_name || activity.contributor}
                              </Link>
                              {activity.contributor_role && (
                                <span className="inline-flex items-center rounded-md bg-[var(--emerald-light)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[var(--emerald)]">
                                  {activity.contributor_role}
                                </span>
                              )}
                              <span className="text-border">·</span>
                              <RelativeTime
                                date={activity.occured_at}
                                className="text-muted-foreground"
                              />
                            </div>

                            <div className="mt-2 space-y-1">
                              {activity.title && (
                                <div className="text-sm font-medium text-foreground">
                                  {activity.link ? (
                                    <a
                                      href={activity.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="underline decoration-border decoration-1 underline-offset-4 hover:decoration-[var(--emerald)] hover:text-[var(--emerald)] transition-all"
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
                                  className="prose prose-sm prose-zinc max-w-none text-muted-foreground leading-relaxed [&_a]:text-[var(--emerald)] [&_a]:no-underline [&_a]:hover:underline dark:prose-invert"
                                  dangerouslySetInnerHTML={{ __html: activity.text }}
                                />
                              )}
                            </div>
                          </div>

                          {activity.points !== null && activity.points > 0 && (
                            <div className="shrink-0 self-start">
                              <span className="inline-flex items-center rounded-lg bg-[var(--emerald-light)] px-2.5 py-1.5 text-xs font-semibold text-[var(--emerald)] ring-1 ring-inset ring-[var(--emerald)]/20">
                                +{activity.points}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    {group.activities.length > 10 && (
                      <div className="border-t border-border/50 bg-secondary/30 p-3 text-center">
                        <span className="text-xs font-medium text-muted-foreground">
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