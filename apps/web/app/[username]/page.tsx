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

  // Convert bio markdown to HTML
  const bioHtml = contributor.bio ? await marked.parse(contributor.bio) : null;

  // Calculate activity breakdown
  const activityBreakdown = activities.reduce((acc, activity) => {
    const key = activity.activity_name;
    if (!acc[key]) {
      acc[key] = { count: 0, points: 0 };
    }
    acc[key].count += 1;
    acc[key].points += activity.points || 0;
    return acc;
  }, {} as Record<string, { count: number; points: number }>);

  // Prepare data for components
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
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <ContributorHeader
        contributor={contributor}
        bioHtml={bioHtml}
        socialProfiles={config.leaderboard.social_profiles}
      />

      {/* Stats Cards */}
      <StatsCards
        totalPoints={totalPoints}
        totalActivities={activities.length}
        activityTypes={Object.keys(activityBreakdown).length}
      />

      {/* Activity Overview */}
      <div className="rounded-lg border bg-card mb-8">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Activity Overview</h2>
          <p className="text-sm text-muted-foreground">
            {activities.length} contributions in the last year
          </p>
        </div>
        <div className="p-6">
          <ActivityGraph
            data={activityGraphData}
            activities={activitiesForGraph}
            activityDefinitions={activityDefinitions}
          />
        </div>
      </div>

      {/* Activity Breakdown */}
      <div className="mb-8">
        <ActivityBreakdown activities={activitiesForBreakdown} />
      </div>

      {/* Activity Timeline */}
      <ActivityTimeline
        activities={activities}
        activityDefinitions={activityDefinitions}
      />

      {/* Back to Leaderboard */}
      <div className="mt-8 text-center">
        <Link
          href="/leaderboard"
          className="text-sm text-primary hover:underline"
        >
          ← Back to Leaderboard
        </Link>
      </div>
    </div>
  );
}
