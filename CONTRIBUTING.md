# Contributing

Thanks for helping out! This project is a community registry of API rate
limits for [Notion Workers](https://developers.notion.com/workers/get-started/overview).
The most valuable contributions are **new or corrected rate limits** — but
bug fixes, docs, and tests are all welcome.

## Ways to contribute

- **Add a new API's rate limit** (most wanted — see below)
- **Correct an existing limit** if the official docs have changed
- Improve docs, tests, or the validation tooling

No contribution is too small. Opening an issue to flag a stale limit is just as
useful as a PR.

## Adding a new rate limit

1. Open `src/registry.ts`.
2. Add your service in **lowercase**, keeping the list **alphabetical**:

   ```typescript
   hubspot: {
     allowedRequests: 10,
     intervalMs: 1000,
     sourceUrl: "https://developers.hubspot.com/docs/api/usage-details",
   },
   ```

3. Base the numbers on the **official docs** and link them in `sourceUrl`.
4. If the API's limits vary by plan/tier/endpoint, pick a **conservative**
   default and add a short comment noting the nuance (see the existing entries
   for GitHub, Slack, and Shopify as examples).
5. Run `npm run build:json` to regenerate `registry.json`, and commit it
   alongside your change.

`src/registry.ts` is the source of truth; `registry.json` is generated from it.
CI fails if they're out of sync, so don't hand-edit `registry.json`.

## Development setup

```bash
npm install
npm run lint           # ESLint + Prettier
npm run format         # auto-fix formatting
npm run validate       # check registry entries (lowercase, alphabetical, https sourceUrl, sane numbers)
npm run build:json     # regenerate registry.json from src/registry.ts
npm run check:json     # verify registry.json is in sync (CI)
npm run typecheck      # tsc --noEmit
npm test               # vitest
npm run test:coverage  # vitest with 90% coverage thresholds
```

CI runs all of these on every PR. The quickest way to pass is to run
`npm run format`, `npm run validate`, `npm run build:json`, and `npm test`
locally before pushing. `npm run validate` tells you exactly which registry
rule failed.

## Pull request flow

1. Fork and create a branch (`git checkout -b add-hubspot-limit`).
2. Make your change; keep commits focused.
3. Run `npm run validate`, `npm run build:json`, `npm run typecheck`, and
   `npm test` locally.
4. Open a PR using the template. Link the official rate-limit docs for any
   value you add or change.

## Code style

- TypeScript, strict mode. Prefer small, pure functions.
- Use `===`, early returns, and descriptive names.
- Keep the registry alphabetical and lowercase, and regenerate `registry.json`.

## Reporting issues

Use the issue templates. For a stale or wrong limit, please include a link to
the current official docs so a maintainer can verify quickly.

By contributing, you agree your contributions are licensed under the project's
[MIT License](./LICENSE).
