# data directory

flat file storage for leaderboard data.

## structure

```
data/
├── contributors/      # {username}.md - contributor profiles
├── github/activities/ # {username}.json - github activity
├── slack/activities/ # {username}.json - slack activity
├── pglite/           # pglite database (created automatically)
└── leaderboard/
    └── config.yaml   # leaderboard configuration
```

## contributor file

```markdown
---
name: display name
role: contributor
title: job title
avatar_url: https://github.com/avatar.png
social_profiles:
  github: https://github.com/username
---

optional bio
```
