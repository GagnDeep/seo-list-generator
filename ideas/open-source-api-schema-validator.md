# Open Source API Schema Validator

## What It Is
A TypeScript library that validates API request/response payloads against OpenAPI 3.x specs at runtime. Catch schema mismatches before they hit production. Useful for testing, middleware, and CI pipelines. Zero dependencies, tree-shakeable, and works in Node.js and browsers.

## Why It Doesn't Exist Well as Open Source
`ajv` is the standard for JSON Schema validation but requires manual schema setup. OpenAPI validators like `swagger-parser` are for validation/parsing, not runtime payload checking. There's no lightweight library that just takes an OpenAPI spec and validates incoming requests/responses against it quickly.

## Developer Pain Point
Teams with OpenAPI specs still have runtime type mismatches between frontend and backend. This library bridges that gap — validate the request body against the spec before it hits your handler. Developers would npm install this to add a safety layer to any API without changing business logic.

## Suggested Tech Stack
- TypeScript with strict mode
- No external runtime dependencies (use built-in JS APIs)
- `json-schema-typed` or manual validation for type safety
- Browser and Node.js compatible

## What's Close (GitHub repos to reference)
- [ajv](https://github.com/ajv-validator/ajv) — JSON Schema validator, not OpenAPI-specific
- [swagger-parser](https://github.com/BRIKEV/swagger-parser) — parses OpenAPI but doesn't validate payloads
- [zod](https://github.com/colinhacks/zod) — excellent but requires manual schema definition, not OpenAPI-driven

## What to Build (MVP Scope)
1. Load OpenAPI 3.x spec (YAML or JSON)
2. Validate request body/query/params against operation schema
3. Validate response body against schema
4. Return detailed validation errors with paths
5. TypeScript types inferred from OpenAPI spec
6. Middleware adapter for Express/Fastify

## Category
Library
-e 
## Status
[DONE] (built: /root/Projects/seo-list-generator/built/openapi-schema-validator)
