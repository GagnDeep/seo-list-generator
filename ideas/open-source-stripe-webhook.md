# Open Source Stripe Webhook

## What It Is
A self-hosted Stripe webhook handler with built-in idempotency, automatic retry logic, and a simple queue system. Handles `payment_intent.succeeded`, `customer.subscription.updated`, and other events reliably. Zero infrastructure required — runs as a standalone Node.js server or serverless function.

## Why It Doesn't Exist Well as Open Source
Stripe's own `stripe-node` library handles API calls but not webhook delivery. Most webhook implementations use SQLite/Postgres for idempotency but don't handle edge cases (duplicate delivery, out-of-order events). There's no drop-in webhook handler that's both complete and self-hosted.

## Developer Pain Point
Every Stripe integration needs webhook handling and most developers implement it incorrectly: no idempotency check, no retry handling, no event ordering. This library handles all of it. Developers would npm install it to get a production-ready webhook endpoint in minutes.

## Suggested Tech Stack
- TypeScript with strict mode
- `stripe` SDK for webhook signature verification
- SQLite (via `better-sqlite3`) or in-memory for idempotency storage
- Node.js HTTP server or AWS Lambda / Vercel Edge function compatible

## What's Close (GitHub repos to reference)
- [stripe-node](https://github.com/stripe/stripe-node) — webhook signature verification only
- [stripe-webhook-handler](https://github.com/zeit/stripe-webhook-handler) — basic, outdated
- [webhookRelay stripe-forwarder](https://github.com/webhook-relay/stripe-forwarder) — relay service, not self-hosted

## What to Build (MVP Scope)
1. Webhook endpoint that verifies Stripe signature (`stripe.webhooks.constructEvent`)
2. Idempotency: store event IDs in SQLite, skip duplicates
3. Event ordering: process events in correct sequence
4. Built-in handlers for common events: `payment_intent.succeeded`, `customer.subscription.*`, `invoice.*`
5. Custom handler registration: `webhook.on('event', handler)`
6. Retry queue for failed handlers with exponential backoff
7. Health endpoint `/health` for uptime monitoring

## Category
Library
