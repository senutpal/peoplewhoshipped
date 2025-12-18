/**
 * @fileoverview Contributor profile page.
 * @module @leaderboard/web/app/[username]/page
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { marked } from "marked";
import { ArrowLeft } from "lucide-react";
import {
  getAllContributorUsernames,
  getContributorProfile,
  listActivityDefinitions,
} from "@/lib/static-data";
import { generateActivityGraphData } from "@leaderboard/utils";
import { getYamlConfigSync } from "@leaderboard/config";
import { ContributorHeader, StatsCards } from "@/components/profile";
import { ActivityGraph, ActivityBreakdown, ActivityTimeline } from "@/components/activity";

const config = getYamlConfigSync();

/**
 * Generate static params for all contributors.
 */
export async function generateStaticParams(): Promise<Array<{ username: string }>> {
  const usernames = await getAllContributorUsernames();
  return usernames.map((username) => ({ username }));
}

/**
 * Props for the contributor page.
 */
interface ContributorPageProps {
  params: Promise<{ username: string }>;
}

/**
 * Generate metadata for the contributor page.
 */
export async function generateMetadata({
  params,
}: ContributorPageProps): Promise<Metadata> {
  const { username } = await params;
  const { contributor, totalPoints, activities } = await getContributorProfile(
    username
  );

  if (!contributor) {
    return {
      title: "Contributor Not Found",
    };
  }

  const title = `${contributor.name || contributor.username} - ${config.org.name} Contributor`;
  const description =
    contributor.bio ||
    `${contributor.name || contributor.username} has earned ${totalPoints} points from ${activities.length} activities on ${config.org.name}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${config.meta.site_url}/${username}`,
      siteName: config.meta.title,
      type: "profile",
    },
  };
}

/**
 * Contributor profile page showing stats, activity graph, and timeline.
 *
 * @param props - Component props
 * @returns Contributor page component
 */
export default async function ContributorPage({
  params,
}: ContributorPageProps): Promise<React.ReactElement> {
  const { username } = await params;

  const [
    { contributor, activities, totalPoints, activityByDate },
    activityDefinitions,
  ] = await Promise.all([
    getContributorProfile(username),
    listActivityDefinitions(),
  ]);

  if (!contributor) {
    notFound();
  }

  const activityGraphData = generateActivityGraphData(activityByDate, 365);
  const bioHtml = contributor.bio ? await marked.parse(contributor.bio) : null;

  const activityBreakdown = activities.reduce((acc, activity) => {
    const key = activity.activity_name;
    if (!acc[key]) {
      acc[key] = { count: 0, points: 0 };
    }
    acc[key].count += 1;
    acc[key].points += activity.points || 0;
    return acc;
  }, {} as Record<string, { count: number; points: number }>);

  const activitiesForGraph = activities.map((a) => ({
    activity_definition_name: a.activity_name,
    occured_at: a.occured_at,
  }));

  const activitiesForBreakdown = activities.map((activity) => ({
    activity_definition_name: activity.activity_name,
    occured_at: activity.occured_at,
    points: activity.points || 0,
  }));

  return (
    <main className="min-h-screen w-full pt-20 sm:pt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Back Link */}
        <Link
          href="/leaderboard/week"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-[var(--emerald)] transition-colors mb-6 sm:mb-8 animate-fade-up"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Leaderboard
        </Link>

        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Left Column: Profile & Breakdown (Sticky on Desktop) */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24 space-y-6 sm:space-y-8">
              {/* Profile Card */}
              <section className="rounded-2xl border border-border/50 bg-card p-5 sm:p-6 shadow-luxury animate-fade-up delay-100">
                <ContributorHeader
                  contributor={contributor}
                  bioHtml={bioHtml}
                  socialProfiles={config.leaderboard.social_profiles}
                />
              </section>

              {/* Activity Breakdown Card - Desktop */}
              <section className="hidden lg:block rounded-2xl border border-border/50 bg-card shadow-luxury overflow-hidden animate-fade-up delay-200">
                <div className="border-b border-border/50 px-5 py-4">
                  <h3 className="text-sm font-semibold text-foreground tracking-wide">
                    Activity Distribution
                  </h3>
                </div>
                <div className="p-5">
                  <ActivityBreakdown activities={activitiesForBreakdown} />
                </div>
              </section>
            </div>
          </div>

          {/* Right Column: Stats, Graph, Timeline */}
          <div className="space-y-6 sm:space-y-8 lg:col-span-7">
            {/* Stats Row */}
            <section className="rounded-2xl border border-border/50 bg-card p-5 sm:p-6 shadow-luxury animate-fade-up delay-150">
              <StatsCards
                totalPoints={totalPoints}
                totalActivities={activities.length}
                activityTypes={Object.keys(activityBreakdown).length}
              />
            </section>

            {/* Activity Graph Section */}
            <section className="rounded-2xl border border-border/50 bg-card shadow-luxury overflow-hidden animate-fade-up delay-200">
              <div className="flex items-center justify-between border-b border-border/50 px-5 sm:px-6 py-4 sm:py-5">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground font-[family-name:var(--font-jakarta)]">
                    Contribution History
                  </h2>
                  <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">
                    <span className="text-[var(--emerald)] font-medium">{activities.length}</span> contributions in the last year
                  </p>
                </div>
              </div>
              <div className="p-5 sm:p-6">
                <ActivityGraph
                  data={activityGraphData}
                  activities={activitiesForGraph}
                  activityDefinitions={activityDefinitions}
                />
              </div>
            </section>

            {/* Mobile-only Breakdown */}
            <section className="lg:hidden rounded-2xl border border-border/50 bg-card shadow-luxury overflow-hidden animate-fade-up">
              <div className="border-b border-border/50 px-5 py-4">
                <h3 className="text-sm font-semibold text-foreground tracking-wide">
                  Activity Distribution
                </h3>
              </div>
              <div className="p-5">
                <ActivityBreakdown activities={activitiesForBreakdown} />
              </div>
            </section>

            {/* Timeline Section */}
            <section className="rounded-2xl border border-border/50 bg-card shadow-luxury overflow-hidden animate-fade-up delay-300">
              <div className="border-b border-border/50 px-5 sm:px-6 py-4 sm:py-5">
                <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground font-[family-name:var(--font-jakarta)]">
                  Recent Activity
                </h2>
              </div>
              <div className="p-4 sm:p-5">
                <ActivityTimeline
                  activities={activities}
                  activityDefinitions={activityDefinitions}
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}