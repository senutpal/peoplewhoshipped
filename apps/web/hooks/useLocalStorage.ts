/**
 * @fileoverview useLocalStorage hook for persistent state.
 * @module @leaderboard/web/hooks/useLocalStorage
 */

"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook for managing state with localStorage persistence.
 * Safely handles SSR by returning the initial value on the server.
 *
 * @typeParam T - Type of the stored value
 * @param key - localStorage key
 * @param initialValue - Initial value if no stored value exists
 * @returns Tuple of [value, setValue] similar to useState
 *
 * @example
 * ```tsx
 * const [filter, setFilter] = useLocalStorage<string[]>("filters", []);
 *
 * // Use like regular state
 * setFilter(["type1", "type2"]);
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  // Get initial value from localStorage or use default
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(
        `useLocalStorage: failed to read "${key}" from localStorage`,
        error,
      );
      return initialValue;
    }
  });

  // Update localStorage when value changes
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(
        `useLocalStorage: failed to write "${key}" to localStorage`,
        error,
      );
    }
  }, [key, storedValue]);

  // Wrapped setter to support both direct values and updater functions
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue((prev) => (value instanceof Function ? value(prev) : value));
  }, []);

  return [storedValue, setValue];
}
