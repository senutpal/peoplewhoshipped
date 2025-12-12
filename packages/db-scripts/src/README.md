# @leaderboard/db-scripts

Database scripts for managing the leaderboard data store.

## Overview

This package provides CLI scripts and programmatic APIs for managing the leaderboard database, including schema initialization, data import from flat files, and data export to JSON.

## Installation

```bash
bun add @leaderboard/db-scripts
```

## Configuration

Set the following environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `PGLITE_DB_PATH` | Path to PGlite database directory | *Required* |
| `LEADERBOARD_DATA_PATH` | Path to data directory | `./data` |

## Usage

### CLI

```bash
# Initialize database schema
bun run db:prepare

# Import data from flat files
bun run db:import

# Export data to flat files
bun run db:export
```

### Programmatic

```typescript
import {
  prepareDatabase,
  importData,
  exportData,
} from "@leaderboard/db-scripts";

// Initialize schema
await prepareDatabase();

// Import all data
await importData();

// Export all data
await exportData();
```

## Exports

### Main Functions

| Export | Description |
|--------|-------------|
| `prepareDatabase()` | Initialize database schema |
| `importData()` | Import all flat files to database |
| `exportData()` | Export all database data to flat files |

### Import Services

| Export | Description |
|--------|-------------|
| `importContributors(dataPath)` | Import contributors from markdown files |
| `importGitHubActivities(dataPath)` | Import GitHub activities from JSON |
| `importSlackActivities(dataPath)` | Import Slack activities from JSON |
| `importSlackEodMessages(dataPath)` | Import Slack EOD messages from JSON |
| `getContributorMeta(filePath)` | Get metadata from contributor markdown file |

### Export Services

| Export | Description |
|--------|-------------|
| `exportGitHubActivities(dataPath)` | Export GitHub activities to JSON |
| `exportSlackActivities(dataPath)` | Export Slack activities to JSON |
| `exportSlackEodMessages(dataPath)` | Export Slack EOD messages to JSON |

### Configuration

| Export | Description |
|--------|-------------|
| `getDataPath()` | Get data directory path |
| `getPgliteDbPath()` | Get PGlite database path |
| `validateConfig()` | Validate required configuration |

### Types

| Export | Description |
|--------|-------------|
| `ActivityRow` | Activity record from database |
| `EodMessageRow` | EOD message record from database |
| `ContributorMeta` | Contributor metadata from frontmatter |
| `ExportResult` | Result of export operations |
| `ImportResult` | Result of import operations |

## Architecture

```
src/
├── index.ts              # Barrel export (entry point)
├── prepare.ts            # Schema initialization
├── import.ts             # Import orchestration
├── export.ts             # Export orchestration
├── types/
│   └── index.ts          # All TypeScript interfaces
├── config/
│   └── index.ts          # Environment configuration
└── services/
    ├── index.ts              # Services barrel export
    ├── contributor-importer.ts  # Contributor import
    ├── activity-importer.ts     # Activity import (GitHub/Slack)
    ├── eod-importer.ts          # EOD message import
    ├── github-exporter.ts       # GitHub activity export
    ├── slack-exporter.ts        # Slack activity export
    └── eod-exporter.ts          # EOD message export
```

## Data Directory Structure

```
data/
├── contributors/         # Contributor markdown files
│   ├── _sample.md        # Sample template
│   └── {username}.md     # One file per contributor
├── github/
│   └── activities/       # GitHub activity JSON files
│       └── {username}.json
├── slack/
│   ├── activities/       # Slack activity JSON files
│   │   └── {username}.json
│   └── eod_messages/     # EOD message JSON files
│       └── {user_id}.json
└── leaderboard/
    └── config.yaml       # Leaderboard configuration
```

## Dependencies

- `@leaderboard/database` - Database operations
- `@leaderboard/scraper-core` - Activity definitions
- `gray-matter` - Markdown frontmatter parsing
