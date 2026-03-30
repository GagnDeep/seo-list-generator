// src/schema.ts
import { z } from "zod";
var DEFAULT_TRUTHY = ["true", "1", "yes"];
var DEFAULT_FALSY = ["false", "0", "no"];
function fieldToZod(field) {
  let schema;
  switch (field.type) {
    case "string": {
      let zod = z.string();
      if (field.pattern) {
        zod = zod.regex(field.pattern, `Invalid pattern for ${field.description ?? "value"}`);
      }
      if (field.minLength !== void 0) {
        zod = zod.min(field.minLength, `Minimum length is ${field.minLength}`);
      }
      if (field.maxLength !== void 0) {
        zod = zod.max(field.maxLength, `Maximum length is ${field.maxLength}`);
      }
      schema = zod;
      break;
    }
    case "number": {
      let zod = z.coerce.number();
      if (field.min !== void 0) {
        zod = zod.min(field.min, `Minimum value is ${field.min}`);
      }
      if (field.max !== void 0) {
        zod = zod.max(field.max, `Maximum value is ${field.max}`);
      }
      schema = zod;
      break;
    }
    case "boolean": {
      const truthy = field.truthyValues ?? DEFAULT_TRUTHY;
      const falsy = field.falsyValues ?? DEFAULT_FALSY;
      const allValues = [...truthy, ...falsy];
      schema = z.string().refine(
        (val) => allValues.map((v) => v.toLowerCase()).includes(val.toLowerCase()),
        { message: `Must be one of: ${allValues.join(", ")}` }
      ).transform((val) => {
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
      schema = z.enum(field.values);
      break;
    }
    default:
      schema = z.string();
  }
  if (!field.optional && field.default === void 0) {
  } else if (field.optional || field.default !== void 0) {
    if (field.default !== void 0) {
      schema = schema.optional().default(String(field.default));
    } else {
      schema = schema.optional();
    }
  }
  return schema;
}
var EnvSchemaValidator = class {
  schema;
  zodSchema;
  constructor(schema) {
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
  validate(env) {
    const errors = [];
    for (const [key, field] of Object.entries(this.schema)) {
      const value = env[key];
      const isOptional = field.optional || field.default !== void 0;
      if (value === void 0 && !isOptional) {
        errors.push({
          variable: key,
          error: "MISSING",
          message: `MISSING: ${key}${field.description ? ` (${field.description})` : ""}`
        });
      }
    }
    if (errors.length > 0) {
      return { success: false, errors };
    }
    const parseResult = this.zodSchema.safeParse(env);
    if (!parseResult.success) {
      for (const issue of parseResult.error.issues) {
        const path = issue.path[0];
        const field = this.schema[path];
        let errorType = "INVALID";
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
          message
        });
      }
      return { success: false, errors };
    }
    return {
      success: true,
      data: parseResult.data
    };
  }
  /**
   * Get the schema definition
   */
  getSchema() {
    return this.schema;
  }
};
function envSchema(schema) {
  return new EnvSchemaValidator(schema);
}
function envAssert(schema) {
  const validator = new EnvSchemaValidator(schema);
  const result = validator.validate(process.env);
  if (!result.success) {
    const errorMessages = result.errors.map((e) => `  - ${e.message}`).join("\n");
    throw new Error(`Environment validation failed:
${errorMessages}`);
  }
  return result.data;
}

// src/generator.ts
function generateEnvExample(schema) {
  const lines = [];
  for (const [variable, field] of Object.entries(schema)) {
    const line = generateFieldLine(variable, field);
    lines.push(line);
  }
  return lines.join("\n");
}
function generateFieldLine(variable, field) {
  const parts = [];
  if (field.description) {
    parts.push(`# ${field.description}`);
  }
  const value = generateExampleValue(field);
  parts.push(`${variable}=${value}`);
  parts.push("");
  return parts.join("\n");
}
function generateExampleValue(field) {
  if (field.default !== void 0) {
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
function generateTypeDeclaration(schema) {
  const lines = ["export interface Env {"];
  for (const [variable, field] of Object.entries(schema)) {
    const typeStr = getFieldTypeScriptType(field);
    lines.push(`  ${variable}: ${typeStr};`);
  }
  lines.push("}");
  return lines.join("\n");
}
function getFieldTypeScriptType(field) {
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
export {
  EnvSchemaValidator,
  envAssert,
  envSchema,
  generateEnvExample,
  generateTypeDeclaration
};
