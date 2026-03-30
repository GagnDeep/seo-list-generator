import { describe, it, expect } from "vitest";
import { generateEnvExample, generateTypeDeclaration } from "../src/generator";

describe("generateEnvExample", () => {
  it("generates basic .env.example", () => {
    const schema = {
      DATABASE_URL: { type: "url", description: "PostgreSQL connection string" },
      PORT: { type: "number", default: 3000 },
      NODE_ENV: { type: "enum", values: ["development", "production"] },
    };

    const output = generateEnvExample(schema);

    expect(output).toContain("# PostgreSQL connection string");
    expect(output).toContain("DATABASE_URL=https://example.com");
    expect(output).toContain("PORT=3000");
    expect(output).toContain("NODE_ENV=development|production");
  });

  it("handles optional fields", () => {
    const schema = {
      DEBUG: { type: "boolean", optional: true },
    };

    const output = generateEnvExample(schema);
    expect(output).toContain("DEBUG=# boolean (optional)");
  });
});

describe("generateTypeDeclaration", () => {
  it("generates TypeScript interface", () => {
    const schema = {
      DATABASE_URL: { type: "url" },
      PORT: { type: "number" },
      NODE_ENV: { type: "enum", values: ["dev", "prod"] },
    };

    const output = generateTypeDeclaration(schema);

    expect(output).toContain("export interface Env {");
    expect(output).toContain("DATABASE_URL: URL;");
    expect(output).toContain("PORT: number;");
    expect(output).toContain('NODE_ENV: "dev" | "prod";');
  });
});
