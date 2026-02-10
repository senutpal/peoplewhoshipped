/**
 * @fileoverview OpenGraph image generation for contributor profiles.
 * @module @leaderboard/web/app/[username]/opengraph-image
 */

import { ImageResponse } from "next/og";
import {
  getContributorProfile,
  getAllContributorUsernames,
} from "@/lib/static-data";
import { getYamlConfigSync } from "@leaderboard/config";

/** Image runtime configuration */
export const runtime = "nodejs";
export const dynamic = "force-static";
export const alt = "Contributor Profile";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const config = getYamlConfigSync();

/**
 * Generate static params for all contributors.
 */
export async function generateStaticParams(): Promise<
  Array<{ username: string }>
> {
  const usernames = await getAllContributorUsernames();
  return usernames.map((username) => ({ username }));
}

/**
 * Props for the OG image component.
 */
interface OGImageProps {
  params: Promise<{ username: string }>;
}

/**
 * Generate OpenGraph image for a contributor profile.
 *
 * @param props - Component props
 * @returns ImageResponse with OG image
 */
export default async function OGImage({
  params,
}: OGImageProps): Promise<ImageResponse> {
  const { username } = await params;
  const { contributor, totalPoints, activityByDate } =
    await getContributorProfile(username);

  if (!contributor) {
    return new ImageResponse(
      <div
        style={{
          fontSize: 40,
          background: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Contributor not found
      </div>,
      { ...size },
    );
  }

  // Calculate activity total
  const activities = Object.values(activityByDate).reduce(
    (sum, count) => sum + count,
    0,
  );

  return new ImageResponse(
    <div
      style={{
        background: "linear-gradient(to bottom right, #0A0908, #15130F)",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Avatar */}
      <div
        style={{
          display: "flex",
          marginBottom: "40px",
        }}
      >
        {contributor.avatar_url ? (
          <img
            src={contributor.avatar_url}
            alt={contributor.name || contributor.username}
            width={180}
            height={180}
            style={{
              borderRadius: "50%",
              border: "6px solid #4AE3A8",
            }}
          />
        ) : (
          <div
            style={{
              width: "180px",
              height: "180px",
              borderRadius: "50%",
              background: "#4AE3A8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "72px",
              fontWeight: "bold",
              color: "#0A0908",
              border: "6px solid #2D7A5F",
            }}
          >
            {(contributor.name || contributor.username)
              .substring(0, 2)
              .toUpperCase()}
          </div>
        )}
      </div>

      {/* Name */}
      <div
        style={{
          fontSize: "56px",
          fontWeight: "bold",
          color: "#F5F2ED",
          marginBottom: "16px",
          textAlign: "center",
          display: "flex",
        }}
      >
        {contributor.name || contributor.username}
      </div>

      {/* Username */}
      <div
        style={{
          fontSize: "32px",
          color: "#A09A92",
          marginBottom: "48px",
          display: "flex",
        }}
      >
        @{contributor.username}
      </div>

      {/* Stats */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "60px",
          marginBottom: "40px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              fontSize: "48px",
              fontWeight: "bold",
              color: "#4AE3A8",
              textAlign: "center",
              display: "flex",
            }}
          >
            {totalPoints}
          </div>
          <div
            style={{
              fontSize: "20px",
              color: "#A09A92",
              textAlign: "center",
              display: "flex",
            }}
          >
            Total Points
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              fontSize: "48px",
              fontWeight: "bold",
              color: "#4AE3A8",
              textAlign: "center",
              display: "flex",
            }}
          >
            {activities}
          </div>
          <div
            style={{
              fontSize: "20px",
              color: "#A09A92",
              textAlign: "center",
              display: "flex",
            }}
          >
            Activities
          </div>
        </div>
      </div>

      {/* Organization */}
      <div
        style={{
          fontSize: "24px",
          color: "#8B8680",
          display: "flex",
          flexDirection: "row",
          gap: "12px",
        }}
      >
        <span>{config.org.name}</span>
        <span>•</span>
        <span>Contributor Leaderboard</span>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
