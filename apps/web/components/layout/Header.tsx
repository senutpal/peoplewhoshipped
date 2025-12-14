/**
 * @fileoverview Header component with navigation and theme selector.
 * @module @leaderboard/web/components/layout/Header
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMobileMenuOpen]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Leaderboard", href: "/leaderboard" },
    { name: "People", href: "/people" },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled || isMobileMenuOpen
            ? "bg-background/80 backdrop-blur-xl border-b border-border"
            : "bg-background/0 border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo Section */}
          <Link
            href="/"
            className="flex items-center gap-3 group relative z-50"
            aria-label="Go to homepage"
          >
            <div className="relative overflow-hidden rounded-lg border border-border group-hover:border-emerald-500/50 transition-colors duration-300 bg-background">
              <Image
                src={config.org.logo_url}
                alt={config.org.name}
                width={32}
                height={32}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <span className="font-bold text-lg tracking-tight text-foreground">
              {config.org.name}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                  isActive(link.href)
                    ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/50"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3 relative z-50">
            <div className="hidden md:block">
              <ThemeSelector />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-foreground hover:bg-secondary rounded-full transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-transform duration-300 ${
                  isMobileMenuOpen ? "rotate-90" : "rotate-0"
                }`}
              >
                {isMobileMenuOpen ? (
                  <>
                    <path d="M18 6L6 18" />
                    <path d="M6 6l12 12" />
                  </>
                ) : (
                  <>
                    <path d="M4 8h16" />
                    <path d="M4 16h16" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-background md:hidden transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isMobileMenuOpen
            ? "opacity-100 translate-y-0 visible"
            : "opacity-0 -translate-y-4 invisible pointer-events-none"
        }`}
      >
        <div className="flex flex-col h-full pt-28 px-6 pb-12">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  transitionDelay: isMobileMenuOpen ? `${i * 50}ms` : "0ms",
                }}
                className={`text-3xl font-bold tracking-tight py-4 border-b border-border transition-all duration-300 ${
                  isActive(link.href)
                    ? "text-emerald-600 dark:text-emerald-400 pl-4 border-emerald-500/20"
                    : "text-foreground hover:text-emerald-500 dark:hover:text-emerald-400 hover:pl-2"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="mt-auto flex items-center justify-between pt-8 border-t border-border">
            <span className="text-sm font-medium text-muted-foreground">
              Appearance
            </span>
            <ThemeSelector />
          </div>
        </div>
      </div>
    </>
  );
}