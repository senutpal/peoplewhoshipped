# quick start

1. **fork this repo**

   ```
   git clone https://github.com/YOUR_ORG/peoplewhoshipped.git
   cd peoplewhoshipped
   ```

2. **configure environment**
   - copy `.env.example` to `.env`
   - add your `GITHUB_ORG` and `GITHUB_TOKEN`
   - (optional) add slack credentials

3. **configure peoplewhoshipped**
   - edit `data/leaderboard/config.yaml` with your org details
   - see [SETUP_CONFIG.md](SETUP_CONFIG.md) for details

4. **run locally**

   ```bash
   bun install
   bun run db:prepare
   bun run db:import
   cd apps/web && bun run dev
   ```

5. **deploy to vercel**
   - import repo to vercel
   - add environment variables in vercel dashboard
   - deploy (root: apps/web, build: bunx --bun next build)
