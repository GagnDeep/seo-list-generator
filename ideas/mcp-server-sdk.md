# MCP Server SDK — Model Context Protocol Toolkit

## What It Would Be

A TypeScript-first SDK for building MCP (Model Context Protocol) servers. Think of it as the "Express.js for AI agent tools" — a batteries-included framework that makes it trivial to expose any tool, resource, or prompt template as an MCP server that AI agents like Claude Code can discover and use.

**Core features:**
- `@mcp/server` — decorator-based server (`@tool`, `@resource`, `@prompt`)
- `@mcp/client` — connect to any MCP server as a client
- `@mcp/registry` — self-hosted registry for publishing/finding server packages
- Built-in auth, rate limiting, streaming support
- First-class TypeScript with full inference (no `as any`)
- Zero-config development mode with hot reload
- Docker + npm packaging built-in

**Example:**
```typescript
import { McpServer, tool } from '@mcp/server';

const server = new McpServer({
  name: 'my-tools',
  version: '1.0.0',
});

@tool()
async function generateImage(prompt: string, size: '256' | '512' | '1024' = '1024') {
  // ... your tool logic
  return { url: `https://images.example.com/${id}.png` };
}

@resource('docs://{topic}')
function docResource(topic: string) {
  return readFile(`./docs/${topic}.md`);
}

server.start();
```

## Why This Doesn't Exist

- MCP is new (Anthropic released spec in late 2024) — the ecosystem is fragmented
- Most "MCP servers" are hand-rolled one-offs with no shared tooling
- No npm package with 1k+ stars for building MCP servers (only client libs)
- The spec changes frequently; a well-maintained SDK would be invaluable

## Market Gap

- **~500 npm packages** mention "MCP" but most are thin wrappers or unmaintained
- The best-in-class tooling hasn't emerged yet
- AI agent frameworks (LlamaIndex, LangChain, CrewAI) all need MCP server support
- Developers building custom AI agents need a standard way to expose tools

## Tech Stack

- **TypeScript** (strict mode, ESM + CJS dual publish)
- **Node.js 20+** with native test runner
- **zod** for runtime validation
- **vitest** for testing
- **tsx** for development
- **Docker** for registry server
- **semantic-release** + **Changesets** for versioning

## What's Close

- `@modelcontextprotocol/sdk` — official Anthropic SDK, but low-level (raw protocol)
- `mcp-js` — abandoned, no TypeScript support
- `fastmcp` — simple but no TypeScript, no registry, no auth

## Revenue Model

- **Open source MIT** — free forever
- **Hosted MCP Registry** (mcp.run, etc.) — freemium SaaS (free tier + paid teams)
- **Enterprise support** — consulting + SLA for regulated industries (healthcare, finance)
- **Registry premium features** — analytics, popularity metrics, verified badges ($9/mo)

## Priority

[DONE]

## Target Users

- AI agent developers building custom tools
- SaaS companies wanting to expose their APIs as MCP servers
- Developer tool companies building AI integrations
