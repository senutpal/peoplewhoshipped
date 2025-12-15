/**
 * Mock Service Worker (MSW) handlers for external APIs.
 *
 * @module test/mocks/handlers
 *
 * This module provides mock handlers for all external APIs used by the
 * leaderboard scrapers. Using MSW allows us to:
 * - Test API integration without making real requests
 * - Simulate error conditions and edge cases
 * - Control response timing for testing loading states
 *
 * @see {@link https://mswjs.io/docs/}
 */

import { http, HttpResponse } from "msw";

// =============================================================================
// GitHub API Mock Handlers
// =============================================================================

/**
 * Mock handlers for GitHub REST API v3.
 *
 * @constant
 * @see {@link https://docs.github.com/en/rest}
 */
export const githubHandlers = [
  // -------------------------------------------------------------------------
  // Pull Requests
  // -------------------------------------------------------------------------

  /**
   * Mock: GET /repos/:owner/:repo/pulls
   * Returns a list of pull requests for a repository.
   */
  http.get("https://api.github.com/repos/:owner/:repo/pulls", ({ params }) => {
    const { owner, repo } = params;

    return HttpResponse.json([
      {
        id: 1,
        number: 123,
        title: "feat: Add new dashboard component",
        state: "closed",
        user: {
          login: "testuser",
          id: 12345,
          avatar_url: "https://avatars.githubusercontent.com/u/12345",
        },
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-15T12:00:00Z",
        merged_at: "2024-01-15T12:00:00Z",
        html_url: `https://github.com/${owner}/${repo}/pull/123`,
        body: "This PR adds a new dashboard component with contributor statistics.",
        base: { repo: { full_name: `${owner}/${repo}` } },
      },
      {
        id: 2,
        number: 124,
        title: "fix: Resolve database connection issue",
        state: "open",
        user: {
          login: "anotheruser",
          id: 67890,
          avatar_url: "https://avatars.githubusercontent.com/u/67890",
        },
        created_at: "2024-01-16T08:00:00Z",
        updated_at: "2024-01-16T09:00:00Z",
        merged_at: null,
        html_url: `https://github.com/${owner}/${repo}/pull/124`,
        body: "Fixes the database connection pooling issue.",
        base: { repo: { full_name: `${owner}/${repo}` } },
      },
    ]);
  }),

  // -------------------------------------------------------------------------
  // Issues
  // -------------------------------------------------------------------------

  /**
   * Mock: GET /repos/:owner/:repo/issues
   * Returns a list of issues for a repository.
   */
  http.get("https://api.github.com/repos/:owner/:repo/issues", ({ params }) => {
    const { owner, repo } = params;

    return HttpResponse.json([
      {
        id: 101,
        number: 50,
        title: "Bug: Activity graph not rendering",
        state: "open",
        user: {
          login: "reporter",
          id: 11111,
          avatar_url: "https://avatars.githubusercontent.com/u/11111",
        },
        created_at: "2024-01-14T15:00:00Z",
        updated_at: "2024-01-14T16:00:00Z",
        html_url: `https://github.com/${owner}/${repo}/issues/50`,
        body: "The activity graph component is not rendering correctly on mobile.",
        labels: [{ name: "bug" }, { name: "ui" }],
        pull_request: undefined, // Not a PR
      },
    ]);
  }),

  // -------------------------------------------------------------------------
  // Commits
  // -------------------------------------------------------------------------

  /**
   * Mock: GET /repos/:owner/:repo/commits
   * Returns a list of commits for a repository.
   */
  http.get(
    "https://api.github.com/repos/:owner/:repo/commits",
    ({ params }) => {
      const { owner, repo } = params;

      return HttpResponse.json([
        {
          sha: "abc123def456",
          commit: {
            message: "feat: Implement leaderboard sorting",
            author: {
              name: "Test User",
              email: "test@example.com",
              date: "2024-01-15T11:00:00Z",
            },
          },
          author: {
            login: "testuser",
            id: 12345,
            avatar_url: "https://avatars.githubusercontent.com/u/12345",
          },
          html_url: `https://github.com/${owner}/${repo}/commit/abc123def456`,
        },
      ]);
    }
  ),

  // -------------------------------------------------------------------------
  // Pull Request Reviews
  // -------------------------------------------------------------------------

  /**
   * Mock: GET /repos/:owner/:repo/pulls/:pull_number/reviews
   * Returns reviews for a pull request.
   */
  http.get(
    "https://api.github.com/repos/:owner/:repo/pulls/:pull_number/reviews",
    ({ params }) => {
      return HttpResponse.json([
        {
          id: 201,
          user: {
            login: "reviewer",
            id: 22222,
            avatar_url: "https://avatars.githubusercontent.com/u/22222",
          },
          state: "APPROVED",
          submitted_at: "2024-01-15T11:30:00Z",
          html_url: `https://github.com/${params.owner}/${params.repo}/pull/${params.pull_number}#pullrequestreview-201`,
        },
      ]);
    }
  ),

  // -------------------------------------------------------------------------
  // Repositories
  // -------------------------------------------------------------------------

  /**
   * Mock: GET /orgs/:org/repos
   * Returns repositories for an organization.
   */
  http.get("https://api.github.com/orgs/:org/repos", ({ params }) => {
    const { org } = params;

    return HttpResponse.json([
      {
        id: 1001,
        name: "leaderboard",
        full_name: `${org}/leaderboard`,
        private: false,
        html_url: `https://github.com/${org}/leaderboard`,
        description: "Team leaderboard application",
      },
      {
        id: 1002,
        name: "api-service",
        full_name: `${org}/api-service`,
        private: false,
        html_url: `https://github.com/${org}/api-service`,
        description: "Backend API service",
      },
    ]);
  }),

  // -------------------------------------------------------------------------
  // Rate Limit
  // -------------------------------------------------------------------------

  /**
   * Mock: GET /rate_limit
   * Returns current rate limit status.
   */
  http.get("https://api.github.com/rate_limit", () => {
    return HttpResponse.json({
      resources: {
        core: {
          limit: 5000,
          remaining: 4999,
          reset: Math.floor(Date.now() / 1000) + 3600,
          used: 1,
        },
        search: {
          limit: 30,
          remaining: 30,
          reset: Math.floor(Date.now() / 1000) + 60,
          used: 0,
        },
      },
      rate: {
        limit: 5000,
        remaining: 4999,
        reset: Math.floor(Date.now() / 1000) + 3600,
        used: 1,
      },
    });
  }),
];

