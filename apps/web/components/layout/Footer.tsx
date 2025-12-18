/**
 * @fileoverview Footer component with copyright.
 * @module @leaderboard/web/components/layout/Footer
 */

import Link from "next/link";
import type { YamlConfig } from "@leaderboard/config";

/**
 * Props for the Footer component.
 */
export interface FooterProps {
  /** Configuration object with org info */
  readonly config: Readonly<YamlConfig>;
}

/**
 * Application footer with copyright notice and subtle branding.
 *
 * @param props - Component props
 * @returns Footer component
 */
export function Footer({ config }: FooterProps): React.ReactElement {
  return (
    <footer className="relative mt-16 sm:mt-24">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p className="text-sm text-muted-foreground tracking-wide">
            © {new Date().getFullYear()}{" "}
            <span className="font-medium text-foreground">{config.org.name}</span>
            <span className="hidden sm:inline">. All rights reserved.</span>
          </p>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link
              href="/"
              className="hover:text-[var(--emerald)] transition-colors duration-300"
            >
              Home
            </Link>
            <Link
              href="/leaderboard/week"
              className="hover:text-[var(--emerald)] transition-colors duration-300"
            >
              Leaderboard
            </Link>
            <Link
              href="/people"
              className="hover:text-[var(--emerald)] transition-colors duration-300"
            >
              People
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
