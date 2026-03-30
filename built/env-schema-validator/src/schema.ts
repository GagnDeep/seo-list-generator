import { z } from "zod";
import type {
  EnvSchema,
  EnvValidationResult,
  EnvError,
  EnvErrorItem,
  StringEnvField,
  NumberEnvField,
  BooleanEnvField,
  UrlEnvField,
  EmailEnvField,
  EnumEnvField,
} from "./types";

/**
 * Default truthy values for boolean parsing
 */
const DEFAULT_TRUTHY = ["true", "1", "yes"];
const DEFAULT_FALSY = ["false", "0", "no"];

/**
 * Parse boolean string to boolean value
 */
function parseBoolean(value: string, truthyValues = DEFAULT_TRUTHY, falsyValues = DEFAULT_FALSY): boolean {
  const lower = value.toLowerCase();
  if (truthyValues.map((v) => v.toLowerCase()).includes(lower)) {
    return true;
  }
  if (falsyValues.map((v) => v.toLowerCase()).includes(lower)) {
    return false;
  }
  throw new Error(`Invalid boolean value: ${value}`);
}

/**
 * Build a Zod schema from an EnvField definition
 */
function fieldToZod(field: StringEnvField | NumberEnvField | BooleanEnvField | UrlEnvField | EmailEnvField | EnumEnvField): z.ZodType<unknown> {
  let schema: z.ZodType<unknown>;

  switch (field.type) {
    case "string": {
      let zod = z.string();
      if (field.pattern) {
        zod = zod.regex(field.pattern, `Invalid pattern for ${field.description ?? "value"}`);
      }
      if (field.minLength !== undefined) {
        zod = zod.min(field.minLength, `Minimum length is ${field.minLength}`);
      }
      if (field.maxLength !== undefined) {
        zod = zod.max(field.maxLength, `Maximum length is ${field.maxLength}`);
      }
      schema = zod;
      break;
    }

    case "number": {
      let zod = z.coerce.number();
      if (field.min !== undefined) {
        zod = zod.min(field.min, `Minimum value is ${field.min}`);
      }
      if (field.max !== undefined) {
        zod = zod.max(field.max, `Maximum value is ${field.max}`);
      }
      schema = zod;
      break;
    }

    case "boolean": {
      const truthy = field.truthyValues ?? DEFAULT_TRUTHY;
      const falsy = field.falsyValues ?? DEFAULT_FALSY;
      const allValues = [...truthy, ...falsy];
      schema = z.string()
        .refine(
          (val) => allValues.map((v) => v.toLowerCase()).includes(val.toLowerCase()),
          { message: `Must be one of: ${allValues.join(", ")}` }
        )
        .transform((val) => {
          const lower = val.toLowerCase();
          return truthy.map((v) => v.toLowerCase()).includes(lower);
        });
      break;
    }

    case "url": {
      schema = z.string().url().transform((val) => {
        try {
          return new URL(val);
        } catch {
          throw new Error(`Invalid URL: ${val}`);
        }
      });
      break;
    }

    case "email": {
      schema = z.string().email();
      break;
    }

    case "enum": {
      schema = z.enum(field.values as [string, ...string[]]);
      break;
    }

    default:
      schema = z.string();
  }

  if (!field.optional && field.default === undefined) {
    // Keep as required
  } else if (field.optional || field.default !== undefined) {
    // Make optional with default
    if (field.default !== undefined) {
      schema = schema.optional().default(String(field.default));
    } else {
      schema = schema.optional();
    }
  }

  return schema;
}

/**
 * Validate environment variables against a schema
 *
 * @example
 * ```typescript
 * const schema = envSchema({
 *   DATABASE_URL: { type: "url", description: "PostgreSQL connection string" },
 *   PORT: { type: "number", default: 3000 },
 *   NODE_ENV: { type: "enum", values: ["development", "production", "test"] },
 * });
 *
 * const result = schema.validate(process.env);
 * if (!result.success) {
 *   console.error(result.errors);
 *   process.exit(1);
 * }
 * ```
 */
export class EnvSchemaValidator<T extends EnvSchema> {
  private schema: T;
  private zodSchema: z.ZodObject<Record<string, z.ZodType<unknown>>>;

  constructor(schema: T) {
    this.schema = schema;
    this.zodSchema = z.object(
      Object.fromEntries(
        Object.entries(schema).map(([key, field]) => [key, fieldToZod(field)])
      )
    );
  }

  /**
   * Validate environment variables
   */
  validate(env: Record<string, string | undefined>): EnvValidationResult<T> {
    const errors: EnvErrorItem[] = [];

    // Check for missing required fields
    for (const [key, field] of Object.entries(this.schema)) {
      const value = env[key];
      const isOptional = field.optional || field.default !== undefined;

      if (value === undefined && !isOptional) {
        errors.push({
          variable: key,
          error: "MISSING",
          message: `MISSING: ${key}${field.description ? ` (${field.description})` : ""}`,
        });
      }
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    // Parse with zod
    const parseResult = this.zodSchema.safeParse(env);

    if (!parseResult.success) {
      for (const issue of parseResult.error.issues) {
        const path = issue.path[0] as string;
        const field = this.schema[path];

        let errorType: "MISSING" | "INVALID" | "OUT_OF_RANGE" = "INVALID";
        let message = `INVALID: ${path}`;

        if (issue.code === "too_small") {
          errorType = "OUT_OF_RANGE";
          message = `INVALID: ${path} is too small`;
        } else if (issue.code === "too_big") {
          errorType = "OUT_OF_RANGE";
          message = `INVALID: ${path} is too large`;
        }

        if (field?.description) {
          message = `${message} (${field.description})`;
        } else if (issue.message) {
          message = `${message}: ${issue.message}`;
        }

        errors.push({
          variable: path,
          error: errorType,
          message,
        });
      }

      return { success: false, errors };
    }

    return {
      success: true,
      data: parseResult.data as InferEnvData<T>,
    } as EnvValidationResult<T>;
  }

  /**
   * Get the schema definition
   */
  getSchema(): T {
    return this.schema;
  }
}

// Import InferEnvData at the bottom to avoid circular
import type { InferEnvData } from "./types";

type _InferEnvData<T extends EnvSchema> = InferEnvData<T>;

/**
 * Create a schema validator from a schema definition
 *
 * @example
 * ```typescript
 * const schema = envSchema({
 *   DATABASE_URL: { type: "url", description: "Database connection string" },
 *   PORT: { type: "number", default: 3000 },
 * });
 *
 * const result = schema.validate(process.env);
 * ```
 */
export function envSchema<T extends EnvSchema>(schema: T): EnvSchemaValidator<T> {
  return new EnvSchemaValidator(schema);
}

/**
 * Validate and assert environment variables at startup.
 * Throws if validation fails — use this for required startup validation.
 *
 * @example
 * ```typescript
 * const env = envAssert({
 *   DATABASE_URL: { type: "url" },
 *   PORT: { type: "number", default: 3000 },
 * });
 * // env is guaranteed to be valid here
 * ```
 */
export function envAssert<T extends EnvSchema>(schema: T): InferEnvData<T> {
  const validator = new EnvSchemaValidator(schema);
  const result = validator.validate(process.env);

  if (!result.success) {
    const errorMessages = result.errors.map((e) => `  - ${e.message}`).join("\n");
    throw new Error(`Environment validation failed:\n${errorMessages}`);
  }

  return result.data;
}
