/**
 * @fileoverview ContributorHeader component for profile page header.
 * @module @leaderboard/web/components/profile/ContributorHeader
 *
 * @security This component uses dangerouslySetInnerHTML for bio content.
 * Ensure bioHtml is sanitized server-side before passing to this component.
 * Recommended: Use DOMPurify or similar sanitization library.
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
 * Compact profile header with inline layout.
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
      {/* Avatar - Fixed Size, Compact */}
      <div className="relative shrink-0">
        <Avatar className="h-16 w-16 rounded-2xl border border-zinc-100 shadow-sm sm:h-20 sm:w-20 dark:border-zinc-800">
          <AvatarImage
            src={contributor.avatar_url || undefined}
            alt={contributor.name || contributor.username}
            className="object-cover"
          />
          <AvatarFallback className="rounded-2xl bg-zinc-50 text-lg font-medium text-zinc-900 dark:bg-zinc-900 dark:text-zinc-200">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Info Section - Fluid Width */}
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        {/* Top Row: Name, Handle, Role */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h1 className="truncate text-lg font-bold tracking-tight text-zinc-900 sm:text-xl dark:text-white">
            {contributor.name || contributor.username}
          </h1>
          
          <span className="truncate font-mono text-sm text-zinc-500 dark:text-zinc-500">
            @{contributor.username}
          </span>

          {contributor.role && (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 ring-1 ring-inset ring-emerald-600/10 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20">
              <Award className="h-2.5 w-2.5" />
              {contributor.role}
            </span>
          )}
        </div>

        {/* Middle Row: Bio */}
        {bioHtml && (
          <div
            className="prose prose-sm prose-zinc mt-1.5 max-w-2xl line-clamp-2 text-sm leading-relaxed text-zinc-600 dark:prose-invert dark:text-zinc-400"
            dangerouslySetInnerHTML={{ __html: bioHtml }}
          />
        )}

        {/* Bottom Row: Socials */}
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
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-zinc-400 transition-all hover:bg-green-100 hover:text-green-900 dark:hover:bg-green-900 dark:hover:text-green-100"
                  title={key}
                  aria-label={`Visit ${key} profile (opens in new tab)`}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}