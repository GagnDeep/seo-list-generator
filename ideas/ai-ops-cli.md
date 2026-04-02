# AI Ops CLI — Self-Hosted AI Cost & Performance Monitor

## Status
[DONE] — Built at `/root/Projects/seo-list-generator/built/ai-ops-cli/`

## What It Would Be

A CLI tool + self-hosted dashboard for monitoring AI API usage, costs, latency, and error rates across all AI providers in one place.

```bash
# Track costs across OpenAI, Anthropic, Google, Azure, local Ollama
ai-ops track --provider openai --api-key sk-...
ai-ops dashboard
# → Opens http://localhost:3000 with live cost dashboard
```

**What it does:**
- **Cost tracking** — Aggregates spending across OpenAI, Anthropic, Google AI, Azure OpenAI, Ollama
- **Usage analytics** — Tokens used per day/week/month, per model, per API key
- **Latency monitoring** — P50/P95/P99 response times per provider
- **Error rate tracking** — 4xx/5xx rates, rate limit hits
- **Budget alerts** — Slack/email/webhook when cost exceeds threshold
- **Cost attribution** — Tag requests by project/user to see where money goes
- **Local-first** — All data stored in SQLite on your server, nothing leaves your network

**Files created:**
```
src/
  cli.ts           — Commander.js CLI (track, dashboard, alert, report)
  providers/
    openai.ts      — OpenAI + Azure OpenAI adapter
    anthropic.ts   — Anthropic adapter
    google.ts      — Google AI (Gemini)
    ollama.ts      — Local Ollama adapter
  store/
    sqlite.ts      — SQLite persistence layer
    schema.ts      — Tables: requests, costs, errors, budgets
  analytics/
    cost.ts        — Cost aggregation per model/provider/time
    latency.ts     — Latency percentiles
    errors.ts      — Error rate tracking
  dashboard/
    server.ts      — Fastify web dashboard
    index.html     — Live-updating charts (Chart.js)
    alerts.ts      — Budget alert engine
  alerts/
    slack.ts       — Slack webhook notifications
    email.ts       — Email alerts via SMTP
    webhook.ts     — Generic webhook alerts
  report/
    csv.ts         — CSV export
    json.ts        — JSON export
package.json
tsconfig.json
vitest.config.ts
docker-compose.yml
README.md
CHANGELOG.md
LICENSE (MIT)
```

## Why This Doesn't Exist

- **Provider dashboards are siloed** — OpenAI dashboard shows OpenAI costs, Anthropic shows Anthropic. You can't see cross-provider total cost in one view.
- **No local-first option** — All existing cost tools are SaaS that require sending your API keys to third parties.
- **Budget alerts are crude** — Most tools only alert after you've already overspent. This tool tracks spend velocity and can alert before you hit the limit.

## Market Gap

Developers and companies using multiple AI providers spend real money but have no unified visibility:
- "Did our GPT-4 usage spike this week or is that just cached?"
- "Which project is burning through our budget?"
- "Ollama is free but latency is 3x — is that worth it for our use case?"

The gap: **"AI's Datadog"** — local, privacy-first, cross-provider cost and performance observability.

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **CLI**: Commander.js
- **Database**: SQLite (better-sqlite3) — zero-config, local, portable
- **Dashboard**: Fastify + vanilla HTML/JS + Chart.js (no React SPA bloat)
- **Container**: Docker + docker-compose for one-command deploy
- **Alerts**: Nodemailer (SMTP), axios (Slack webhooks)
- **Testing**: Vitest

## What's Close

- **OpenAI usage dashboard** — Only OpenAI, cloud-only
- **Datadog AI monitors** — Expensive enterprise SaaS, no local option
- **Helicone** — Open source AI observability, but still requires proxying requests through their service
- **Bito AI** — IDE plugin, not a CLI/Ops tool

Our differentiator: **Zero external dependency** — runs entirely local, one Docker command, no account needed.

## Revenue Model

- **MIT open source** — Core tool is always free
- **Managed hosted version** — $5/mo hosted dashboard + alerts (no need to self-host)
- **Team features** — Multi-user, role-based access, SSO @ $15/mo
- **Enterprise** — On-premise deploy + SLA + custom integrations @ $99/mo
