# Testing Guidelines

Comprehensive testing documentation for the leaderboard monorepo.

## Overview

This project uses a multi-layer testing strategy with:

- **Unit Tests**: Test individual functions and components in isolation
- **Integration Tests**: Test interactions between modules with mocked external services
- **E2E Tests**: Test complete user workflows in a real browser

## Test Stack

| Tool | Purpose |
|------|---------|
| Bun Test | Native test runner for unit/integration tests |
| Playwright | E2E browser testing |
| Testing Library | React component testing |
| MSW | API mocking for integration tests |
| PGlite | In-memory database for testing |

## Running Tests

### Quick Commands

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test:watch

# Run with coverage
bun test:coverage

# Run E2E tests
bun test:e2e

# Run E2E tests with UI
bun test:e2e:ui
```

### By Type

```bash
# Unit tests only
bun test:unit

# Integration tests only
bun test:integration

# E2E tests only
bun test:e2e

# Full CI suite
bun test:ci
```

## Test Structure

### File Naming

| Test Type | Pattern | Location |
|-----------|---------|----------|
| Unit | `*.test.ts` / `*.test.tsx` | `src/__tests__/` |
| Integration | `*.test.ts` | `src/__tests__/integration/` |
| E2E | `*.e2e.ts` | `apps/web/e2e/tests/` |

### Directory Structure

```
packages/
├── config/
│   └── src/
│       └── __tests__/
│           ├── env-parser.test.ts
│           ├── config-loader.test.ts
│           └── validators.test.ts
├── database/
│   └── src/
│       ├── __tests__/
│       │   └── utils/
│       │       └── test-db.ts
│       ├── connection/
│       │   └── __tests__/
│       │       └── pglite-connection.test.ts
│       └── operations/
│           └── __tests__/
│               ├── activity.test.ts
│               └── contributor.test.ts
├── utils/
│   └── src/
│       └── __tests__/
│           ├── date.test.ts
│           └── cn.test.ts
└── ui/
    └── src/
        └── components/
            └── ui/
                └── __tests__/
                    ├── button.test.tsx
                    └── avatar.test.tsx

apps/web/
└── e2e/
    ├── pages/
    │   └── leaderboard.page.ts
    └── tests/
        ├── leaderboard.e2e.ts
        └── accessibility.e2e.ts
```

## Writing Tests

### Unit Test Template

```typescript
/**
 * Tests for [Feature Name].
 *
 * @group unit
 * @group [package-name]
 *
 * Test Coverage:
 * - [Scenario 1]
 * - [Scenario 2]
 *
 * @module @leaderboard/[package]/__tests__/[feature]
 */

import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { functionToTest } from "../module";

describe("Feature Name", () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  /**
   * Test: Description of what is being tested
   */
  it("should [expected behavior]", () => {
    // Arrange
    const input = "test";

    // Act
    const result = functionToTest(input);

    // Assert
    expect(result).toBe("expected");
  });
});
```

### React Component Test Template

```typescript
import { describe, it, expect } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ComponentName } from "../ComponentName";

describe("ComponentName", () => {
  it("should render correctly", () => {
    render(<ComponentName />);
    
    expect(screen.getByRole("button")).toBeDefined();
  });

  it("should handle user interaction", async () => {
    let clicked = false;
    render(<ComponentName onClick={() => (clicked = true)} />);
    
    await userEvent.click(screen.getByRole("button"));
    
    expect(clicked).toBe(true);
  });
});
```

### Database Test Template

```typescript
import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { PGlite } from "@electric-sql/pglite";
import { createTestDatabase, seedTestData } from "../__tests__/utils/test-db";

describe("Database Operation", () => {
  let db: PGlite;

  beforeEach(async () => {
    db = await createTestDatabase();
    await seedTestData(db, {
      contributors: [{ username: "alice" }],
    });
  });

  afterEach(async () => {
    await db.close();
  });

  it("should query data correctly", async () => {
    const result = await db.query("SELECT * FROM contributor");
    expect(result.rows.length).toBe(1);
  });
});
```

### E2E Test Template (Page Object Pattern)

```typescript
import { test, expect } from "@playwright/test";
import { PageName } from "../pages/page-name.page";

test.describe("Feature Name", () => {
  let page: PageName;

  test.beforeEach(async ({ page: playwrightPage }) => {
    page = new PageName(playwrightPage);
    await page.goto();
  });

  test("should [expected behavior]", async () => {
    await page.performAction();
    await expect(page.element).toBeVisible();
  });
});
```

## Mocking

### MSW for API Mocking

```typescript
import { server } from "../../test/mocks/server";
import { http, HttpResponse } from "msw";

it("should handle API response", async () => {
  // Override handler for this test
  server.use(
    http.get("https://api.example.com/data", () => {
      return HttpResponse.json({ custom: "response" });
    })
  );

  // Test code that makes API call
});
```

### Simulating Errors

```typescript
it("should handle API errors", async () => {
  server.use(
    http.get("https://api.example.com/data", () => {
      return HttpResponse.error();
    })
  );

  await expect(fetchData()).rejects.toThrow();
});
```

## Coverage Requirements

| Package | Target |
|---------|--------|
| @leaderboard/config | 100% |
| @leaderboard/database | 95% |
| @leaderboard/utils | 100% |
| @leaderboard/ui | 90% |
| @leaderboard/scraper-* | 85% |

## Best Practices

### Do

- ✅ Test behavior, not implementation details
- ✅ Use descriptive test names that explain the expected behavior
- ✅ Keep tests independent and isolated
- ✅ Use factory functions for test data
- ✅ Clean up resources in `afterEach`
- ✅ Mock external dependencies

### Don't

- ❌ Test private implementation details
- ❌ Share state between tests
- ❌ Make real API calls in unit/integration tests
- ❌ Use `test.only()` or `describe.only()` in committed code
- ❌ Write flaky tests that depend on timing

## Continuous Integration

Tests run automatically on:
- Every push to `main` and `develop`
- Every pull request

The CI pipeline:
1. Runs unit tests with coverage
2. Runs integration tests
3. Runs E2E tests with Playwright
4. Uploads coverage and test reports as artifacts

## Troubleshooting

### Tests failing with database errors

Ensure `PGLITE_DB_PATH` is set to `:memory:` for tests:

```bash
PGLITE_DB_PATH=":memory:" bun test
```

### E2E tests failing to start

Install Playwright browsers:

```bash
bunx playwright install
```

### E2E tests timing out

> **Important**: E2E tests require a **production server**, not the HMR dev server.

The development server (`bun dev`) uses Hot Module Replacement (HMR) which keeps WebSocket connections open, preventing Playwright's page load events from completing. This causes all tests to timeout.

**Solution 1: Let Playwright manage the server (recommended)**

Stop your dev server and run:

```bash
bun test:e2e
```

Playwright will automatically build and start a production server.

**Solution 2: Manually run a production server**

```bash
# Terminal 1: Build and start production server
bun run --filter @leaderboard/web build && bun run --filter @leaderboard/web start

# Terminal 2: Run tests with server reuse
PLAYWRIGHT_REUSE_SERVER=true bun test:e2e
```

### E2E tests running slowly

Tests run sequentially with 1 worker for stability. For faster local runs on specific browsers:

```bash
# Run only on Chromium
bunx playwright test --project=chromium

# Run a specific test file
bunx playwright test tests/leaderboard.e2e.ts
```

### Coverage not generating

Run with explicit coverage flag:

```bash
bun test --coverage
```
