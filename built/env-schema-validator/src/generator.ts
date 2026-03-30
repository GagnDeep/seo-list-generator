import type { EnvSchema, EnvField } from "./types";

/**
 * Generate a .env.example file content from a schema
 *
 * @example
 * ```typescript
 * const schema = {
 *   DATABASE_URL: { type: "url", description: "PostgreSQL connection string" },
 *   PORT: { type: "number", default: 3000 },
 *   NODE_ENV: { type: "enum", values: ["development", "production", "test"] },
 * };
 *
 * console.log(generateEnvExample(schema));
 * // # PostgreSQL connection string
 * // DATABASE_URL=
 * //
 * // # Default: 3000
 * // PORT=3000
 * //
 * // NODE_ENV=development|production|test
 * ```
 */
export function generateEnvExample(schema: EnvSchema): string {
  const lines: string[] = [];

  for (const [variable, field] of Object.entries(schema)) {
    const line = generateFieldLine(variable, field);
    lines.push(line);
  }

  return lines.join("\n");
}

/**
 * Generate a single line/comment block for a field
 */
function generateFieldLine(variable: string, field: EnvField): string {
  const parts: string[] = [];

  // Add description comment
  if (field.description) {
    parts.push(`# ${field.description}`);
  }

  // Generate the variable line
  const value = generateExampleValue(field);
  parts.push(`${variable}=${value}`);

  // Add spacing
  parts.push("");

  return parts.join("\n");
}

/**
 * Generate an example value placeholder for a field
 */
function generateExampleValue(field: EnvField): string {
  if (field.default !== undefined) {
    return String(field.default);
  }

  if (field.optional) {
    return `# ${field.type} (optional)`;
  }

  switch (field.type) {
    case "string":
      return "";

    case "number":
      return "0";

    case "boolean":
      return "true";

    case "url":
      return "https://example.com";

    case "email":
      return "user@example.com";

    case "enum":
      return field.values.join("|");

    default:
      return "";
  }
}

/**
 * Generate a TypeScript type declaration from a schema
 *
 * @example
 * ```typescript
 * const schema = {
 *   DATABASE_URL: { type: "url" },
 *   PORT: { type: "number", default: 3000 },
 * };
 *
 * console.log(generateTypeDeclaration(schema));
 * // export interface Env {
 * //   DATABASE_URL: string;
 * //   PORT: number;
 * // }
 * ```
 */
export function generateTypeDeclaration(schema: EnvSchema): string {
  const lines: string[] = ["export interface Env {"];

  for (const [variable, field] of Object.entries(schema)) {
    const typeStr = getFieldTypeScriptType(field);
    lines.push(`  ${variable}: ${typeStr};`);
  }

  lines.push("}");
  return lines.join("\n");
}

/**
 * Get TypeScript type string for a field
 */
function getFieldTypeScriptType(field: EnvField): string {
  switch (field.type) {
    case "string":
      return "string";

    case "number":
      return "number";

    case "boolean":
      return "boolean";

    case "url":
      return "URL";

    case "email":
      return "string";

    case "enum":
      return field.values.map((v) => JSON.stringify(v)).join(" | ");

    default:
      return "string";
  }
}
