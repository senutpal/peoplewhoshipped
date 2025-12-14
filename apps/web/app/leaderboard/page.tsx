/**
 * @fileoverview Leaderboard index page - redirects to weekly leaderboard.
 * @module @leaderboard/web/app/leaderboard/page
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leaderboard",
};

/**
 * Leaderboard index page - client redirects to /leaderboard/week.
 */
export default function LeaderboardPage(): React.ReactElement {
  return (
    <>
      <meta httpEquiv="refresh" content="0;url=/leaderboard/week" />
      <div className="container mx-auto px-4 py-8 mt-36 text-center">
        <p className="text-muted-foreground">
          Redirecting to weekly leaderboard...
        </p>
        <a href="/leaderboard/week" className="text-primary hover:underline">
          Click here if not redirected automatically
        </a>
      </div>
    </>
  );
}
