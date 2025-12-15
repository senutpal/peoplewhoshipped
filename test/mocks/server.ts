/**
 * MSW server lifecycle management for tests.
 *
 * @module test/mocks/server
 *
 * This module sets up the MSW server for intercepting HTTP requests
 * during tests. Import this file in test files that need API mocking.
 *
 * @example
 * ```typescript
 * // In your test file:
 * import "../../../test/mocks/server";
 * import { server } from "../../../test/mocks/server";
 *
 * // Override handlers for specific tests:
 * import { http, HttpResponse } from "msw";
 *
 * it("handles rate limiting", async () => {
 *   server.use(
 *     http.get("https://api.github.com/repos/:owner/:repo/pulls", () => {
 *       return new HttpResponse(null, { status: 403 });
 *     })
 *   );
 *   // ... test code
 * });
 * ```
 *
 * @see {@link https://mswjs.io/docs/}
 */

import { beforeAll, afterEach, afterAll } from "bun:test";
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

// =============================================================================
// Server Instance
// =============================================================================

/**
 * MSW server instance configured with all mock handlers.
 * Export for use in tests that need to override handlers.
 */
export const server = setupServer(...handlers);

// =============================================================================
// Lifecycle Hooks
// =============================================================================

/**
 * Start MSW server before all tests.
 * Configures strict mode to error on unhandled requests.
 */
beforeAll(() => {
  server.listen({
    onUnhandledRequest: "error",
  });
});

/**
 * Reset handlers after each test to ensure isolation.
 * This removes any runtime handlers added during tests.
 */
afterEach(() => {
  server.resetHandlers();
});

/**
 * Close MSW server after all tests complete.
 */
afterAll(() => {
  server.close();
});

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Helper to create a rate-limited GitHub response.
 * Useful for testing rate limit handling.
 *
 * @param {number} resetTime - Unix timestamp when rate limit resets
 * @returns {HttpResponse} Rate-limited response
 *
 * @example
 * ```typescript
 * import { createRateLimitedResponse } from "../../../test/mocks/server";
 * import { http } from "msw";
 *
 * server.use(
 *   http.get("https://api.github.com/*", () => {
 *     return createRateLimitedResponse(Date.now() / 1000 + 3600);
 *   })
 * );
 * ```
 */
export function createRateLimitResponse(resetTime: number) {
  const { HttpResponse } = require("msw");

  return new HttpResponse(JSON.stringify({ message: "API rate limit exceeded" }), {
    status: 403,
    headers: {
      "X-RateLimit-Limit": "5000",
      "X-RateLimit-Remaining": "0",
      "X-RateLimit-Reset": String(resetTime),
      "Content-Type": "application/json",
    },
  });
}

/**
 * Helper to create a Slack API error response.
 *
 * @param {string} error - Slack error code
 * @returns {object} Slack error response object
 *
 * @example
 * ```typescript
 * server.use(
 *   http.post("https://slack.com/api/conversations.history", () => {
 *     return HttpResponse.json(createSlackErrorResponse("channel_not_found"));
 *   })
 * );
 * ```
 */
export function createSlackErrorResponse(error: string) {
  return {
    ok: false,
    error,
  };
}