// =============================================================================
// Slack API Mock Handlers
// =============================================================================

/**
 * Mock handlers for Slack Web API.
 *
 * @constant
 * @see {@link https://api.slack.com/methods}
 */
export const slackHandlers = [
  // -------------------------------------------------------------------------
  // Conversations History
  // -------------------------------------------------------------------------

  /**
   * Mock: POST /api/conversations.history
   * Returns messages from a channel.
   */
  http.post("https://slack.com/api/conversations.history", async () => {
    return HttpResponse.json({
      ok: true,
      messages: [
        {
          type: "message",
          user: "U12345678",
          text: "*EOD Update* :memo:\n\n• Completed PR review for dashboard feature\n• Fixed database migration script\n• Started working on API documentation",
          ts: "1705334400.123456",
          thread_ts: undefined,
        },
        {
          type: "message",
          user: "U87654321",
          text: "*EOD* :white_check_mark:\n\n• Deployed hotfix to production\n• Updated monitoring alerts\n• Team sync meeting",
          ts: "1705334500.789012",
          thread_ts: undefined,
        },
      ],
      has_more: false,
      response_metadata: {
        next_cursor: "",
      },
    });
  }),

  // -------------------------------------------------------------------------
  // User Info
  // -------------------------------------------------------------------------

  /**
   * Mock: POST /api/users.info
   * Returns information about a user.
   */
  http.post("https://slack.com/api/users.info", async ({ request }) => {
    const formData = await request.formData();
    const userId = formData.get("user");

    const users: Record<string, object> = {
      U12345678: {
        id: "U12345678",
        name: "testuser",
        real_name: "Test User",
        profile: {
          email: "testuser@example.com",
          image_48: "https://avatars.slack-edge.com/test.jpg",
          display_name: "testuser",
        },
        is_bot: false,
      },
      U87654321: {
        id: "U87654321",
        name: "anotheruser",
        real_name: "Another User",
        profile: {
          email: "another@example.com",
          image_48: "https://avatars.slack-edge.com/another.jpg",
          display_name: "anotheruser",
        },
        is_bot: false,
      },
    };

    const user = users[userId as string];

    if (user) {
      return HttpResponse.json({ ok: true, user });
    }

    return HttpResponse.json({
      ok: false,
      error: "user_not_found",
    });
  }),

  // -------------------------------------------------------------------------
  // Users List
  // -------------------------------------------------------------------------

  /**
   * Mock: POST /api/users.list
   * Returns a list of all users in the workspace.
   */
  http.post("https://slack.com/api/users.list", async () => {
    return HttpResponse.json({
      ok: true,
      members: [
        {
          id: "U12345678",
          name: "testuser",
          real_name: "Test User",
          is_bot: false,
          profile: {
            email: "testuser@example.com",
            display_name: "testuser",
          },
        },
        {
          id: "U87654321",
          name: "anotheruser",
          real_name: "Another User",
          is_bot: false,
          profile: {
            email: "another@example.com",
            display_name: "anotheruser",
          },
        },
      ],
      response_metadata: {
        next_cursor: "",
      },
    });
  }),

  // -------------------------------------------------------------------------
  // Auth Test
  // -------------------------------------------------------------------------

  /**
   * Mock: POST /api/auth.test
   * Validates the authentication token.
   */
  http.post("https://slack.com/api/auth.test", async () => {
    return HttpResponse.json({
      ok: true,
      url: "https://testworkspace.slack.com/",
      team: "Test Workspace",
      user: "testbot",
      team_id: "T12345678",
      user_id: "U00000000",
      bot_id: "B12345678",
    });
  }),
];

// =============================================================================
// Combined Handlers
// =============================================================================

/**
 * All mock handlers combined for use with MSW server.
 */
export const handlers = [...githubHandlers, ...slackHandlers];
