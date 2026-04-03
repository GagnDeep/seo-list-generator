# Self-Hosted Feature Flag CLI

## What It Would Be

A single-binary CLI and TypeScript library (`feature-flag`) that lets teams manage feature flags entirely in their own infrastructure — no SaaS, no accounts, no rate limits. Flags are stored in a local SQLite DB or any PostgreSQL/MySQL instance you control.

```bash
# Initialize a project
feature-flag init

# Create a flag
feature-flag create "new-checkout" --description "Redesigned checkout flow"

# Enable for a percentage of users
feature-flag enable "new-checkout" --rollout 20

# Enable for specific user IDs
feature-flag enable "new-checkout" --users user_123,user_456

# Check a flag in code
const { isEnabled } = require('feature-flag');
if (await isEnabled('new-checkout', { userId: 'user_123' })) {
  // show new checkout
}
```

## Why This Doesn't Exist

Every existing feature flag tool is either:
- **LaunchDarkly / Flagsmith / GrowthBook** — full SaaS platforms with pricing tiers, account dashboards, rate limits, and vendor lock-in
- **Unleash** — self-hosted option exists but requires Node.js server + Redis + PostgreSQL + complex Docker setup
- **ff4j** — Java-only, enterprise-weighted
- **experiment.js** — client-side only, no server-side evaluation, no targeting rules

The middle ground is empty: a **zero-dependency, single-binary CLI** that runs a SQLite-backed flag evaluation server you deploy in 30 seconds.

## Market Gap

- Solo devs and small teams (< 5 people) can't justify $80/mo LaunchDarkly just to A/B test a checkout button
- Full self-hosted options (Unleash) require managing 4+ services
- No open-source tool that is genuinely **just a binary you run** — no Docker, no Redis, no separate evaluation client/server

## Tech Stack

- **Runtime**: Node.js 20+ compiled to a single binary via `pkg` or `@vercel/ncc`
- **Database**: SQLite (default) or PostgreSQL/MySQL via `better-sqlite3` / `pg`
- **CLI**: Commander.js
- **Library API**: TypeScript, tree-shakeable ESM exports
- **Server**: Optional built-in HTTP server for remote flag evaluation (small teams)
- **Client SDKs**: TypeScript/Node.js client + browser-compatible bundle

## What's Close

- `unleash` — closest OSS alternative, but requires Redis + PostgreSQL + separate API + separate client
- `growthbook` — requires Node.js server + MongoDB
- `flagsmith` — Python/Django based, complex

## Revenue Model

- Open source (MIT) — core tool is free forever
- **Paid tier**: Multi-environment config sync, team permissions, audit log, Webhooks — delivered as a lightweight paid SaaS on top (featureflag.sh)
- GitHub Sponsors / Open Collective for the core tool

## Status

[DONE] — Built at `/root/Projects/seo-list-generator/built/feature-flag/`
