import { describe, it, expect } from "vitest";
import { envSchema, envAssert } from "../src/schema";

describe("envSchema", () => {
  describe("string validation", () => {
    it("validates a basic string", () => {
      const validator = envSchema({
        NAME: { type: "string" },
      });

      const result = validator.validate({ NAME: "hello" });
      expect(result.success).toBe(true);
    });

    it("fails on missing required string", () => {
      const validator = envSchema({
        NAME: { type: "string" },
      });

      const result = validator.validate({});
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors[0]?.variable).toBe("NAME");
        expect(result.errors[0]?.error).toBe("MISSING");
      }
    });

    it("applies pattern validation", () => {
      const validator = envSchema({
        API_KEY: { type: "string", pattern: /^sk-[a-zA-Z0-9]{32}$/ },
      });

      const valid = validator.validate({ API_KEY: "sk-abc123".padEnd(35, "0") });
      expect(valid.success).toBe(true);

      const invalid = validator.validate({ API_KEY: "invalid" });
      expect(invalid.success).toBe(false);
    });
  });

  describe("number validation", () => {
    it("validates a number", () => {
      const validator = envSchema({
        PORT: { type: "number" },
      });

      const result = validator.validate({ PORT: "3000" });
      expect(result.success).toBe(true);
    });

    it("respects min/max constraints", () => {
      const validator = envSchema({
        PORT: { type: "number", min: 1, max: 65535 },
      });

      const valid = validator.validate({ PORT: "8080" });
      expect(valid.success).toBe(true);

      const tooLow = validator.validate({ PORT: "0" });
      expect(tooLow.success).toBe(false);
    });

    it("uses default value when missing", () => {
      const validator = envSchema({
        PORT: { type: "number", default: 3000 },
      });

      const result = validator.validate({});
      expect(result.success).toBe(true);
    });
  });

  describe("boolean validation", () => {
    it("validates boolean strings", () => {
      const validator = envSchema({
        DEBUG: { type: "boolean" },
      });

      expect(validator.validate({ DEBUG: "true" }).success).toBe(true);
      expect(validator.validate({ DEBUG: "1" }).success).toBe(true);
      expect(validator.validate({ DEBUG: "yes" }).success).toBe(true);
      expect(validator.validate({ DEBUG: "false" }).success).toBe(true);
      expect(validator.validate({ DEBUG: "0" }).success).toBe(true);
      expect(validator.validate({ DEBUG: "no" }).success).toBe(true);
    });

    it("allows custom truthy/falsy values", () => {
      const validator = envSchema({
        FLAG: { type: "boolean", truthyValues: ["on"], falsyValues: ["off"] },
      });

      expect(validator.validate({ FLAG: "on" }).success).toBe(true);
      expect(validator.validate({ FLAG: "off" }).success).toBe(true);
      expect(validator.validate({ FLAG: "true" }).success).toBe(false);
    });
  });

  describe("url validation", () => {
    it("validates URLs", () => {
      const validator = envSchema({
        SITE_URL: { type: "url" },
      });

      const valid = validator.validate({ SITE_URL: "https://example.com/path?query=1" });
      expect(valid.success).toBe(true);

      const invalid = validator.validate({ SITE_URL: "not-a-url" });
      expect(invalid.success).toBe(false);
    });
  });

  describe("email validation", () => {
    it("validates emails", () => {
      const validator = envSchema({
        EMAIL: { type: "email" },
      });

      const valid = validator.validate({ EMAIL: "user@example.com" });
      expect(valid.success).toBe(true);

      const invalid = validator.validate({ EMAIL: "not-an-email" });
      expect(invalid.success).toBe(false);
    });
  });

  describe("enum validation", () => {
    it("validates enum values", () => {
      const validator = envSchema({
        NODE_ENV: { type: "enum", values: ["development", "production", "test"] },
      });

      const valid = validator.validate({ NODE_ENV: "development" });
      expect(valid.success).toBe(true);

      const invalid = validator.validate({ NODE_ENV: "staging" });
      expect(invalid.success).toBe(false);
    });
  });

  describe("optional fields", () => {
    it("allows optional fields to be missing", () => {
      const validator = envSchema({
        OPTIONAL_VAR: { type: "string", optional: true },
      });

      const result = validator.validate({});
      expect(result.success).toBe(true);
    });
  });

  describe("envAssert", () => {
    it("throws on validation failure", () => {
      expect(() => {
        envAssert({
          REQUIRED: { type: "string" },
        });
      }).toThrow("Environment validation failed");
    });

    it("returns data on success", () => {
      const env = envAssert({
        VALUE: { type: "string", default: "test" },
      });
      expect(env.VALUE).toBe("test");
    });
  });
});
