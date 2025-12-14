/**
 * @fileoverview Contributor profile page.
 * @module @leaderboard/web/app/[username]/page
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { marked } from "marked";
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
    <main className="min-h-screen w-full bg-[#FAFAFA] dark:bg-black text-zinc-900 dark:text-zinc-100 antialiased selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-emerald-50 mt-16">

      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: Profile & Breakdown (Sticky on Desktop) */}
          <div className="lg:col-span-5 lg:space-y-8">
            <div className="sticky top-24 space-y-8">
              {/* Profile Card */}
              <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white p-1 shadow-sm transition-all dark:border-zinc-800 dark:bg-zinc-900">
                <div className="rounded-[20px] bg-zinc-50/50 p-6 dark:bg-black/40">
                  <ContributorHeader
                    contributor={contributor}
                    bioHtml={bioHtml}
                    socialProfiles={config.leaderboard.social_profiles}
                  />
                </div>
              </section>

              {/* Activity Breakdown Card */}
              <section className="hidden lg:block overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                    Distribution
                  </h3>
                </div>
                <div className="p-6">
                  <ActivityBreakdown activities={activitiesForBreakdown} />
                </div>
              </section>
            </div>
          </div>

          {/* Right Column: Stats, Graph, Timeline */}
          <div className="space-y-8 lg:col-span-7">
            {/* Stats Row */}
            <section className="grid grid-cols-1 gap-4 ">
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <StatsCards
                  totalPoints={totalPoints}
                  totalActivities={activities.length}
                  activityTypes={Object.keys(activityBreakdown).length}
                />
              </div>
            </section>

            {/* Activity Graph Section */}
            <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between border-b border-zinc-100 px-8 py-6 dark:border-zinc-800">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
                    Contribution History
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {activities.length} contributions in the last year
                  </p>
                </div>
              </div>
              <div className="p-8">
                <ActivityGraph
                  data={activityGraphData}
                  activities={activitiesForGraph}
                  activityDefinitions={activityDefinitions}
                />
              </div>
            </section>

            {/* Mobile-only Breakdown (Visible only on small screens) */}
            <section className="lg:hidden overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                  Distribution
                </h3>
              </div>
              <div className="p-6">
                <ActivityBreakdown activities={activitiesForBreakdown} />
              </div>
            </section>

            {/* Timeline Section */}
            <section className="rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="border-b border-zinc-100 px-8 py-6 dark:border-zinc-800">
                <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
                  Recent Activity
                </h2>
              </div>
              <div className="p-4">
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