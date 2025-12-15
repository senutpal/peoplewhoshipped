/**
 * Tests for date utility functions.
 *
 * @group unit
 * @group utils
 *
 * Test Coverage:
 * - getDateRange: week, month, year periods
 * - formatTimeAgo: human-readable time formatting
 *
 * @module @leaderboard/utils/__tests__/date
 */

import { describe, it, expect } from "bun:test";
import { getDateRange, formatTimeAgo, type DateRangePeriod } from "../date";

// =============================================================================
// getDateRange Tests
// =============================================================================

describe("getDateRange", () => {
  /**
   * Test: Returns week range (7 days back)
   */
  it("should return week range (7 days back)", () => {
    const { startDate, endDate } = getDateRange("week");
    
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    expect(diffDays).toBe(7);
  });

  /**
   * Test: Returns month range (30 days back)
   */
  it("should return month range (30 days back)", () => {
    const { startDate, endDate } = getDateRange("month");
    
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    expect(diffDays).toBe(30);
  });

  /**
   * Test: Returns year range (365 days back)
   */
  it("should return year range (365 days back)", () => {
    const { startDate, endDate } = getDateRange("year");
    
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    expect(diffDays).toBe(365);
  });

  /**
   * Test: endDate is approximately now
   */
  it("should have endDate close to now", () => {
    const { endDate } = getDateRange("week");
    const now = new Date();
    
    // Should be within 1 second of now
    const diffMs = Math.abs(endDate.getTime() - now.getTime());
    expect(diffMs).toBeLessThan(1000);
  });

  /**
   * Test: startDate is before endDate
   */
  it("should have startDate before endDate", () => {
    const periods: DateRangePeriod[] = ["week", "month", "year"];
    
    for (const period of periods) {
      const { startDate, endDate } = getDateRange(period);
      expect(startDate.getTime()).toBeLessThan(endDate.getTime());
    }
  });
});

// =============================================================================
// formatTimeAgo Tests
// =============================================================================

describe("formatTimeAgo", () => {
  /**
   * Test: Formats recent time as "less than a minute ago"
   */
  it('should format very recent time', () => {
    const now = new Date();
    const result = formatTimeAgo(now);
    
    // date-fns returns "less than a minute ago" for very recent times
    expect(result).toContain("ago");
  });

  /**
   * Test: Formats hours ago
   */
  it("should format hours ago", () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const result = formatTimeAgo(twoHoursAgo);
    
    expect(result).toContain("hour");
    expect(result).toContain("ago");
  });

  /**
   * Test: Formats days ago
   */
  it("should format days ago", () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const result = formatTimeAgo(threeDaysAgo);
    
    expect(result).toContain("day");
    expect(result).toContain("ago");
  });

  /**
   * Test: Formats months ago
   */
  it("should format months ago", () => {
    const twoMonthsAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const result = formatTimeAgo(twoMonthsAgo);
    
    expect(result).toContain("month");
    expect(result).toContain("ago");
  });

  /**
   * Test: Always includes "ago" suffix
   */
  it('should always include "ago" suffix', () => {
    const dates = [
      new Date(), // Now
      new Date(Date.now() - 60000), // 1 minute ago
      new Date(Date.now() - 3600000), // 1 hour ago
      new Date(Date.now() - 86400000), // 1 day ago
    ];

    for (const date of dates) {
      const result = formatTimeAgo(date);
      expect(result).toContain("ago");
    }
  });

  /**
   * Test: Handles Date objects correctly
   */
  it("should handle Date objects correctly", () => {
    const date = new Date("2024-01-01T00:00:00Z");
    const result = formatTimeAgo(date);
    
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});
