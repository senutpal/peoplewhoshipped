/**
 * @fileoverview Root layout component for the leaderboard web app.
 * @module @leaderboard/web/app/layout
 */

import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { DM_Sans, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@leaderboard/ui";
import { getYamlConfigSync } from "@leaderboard/config";
import { Header, Footer } from "@/components/layout";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});


const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
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
        className={`${dmSans.variable} ${jakarta.variable} ${jetbrainsMono.variable} font-[family-name:var(--font-dm-sans)] antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Subtle background glow effect */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
            <div 
              className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-30 blur-[120px]"
              style={{ background: "var(--gradient-glow)" }}
            />
            <div 
              className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full opacity-20 blur-[100px]"
              style={{ background: "radial-gradient(ellipse, rgba(196, 165, 116, 0.08), transparent)" }}
            />
          </div>
          
          <div className="relative min-h-screen flex flex-col">
            <Header config={config} />
            <main className="flex-1">{children}</main>
            <Footer config={config} />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
