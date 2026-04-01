import { describe, it, expect, afterEach, vi } from "vitest";
vi.mock("ws", () => {
    const WebSocketServerMock = vi.fn(() => ({
        on: vi.fn(),
        close: vi.fn(),
    }));
    return { WebSocketServer: WebSocketServerMock, WebSocket: vi.fn() };
});
let server = null;
afterEach(() => {
    if (server) {
        server.close();
        server = null;
    }
});
describe("TunnelServer", () => {
    it("creates an HTTP server that listens on the configured httpPort", async () => {
        const { createTunnelServer } = await import("./server.js");
        server = createTunnelServer({
            port: 0,
            httpPort: 0,
        });
        const address = server.address();
        expect(address.port).toBeGreaterThan(0);
    });
    it("returns an HTTP server instance", async () => {
        const { createTunnelServer } = await import("./server.js");
        server = createTunnelServer({
            port: 0,
            httpPort: 0,
        });
        expect(typeof server.listen).toBe("function");
        expect(typeof server.close).toBe("function");
    });
});
//# sourceMappingURL=server.test.js.map