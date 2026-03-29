# Env Schema Validator

## What It Is
A TypeScript library that validates `.env` files against a typed schema. Define your expected environment variables with types and validation rules, then catch missing vars, wrong types, and invalid values at startup — before your app crashes. Zero runtime overhead after validation.

## Why It Doesn't Exist Well as Open Source
`zod` and `valibot` can validate env vars but require manual schema setup each time. `envalid` exists but is abandonware and poorly typed. `validate-env` hasn't been updated in years. There's no dedicated, well-maintained library specifically for `.env` schema validation with first-class TypeScript support.

## Developer Pain Point
Every project has environment variables and every project has "undefined ENV_VAR" errors in production. Developers define types but don't validate at runtime. This library makes validation automatic and gives clear error messages. Developers would npm install it on day one of every project.

## Suggested Tech Stack
- TypeScript with strict mode, no runtime dependencies
- Zod or Valibot for schema validation under the hood
- JSDoc comments for IDE autocomplete
- Works in Node.js, Deno, Bun, and edge runtimes

## What's Close (GitHub repos to reference)
- [envalid](https://github.com/SecretIntent/envalid) — good concept but abandonware
- [validate-env](https://github.com/Justice-Engineering/validate-env) — not updated since 2021
- [zod](https://github.com/colinhacks/zod) — can validate env vars but no dedicated tooling

## What to Build (MVP Scope)
1. Define schema with `envSchema({ ... })` — specify required/optional, types, defaults
2. Supported types: string, number, boolean, url, email, enum
3. Custom validation functions
4. Clear error messages: "MISSING: DATABASE_URL" or "INVALID: PORT must be a number"
5. Auto-generates `.env.example` from schema
6. TypeScript types inferred from schema

## Category
Library
