# Self-Hosted AI Agent CLI

## What It Would Be

A CLI tool that lets developers deploy a personal AI agent to their own server in one command. Inspired by projects like Kage (simple self-hosting agent) but focused on being the easiest way to get an AI agent running on a VPS or home server.

```bash
npx @openclaw/self-hosted-agent deploy --provider digitalocean --plan hobby
# OR
npx @openclaw/self-hosted-agent deploy --provider self-hosted --ssh user@host
```

**What it does:**
- Supports multiple hosting providers: DigitalOcean, AWS, Hetzner, SSH to any server
- Docker-based deployment (single docker-compose.yml)
- Ships with a pre-configured LLM backend (Ollama by default, or connect to OpenAI/Anthropic)
- Built-in tools: web search, file system, shell commands, webhooks
- REST API + web UI dashboard
- OAuth for team access
- TLS automatically via Let's Encrypt

**Built-in tools:**
- `web-search` — Search the web (SearXNG or Google SerpAPI)
- `filesystem` — Read/write files on the host
- `shell` — Execute commands with timeout + approval
- `webhook` — Send HTTP callbacks
- `browser` — Headless browser automation (Playwright)

**Files created:**
```
src/
  cli.ts           — Commander.js CLI (deploy, stop, logs, status, invoke)
  providers/
    digitalocean.ts
    aws.ts
    hetzner.ts
    ssh.ts
  docker/
    Dockerfile.agent
    docker-compose.yml
    nginx.conf
  tools/
    index.ts
    web-search.ts
    filesystem.ts
    shell.ts
    webhook.ts
    browser.ts
  api/
    server.ts      — Fastify REST API
    auth.ts        — OAuth provider
  ui/
    index.html     — Simple dashboard
  index.ts
package.json
tsconfig.json
vitest.config.ts
README.md
CHANGELOG.md
LICENSE (MIT)
```

## Why This Doesn't Exist

Existing solutions are either:
- **Too complex** — LangChain agents need 500 lines of setup
- **Too simple** — Basic chatbots lack tool use and self-hosting
- **Too expensive** — SaaS agent platforms charge per-message
- **Too locked-in** — Most self-hosted options are not designed for easy deployment

## Market Gap

Developers and indie hackers want to run their own AI agents for:
- Privacy (don't send data to OpenAI/Anthropic for every task)
- Cost control (run Ollama on a $6/mo VPS)
- Customization (modify the agent's tools and behavior)
- Reliability (self-host instead of depending on SaaS uptime)

The gap is "Heroku for AI agents" — one command to deploy, well-documented, production-ready defaults.

## Tech Stack

- **CLI**: TypeScript + Commander.js + Dockerode (programmatic Docker control)
- **Agent Runtime**: Node.js + TypeScript (no Python needed for the agent itself)
- **LLM Backend**: Ollama (local) or OpenAI/Anthropic-compatible API
- **Web UI**: Vanilla HTML/CSS/JS (no framework needed for dashboard)
- **API Server**: Fastify
- **Container**: Docker + docker-compose
- **Reverse Proxy**: Nginx with Let's Encrypt (via certbot)
- **Auth**: Simple OAuth 2.0 with GitHub/Google providers

## What's Close

- **Kage** — Excellent concept but minimal tooling and no deployment automation
- **Ollama** — Great LLM backend but no agent framework
- **Open Interpreter** — Local AI coding but not deployable as a service
- **LangChain Agents** — Too complex to deploy, not designed for single-command hosting

Our differentiator: **Deploy a working agent in 60 seconds, not 60 minutes.**

## Revenue Model

- **Freemium**: Core CLI is MIT open source
- **Managed cloud**: Hosted version @ $5/mo (use our infrastructure, still self-host your agent)
- **Enterprise**: White-label + SLA + team features @ $29/mo
- **Marketplace**: One-click deploy buttons for DigitalOcean/AWS marketplace
