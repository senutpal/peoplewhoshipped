# hosting

## quick setup for new contributors

```bash
# 1. Copy example env and update
cp .env.example .env
# Edit .env - for local dev, relative paths work

# 2. Generate data files
bun run db:prepare
bun run db:import
bun run db:prebuild-static

# 3. Build and test
bun run build
bun run test:e2e
```

## vercel (recommended)

1. import this repo to vercel
2. add environment variables in project settings:
   - `GITHUB_ORG`
   - `GITHUB_TOKEN`
   - `PGLITE_DB_PATH` (set to `./data/pglite`)
   - `LEADERBOARD_DATA_PATH` (set to `./data`)
3. deploy settings:
   - root directory: `apps/web`
   - build command: `bunx --bun next build`
   - output directory: `out`

**Important:** The `data/` folder with `leaderboard/config.yaml` and `static/*.json` must exist. Either:

- Commit `data/` folder to repo (simple)
- Set up GitHub Actions scraper to generate data

## netlify

1. import this repo to netlify
2. add same environment variables
3. build settings:
   - base directory: `apps/web`
   - build command: `bunx --bun next build`
   - publish directory: `out`

## automated scraping

GitHub Actions workflow runs every 12 hours:

1. The scraper generates `data/static/*.json` files
2. These are used during Next.js build for static generation
3. Vercel deployment uses the prebuilt data

**Required secrets/variables:**

- `GITHUB_TOKEN` (automatic for actions)
- `GITHUB_ORG` (your GitHub org)
- `SLACK_API_TOKEN` (optional, for Slack integration)
- `SLACK_CHANNEL` (optional, for Slack EOD updates)
