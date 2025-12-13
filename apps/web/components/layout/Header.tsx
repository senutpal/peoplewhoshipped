/**
 * @fileoverview Header component with navigation and theme selector.
 * @module @leaderboard/web/components/layout/Header
 */

import Link from "next/link";
import Image from "next/image";
import type { YamlConfig } from "@leaderboard/config";
import { ThemeSelector } from "./ThemeSelector";

/**
 * Props for the Header component.
 */
export interface HeaderProps {
  /** Configuration object with org info */
  config: YamlConfig;
}

/**
 * Application header with logo, navigation links, and theme selector.
 *
 * @param props - Component props
 * @returns Header component
 *
 * @example
 * ```tsx
 * <Header config={config} />
 * ```
 */
export function Header({ config }: HeaderProps): React.ReactElement {
  return (
    <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src={config.org.logo_url}
              alt={config.org.name}
              width={40}
              height={40}
              className="rounded"
            />
            <span className="font-semibold text-lg">{config.org.name}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Home
            </Link>
            <Link
              href="/leaderboard"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Leaderboard
            </Link>
            <Link
              href="/people"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              People
            </Link>
          </nav>
        </div>
        <ThemeSelector />
      </div>
    </header>
  );
}
