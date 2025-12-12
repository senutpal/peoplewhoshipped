# Data Directory

This directory contains the flat file data for the leaderboard system.

## Structure

```
data/
├── contributors/         # Contributor profiles
│   ├── _sample.md        # Template file (ignored during import)
│   └── {username}.md     # One markdown file per contributor
│
├── github/               # GitHub activity data
│   └── activities/       # Activity JSON files by contributor
│       └── {username}.json
│
├── slack/                # Slack activity data
│   ├── activities/       # Activity JSON files by contributor
│   │   └── {username}.json
│   └── eod_messages/     # EOD message JSON files by user
│       └── {user_id}.json
│
└── leaderboard/          # Configuration
    └── config.yaml       # Main leaderboard configuration
```

## Contributor Files

Each contributor has a markdown file in `contributors/` named with their GitHub username:

```markdown
---
name: Display Name
role: contributor
title: Job Title
avatar_url: https://avatars.githubusercontent.com/username
social_profiles:
  github: https://github.com/username
  linkedin: https://linkedin.com/in/username
---

Optional biography or notes about the contributor.
```

### Frontmatter Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Display name |
| `role` | string | Role (core, contributor, bot) |
| `title` | string | Job title or description |
| `avatar_url` | string | URL to avatar image |
| `meta` | object | Additional metadata |
| `social_profiles` | object | Social profile URLs |

## Activity Files

Activity JSON files contain arrays of activity records:

```json
[
  {
    "slug": "pr_merged_repo#123",
    "contributor": "username",
    "activity_definition": "pr_merged",
    "title": "Merged PR: Feature implementation",
    "occured_at": "2024-01-15T10:30:00Z",
    "link": "https://github.com/org/repo/pull/123",
    "text": null,
    "points": 5,
    "meta": {}
  }
]
```

## EOD Message Files

EOD message JSON files contain arrays of Slack messages:

```json
[
  {
    "id": 1,
    "user_id": "U12345678",
    "timestamp": "2024-01-15T18:00:00Z",
    "text": "Today I worked on..."
  }
]
```

## Configuration

See `leaderboard/config.yaml` for the main configuration file with organization info, leaderboard settings, and role definitions.

## Usage

Data is managed via the `@leaderboard/db-scripts` package:

```bash
# Import data to database
bun run db:import

# Export data from database
bun run db:export
```
