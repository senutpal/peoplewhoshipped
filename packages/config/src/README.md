# @leaderboard/config

Centralized configuration management for the leaderboard monorepo.

## Overview

This package provides type-safe configuration loading, validation, and management for all leaderboard services. It handles environment variable parsing, service-specific configurations, and runtime validation with TypeScript type guards.

## Installation

```bash
bun add @leaderboard/config
```

## Configuration

Set the following environment variables:

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PGLITE_DB_PATH` | ✅ | Path to PGlite database | `./data/leaderboard.db` |
| `GITHUB_TOKEN` | ❌ | GitHub Personal Access Token | `ghp_xxxxxxxxxxxx` |
| `GITHUB_ORG` | ❌ | GitHub organization slug | `my-organization` |
| `SLACK_API_TOKEN` | ❌ | Slack Bot User OAuth Token | `xoxb-xxxxxxxxxxxx` |
| `SLACK_CHANNEL` | ❌ | Slack channel ID | `C12345678` |
| `LEADERBOARD_DATA_PATH` | ❌ | Path for exported data | `./data/exports` |
| `SCRAPE_DAYS` | ❌ | Days to scrape (default: 1) | `7` |

## Usage

### Basic Usage

```typescript
import { loadConfig, validateConfig } from "@leaderboard/config";

const config = loadConfig();

if (!validateConfig(config)) {
  console.error("Invalid configuration");
  process.exit(1);
}

console.log(`Database path: ${config.database.path}`);
console.log(`Scrape days: ${config.scrapeDays}`);
```

### Service-Specific Validation

```typescript
import {
  loadConfig,
  validateGitHubConfig,
  validateSlackConfig
} from "@leaderboard/config";

const config = loadConfig();

if (validateGitHubConfig(config)) {
  // TypeScript knows config.github is defined
  console.log(`GitHub org: ${config.github.org}`);
}

if (validateSlackConfig(config)) {
  // TypeScript knows config.slack is defined
  console.log(`Slack channel: ${config.slack.channel}`);
}
```

### Environment Variable Helpers

```typescript
import {
  getRequiredEnv,
  getOptionalEnv,
  getOptionalEnvInt
} from "@leaderboard/config";

// Throws if not set
const apiKey = getRequiredEnv("API_KEY");

// Returns default if not set
const logLevel = getOptionalEnv("LOG_LEVEL", "info");
const timeout = getOptionalEnvInt("TIMEOUT_MS", 5000);
```

### Using Constants

```typescript
import {
  DEFAULT_BATCH_SIZE,
  DEFAULT_PAGE_LIMIT,
  MAX_CONCURRENT_REQUESTS
} from "@leaderboard/config";

// Batch database inserts
for (let i = 0; i < items.length; i += DEFAULT_BATCH_SIZE) {
  const batch = items.slice(i, i + DEFAULT_BATCH_SIZE);
  await db.insert(batch);
}
```

## Exports

### Types

| Export | Description |
|--------|-------------|
| `GitHubConfig` | GitHub authentication configuration |
| `SlackConfig` | Slack authentication configuration |
| `DatabaseConfig` | PGlite database configuration |
| `LeaderboardConfig` | Complete application configuration |

### Functions

| Export | Description |
|--------|-------------|
| `getRequiredEnv(name)` | Get required env var or throw |
| `getOptionalEnv(name, default)` | Get optional env var with fallback |
| `getOptionalEnvInt(name, default)` | Get optional integer env var |
| `loadGitHubConfig()` | Load GitHub config from env |
| `loadSlackConfig()` | Load Slack config from env |
| `loadDatabaseConfig()` | Load database config from env |
| `loadConfig()` | Load complete application config |
| `validateGitHubConfig(config)` | Type guard for GitHub config |
| `validateSlackConfig(config)` | Type guard for Slack config |
| `validateConfig(config)` | Validate complete configuration |

### Constants

| Export | Value | Description |
|--------|-------|-------------|
| `DEFAULT_BATCH_SIZE` | 1000 | Default batch size for DB operations |
| `DEFAULT_PAGE_LIMIT` | 100 | Default API pagination limit |
| `MAX_CONCURRENT_REQUESTS` | 5 | Max concurrent API requests |

## Architecture

```
src/
├── index.ts              # Barrel export (entry point)
├── README.md             # This documentation
├── types/
│   └── index.ts          # TypeScript interfaces
├── env/
│   └── index.ts          # Environment variable helpers
├── loaders/
│   └── index.ts          # Configuration loaders
├── validators/
│   └── index.ts          # Validation functions & type guards
└── constants/
    └── index.ts          # Configuration constants
```

## Dependencies

- None (pure TypeScript)

## Peer Dependencies

- `typescript@^5`
