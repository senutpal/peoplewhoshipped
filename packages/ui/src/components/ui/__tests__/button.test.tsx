/**
 * Tests for Button component.
 *
 * @group unit
 * @group ui
 *
 * Test Coverage:
 * - Rendering with different variants
 * - Rendering with different sizes
 * - Disabled state
 * - asChild functionality
 * - Custom className merging
 *
 * @module @leaderboard/ui/__tests__/button
 */

import { describe, it, expect } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../button";

// =============================================================================
// Rendering Tests
// =============================================================================

describe("Button Component", () => {
  /**
   * Test: Renders with default props
   */
  it("should render with default props", () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeDefined();
    expect(button.dataset.variant).toBe("default");
    expect(button.dataset.size).toBe("default");
  });

  /**
   * Test: Renders with text content
   */
  it("should render with text content", () => {
    render(<Button>Submit Form</Button>);

    expect(screen.getByText("Submit Form")).toBeDefined();
  });

  /**
   * Test: Renders as different HTML element when asChild is true
   */
  it("should render as child component when asChild is true", () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );

    const link = screen.getByRole("link", { name: /link button/i });
    expect(link).toBeDefined();
    expect(link.getAttribute("href")).toBe("/test");
  });
});

// =============================================================================
// Variant Tests
// =============================================================================

describe("Button Variants", () => {
  /**
   * Test: Renders default variant correctly
   */
  it("should render default variant", () => {
    render(<Button variant="default">Default</Button>);

    const button = screen.getByRole("button");
    expect(button.dataset.variant).toBe("default");
    expect(button.className).toContain("bg-primary");
  });

  /**
   * Test: Renders destructive variant correctly
   */
  it("should render destructive variant", () => {
    render(<Button variant="destructive">Delete</Button>);

    const button = screen.getByRole("button");
    expect(button.dataset.variant).toBe("destructive");
    expect(button.className).toContain("bg-destructive");
  });

  /**
   * Test: Renders outline variant correctly
   */
  it("should render outline variant", () => {
    render(<Button variant="outline">Outline</Button>);

    const button = screen.getByRole("button");
    expect(button.dataset.variant).toBe("outline");
    expect(button.className).toContain("border");
  });

  /**
   * Test: Renders secondary variant correctly
   */
  it("should render secondary variant", () => {
    render(<Button variant="secondary">Secondary</Button>);

    const button = screen.getByRole("button");
    expect(button.dataset.variant).toBe("secondary");
    expect(button.className).toContain("bg-secondary");
  });

  /**
   * Test: Renders ghost variant correctly
   */
  it("should render ghost variant", () => {
    render(<Button variant="ghost">Ghost</Button>);

    const button = screen.getByRole("button");
    expect(button.dataset.variant).toBe("ghost");
  });

  /**
   * Test: Renders link variant correctly
   */
  it("should render link variant", () => {
    render(<Button variant="link">Link</Button>);

    const button = screen.getByRole("button");
    expect(button.dataset.variant).toBe("link");
    expect(button.className).toContain("underline-offset");
  });
});

// =============================================================================
// Size Tests
// =============================================================================

describe("Button Sizes", () => {
  /**
   * Test: Renders default size correctly
   */
  it("should render default size", () => {
    render(<Button size="default">Default Size</Button>);

    const button = screen.getByRole("button");
    expect(button.dataset.size).toBe("default");
    expect(button.className).toContain("h-9");
  });

  /**
   * Test: Renders small size correctly
   */
  it("should render small size", () => {
    render(<Button size="sm">Small</Button>);

    const button = screen.getByRole("button");
    expect(button.dataset.size).toBe("sm");
    expect(button.className).toContain("h-8");
  });

  /**
   * Test: Renders large size correctly
   */
  it("should render large size", () => {
    render(<Button size="lg">Large</Button>);

    const button = screen.getByRole("button");
    expect(button.dataset.size).toBe("lg");
    expect(button.className).toContain("h-10");
  });

  /**
   * Test: Renders icon size correctly
   */
  it("should render icon size", () => {
    render(<Button size="icon">🔍</Button>);

    const button = screen.getByRole("button");
    expect(button.dataset.size).toBe("icon");
    expect(button.className).toContain("size-9");
  });
});

// =============================================================================
// State Tests
// =============================================================================

describe("Button States", () => {
  /**
   * Test: Renders disabled state correctly
   */
  it("should render disabled state", () => {
    render(<Button disabled>Disabled</Button>);

    const button = screen.getByRole("button");
    expect(button.hasAttribute("disabled")).toBe(true);
    expect(button.className).toContain("disabled:opacity-50");
  });

  /**
   * Test: Applies custom className
   */
  it("should apply custom className", () => {
    render(<Button className="custom-class">Custom</Button>);

    const button = screen.getByRole("button");
    expect(button.className).toContain("custom-class");
  });

  /**
   * Test: Forwards additional props
   */
  it("should forward additional props", () => {
    render(<Button data-testid="test-button" type="submit">Submit</Button>);

    const button = screen.getByTestId("test-button");
    expect(button.getAttribute("type")).toBe("submit");
  });
});

// =============================================================================
// Interaction Tests
// =============================================================================

describe("Button Interactions", () => {
  /**
   * Test: Handles click events
   */
  it("should handle click events", async () => {
    let clicked = false;
    render(<Button onClick={() => (clicked = true)}>Click Me</Button>);

    const button = screen.getByRole("button");
    await userEvent.click(button);

    expect(clicked).toBe(true);
  });

  /**
   * Test: Does not fire click when disabled
   */
  it("should not fire click when disabled", async () => {
    let clicked = false;
    render(<Button disabled onClick={() => (clicked = true)}>Disabled</Button>);

    const button = screen.getByRole("button");
    await userEvent.click(button);

    expect(clicked).toBe(false);
  });
});
