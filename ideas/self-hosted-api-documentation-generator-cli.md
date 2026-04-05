# Self-Hosted API Documentation Generator CLI

## What It Would Be

A CLI tool that generates beautiful, self-hosted API documentation from source code annotations — similar to apiDoc or JSDoc, but for modern TypeScript/FastAPI/Express apps. Point it at your API source and it spits out searchable HTML with live request/response examples.

```bash
npm install -g @seo-list/api-doc-gen
api-doc ./src --out ./docs
# Opens browser at http://localhost:3000 with live, searchable docs
```

## Why This Doesn't Exist

- **apiDoc**: Unmaintained, no TypeScript support, ugly output
- **Swagger/OpenAPI**: Requires manual spec writing — developers won't do it
- **Mintlify/Docosaurus**: Cloud-dependent or require CI setup
- **Slate**: Ruby-based, complex setup

Developers want: `api-doc ./src` → done.

## Market Gap

Every internal API needs docs. Every startup rewrites the same docs tooling. No self-hosted solution with zero config that just reads your source code and annotations.

## Tech Stack

- TypeScript (Node.js)
- TypeScript compiler API for parsing
- Express.js for local dev server with live reload
- Prism.js for syntax highlighting
- No external API calls — 100% local

## What's Close

- `@scalar/blade` — but it's for Blade (PHP) and cloud-hosted
- `apidoc` — unmaintained since 2019, no TypeScript
- `typescript-rapidoc` — exists but broken/outdated

## Revenue Model

- Open source MIT
- GitHub Sponsors / GitHub Marketplace listing
- Pro tier: hosted docs with custom domain, analytics, auth
