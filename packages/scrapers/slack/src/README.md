# @leaderboard/scraper-slack

Slack EOD (End of Day) update scraper for the leaderboard system.

## Overview

This package scrapes Slack messages from a configured channel and converts them to contributor activities. It's designed to track EOD updates posted by team members.

## Installation

```bash
bun add @leaderboard/scraper-slack
```

## Configuration

Set the following environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `SLACK_API_TOKEN` | Bot User OAuth Token | `xoxb-...` |
| `SLACK_CHANNEL` | Target channel ID | `C12345678` |

### Getting the Channel ID

1. Right-click the channel in Slack
2. Select "Copy link"
3. The ID is the last part of the URL (e.g., `C12345678`)

## Usage

### CLI

```bash
cd packages/scrapers/slack
bun run scrape
```

### Programmatic

```typescript
import { SlackScraper } from "@leaderboard/scraper-slack";

const scraper = new SlackScraper();
const result = await scraper.scrape();

console.log(`Processed: ${result.stats.processed}`);
console.log(`Skipped: ${result.stats.skipped}`);
console.log(`Activities: ${result.contributions.length}`);
```

## Exports

### Classes

| Export | Description |
|--------|-------------|
| `SlackScraper` | Main scraper class extending `BaseScraper` |

### Functions

| Export | Description |
|--------|-------------|
| `main()` | CLI entry point - prepares DB and runs scraper |
| `fetchSlackMessages(since?)` | Fetches messages from Slack channel |
| `ingestEodUpdates()` | Processes pending messages into activities |
| `getSlackClient()` | Returns Slack WebClient singleton |
| `getSlackChannel()` | Returns configured channel ID |
| `getSlackToken()` | Returns configured API token |
| `resetSlackClient()` | Resets client singleton (for testing) |

### Types

| Export | Description |
|--------|-------------|
| `Activity` | Activity record (re-exported from database) |
| `SlackEodMessage` | Queued message format |
| `ConversationHistoryResponse` | Slack API response structure |
| `SlackApiMessage` | Single Slack message structure |
| `EodIngestionResult` | Ingestion operation result |
| `DateGroupedMessages` | Grouped messages for processing |

## Architecture

```
src/
├── index.ts              # Barrel export (entry point)
├── scraper.ts            # SlackScraper class
├── types/
│   └── index.ts          # All TypeScript interfaces
├── client/
│   └── index.ts          # Slack WebClient singleton
└── services/
    ├── message-fetcher.ts   # Message fetching with pagination
    └── eod-ingestion.ts     # EOD update processing
```



## Activity Slugs

Activities are created with the following slug format:
```
eod_update_YYYY-MM-DD_contributor_username
```

Multiple messages from the same contributor on the same day are merged into a single activity with text joined by double newlines.

## Dependencies

- `@slack/web-api` - Slack API client
- `slack-markdown` - Slack markdown to HTML converter
- `date-fns` - Date manipulation utilities
- `@leaderboard/database` - Database operations
- `@leaderboard/config` - Configuration loading
- `@leaderboard/scraper-core` - Base scraper functionality
