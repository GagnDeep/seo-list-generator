/**
 * Supported environment variable types
 */
export type EnvType =
  | "string"
  | "number"
  | "boolean"
  | "url"
  | "email"
  | "enum";

/**
 * Base schema field definition
 */
export interface BaseEnvField {
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
export interface StringEnvField extends BaseEnvField {
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
export interface NumberEnvField extends BaseEnvField {
  type: "number";
  /** Optional minimum value */
  min?: number;
  /** Optional maximum value */
  max?: number;
}

/**
 * Boolean field schema
 */
export interface BooleanEnvField extends BaseEnvField {
  type: "boolean";
  /** Accepted true values (default: ["true", "1", "yes"]) */
  truthyValues?: string[];
  /** Accepted false values (default: ["false", "0", "no"]) */
  falsyValues?: string[];
}

/**
 * URL field schema
 */
export interface UrlEnvField extends BaseEnvField {
  type: "url";
}

/**
 * Email field schema
 */
export interface EmailEnvField extends BaseEnvField {
  type: "email";
}

/**
 * Enum field schema
 */
export interface EnumEnvField extends BaseEnvField {
  type: "enum";
  /** Allowed values */
  values: string[];
}

/**
 * Union of all field types
 */
export type EnvField =
  | StringEnvField
  | NumberEnvField
  | BooleanEnvField
  | UrlEnvField
  | EmailEnvField
  | EnumEnvField;

/**
 * Schema definition mapping variable names to field schemas
 */
export type EnvSchema = Record<string, EnvField>;

/**
 * Validated environment result
 */
export interface EnvResult<T extends EnvSchema> {
  success: true;
  data: InferEnvData<T>;
}

/**
 * Validation error result
 */
export interface EnvError {
  success: false;
  errors: EnvErrorItem[];
}

/**
 * Single validation error
 */
export interface EnvErrorItem {
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
export type EnvValidationResult<T extends EnvSchema> = EnvResult<T> | EnvError;

/**
 * Inferred data type from schema
 */
export type InferEnvData<T extends EnvSchema> = {
  [K in keyof T]: T[K]["optional"] extends true
    ? T[K]["default"] extends undefined
      ? string | undefined
      : string
    : T[K]["default"] extends undefined
      ? string
      : string;
};
