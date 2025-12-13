/**
 * @fileoverview CSS class name utility
 * @module @leaderboard/utils/cn
 *
 * This module provides a utility function for merging Tailwind CSS classes
 * intelligently using clsx and tailwind-merge.
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge class names with Tailwind CSS conflict resolution.
 *
 * @param inputs - Class names, objects, or arrays to merge
 * @returns Merged class string with Tailwind conflicts resolved
 *
 * @remarks
 * This function combines `clsx` for conditional class handling
 * with `tailwind-merge` for intelligent Tailwind class deduplication.
 *
 * @example
 * ```typescript
 * // Basic usage
 * cn("px-4 py-2", "bg-blue-500");
 * // Returns: "px-4 py-2 bg-blue-500"
 *
 * // Conditional classes
 * cn("base-class", isActive && "active-class");
 * // Returns: "base-class active-class" or "base-class"
 *
 * // Tailwind conflict resolution
 * cn("px-4", "px-8");
 * // Returns: "px-8" (later value wins)
 *
 * // Object syntax
 * cn({ "text-red-500": hasError, "text-green-500": isSuccess });
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
