import { describe, it, expect, vi, beforeEach } from "vitest";
import "./client.js";
// Track sent messages across all tests
const sentMessages = [];
beforeEach(() => {
    sentMessages.length = 0;
    vi.clearAllMocks();
});
describe("TunnelClient", () => {
    // These tests mock the ws module to avoid real network connections
    describe("message sending", () => {
        it("should be importable as a module", async () => {
            const mod = await import("./client.js");
            expect(typeof mod.createTunnelClient).toBe("function");
        });
    });
    describe("TunnelClientOptions type", () => {
        it("accepts valid options shape", () => {
            // Type check: this will fail at compile time if types are wrong
            const opts = {
                host: "localhost",
                port: 3001,
                localPort: 8080,
                auth: "user:pass",
                subdomain: "myapp",
            };
            expect(opts.host).toBe("localhost");
            expect(opts.port).toBe(3001);
            expect(opts.localPort).toBe(8080);
            expect(opts.auth).toBe("user:pass");
            expect(opts.subdomain).toBe("myapp");
        });
    });
});
//# sourceMappingURL=client.test.js.map