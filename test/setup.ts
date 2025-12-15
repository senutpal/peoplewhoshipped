/**
 * Global test setup file for all test suites.
 *
 * @module test/setup
 *
 * This file is preloaded before every test file runs. It configures:
 * - DOM environment for React component testing (happy-dom)
 * - Global test environment variables
 * - Cleanup hooks for test isolation
 *
 * @see {@link https://bun.sh/docs/cli/test}
 */

import { beforeAll, afterAll, afterEach } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";

// =============================================================================
// DOM Environment Setup
// =============================================================================

/**
 * Register happy-dom as the global DOM environment.
 * This MUST happen before any @testing-library imports to ensure
 * document.body is available when testing-library initializes.
 */
GlobalRegistrator.register();

// Now we can safely import testing-library (after DOM is available)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { cleanup } = require("@testing-library/react");

// =============================================================================
// Environment Configuration
// =============================================================================

/**
 * Global test timeout in milliseconds.
 * Tests exceeding this duration will fail.
 */
export const TEST_TIMEOUT = 30000;

/**
 * Configure test environment before all tests run.
 */
/**
 * Configure test environment before all tests run.
 */
beforeAll(() => {
  // Global beforeAll setup if needed in the future
});

// =============================================================================
// Test Cleanup
// =============================================================================

/**
 * Cleanup after each test to ensure isolation.
 */
afterEach(() => {
  // Cleanup React Testing Library DOM after each test
  cleanup();
  
  // Reset any global state that might leak between tests
  // Note: Bun doesn't have jest.clearAllMocks(), but we can add
  // custom cleanup logic here as needed
});

/**
 * Cleanup on test suite exit.
 */
afterAll(() => {
  // Unregister happy-dom to properly cleanup
  GlobalRegistrator.unregister();
});

// =============================================================================
// Test Utilities Re-exports
// =============================================================================

/**
 * Re-export testing utilities for convenience.
 * Tests can import from "test/setup" instead of multiple packages.
 */
export { expect, describe, it, test, beforeEach, beforeAll, afterEach, afterAll, mock, spyOn } from "bun:test";
