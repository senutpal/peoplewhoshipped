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
    { name: "Leaderboard", href: "/leaderboard/week" },
    { name: "People", href: "/people" },
  ];

  const isActive = useCallback(
    (path: string) => {
      if (path === "/") return pathname === path;
      return pathname.startsWith(path.replace(/\/week$|\/month$|\/year$/, ""));
    },
    [pathname]
  );

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled || isMobileMenuOpen
            ? "bg-background/85 backdrop-blur-xl border-b border-border shadow-luxury"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
          {/* Logo Section */}
          <Link
            href="/"
            className="flex items-center gap-2.5 sm:gap-3 group relative z-50"
            aria-label="Go to homepage"
          >
            <div className="relative overflow-hidden rounded-xl border border-border/50 group-hover:border-[var(--emerald)]/30 transition-all duration-500 bg-card shadow-sm">
              <Image
                src={config.org.logo_url}
                alt={config.org.name}
                width={36}
                height={36}
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Subtle gold shimmer on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-transparent via-[var(--gold)]/10 to-transparent" />
            </div>
            <span className="font-semibold text-base sm:text-lg tracking-tight text-foreground">
              {config.org.name}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`group relative px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  isActive(link.href)
                    ? "text-[var(--emerald)]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="relative">
                  {link.name}
                  {/* Underline indicator - spans full text width */}
                  <span
                    className={`absolute -bottom-1 left-0 h-0.5 rounded-full bg-[var(--emerald)] transition-all duration-300 ${
                      isActive(link.href)
                        ? "w-full"
                        : "w-0 group-hover:w-full"
                    }`}
                  />
                </span>
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3 relative z-50">
            <div className="hidden md:block">
              <ThemeSelector />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-foreground hover:bg-secondary rounded-xl transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-transform duration-300 ${
                  isMobileMenuOpen ? "rotate-45" : "rotate-0"
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
                    <path d="M4 16h12" />
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
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        }`}
      >
        <div className="flex flex-col h-full pt-24 px-6 pb-8">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  transitionDelay: isMobileMenuOpen ? `${i * 75}ms` : "0ms",
                  transform: isMobileMenuOpen ? "translateX(0)" : "translateX(-20px)",
                  opacity: isMobileMenuOpen ? 1 : 0,
                }}
                className={`text-2xl sm:text-3xl font-semibold tracking-tight py-4 border-b border-border/50 transition-all duration-300 ${
                  isActive(link.href)
                    ? "text-[var(--emerald)] pl-4 border-[var(--emerald)]/30"
                    : "text-foreground hover:text-[var(--emerald)] hover:pl-2"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="mt-auto flex items-center justify-between pt-6 border-t border-border/50">
            <span className="text-sm font-medium text-muted-foreground tracking-wide">
              Appearance
            </span>
            <ThemeSelector />
          </div>
        </div>
      </div>
    </>
  );
}