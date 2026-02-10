import { Octokit } from "octokit";
import { loadConfig } from "../config/index.js";
import fs from "node:fs/promises";
import path from "node:path";

const CONTRIBUTORS_DIR = "data/contributors";
const DATA_PATH = "data";

async function generateContributors() {
  const config = loadConfig();

  if (!config.github?.token || !config.github?.org) {
    console.error("Error: GITHUB_TOKEN and GITHUB_ORG must be set");
    process.exit(1);
  }

  const octokit = new Octokit({ auth: config.github.token });
  const org = config.github.org;

  console.log(`Fetching contributors from ${org}...`);

  const contributors = new Map<string, { name: string; avatar: string }>();

  for (let page = 1; ; page++) {
    const { data } = await octokit.rest.repos.listForOrg({
      org,
      type: "all",
      per_page: 100,
      page,
    });

    if (data.length === 0) break;

    for (const repo of data) {
      if (repo.fork) continue;

      try {
        const { data: contribs } = await octokit.rest.repos.listContributors({
          owner: org,
          repo: repo.name,
          per_page: 100,
        });

        for (const c of contribs) {
          if (!contributors.has(c.login!)) {
            contributors.set(c.login!, {
              name: c.login!,
              avatar: c.avatar_url,
            });
          }
        }
      } catch (e) {
        console.warn(`  skip ${repo.name}: ${(e as Error).message}`);
      }
    }

    console.log(`  page ${page}: found ${contributors.size} contributors`);
  }

  await fs.mkdir(CONTRIBUTORS_DIR, { recursive: true });

  for (const [login, data] of contributors) {
    const filePath = path.join(CONTRIBUTORS_DIR, `${login}.md`);
    const existing = await fs.readFile(filePath, "utf-8").catch(() => null);

    if (existing) {
      console.log(`  skip ${login}: already exists`);
      continue;
    }

    const content = `---
name: ${data.name}
role: contributor
title: contributor
avatar_url: ${data.avatar}
---

`;

    await fs.writeFile(filePath, content);
    console.log(`  created ${login}.md`);
  }

  console.log(`\ndone. generated ${contributors.size} contributor files.`);
}

generateContributors().catch(console.error);
