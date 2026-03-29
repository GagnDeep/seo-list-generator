# Webhook SDK

## What It Is
A TypeScript SDK for building webhook integrations. Handle incoming webhooks with signature verification, automatic retries, exponential backoff, and queued processing. Works with any webhook provider (Stripe, GitHub, Slack) and supports idempotency keys out of the box.

## Why It Doesn't Exist Well as Open Source
`microgateway` is complex and Stripe-specific. Generic webhook libraries don't handle signature verification consistently. Most implementations roll their own retry logic and get it wrong. There's no well-typed, provider-agnostic SDK that handles the hard parts.

## Developer Pain Point
Every developer implements webhooks differently and most get it wrong: no signature verification, no retries, no idempotency. This SDK handles the hard parts so developers just define handlers. Developers would npm install it when building any webhook integration.

## Suggested Tech Stack
- TypeScript with strict mode
- `jose` or `crypto` for signature verification (Ed25519, HMAC)
- In-memory or Redis queue for retry processing
- Works in Node.js, edge functions, and Bun

## What's Close (GitHub repos to reference)
- [stripe-node](https://github.com/stripe/stripe-node) — excellent SDK but Stripe-specific
- [S判non-JS/webhook](https://github.com/convrtelligence/webhook) — basic, no signature verification
- [webhook-relay](https://github.com/webhook-relay/node-client) — relay service, not a SDK

## What to Build (MVP Scope)
1. `WebhookHandler` class with `verify()` method for signature checking
2. Built-in verifiers for: Stripe, GitHub, Slack, generic HMAC
3. `handle(event, handler)` — process webhook with automatic retries
4. Idempotency via deduplication key (prevents double-processing)
5. Exponential backoff: 1s, 2s, 4s, 8s, max 5 retries
6. Dead letter queue for failed webhooks
7. TypeScript types for common providers (Stripe events, GitHub events)

## Category
Library
