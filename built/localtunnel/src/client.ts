import { WebSocket } from "ws";
import httpProxy from "http-proxy";
import type { IncomingMessage, ServerResponse } from "http";

export interface TunnelClientOptions {
  /** Hostname of the tunnel server */
  host: string;
  /** Port of the tunnel server (WebSocket) */
  port: number;
  /** Local port to expose */
  localPort: number;
  /** Optional subdomain to request */
  subdomain?: string;
  /** Optional basic auth in 'user:pass' format */
  auth?: string;
}

export interface TunnelInfo {
  url: string;
  client: WebSocket;
  localPort: number;
}

interface ProxyMessage {
  type: "welcome" | "request" | "response" | "error";
  id?: number;
  method?: string;
  url?: string;
  headers?: IncomingMessage["headers"];
  body?: string;
  statusCode?: number;
  data?: string;
  error?: string;
}



export function createTunnelClient(
  options: TunnelClientOptions
): Promise<TunnelInfo> {
  return new Promise((resolve, reject) => {
    const proxy = httpProxy.createProxyServer({
      target: `http://localhost:${options.localPort}`,
      ws: false,
      changeOrigin: true,
    });

    const clientHost = options.host.replace(/^https?:\/\//, "");
    const wsUrl = `ws://${clientHost}:${options.port}`;
    const client = new WebSocket(wsUrl);

    client.on("open", () => {
      const authMsg = options.auth
        ? { type: "auth", auth: options.auth }
        : null;
      const subdomainMsg = options.subdomain
        ? { type: "subdomain", subdomain: options.subdomain }
        : null;

      if (authMsg) client.send(JSON.stringify(authMsg));
      if (subdomainMsg) client.send(JSON.stringify(subdomainMsg));
    });

    client.on("message", (data) => {
      try {
        const msg: ProxyMessage = JSON.parse(data.toString());

        if (msg.type === "welcome") {
          resolve({
            url: msg.url as string,
            client,
            localPort: options.localPort,
          });
          return;
        }

        if (msg.type === "error") {
          console.error(`[tunnel] server error: ${msg.error}`);
          return;
        }

        if (msg.type === "request" && msg.id !== undefined) {
          // Create a mock IncomingMessage to satisfy http-proxy
          const mockReq = {
            method: msg.method || "GET",
            url: msg.url,
            headers: msg.headers || {},
            body: msg.body,
          } as unknown as IncomingMessage;

          const res = new MockServerResponse(msg.id, client, msg.statusCode);

          proxy.web(mockReq, res as unknown as ServerResponse, {}, (err) => {
            if (err) {
              const errorMsg: ProxyMessage = {
                type: "error",
                id: msg.id,
                error: err.message,
              };
              client.send(JSON.stringify(errorMsg));
            }
          });
        }
      } catch {
        // ignore malformed messages
      }
    });

    client.on("error", (err) => {
      reject(err);
    });

    client.on("close", () => {
      console.log("[tunnel] disconnected from server");
    });
  });
}

class MockServerResponse {
  private id: number;
  private client: WebSocket;
  private statusCode: number;
  private headers: Record<string, string | string[]> = {};
  private bodyChunks: string[] = [];

  constructor(id: number, client: WebSocket, statusCode = 200) {
    this.id = id;
    this.client = client;
    this.statusCode = statusCode;
  }

  setHeader(name: string, value: string | string[]): void {
    this.headers[name] = value;
  }

  write(chunk?: string | Buffer): boolean {
    if (chunk) this.bodyChunks.push(chunk.toString());
    return true;
  }

  end(chunk?: string | Buffer): void {
    if (chunk) this.bodyChunks.push(chunk.toString());
    const body = this.bodyChunks.join("");

    const msg: ProxyMessage = {
      type: "response",
      id: this.id,
      statusCode: this.statusCode,
      headers: this.headers,
      data: body,
    };
    this.client.send(JSON.stringify(msg));
  }
}
