/**
 * @fileoverview ContributorHeader component for profile page header.
 * @module @leaderboard/web/components/profile/ContributorHeader
 *
 * @security This component uses dangerouslySetInnerHTML for bio content.
 * Ensure bioHtml is sanitized server-side before passing to this component.
 */

import {
  Award,
  Link as LinkIcon,
  Github,
  Twitter,
  Linkedin,
  Mail,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@leaderboard/ui";
import type { Contributor } from "@leaderboard/database";
import type { SocialProfileConfig } from "@leaderboard/config";

/**
 * Props for the ContributorHeader component.
 */
export interface ContributorHeaderProps {
  /** Contributor data */
  readonly contributor: Contributor;
  /**
   * Bio HTML content (pre-rendered markdown).
   * @security MUST be sanitized before passing to prevent XSS attacks.
   */
  readonly bioHtml: string | null;
  /** Social profile configuration for icon mapping */
  readonly socialProfiles?: Readonly<Record<string, SocialProfileConfig>>;
}

/**
 * Helper to determine the appropriate icon for a social link.
 */
const getSocialIcon = (key: string) => {
  const lowerKey = key.toLowerCase();
  if (lowerKey.includes("github")) return Github;
  if (lowerKey.includes("twitter") || lowerKey.includes("x.com")) return Twitter;
  if (lowerKey.includes("linkedin")) return Linkedin;
  if (lowerKey.includes("mail") || lowerKey.includes("email")) return Mail;
  return LinkIcon;
};

/**
 * Profile header.
 *
 * @param props - Component props
 * @returns ContributorHeader component
 */
export function ContributorHeader({
  contributor,
  bioHtml,
  socialProfiles,
}: ContributorHeaderProps): React.ReactElement {
  const initials = (contributor.name || contributor.username)
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="flex gap-5 sm:gap-6">
      {/* Avatar - Premium styling */}
      <div className="relative shrink-0">
        <Avatar className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl border-2 border-background shadow-luxury ring-1 ring-border/50">
          <AvatarImage
            src={contributor.avatar_url || undefined}
            alt={contributor.name || contributor.username}
            className="object-cover"
          />
          <AvatarFallback className="rounded-2xl bg-secondary text-lg font-medium text-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        {/* Subtle gold accent */}
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 border-2 border-background flex items-center justify-center">
          <Award className="w-2.5 h-2.5 text-white" />
        </div>
      </div>

      {/* Info Section */}
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        {/* Name & Handle */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h1 className="truncate text-xl font-semibold text-foreground">
            {contributor.name || contributor.username}
          </h1>
          
          <span className="truncate mt-[5px] font-mono text-sm text-muted-foreground">
            @{contributor.username}
          </span>

          {contributor.role && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-[var(--emerald-light)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--emerald)] ring-1 ring-inset ring-[var(--emerald)]/20">
              {contributor.role}
            </span>
          )}
        </div>

        {/* Bio */}
        {bioHtml && (
          <div
            className="prose prose-sm max-w-2xl mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground [&_a]:text-[var(--emerald)] [&_a]:no-underline [&_a]:hover:underline dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: bioHtml }}
          />
        )}

        {/* Social Links */}
        {contributor.social_profiles && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {Object.entries(contributor.social_profiles).map(([key, url]) => {
              const Icon = getSocialIcon(key);
              return (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 text-muted-foreground transition-all hover:bg-[var(--emerald-light)] hover:text-[var(--emerald)] hover:border-[var(--emerald)]/30"
                  title={key}
                  aria-label={`Visit ${key} profile (opens in new tab)`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}