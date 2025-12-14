/**
 * @fileoverview Root layout component for the leaderboard web app.
 * @module @leaderboard/web/app/layout
 */

import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { DM_Sans, DM_Mono } from "next/font/google";
import { ThemeProvider } from "@leaderboard/ui";
import { getYamlConfigSync } from "@leaderboard/config";
import { Header, Footer } from "@/components/layout";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const config = getYamlConfigSync();

/**
 * Application metadata derived from configuration.
 */
export const metadata: Metadata = {
  title: config.meta.title,
  description: config.meta.description,
  icons: {
    icon: config.meta.favicon_url,
  },
  openGraph: {
    title: config.meta.title,
    description: config.meta.description,
    images: [config.meta.image_url],
    url: config.meta.site_url,
  },
  twitter: {
    card: "summary_large_image",
    title: config.meta.title,
    description: config.meta.description,
    images: [config.meta.image_url],
  },
};

/**
 * Viewport configuration.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

/**
 * Props for the RootLayout component.
 */
interface RootLayoutProps {
  /** Page children */
  children: ReactNode;
}

/**
 * Root layout wrapping all pages with theme provider, header, and footer.
 *
 * @param props - Component props
 * @returns Root layout
 */
export default function RootLayout({
  children,
}: RootLayoutProps): React.ReactElement {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${dmSans.className} ${dmMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen flex flex-col">
            <Header config={config} />
            <main className="flex-1">{children}</main>
            <Footer config={config} />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
