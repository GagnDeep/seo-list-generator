import { WebSocketServer, WebSocket } from "ws";
import { createServer, Server } from "http";
import type { IncomingMessage } from "http";
import { parse } from "url";
import crypto from "crypto";

export interface TunnelServerOptions {
  /** Port to listen on for tunnel connections */
  port: number;
  /** Port to listen on for HTTP traffic from the internet */
  httpPort: number;
  /** Optional domain for subdomains (default subdomain.localtunnel.dev) */
  domain?: string;
  /** Optional basic auth for all tunnels */
  globalAuth?: string;
}

interface ClientConnection {
  ws: WebSocket;
  subdomain: string | null;
  auth: string | null;
  ready: boolean;
}

const clients = new Map<string, ClientConnection>();
const subdomainToPath = new Map<string, string>();

function generateSubdomain(length = 10): string {
  return crypto.randomBytes(length).toString("hex").slice(0, length);
}

function parseAuthHeader(header: string | undefined): { user: string; pass: string } | null {
  if (!header || !header.startsWith("Basic ")) return null;
  try {
    const decoded = Buffer.from(header.slice(6), "base64").toString();
    const [user, pass] = decoded.split(":");
    if (user && pass) return { user, pass };
    return null;
  } catch {
    return null;
  }
}

export function createTunnelServer(options: TunnelServerOptions): Server {
  const domain = options.domain || "localtunnel.dev";
  const httpServer = createServer();
  const wss = new WebSocketServer({ server: httpServer });

  // Handle incoming HTTP requests from the internet
  httpServer.on("request", (req: IncomingMessage, res) => {
    const parsed = parse(req.url || "/", true);
    const hostHeader = req.headers.host || "";
    const subdomain = hostHeader.split(".")[0];

    // Find the client for this subdomain
    const path = subdomainToPath.get(subdomain);
    if (!path) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Tunnel not found. Is the client connected?");
      return;
    }

    const client = clients.get(path);
    if (!client || !client.ready || client.ws.readyState !== WebSocket.OPEN) {
      res.writeHead(502, { "Content-Type": "text/plain" });
      res.end("Tunnel client disconnected");
      return;
    }

    // Check global auth if set
    if (options.globalAuth) {
      const credentials = parseAuthHeader(req.headers.authorization);
      if (!credentials) {
        res.writeHead(401, { "WWW-Authenticate": 'Basic realm="Tunnel"' });
        res.end("Authentication required");
        return;
      }
      const [expectedUser, expectedPass] = options.globalAuth.split(":");
      if (
        credentials.user !== expectedUser ||
        credentials.pass !== expectedPass
      ) {
        res.writeHead(403, { "Content-Type": "text/plain" });
        res.end("Forbidden");
        return;
      }
    }

    // Collect request body
    const chunks: string[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk.toString()));
    req.on("end", () => {
      const body = chunks.join("");

      // Forward request to tunnel client
      const id = Date.now() + Math.floor(Math.random() * 1000);
      const msg = {
        type: "request",
        id,
        method: req.method,
        url: parsed.path || "/",
        headers: req.headers,
        body,
      };

      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(msg));

        // Set up response handler
        const timeout = setTimeout(() => {
          pendingResponses.delete(id);
          res.writeHead(504, { "Content-Type": "text/plain" });
          res.end("Gateway timeout - tunnel unresponsive");
        }, 30000);

        pendingResponses.set(id, (response) => {
          clearTimeout(timeout);
          res.writeHead(response.statusCode || 200, response.headers || {});
          res.end(response.data || "");
        });

        // Listen for the response from client
        const responseHandler = (data: Buffer) => {
          try {
            const msg = JSON.parse(data.toString());
            if (msg.id === id && msg.type === "response") {
              client.ws.removeListener("message", responseHandler);
              pendingResponses.delete(id);
              res.writeHead(msg.statusCode || 200, msg.headers || {});
              res.end(msg.data || "");
            }
          } catch {
            // ignore
          }
        };
        client.ws.on("message", responseHandler);
      }
    });
  });

  const pendingResponses = new Map<
    number,
    (response: { statusCode?: number; headers?: Record<string, string | string[]>; data?: string }) => void
  >();

  // Handle WebSocket connections from tunnel clients
  wss.on("connection", (ws: WebSocket) => {
    let path = generateSubdomain();
    let clientAuth: string | null = null;

    const sendWelcome = (subdomain: string) => {
      const url = `http://${subdomain}.${domain}:${options.httpPort}`;
      subdomainToPath.set(subdomain, path);
      ws.send(JSON.stringify({ type: "welcome", url, subdomain }));
    };

    ws.on("message", (data) => {
      try {
        const msg = JSON.parse(data.toString());

        if (msg.type === "auth") {
          clientAuth = msg.auth as string;
        } else if (msg.type === "subdomain") {
          const requested = msg.subdomain as string;
          if (!subdomainToPath.has(requested)) {
            path = requested;
            sendWelcome(requested);
          } else {
            ws.send(JSON.stringify({
              type: "error",
              error: `Subdomain '${requested}' is taken, using random`,
            }));
            sendWelcome(generateSubdomain());
          }
        } else if (msg.type === "ping") {
          ws.send(JSON.stringify({ type: "pong" }));
        }
      } catch {
        // ignore
      }
    });

    // Register client with a random subdomain
    clients.set(path, { ws, subdomain: null, auth: clientAuth, ready: true });
    sendWelcome(path);

    ws.on("close", () => {
      clients.delete(path);
      // Clean up subdomain mapping
      for (const [sub, p] of subdomainToPath.entries()) {
        if (p === path) {
          subdomainToPath.delete(sub);
          break;
        }
      }
    });

    ws.on("error", (err) => {
      console.error(`[server] client error: ${err.message}`);
      clients.delete(path);
    });
  });

  httpServer.listen(options.httpPort, () => {
    console.log(`[server] HTTP tunnel gateway listening on port ${options.httpPort}`);
  });

  return httpServer;
}
