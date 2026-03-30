# @tinyhttp/env-schema-validator

TypeScript-first `.env` schema validation with clear error messages and auto-generated `.env.example` files.

## Install

```bash
npm install @tinyhttp/env-schema-validator
```

## Usage

### Define a Schema

```typescript
import { envSchema } from "@tinyhttp/env-schema-validator";

const schema = envSchema({
  DATABASE_URL: { type: "url", description: "PostgreSQL connection string" },
  PORT: { type: "number", default: 3000 },
  NODE_ENV: { type: "enum", values: ["development", "production", "test"] },
  DEBUG: { type: "boolean", optional: true },
  API_KEY: { type: "string", pattern: /^[a-zA-Z0-9]{32}$/ },
});
```

### Validate Environment

```typescript
const result = schema.validate(process.env);

if (!result.success) {
  for (const error of result.errors) {
    console.error(`  - ${error.message}`);
  }
  process.exit(1);
}

// Use validated data
console.log(result.data.DATABASE_URL);
```

### Assert at Startup

Throw on validation failure — use this for required startup validation:

```typescript
import { envAssert } from "@tinyhttp/env-schema-validator";

const env = envAssert({
  DATABASE_URL: { type: "url" },
  PORT: { type: "number", default: 3000 },
});

// env is guaranteed to be valid here
app.listen(env.PORT);
```

### Generate .env.example

```typescript
import { generateEnvExample } from "@tinyhttp/env-schema-validator";

const example = generateEnvExample(schema.getSchema());
// Write to .env.example
```

## Supported Types

| Type | Description | Example |
|------|-------------|---------|
| `string` | Basic string with optional pattern/length | `NAME=hello` |
| `number` | Coerced number with optional min/max | `PORT=3000` |
| `boolean` | Parses "true", "1", "yes" as true | `DEBUG=true` |
| `url` | Valid URL (uses `new URL()`) | `SITE_URL=https://...` |
| `email` | Valid email address | `EMAIL=user@...` |
| `enum` | One of specified values | `NODE_ENV=dev\|prod` |

## API

### `envSchema(schema)`

Create a validator from a schema definition.

```typescript
const validator = envSchema({
  VAR_NAME: {
    type: "string" | "number" | "boolean" | "url" | "email" | "enum",
    description?: string,
    default?: string | number | boolean,
    optional?: boolean,
    // type-specific options:
    pattern?: RegExp,          // string
    minLength?: number,        // string
    maxLength?: number,        // string
    min?: number,              // number
    max?: number,              // number
    truthyValues?: string[],   // boolean
    falsyValues?: string[],    // boolean
    values?: string[],         // enum
  },
});
```

### `validator.validate(env)`

Validate environment variables and return typed result.

Returns `{ success: true, data: {...} }` or `{ success: false, errors: [...] }`.

### `envAssert(schema)`

Validate and assert at startup. Throws with formatted error messages if validation fails.

### `generateEnvExample(schema)`

Generate `.env.example` file content from a schema.

### `generateTypeDeclaration(schema)`

Generate TypeScript `interface` from a schema.

## Error Output

```
Environment validation failed:
  - MISSING: DATABASE_URL (PostgreSQL connection string)
  - INVALID: PORT is too large (Maximum value is 65535)
```

## License

MIT
