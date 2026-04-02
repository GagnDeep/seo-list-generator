# Self-Hosted Webhook Debugger CLI

## What It Would Be

**`whook`** — a zero-config CLI that gives developers a local webhook inspection + replay endpoint in one command.

```bash
npm install -g @seo-list/whook
whook                    # Starts server, prints https://whook.dev/abc123 → forwards to localhost:9999/whook
whook --forward https://example.com/webhook   # Forward all received webhooks to another URL
whook --inspect                                 # Open browser UI showing captured requests
whook replay <id>                              # Replay a captured request to any URL
```

A self-hosted alternative to RequestBin/Svix/webhook.site — runs on your own machine, no account needed, no data leaves your network.

## Why This Doesn't Exist Properly

- **RequestBin** — cloud-only, no replay, no local option
- **webhook.site** — cloud-only, freemium, data leaves your network  
- **Hook0/Svix** — webhook delivery platforms (sending), not debugging (receiving)
- **ngrok** — generic tunnel, no webhook-specific inspection
- **Local tunnel CLIs** — tunnel traffic but don't provide webhook inspection UI

The niche is "local-first webhook debugging" — a self-contained CLI with a companion local web UI that captures, inspects, replays, and filters webhook requests. Developers testing Stripe/GitHub/Slack webhooks locally need this.

## Market Gap

- Developers testing webhooks locally need to see the full payload, timing, headers
- Existing tools are cloud-only or lack replay/forward features
- Privacy-sensitive devs don't want to send test webhook payloads to third-party services
- The workflow is: start debugger → point webhook sender at URL → inspect → replay with modifications → forward to production

## Tech Stack

- **Language:** TypeScript / Node.js (broad compatibility)
- **Runtime:** Single binary via `pkg` or `bun compile` — zero runtime deps for end users
- **Web UI:** Lightweight vanilla HTML/CSS/JS (no framework) served from the same process
- **Storage:** In-memory ring buffer (last 100 requests) + optional SQLite for persistence
- **Networking:** Built-in HTTP server with a unique tunnel URL via `localtunnel` or built-in tunnel

## What's Close

- `@webhook/sdk` (already built) — SDK for sending + verifying webhooks, not debugging
- Localtunnel — generic TCP tunnel, no webhook UI
- The gap: a unified CLI that combines tunnel + inspection + replay + forward

## Revenue Model

- Open-source MIT — developer goodwill + portfolio piece
- SaaS tier: cloud-hosted version (whook.io) with persistent storage + team sharing
- GitHub Sponsors / buy-me-a-coffee

## Status

[READY]

## Implementation Notes

- Use `localtunnel` (already built `localtunnel`!) to give each session a public URL
- Build a simple vanilla JS frontend for request inspection
- Use a ring buffer in memory for the last 100 requests
- Add `--persist` flag to use SQLite for longer retention
- Replay endpoint should allow modifying headers/body before sending
- Support filtering by event type, timestamp, payload size
