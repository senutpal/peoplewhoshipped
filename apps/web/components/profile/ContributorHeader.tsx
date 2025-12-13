/**
 * @fileoverview ContributorHeader component for profile page header.
 * @module @leaderboard/web/components/profile/ContributorHeader
 */

import { Award, Link as LinkIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@leaderboard/ui";
import type { Contributor } from "@leaderboard/database";
import type { SocialProfileConfig } from "@leaderboard/config";

/**
 * Props for the ContributorHeader component.
 */
export interface ContributorHeaderProps {
  /** Contributor data */
  contributor: Contributor;
  /** Bio HTML content (pre-rendered markdown) */
  bioHtml: string | null;
  /** Social profile configuration for icon mapping */
  socialProfiles?: Record<string, SocialProfileConfig>;
}

/**
 * Profile header with avatar, name, bio, and social links.
 *
 * @param props - Component props
 * @returns ContributorHeader component
 *
 * @example
 * ```tsx
 * <ContributorHeader
 *   contributor={contributor}
 *   bioHtml={bioHtml}
 *   socialProfiles={config.leaderboard.social_profiles}
 * />
 * ```
 */
export function ContributorHeader({
  contributor,
  bioHtml,
  socialProfiles,
}: ContributorHeaderProps): React.ReactElement {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <Avatar className="h-32 w-32">
          <AvatarImage
            src={contributor.avatar_url || undefined}
            alt={contributor.name || contributor.username}
          />
          <AvatarFallback className="text-4xl">
            {(contributor.name || contributor.username)
              .substring(0, 2)
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <h1 className="text-4xl font-bold mb-2">
            {contributor.name || contributor.username}
          </h1>
          <p className="text-xl text-muted-foreground mb-4">
            @{contributor.username}
          </p>

          {bioHtml && (
            <div
              className="text-muted-foreground mb-4 prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: bioHtml }}
            />
          )}

          <div className="flex flex-wrap gap-4 text-sm">
            {contributor.role && (
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                <span className="px-2 py-1 rounded-full bg-primary/10 text-primary">
                  {contributor.role}
                </span>
              </div>
            )}
            {contributor.social_profiles && socialProfiles && (
              <div className="flex items-center gap-3">
                {Object.entries(contributor.social_profiles).map(
                  ([key, url]) => {
                    return (
                      <a
                        key={key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                        title={key}
                      >
                        <LinkIcon className="h-5 w-5" />
                      </a>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
