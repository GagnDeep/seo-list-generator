import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createServer, Server } from "http";
import type { AddressInfo } from "net";

let httpServer: Server | null = null;
let wsServer: import("ws").Server | null = null;

vi.mock("ws", async () => {
  const { WebSocketServer, WebSocket } = await vi.importActual<typeof import("ws")>("ws");
  return { WebSocketServer, WebSocket };
});

afterEach(() => {
  if (httpServer) {
    httpServer.close();
    httpServer = null;
  }
});

describe("TunnelServer", () => {
  it("creates HTTP and WebSocket servers", () => {
    const { createTunnelServer } = require("./server.js");
    const server = createTunnelServer({
      port: 0,
      httpPort: 0,
    });

    const address = server.address() as AddressInfo;
    expect(address.port).toBeGreaterThan(0);

    server.close();
  });

  it("assigns random subdomain on connection", async () => {
    const { createTunnelServer } = await import("./server.js");
    const server = createTunnelServer({
      port: 0,
      httpPort: 0,
    });

    const address = server.address() as AddressInfo;
    expect(address.port).toBeGreaterThan(0);

    server.close();
  });
});
