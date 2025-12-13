/**
 * @fileoverview useUrlParams hook for URL search parameter management.
 * @module @leaderboard/web/hooks/useUrlParams
 */

"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";

/**
 * Custom hook for managing URL search parameters.
 * Provides utilities for getting and setting URL params without full page reloads.
 *
 * @returns Object with param utilities
 *
 * @example
 * ```tsx
 * const { getParam, setParam, setParams, removeParam } = useUrlParams();
 *
 * // Get a param value
 * const roles = getParam("roles");
 *
 * // Set a single param
 * setParam("roles", "contributor,maintainer");
 *
 * // Set multiple params
 * setParams({ roles: "contributor", search: "john" });
 *
 * // Remove a param
 * removeParam("roles");
 * ```
 */
export function useUrlParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  /**
   * Get a URL parameter value.
   *
   * @param key - Parameter key
   * @returns Parameter value or null if not set
   */
  const getParam = useCallback(
    (key: string): string | null => {
      return searchParams.get(key);
    },
    [searchParams]
  );

  /**
   * Get all values for a URL parameter.
   *
   * @param key - Parameter key
   * @returns Array of parameter values
   */
  const getParamAll = useCallback(
    (key: string): string[] => {
      return searchParams.getAll(key);
    },
    [searchParams]
  );

  /**
   * Set a single URL parameter.
   *
   * @param key - Parameter key
   * @param value - Parameter value (or null to remove)
   */
  const setParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  /**
   * Set multiple URL parameters at once.
   *
   * @param updates - Object with key-value pairs to set
   */
  const setParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  /**
   * Remove a URL parameter.
   *
   * @param key - Parameter key to remove
   */
  const removeParam = useCallback(
    (key: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(key);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  /**
   * Clear all URL parameters.
   */
  const clearParams = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [router, pathname]);

  return {
    getParam,
    getParamAll,
    setParam,
    setParams,
    removeParam,
    clearParams,
    searchParams,
  };
}
