# @leaderboard/database

PGlite database management for the leaderboard monorepo. Provides type-safe operations for storing and managing contributor activities across different platforms (GitHub, Slack, etc.).

## Features

- **PGlite-based** - Embedded PostgreSQL for simple deployment
- **Singleton Pattern** - Efficient connection reuse
- **Batch Operations** - Handles large datasets efficiently
- **Type-safe** - Full TypeScript interfaces for all data models
- **Cross-platform** - Links identities across GitHub, Slack, and more

## Installation

```bash
bun add @leaderboard/database
```

## Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PGLITE_DB_PATH` | Path to database data directory | `./data/leaderboard.db` or `:memory:` |

### Optional Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `LEADERBOARD_DATA_PATH` | Path for data exports | - |
| `SCRAPE_DAYS` | Days to look back when scraping | `7` |

## Quick Start

```typescript
import {
  getDb,
  addContributors,
  addActivities,
  type Activity,
} from "@leaderboard/database";

// Set environment
process.env.PGLITE_DB_PATH = "./data/leaderboard.db";

// Get database instance
const db = getDb();

// Add contributors
await addContributors(["alice", "bob", "charlie"]);

// Add activities
const activities: Activity[] = [
  {
    slug: "github-pr-opened-123",
    contributor: "alice",
    activity_definition: "github-pr-opened",
    title: "Add new feature",
    occured_at: new Date(),
    link: "https://github.com/org/repo/pull/123",
    text: null,
    points: 10,
    meta: null
  }
];
await addActivities(activities);
```

## API Reference

### Connection

#### `getDb(): PGlite`
Returns the singleton database instance. Creates one if it doesn't exist.

```typescript
const db = getDb();
const result = await db.query("SELECT * FROM contributor");
```

#### `resetDbInstance(): void`
Resets the database singleton. Primarily for testing.

```typescript
afterEach(() => {
  resetDbInstance();
});
```

#### `getConfig(): DatabaseConfig`
Returns the current database configuration from environment variables.

---

### Contributor Operations

#### `addContributors(contributors: string[]): Promise<void>`
Adds contributors with auto-generated GitHub avatar URLs.

```typescript
await addContributors(["alice", "bob"]);
```

#### `updateBotRoles(botUsernames: string[]): Promise<void>`
Marks specified contributors as bots.

```typescript
await updateBotRoles(["dependabot[bot]", "renovate[bot]"]);
```

#### `getContributorBySlackUserId(slackUserId: string): Promise<ContributorQueryResult | null>`
Finds a contributor by their Slack user ID.

```typescript
const contributor = await getContributorBySlackUserId("U12345678");
```

#### `getContributorsBySlackUserIds(slackUserIds: string[]): Promise<Map<string, string>>`
Batch lookup of contributors by Slack user IDs.

```typescript
const map = await getContributorsBySlackUserIds(["U123", "U456"]);
const username = map.get("U123");
```

---

### Activity Operations

#### `addActivities(activities: Activity[], options?: ActivityInsertOptions): Promise<void>`
Upserts activities with optional text merging.

```typescript
// Standard insert
await addActivities(activities);

// With text merging (for Slack EOD)
await addActivities(activities, { mergeText: true });
```

#### `upsertActivityDefinitions(definitions: ActivityDefinitionData[]): Promise<void>`
Upserts activity type definitions.

```typescript
await upsertActivityDefinitions([
  {
    slug: "github-pr-opened",
    name: "Pull Request Opened",
    description: "Opened a new pull request",
    points: 10,
    icon: "🔀"
  }
]);
```

#### `getActivitiesByDefinitions(definitions: string[]): Promise<Activity[]>`
Queries activities by type.

```typescript
const prActivities = await getActivitiesByDefinitions([
  "github-pr-opened",
  "github-pr-merged"
]);
```

---

### Slack EOD Operations

#### `createSlackEodTable(): Promise<void>`
Creates the EOD message queue table.

```typescript
await createSlackEodTable();
```

#### `addSlackEodMessages(messages: SlackEodMessage[]): Promise<void>`
Adds messages to the EOD queue.

```typescript
await addSlackEodMessages([
  {
    id: 1702400000123456,
    user_id: "U12345678",
    timestamp: new Date(),
    text: "Today I completed..."
  }
]);
```

#### `getPendingEodUpdates(): Promise<PendingEodUpdate[]>`
Gets pending updates grouped by user.

```typescript
const pending = await getPendingEodUpdates();
for (const update of pending) {
  console.log(`User ${update.user_id} has ${update.texts.length} messages`);
}
```

#### `deleteSlackEodMessages(ids: number[]): Promise<void>`
Removes processed messages from the queue.

```typescript
await deleteSlackEodMessages([1702400000123456]);
```

#### `getAllSlackEodMessages(): Promise<SlackEodMessage[]>`
Returns all messages in the queue.

```typescript
const all = await getAllSlackEodMessages();
```

---

### Utility Functions

#### `batchArray<T>(array: T[], batchSize: number): T[][]`
Splits an array into batches.

```typescript
const batches = batchArray(largeArray, 1000);
for (const batch of batches) {
  await processBatch(batch);
}
```

#### `getSqlPositionalParamPlaceholders(length: number, cols: number): string`
Generates SQL placeholders for bulk inserts.

```typescript
const placeholders = getSqlPositionalParamPlaceholders(2, 3);
// Result: "\n        ($1, $2, $3), \n        ($4, $5, $6)"
```

## Types

### Core Types

| Type | Description |
|------|-------------|
| `Activity` | A single contribution event from any platform |
| `Contributor` | A user who makes contributions |
| `SlackEodMessage` | A Slack EOD message in the queue |
| `ActivityDefinitionData` | Activity type definition |

### Option Types

| Type | Description |
|------|-------------|
| `ActivityInsertOptions` | Options for activity insertion |
| `DatabaseConfig` | Environment configuration |

### Result Types

| Type | Description |
|------|-------------|
| `ContributorQueryResult` | Result from contributor queries |
| `PendingEodUpdate` | Grouped pending EOD updates |

## Module Structure

```
src/
├── index.ts              # Barrel exports
├── README.md             # This file
├── types/
│   └── index.ts          # Type definitions
├── connection/
│   └── index.ts          # Database singleton
├── operations/
│   ├── contributor.ts    # Contributor CRUD
│   ├── activity.ts       # Activity CRUD
│   └── slack-eod.ts      # Slack EOD queue
└── utils/
    └── batch.ts          # Batch utilities
```
