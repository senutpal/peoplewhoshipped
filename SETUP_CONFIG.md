# setup & configuration

## env file

copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

required variables:

- `GITHUB_ORG` - your github organization name
- `GITHUB_TOKEN` - github personal access token (repo + read:org scopes)

optional:

- `SLACK_API_TOKEN` - slack bot token for eod tracking
- `SLACK_CHANNEL` - slack channel id for eod updates

## peoplewhoshipped config

edit `data/leaderboard/config.yaml`:

```yaml
org:
  name: your-org-name
  description: your org description
  url: https://your-org.com
  logo_url: https://your-logo.png
```

## adding contributors

create a markdown file in `data/contributors/` named `{username}.md`:

```markdown
---
name: display name
role: contributor
title: software engineer
avatar_url: https://avatars.githubusercontent.com/u/12345
social_profiles:
  github: https://github.com/username
---

optional bio text here
```

or auto-generate from github:

```bash
bun run contributors:generate
```

this fetches all contributors from your github org and creates files for them.

## activity types

| activity       | points |
| -------------- | ------ |
| pr merged      | 7      |
| pr reviewed    | 2      |
| issue opened   | 2      |
| eod update     | 2      |
| pr opened      | 1      |
| issue assigned | 1      |
