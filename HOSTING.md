# hosting

## vercel (recommended)

1. import this repo to vercel
2. add environment variables in project settings:
   - `GITHUB_ORG`
   - `GITHUB_TOKEN`
   - `PGLITE_DB_PATH` (set to `./data/pglite`)
   - `LEADERBOARD_DATA_PATH` (set to `./data` if committing data folder to repo)
3. deploy settings:
   - root directory: `apps/web`
   - build command: `bunx --bun next build`
   - output directory: `out`

## netlify

1. import this repo to netlify
2. add same environment variables
3. build settings:
   - base directory: `apps/web`
   - build command: `bunx --bun next build`
   - publish directory: `out`

## automated scraping

enable github actions:

1. go to repository settings > secrets and variables
2. add `GITHUB_TOKEN` (automatic for actions)
3. add `SLACK_API_TOKEN` if using slack
4. workflow runs every 12 hours automatically
