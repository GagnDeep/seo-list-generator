/**
 * Supported environment variable types
 */
type EnvType = "string" | "number" | "boolean" | "url" | "email" | "enum";
/**
 * Base schema field definition
 */
interface BaseEnvField {
    /** Human-readable description for .env.example comments */
    description?: string;
    /** Default value if not provided */
    default?: string | number | boolean;
    /** Mark field as optional */
    optional?: boolean;
}
/**
 * String field schema
 */
interface StringEnvField extends BaseEnvField {
    type: "string";
    /** Optional regex validation */
    pattern?: RegExp;
    /** Optional min length */
    minLength?: number;
    /** Optional max length */
    maxLength?: number;
}
/**
 * Number field schema
 */
interface NumberEnvField extends BaseEnvField {
    type: "number";
    /** Optional minimum value */
    min?: number;
    /** Optional maximum value */
    max?: number;
}
/**
 * Boolean field schema
 */
interface BooleanEnvField extends BaseEnvField {
    type: "boolean";
    /** Accepted true values (default: ["true", "1", "yes"]) */
    truthyValues?: string[];
    /** Accepted false values (default: ["false", "0", "no"]) */
    falsyValues?: string[];
}
/**
 * URL field schema
 */
interface UrlEnvField extends BaseEnvField {
    type: "url";
}
/**
 * Email field schema
 */
interface EmailEnvField extends BaseEnvField {
    type: "email";
}
/**
 * Enum field schema
 */
interface EnumEnvField extends BaseEnvField {
    type: "enum";
    /** Allowed values */
    values: string[];
}
/**
 * Union of all field types
 */
type EnvField = StringEnvField | NumberEnvField | BooleanEnvField | UrlEnvField | EmailEnvField | EnumEnvField;
/**
 * Schema definition mapping variable names to field schemas
 */
type EnvSchema = Record<string, EnvField>;
/**
 * Validated environment result
 */
interface EnvResult<T extends EnvSchema> {
    success: true;
    data: InferEnvData<T>;
}
/**
 * Validation error result
 */
interface EnvError {
    success: false;
    errors: EnvErrorItem[];
}
/**
 * Single validation error
 */
interface EnvErrorItem {
    /** Variable name that failed */
    variable: string;
    /** Error type */
    error: "MISSING" | "INVALID" | "OUT_OF_RANGE";
    /** Human-readable message */
    message: string;
}
/**
 * Combined result type
 */
type EnvValidationResult<T extends EnvSchema> = EnvResult<T> | EnvError;
/**
 * Inferred data type from schema
 */
type InferEnvData<T extends EnvSchema> = {
    [K in keyof T]: T[K]["optional"] extends true ? T[K]["default"] extends undefined ? string | undefined : string : T[K]["default"] extends undefined ? string : string;
};

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
declare class EnvSchemaValidator<T extends EnvSchema> {
    private schema;
    private zodSchema;
    constructor(schema: T);
    /**
     * Validate environment variables
     */
    validate(env: Record<string, string | undefined>): EnvValidationResult<T>;
    /**
     * Get the schema definition
     */
    getSchema(): T;
}

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
declare function envSchema<T extends EnvSchema>(schema: T): EnvSchemaValidator<T>;
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
declare function envAssert<T extends EnvSchema>(schema: T): InferEnvData<T>;

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
declare function generateEnvExample(schema: EnvSchema): string;
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
declare function generateTypeDeclaration(schema: EnvSchema): string;

export { type BooleanEnvField, type EmailEnvField, type EnumEnvField, type EnvError, type EnvErrorItem, type EnvField, type EnvResult, type EnvSchema, EnvSchemaValidator, type EnvType, type EnvValidationResult, type InferEnvData, type NumberEnvField, type StringEnvField, type UrlEnvField, envAssert, envSchema, generateEnvExample, generateTypeDeclaration };
