/**
 * Tests for CSS class name utility.
 *
 * @group unit
 * @group utils
 *
 * Test Coverage:
 * - cn: class merging, conditional classes, Tailwind conflict resolution
 *
 * @module @leaderboard/utils/__tests__/cn
 */

import { describe, it, expect } from "bun:test";
import { cn } from "../cn";

// =============================================================================
// cn Function Tests
// =============================================================================

describe("cn", () => {
  /**
   * Test: Merges multiple class strings
   */
  it("should merge multiple class strings", () => {
    const result = cn("px-4", "py-2", "bg-blue-500");

    expect(result).toBe("px-4 py-2 bg-blue-500");
  });

  /**
   * Test: Handles empty inputs
   */
  it("should handle empty inputs", () => {
    expect(cn()).toBe("");
    expect(cn("")).toBe("");
    expect(cn("", "")).toBe("");
  });

  /**
   * Test: Filters out falsy values
   */
  it("should filter out falsy values", () => {
    const result = cn("base-class", false && "conditional", null, undefined);

    expect(result).toBe("base-class");
  });

  /**
   * Test: Includes truthy conditional values
   */
  it("should include truthy conditional values", () => {
    const isActive = true;
    const hasError = false;

    const result = cn(
      "base-class",
      isActive && "active-class",
      hasError && "error-class"
    );

    expect(result).toBe("base-class active-class");
  });

  /**
   * Test: Handles object syntax
   */
  it("should handle object syntax", () => {
    const result = cn({
      "text-red-500": true,
      "text-green-500": false,
      "font-bold": true,
    });

    expect(result).toContain("text-red-500");
    expect(result).toContain("font-bold");
    expect(result).not.toContain("text-green-500");
  });

  /**
   * Test: Handles array syntax
   */
  it("should handle array syntax", () => {
    const result = cn(["px-4", "py-2"], ["bg-blue-500"]);

    expect(result).toBe("px-4 py-2 bg-blue-500");
  });

  /**
   * Test: Resolves Tailwind conflicts (later wins)
   */
  it("should resolve Tailwind conflicts with later value winning", () => {
    // Later padding value should win
    const result = cn("px-4", "px-8");
    expect(result).toBe("px-8");
  });

  /**
   * Test: Resolves conflicting margin classes
   */
  it("should resolve conflicting margin classes", () => {
    const result = cn("m-4", "mx-2", "my-6");
    
    // mx and my should override m for their respective directions
    expect(result).toContain("mx-2");
    expect(result).toContain("my-6");
  });

  /**
   * Test: Resolves conflicting color classes
   */
  it("should resolve conflicting color classes", () => {
    const result = cn("text-red-500", "text-blue-500");

    expect(result).toBe("text-blue-500");
  });

  /**
   * Test: Preserves non-conflicting classes
   */
  it("should preserve non-conflicting classes", () => {
    const result = cn("px-4", "py-2", "text-sm", "font-bold", "rounded-lg");

    expect(result).toContain("px-4");
    expect(result).toContain("py-2");
    expect(result).toContain("text-sm");
    expect(result).toContain("font-bold");
    expect(result).toContain("rounded-lg");
  });

  /**
   * Test: Handles mixed input types
   */
  it("should handle mixed input types", () => {
    const isActive = true;

    const result = cn(
      "base",
      ["array-class"],
      { "object-class": true },
      isActive && "conditional"
    );

    expect(result).toContain("base");
    expect(result).toContain("array-class");
    expect(result).toContain("object-class");
    expect(result).toContain("conditional");
  });

  /**
   * Test: Handles responsive prefixes
   */
  it("should handle responsive prefixes correctly", () => {
    const result = cn("px-4", "md:px-8", "lg:px-12");

    expect(result).toContain("px-4");
    expect(result).toContain("md:px-8");
    expect(result).toContain("lg:px-12");
  });

  /**
   * Test: Handles state prefixes
   */
  it("should handle state prefixes correctly", () => {
    const result = cn("bg-blue-500", "hover:bg-blue-600", "focus:bg-blue-700");

    expect(result).toContain("bg-blue-500");
    expect(result).toContain("hover:bg-blue-600");
    expect(result).toContain("focus:bg-blue-700");
  });
});
