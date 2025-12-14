/**
 * @fileoverview Footer component with copyright.
 * @module @leaderboard/web/components/layout/Footer
 */

import type { YamlConfig } from "@leaderboard/config";

/**
 * Props for the Footer component.
 */
export interface FooterProps {
  /** Configuration object with org info */
  readonly config: Readonly<YamlConfig>;
}

/**
 * Application footer with copyright notice.
 *
 * @param props - Component props
 * @returns Footer component
 *
 * @example
 * ```tsx
 * <Footer config={config} />
 * ```
 */
export function Footer({ config }: FooterProps): React.ReactElement {
  return (
    <footer className="border-t py-6 mt-12">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        <p>
          © {new Date().getFullYear()} {config.org.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
