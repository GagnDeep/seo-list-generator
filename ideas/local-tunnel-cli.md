# Local Tunnel CLI

## What It Is
A self-hosted ngrok alternative written in Node.js. Expose your local development server to the internet via a reverse proxy tunnel. Supports custom subdomains, password protection, and TCP forwarding. No account required, no rate limits, runs on your own infrastructure.

## Why It Doesn't Exist Well as Open Source
`ngrok` is closed-source with rate limits on free tier. `cloudflared` works but is tied to Cloudflare. `expose` and `inlets` are good but `inlets` requires a paid server. `localtunnel` (formerly `lt`) is abandonware with security issues. Developers want ngrok-like simplicity without vendor lock-in.

## Developer Pain Point
Every developer needs to share a local webhook, test OAuth callbacks, or demo to a client. ngrok's free tier is too limited and its Pro pricing is steep for personal use. This tool runs on a $5 VPS and gives unlimited tunnels. Developers would install it today to stop paying for ngrok.

## Suggested Tech Stack
- Node.js with TypeScript
- `ws` for WebSocket transport
- `http-proxy` for proxying requests
- Commander.js for CLI
- Can run on any Node.js server (single `server.js` on a VPS)

## What's Close (GitHub repos to reference)
- [ngrok](https://github.com/ngrok/ngrok) — closed source, rate limited
- [cloudflared](https://github.com/cloudflare/cloudflared) — Cloudflare dependency
- [localtunnel](https://github.com/localtunnel/localtunnel) — abandonware, security issues
- [inlets](https://github.com/inlets/inlets) — excellent but requires payment for production use

## What to Build (MVP Scope)
1. `tunnel <port>` — creates public URL pointing to local port
2. Custom subdomain via flag (`--subdomain my-app`)
3. Basic auth protection via flag (`--auth user:pass`)
4. TCP tunnel mode (`--tcp`)
5. Client + server binaries (simple Node script for server on VPS)
6. Clean help output

## Category
CLI
