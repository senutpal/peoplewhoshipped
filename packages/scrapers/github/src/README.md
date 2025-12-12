# @leaderboard/scraper-github

GitHub contribution scraper for the leaderboard system.

## Overview

This package scrapes GitHub activity from a configured organization and converts them to contributor activities. It supports tracking issues, pull requests, comments, and commits.

## Installation

```bash
bun add @leaderboard/scraper-github
```

## Configuration

Set the following environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `GITHUB_TOKEN` | GitHub Personal Access Token | `ghp_...` |
| `GITHUB_ORG` | GitHub Organization name | `my-org` |

### Getting the Token

1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Generate a new token (classic) with `repo` and `read:org` scopes
3. Copy the token and set it as `GITHUB_TOKEN`

## Usage

### CLI

```bash
cd packages/scrapers/github
bun run scrape
```

### Programmatic

```typescript
import { GitHubScraper } from "@leaderboard/scraper-github";

const scraper = new GitHubScraper();
const result = await scraper.scrape();

console.log(`Processed: ${result.stats.processed}`);
console.log(`Failed: ${result.stats.failed}`);
console.log(`Activities: ${result.contributions.length}`);
```

## Exports

### Classes

| Export | Description |
|--------|-------------|
| `GitHubScraper` | Main scraper class extending `BaseScraper` |

### Functions

| Export | Description |
|--------|-------------|
| `main()` | CLI entry point - prepares DB and runs scraper |
| `getOctokit()` | Returns Octokit client singleton |
| `getGitHubOrg()` | Returns configured organization name |
| `getGitHubToken()` | Returns configured API token |
| `resetOctokitClient()` | Resets client singleton (for testing) |
| `getRepositories(org, since?)` | Fetches repositories from organization |
| `getPullRequestsAndReviews(repo, since?)` | Fetches PRs with reviews using GraphQL |
| `getIssues(repo, since?)` | Fetches issues with timeline events |
| `getComments(repo, since?)` | Fetches issue/PR comments |
| `getCommitsFromPushEvents(repo, since?)` | Fetches commits from push events |
| `trackBotUser(login)` | Adds a bot user to tracking |
| `getBotUsers()` | Returns all tracked bot usernames |
| `getBotUserCount()` | Returns count of tracked bots |
| `clearBotUsers()` | Clears bot tracking (for new scrape) |
| `activitiesFromIssues(issues, repo)` | Generates activities from issues |
| `activitiesFromComments(comments, repo)` | Generates activities from comments |
| `activitiesFromPullRequests(prs, repo)` | Generates activities from PRs |
| `activitiesFromCommits(commits)` | Generates activities from commits |

### Types

| Export | Description |
|--------|-------------|
| `Activity` | Activity record (re-exported from database) |
| `Repository` | Repository with name, url, defaultBranch |
| `PullRequest` | Pull request with reviews |
| `PullRequestReview` | Review on a pull request |
| `Issue` | Issue with assignment and close events |
| `IssueAssignEvent` | Assignment event on an issue |
| `Comment` | Comment on issue or PR |
| `Commit` | Commit from push event |
| `GitHubUser` | GitHub user from GraphQL responses |

## Architecture

```
src/
├── index.ts                    # Barrel export (entry point)
├── scraper.ts                  # GitHubScraper class
├── types/
│   └── index.ts                # All TypeScript interfaces
├── client/
│   └── index.ts                # Octokit client singleton
└── services/
    ├── repository-fetcher.ts   # Repository fetching
    ├── pr-fetcher.ts           # Pull request fetching (GraphQL)
    ├── issue-fetcher.ts        # Issue fetching (GraphQL)
    ├── comment-fetcher.ts      # Comment fetching (REST)
    ├── commit-fetcher.ts       # Commit fetching (Events API)
    ├── bot-tracker.ts          # Bot user tracking
    └── activity-generators.ts  # Data to Activity conversion
```

## Activity Slugs

Activities are created with the following slug formats:

| Activity Type | Slug Format |
|---------------|-------------|
| Issue Opened | `issue_opened_{repo}#{number}` |
| Issue Assigned | `issue_assigned_{repo}#{number}_{username}` |
| Issue Closed | `issue_closed_{repo}#{number}` |
| PR Opened | `pr_opened_{repo}#{number}` |
| PR Merged | `pr_merged_{repo}#{number}` |
| PR Reviewed | `pr_reviewed_{repo}#{number}_{state}_{id}` |
| Comment | `comment_created_{repo}#{issue}_{id}` |
| Commit | `commit_created_{branch}_{sha}` |

## Bot Detection

Bot users are automatically detected based on:
- `__typename: "Bot"` in GraphQL responses
- `type: "Bot"` in REST API responses

Detected bots are tracked and their roles are updated in the database after scraping completes.

## Dependencies

- `octokit` - GitHub API client
- `date-fns` - Date manipulation utilities
- `@leaderboard/database` - Database operations
- `@leaderboard/config` - Configuration loading
- `@leaderboard/scraper-core` - Base scraper functionality
