# @leaderboard/scraper-core

Core scraper functionality shared between all scrapers in the leaderboard system.

## Overview

This package provides shared types, utilities, base classes, and activity definitions that are used by all scraper implementations (GitHub, Slack, etc.). It ensures consistent behavior, scoring, and data structures across the entire scraping system.

## Installation

```bash
bun add @leaderboard/scraper-core
```

## Exports

### Classes

| Export | Description |
|--------|-------------|
| `BaseScraper` | Abstract base class for all scrapers with logging utilities |

### Types

| Export | Description |
|--------|-------------|
| `Activity` | Activity record (re-exported from database) |
| `ActivityDefinitionConfig` | Configuration for activity metadata |
| `ScraperResult` | Result structure from scrape operations |
| `ScraperStats` | Statistics (processed, skipped, failed) |
| `Scraper` | Interface all scrapers must implement |
| `UserWithLogin` | Generic user type with login field |
| `UserWithTypename` | User type with __typename for bot detection |

### Activity Definitions

| Export | Description |
|--------|-------------|
| `GitHubActivityDefinition` | Enum of GitHub activity types |
| `SlackActivityDefinition` | Enum of Slack activity types |
| `AllActivityDefinitions` | Combined GitHub + Slack definitions |
| `GITHUB_ACTIVITY_DEFINITIONS` | GitHub activity metadata array |
| `SLACK_ACTIVITY_DEFINITIONS` | Slack activity metadata array |
| `ALL_ACTIVITY_DEFINITIONS` | Combined metadata array |

### Utility Functions

| Export | Description |
|--------|-------------|
| `dateToUnixTimestamp(date)` | Convert Date to Unix timestamp string |
| `unixTimestampToDate(ts)` | Parse Unix timestamp to Date |
| `getDateRange(since?)` | Get oldest/latest date range for scraping |
| `getDateString(date)` | Extract YYYY-MM-DD from Date |
| `isBot(user)` | Check if user is a bot (GraphQL typename) |
| `getLogin(user)` | Safely extract login from user object |
| `findDuplicateSlugs(activities)` | Debug utility for duplicate detection |

## Architecture

```
src/
├── index.ts                         # Barrel export (entry point)
├── README.md                        # This file
├── types/
│   └── index.ts                     # TypeScript interfaces
├── definitions/
│   └── activity-definitions.ts      # Activity enums and metadata
├── base/
│   └── index.ts                     # BaseScraper abstract class
└── utils/
    └── index.ts                     # Utility functions
```

## Usage

### Creating a Custom Scraper

```typescript
import { BaseScraper, ScraperResult } from "@leaderboard/scraper-core";
import type { LeaderboardConfig } from "@leaderboard/config";

class MyCustomScraper extends BaseScraper {
  name = "my-custom-scraper";

  async scrape(config: LeaderboardConfig, since?: Date): Promise<ScraperResult> {
    this.log("Starting scrape...");

    try {
      const activities = await this.fetchActivities(config, since);
      this.log(`Found ${activities.length} activities`);

      return {
        contributions: activities,
        errors: [],
        stats: { processed: activities.length, skipped: 0, failed: 0 }
      };
    } catch (error) {
      this.error("Scrape failed", error as Error);
      const result = this.createEmptyResult();
      result.errors.push(error as Error);
      return result;
    }
  }
}
```

### Using Activity Definitions

```typescript
import {
  GitHubActivityDefinition,
  GITHUB_ACTIVITY_DEFINITIONS,
  SlackActivityDefinition,
  ALL_ACTIVITY_DEFINITIONS
} from "@leaderboard/scraper-core";

// Find configuration for a specific activity
const prMergedConfig = GITHUB_ACTIVITY_DEFINITIONS.find(
  d => d.slug === GitHubActivityDefinition.PR_MERGED
);
console.log(`PR Merged is worth ${prMergedConfig?.points} points`);

// Get all activity types with their points
for (const def of ALL_ACTIVITY_DEFINITIONS) {
  console.log(`${def.name}: ${def.points} points`);
}
```

### Using Utility Functions

```typescript
import {
  getDateRange,
  dateToUnixTimestamp,
  getDateString,
  isBot,
  getLogin
} from "@leaderboard/scraper-core";

// Get date range for scraping
const { oldest, latest } = getDateRange(new Date("2024-12-01"));
console.log(`Scraping from ${oldest} to ${latest}`);

// Convert to Slack-compatible timestamp
const slackOldest = dateToUnixTimestamp(oldest);

// Create activity slug with date
const slug = `activity_${getDateString(new Date())}`;

// Check if user is a bot
if (isBot(graphqlUser)) {
  console.log("Bot detected, tracking...");
}

// Safely extract login
const login = getLogin(user);
if (login) {
  console.log(`Processing activities for ${login}`);
}
```

## Activity Points Reference

### GitHub Activities

| Activity | Points | Icon |
|----------|--------|------|
| PR Merged | 7 | git-merge |
| PR Reviewed | 2 | eye |
| Issue Opened | 2 | circle-dot |
| PR Collaborated | 2 | - |
| Issue Assigned | 1 | user-round-check |
| PR Opened | 1 | git-pull-request-create-arrow |
| Commented | 0 | message-circle |
| Issue Closed | 0 | - |
| Commit Created | 0 | git-commit-horizontal |

### Slack Activities

| Activity | Points | Icon |
|----------|--------|------|
| EOD Update | 2 | message-square |

## Dependencies

- `@leaderboard/database` - Database types and operations
- `@leaderboard/config` - Configuration loading
