/**
 * @tinyhttp/env-schema-validator
 *
 * Validate .env files against typed schemas with clear error messages
 * and auto-generated .env.example files.
 *
 * @example
 * ```typescript
 * import { envSchema, envAssert, generateEnvExample } from "@tinyhttp/env-schema-validator";
 *
 * // Define your schema
 * const schema = envSchema({
 *   DATABASE_URL: { type: "url", description: "PostgreSQL connection string" },
 *   PORT: { type: "number", default: 3000 },
 *   NODE_ENV: { type: "enum", values: ["development", "production", "test"] },
 *   DEBUG: { type: "boolean", optional: true },
 *   API_KEY: { type: "string", pattern: /^[a-zA-Z0-9]{32}$/ },
 * });
 *
 * // Validate and get typed result
 * const result = schema.validate(process.env);
 * if (!result.success) {
 *   console.error(result.errors);
 *   process.exit(1);
 * }
 * console.log(result.data.DATABASE_URL);
 *
 * // Or assert at startup (throws on failure)
 * const env = envAssert({
 *   DATABASE_URL: { type: "url" },
 * });
 *
 * // Generate .env.example
 * console.log(generateEnvExample(schema.getSchema()));
 * ```
 */

export { envSchema, envAssert, EnvSchemaValidator } from "./schema";
export { generateEnvExample, generateTypeDeclaration } from "./generator";

// Re-export types
export type {
  EnvSchema,
  EnvField,
  EnvType,
  EnvValidationResult,
  EnvError,
  EnvErrorItem,
  EnvResult,
  StringEnvField,
  NumberEnvField,
  BooleanEnvField,
  UrlEnvField,
  EmailEnvField,
  EnumEnvField,
  InferEnvData,
} from "./types";
