import { describe, it, expect, vi, beforeEach } from "vitest";

const sentMessages: string[] = [];

vi.mock("ws", () => {
  class MockWebSocket {
    readyState = 1;
    send = vi.fn((data: string) => sentMessages.push(data));
    close = vi.fn();
    ping = vi.fn();
    on = vi.fn((event: string, cb: () => void) => {
      if (event === "open") setTimeout(cb, 0);
    });
    removeListener = vi.fn();
  }
  return { WebSocket: MockWebSocket };
});

vi.mock("http-proxy", () => ({
  default: {
    createProxyServer: vi.fn().mockReturnValue({
      web: vi.fn(),
    }),
  },
}));

import { createTunnelClient } from "./client.js";

describe("TunnelClient", () => {
  beforeEach(() => {
    sentMessages.length = 0;
    vi.clearAllMocks();
  });

  it("sends auth message when auth option is provided", async () => {
    await createTunnelClient({
      host: "localhost",
      port: 3001,
      localPort: 8080,
      auth: "user:pass123",
    });

    await new Promise((r) => setTimeout(r, 10));

    expect(sentMessages).toContainEqual(
      JSON.stringify({ type: "auth", auth: "user:pass123" })
    );
  });

  it("sends subdomain message when subdomain option is provided", async () => {
    await createTunnelClient({
      host: "localhost",
      port: 3001,
      localPort: 8080,
      subdomain: "myapp",
    });

    await new Promise((r) => setTimeout(r, 10));

    expect(sentMessages).toContainEqual(
      JSON.stringify({ type: "subdomain", subdomain: "myapp" })
    );
  });

  it("sends auth before subdomain when both are provided", async () => {
    await createTunnelClient({
      host: "localhost",
      port: 3001,
      localPort: 8080,
      auth: "admin:secret",
      subdomain: "testapp",
    });

    await new Promise((r) => setTimeout(r, 10));

    const authIdx = sentMessages.findIndex(
      (m) => JSON.parse(m).type === "auth"
    );
    const subIdx = sentMessages.findIndex(
      (m) => JSON.parse(m).type === "subdomain"
    );
    expect(authIdx).toBeLessThan(subIdx);
  });

  it("resolves with local port matching options", async () => {
    const info = await createTunnelClient({
      host: "localhost",
      port: 3001,
      localPort: 5173,
    });

    expect(info.localPort).toBe(5173);
  });
});
