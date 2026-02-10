# testing

## commands

```bash
bun test              # all tests
bun test:watch        # watch mode
bun test:e2e          # end-to-end tests
bun test:coverage     # with coverage
```

## notes

- e2e tests require production build (`bun run build`), not dev server
- set `PGLITE_DB_PATH=":memory:"` for in-memory database tests
- run `bunx playwright install` to install browsers
