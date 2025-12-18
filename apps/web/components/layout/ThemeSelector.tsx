/**
 * @fileoverview ThemeSelector component for switching between light/dark themes.
 * @module @leaderboard/web/components/layout/ThemeSelector
 */

"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { cn } from "@leaderboard/ui";

/**
 * Theme selector dropdown with three options: light, dark, and system.
 *
 * @returns ThemeSelector component
 */
export function ThemeSelector(): React.ReactElement {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-1 p-1 rounded-xl bg-secondary/50">
        <div className="w-8 h-8 rounded-lg bg-muted animate-pulse" />
        <div className="w-8 h-8 rounded-lg bg-muted animate-pulse" />
        <div className="w-8 h-8 rounded-lg bg-muted animate-pulse" />
      </div>
    );
  }

  const themes = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ] as const;

  return (
    <div className="flex items-center gap-0.5 p-1 rounded-xl bg-secondary/50 dark:bg-zinc-900 border border-border/50">
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={cn(
            "relative p-2 rounded-lg transition-all duration-300",
            theme === value
              ? "bg-card text-[var(--emerald)] shadow-sm dark:bg-[var(--emerald-light)] dark:text-[var(--emerald)]"
              : "text-muted-foreground hover:text-foreground"
          )}
          aria-label={`Switch to ${label} theme`}
          title={label}
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
}