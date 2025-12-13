# Leaderboard Monorepo

A contributor activity leaderboard system that aggregates data from GitHub and Slack into a unified dashboard.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | [Bun](https://bun.sh) v1.3+ |
| Database | [PGlite](https://electric-sql.com/docs/usage/pglite) (embedded PostgreSQL) |
| Web Framework | [Next.js 15](https://nextjs.org) with React 19 |
| Package Manager | Bun workspaces |
| Language | TypeScript 5.7 (strict mode) |
| CI/CD | GitHub Actions |

---

## Project Structure

```
leaderboard/
├── apps/
│   └── web/                    # Next.js leaderboard dashboard
├── packages/
│   ├── config/                 # @leaderboard/config - Configuration management
│   ├── database/               # @leaderboard/database - PGlite database operations
│   ├── db-scripts/             # @leaderboard/db-scripts - CLI data tools
│   ├── ui/                     # @leaderboard/ui - Shared React components
│   ├── utils/                  # @leaderboard/utils - Common utilities
│   └── scrapers/
│       ├── core/               # @leaderboard/scraper-core - Shared scraper logic
│       ├── github/             # @leaderboard/scraper-github - GitHub API scraper
│       ├── slack/              # @leaderboard/scraper-slack - Slack EOD scraper
│       └── roles/              # @leaderboard/scraper-roles - Role management
├── data/                       # Flat file data storage
│   ├── contributors/           # {username}.md contributor profiles
│   ├── github/                 # GitHub activity JSON
│   ├── slack/                  # Slack EOD messages JSON
│   └── leaderboard/config.yaml # Main configuration file
└── .github/workflows/
    └── scraper.yaml            # Automated scraping workflow
```

---

## Quick Start

### Prerequisites

- **Bun** v1.3.4 or later — [Install Bun](https://bun.sh/docs/installation)
- **GitHub Personal Access Token** — [Generate here](https://github.com/settings/tokens)
- **Slack Bot Token** (optional) — [Create Slack App](https://api.slack.com/apps)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/leaderboard.git
cd leaderboard

# Install dependencies
bun install
```

### Configuration

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Configure required variables in `.env`:
   ```env
   # Required - Database path
   PGLITE_DB_PATH=./pglite-db

   # Required - Data directory
   LEADERBOARD_DATA_PATH=./data

   # GitHub configuration
   GITHUB_TOKEN=ghp_your_token_here
   GITHUB_ORG=your-org-name

   # Slack configuration (optional)
   SLACK_API_TOKEN=xoxb-your-token
   SLACK_CHANNEL=C12345678

   # Scraper settings
   SCRAPE_DAYS=1
   ```

3. Customize `data/leaderboard/config.yaml` for your organization.

### Running Locally

```bash
# 1. Prepare database schema
bun run db:prepare

# 2. Scrape data from GitHub (optional - requires GITHUB_TOKEN)
bun run scrape:github

# 3. Import flat file data into database
bun run db:import

# 4. Export static JSON for Next.js (required before build/dev)
bun run db:prebuild-static

# 5. Start development server
cd apps/web && bun run dev
```

### Building for Production

```bash
# Full build flow (from root)
bun install
bun run db:prepare
bun run scrape:github
bun run db:import
bun run db:prebuild-static
cd apps/web && bunx --bun next build
```

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start all packages in dev mode |
| `bun run build` | Build all packages |
| `bun run lint` | Lint all packages |
| `bun run check` | TypeScript type-check |
| `bun run clean` | Remove build artifacts and node_modules |
| `bun run db:prepare` | Create database schema |
| `bun run db:import` | Import flat files → database |
| `bun run db:export` | Export database → flat files |
| `bun run db:prebuild-static` | Export JSON for Next.js static build |
| `bun run scrape:github` | Scrape GitHub activity |
| `bun run scrape:slack` | Scrape Slack EOD messages |
| `bun run scrape:all` | Run all scrapers |

---

## Database Schema

PGlite tables:

| Table | Description |
|-------|-------------|
| `contributor` | User profiles (username PK, name, role, avatar, socials) |
| `activity_definition` | Activity types (slug PK, name, points, icon) |
| `activity` | Activity records (contributor FK, timestamp, points, meta) |
| `slack_eod_queue` | Pending Slack EOD messages for processing |

---

## Package Details

### `@leaderboard/config`
Environment variable parsing, YAML config loading, and validation with type guards.

### `@leaderboard/database`
PGlite connection singleton, batch operations, and CRUD for contributors/activities.

### `@leaderboard/db-scripts`
CLI tools: `prepare.ts` (schema), `import.ts` (flat files → DB), `export.ts` (DB → flat files).

### `@leaderboard/scraper-core`
Shared activity definitions, date utilities, and base scraper interfaces.

### `@leaderboard/scraper-github`
GitHub API scraper using Octokit. Tracks: PRs, issues, commits, comments, reviews.

### `@leaderboard/scraper-slack`
Slack Web API scraper. Tracks: EOD update messages from configured channel.

### `@leaderboard/ui`
Shared React 19 components for the dashboard.

### `@leaderboard/web`
Next.js 15 app with Turbopack. Displays leaderboard, contributor profiles, activity feeds.

---

## Data Formats

### Contributor File (`data/contributors/{username}.md`)

```markdown
---
name: John Doe
role: contributor
title: Software Engineer
avatar_url: https://avatars.githubusercontent.com/u/12345
social_profiles:
  github: https://github.com/johndoe
  linkedin: https://linkedin.com/in/johndoe
---

Optional bio text here.
```

### Activity JSON (`data/github/activities/{username}.json`)

```json
[
  {
    "slug": "pr_merged_repo#123",
    "contributor": "johndoe",
    "activity_definition": "pr_merged",
    "title": "Feature: Add dark mode",
    "occured_at": "2024-01-15T10:30:00Z",
    "link": "https://github.com/org/repo/pull/123",
    "points": 5
  }
]
```

---

## GitHub Actions Workflow

The `scraper.yaml` workflow runs automatically every 12 hours:

1. Checkout repo & install Bun
2. `bun run db:prepare` — Create schema
3. `bun run db:import` — Load existing data
4. `bun run scrape:github` — Fetch new GitHub activity
5. `bun run scrape:slack` — Fetch new Slack EODs
6. `bun run db:export` — Write to flat files
7. Upload artifacts (30-day retention)

**Required Secrets:**
- `GITHUB_TOKEN` — Auto-provided by Actions
- `SLACK_API_TOKEN` — Your Slack bot token

**Required Variables:**
- `SLACK_EOD_CHANNEL` — Slack channel ID

Manual trigger: Actions → Scraper → Run workflow (optional `days` parameter).

---

## Development

### Adding a New Scraper

1. Create package: `packages/scrapers/new-source/`
2. Add to workspaces in root `package.json`
3. Implement scraper using `@leaderboard/scraper-core` interfaces
4. Register activity definitions in `scraper-core`
5. Add script: `"scrape:new": "bun run --filter @leaderboard/scraper-new scrape"`

### TypeScript Configuration

Root `tsconfig.json` uses:
- `strict: true`
- `noUncheckedIndexedAccess: true`
- `verbatimModuleSyntax: true`
- Path alias: `@leaderboard/*` → `packages/*/src`
