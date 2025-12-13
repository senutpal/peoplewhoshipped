/**
 * @fileoverview People page showing all contributors in an avatar grid.
 * @module @leaderboard/web/app/people/page
 */

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage, Tooltip, TooltipContent, TooltipTrigger } from "@leaderboard/ui";
import { getAllContributorsWithAvatars, type ContributorWithAvatar } from "@/lib/static-data";

/**
 * People page displaying all contributors as an avatar grid.
 *
 * @returns People page component
 */
export default async function PeoplePage(): Promise<React.ReactElement> {
  const contributors: ContributorWithAvatar[] = await getAllContributorsWithAvatars();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">People</h1>
        <p className="text-muted-foreground">
          {contributors.length} contributor{contributors.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div
        className="grid people-avatar-grid"
        style={{ gap: "var(--people-grid-gap)" }}
      >
        {contributors.map((contributor) => (
          <Tooltip key={contributor.username}>
            <TooltipTrigger asChild>
              <Link
                href={`/${contributor.username}`}
                className="block transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full"
              >
                <Avatar className="size-full aspect-square">
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
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-sm">
                <div className="font-medium">
                  {contributor.name || contributor.username}
                </div>
                <div className="text-muted-foreground">
                  @{contributor.username}
                </div>
                {contributor.role && (
                  <div className="text-xs text-primary mt-1">
                    {contributor.role}
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}
