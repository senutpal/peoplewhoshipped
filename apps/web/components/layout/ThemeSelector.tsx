/**
 * @fileoverview Theme selector component with high-fidelity interactions.
 * @module @leaderboard/web/components/layout/ThemeSelector
 */

"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@leaderboard/ui"; // Assuming a utility exists, or we use a local helper

/**
 * High-precision theme controller with sliding localized feedback and etched-glass aesthetics.
 * Designed for immediate visual feedback and zero-layout shift.
 *
 * @returns React.ReactElement
 */
export function ThemeSelector(): React.ReactElement | null {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const options = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "system", icon: Monitor, label: "System" },
    { value: "dark", icon: Moon, label: "Dark" },
  ];

  const activeIndex = options.findIndex((opt) => opt.value === theme);
  const safeIndex = activeIndex === -1 ? 1 : activeIndex; // Default to system if undefined

  return (
    <div
      role="radiogroup"
      aria-label="Theme preference"
      className="group/container relative inline-flex h-9 items-center rounded-full border border-border/40 bg-secondary/30 p-1 backdrop-blur-md transition-colors hover:border-border/60 hover:bg-secondary/40"
    >
      {/* Sliding Active Indicator */}
      <div
        className="absolute inset-y-1 left-1 w-[calc((100%-8px)/3)] rounded-full bg-background shadow-[0_1px_2px_0_rgb(0_0_0_/_0.05),0_1px_3px_0_rgb(0_0_0_/_0.1)] ring-1 ring-black/5 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] dark:ring-white/10"
        style={{
          transform: `translateX(${safeIndex * 100}%)`,
        }}
      />

      {options.map((option) => {
        const isActive = theme === option.value;
        const Icon = option.icon;

        return (
          <button
            key={option.value}
            onClick={() => setTheme(option.value)}
            aria-checked={isActive}
            role="radio"
            className={
              "group relative flex flex-1 items-center justify-center rounded-full px-3 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background"
            }
          >
            <span className="sr-only">{option.label}</span>
            <Icon
              className={`h-4 w-4 transition-all duration-300 ${
                isActive
                  ? "text-foreground scale-100"
                  : "text-muted-foreground/70 scale-90 group-hover:text-foreground group-hover:scale-100"
              } ${
                // Micro-interactions based on specific icon
                option.value === "light" && isActive
                  ? "animate-[spin_3s_linear_infinite_paused] hover:animate-none"
                  : ""
              } ${
                option.value === "dark" && !isActive
                  ? "group-hover:-rotate-12"
                  : ""
              }`}
              strokeWidth={2}
            />
          </button>
        );
      })}
    </div>
  );
}