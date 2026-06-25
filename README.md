# notion-runner-rate-limits

[![CI](https://github.com/dennisedson/notion-runner-rate-limits/actions/workflows/ci.yml/badge.svg)](https://github.com/dennisedson/notion-runner-rate-limits/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

A community-maintained reference of common API rate limits, for people building
[Notion Workers](https://developers.notion.com/workers/get-started/overview).

Notion Workers already give you a built-in pacer to throttle outbound calls —
you just need the right numbers. That's what this repo is: a curated, sourced
list of those numbers so you don't have to dig through each API's docs. **Grab a
value and drop it into your `worker.pacer(...)` call. No install required.**

## The limits

Every value links to the official docs it came from. These are **conservative
defaults** — see the [caveats](#caveats) below.

| Service | Allowed requests | Interval            | Source                                                                               |
| ------- | ---------------- | ------------------- | ------------------------------------------------------------------------------------ |
| GitHub  | 83               | 60,000 ms (per min) | [docs](https://docs.github.com/rest/using-the-rest-api/rate-limits-for-the-rest-api) |
| Shopify | 2                | 1,000 ms (per sec)  | [docs](https://shopify.dev/docs/api/usage/rate-limits)                               |
| Slack   | 50               | 60,000 ms (per min) | [docs](https://api.slack.com/docs/rate-limits)                                       |
| Stripe  | 100              | 1,000 ms (per sec)  | [docs](https://docs.stripe.com/rate-limits)                                          |

Machine-readable version: [`registry.json`](./registry.json) (generated from
[`src/registry.ts`](./src/registry.ts)).

## Using a limit

Inside a Notion Worker sync, pass the numbers straight to the built-in pacer and
`await pacer.wait()` before each request:

```typescript
// Shopify: 2 requests / second
const shopify = worker.pacer("shopify", {
  allowedRequests: 2,
  intervalMs: 1000,
});

for (const item of items) {
  await shopify.wait();
  await fetch("https://your-store.myshopify.com/admin/api/...");
}
```

## Reading the data programmatically

`registry.json` is plain JSON you can fetch raw or read from any language — no
package to install, always the latest committed values:

```
https://raw.githubusercontent.com/dennisedson/notion-runner-rate-limits/main/registry.json
```

## Optional: dynamic helper

If you'd rather resolve a pacer from a service name (with env-var overrides)
instead of inlining numbers, there's a copy-paste helper at
[`examples/notion-pacer.ts`](./examples/notion-pacer.ts). It's intentionally
_not_ a published dependency — for most projects, reading the number is simpler.

## Open question

Is a real, installable helper for **pacing many APIs from config** (env-var
overrides, dynamic lookup) something you'd actually use, or is grabbing the
numbers enough? We're gauging demand before adding a runtime dependency.

👉 **Weigh in here:** [Discussion: should we ship a runtime helper?](https://github.com/dennisedson/notion-runner-rate-limits/discussions)

## Caveats

These are conservative starting points, not exhaustive models. Many APIs vary
limits by plan tier or endpoint, or use cost-based models a single
requests/interval pair can't fully capture (e.g. GitHub enforces hourly, Slack
limits are per-method tiers, Shopify Plus is 4/s and its GraphQL API is
cost-based). When in doubt, start cautious and confirm against the linked docs.

## Contributing

The most valuable contributions are **new and corrected rate limits**. Add an
entry to [`src/registry.ts`](./src/registry.ts), run `npm run build:json`, and
open a PR. See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full guide and
[CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) for community expectations.

## License

MIT — see [LICENSE](./LICENSE).
