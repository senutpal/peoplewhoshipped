---
name: Sample Contributor
role: contributor
title: Contributor
avatar_url: https://avatars.githubusercontent.com/sample-user
meta: {}
social_profiles:
  github: https://github.com/sample-user
---

# Sample Contributor Template

This is a sample contributor file demonstrating the expected format.

## Usage

1. Copy this file and rename it to your GitHub username (e.g., `johndoe.md`)
2. Update the frontmatter fields with your information
3. Optionally add a biography or notes below the frontmatter

## Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Your display name |
| `role` | Yes | One of: `core`, `contributor`, `bot` |
| `title` | No | Your job title or description |
| `avatar_url` | No | URL to your avatar image |
| `meta` | No | Additional metadata (object) |
| `social_profiles` | No | Social URLs keyed by platform |

## Role Options

- `core` - Core team member
- `contributor` - Open source contributor
- `bot` - Bot account (hidden from leaderboard)

## Social Profiles

Supported platforms (add URL as value):
- `github`
- `linkedin`
- `twitter`
- `email`

## Example

```yaml
---
name: Jane Developer
role: core
title: Senior Software Engineer
avatar_url: https://avatars.githubusercontent.com/janedev
meta:
  team: platform
  joined: 2023-01-15
social_profiles:
  github: https://github.com/janedev
  linkedin: https://linkedin.com/in/janedev
  twitter: https://twitter.com/janedev
---
```
