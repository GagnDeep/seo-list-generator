import { WebSocket } from "ws";
import httpProxy from "http-proxy";
export function createTunnelClient(options) {
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
            if (authMsg)
                client.send(JSON.stringify(authMsg));
            if (subdomainMsg)
                client.send(JSON.stringify(subdomainMsg));
        });
        client.on("message", (data) => {
            try {
                const msg = JSON.parse(data.toString());
                if (msg.type === "welcome") {
                    resolve({
                        url: msg.url,
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
                    };
                    const res = new MockServerResponse(msg.id, client, msg.statusCode);
                    proxy.web(mockReq, res, {}, (err) => {
                        if (err) {
                            const errorMsg = {
                                type: "error",
                                id: msg.id,
                                error: err.message,
                            };
                            client.send(JSON.stringify(errorMsg));
                        }
                    });
                }
            }
            catch {
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
    id;
    client;
    statusCode;
    headers = {};
    bodyChunks = [];
    constructor(id, client, statusCode = 200) {
        this.id = id;
        this.client = client;
        this.statusCode = statusCode;
    }
    setHeader(name, value) {
        this.headers[name] = value;
    }
    write(chunk) {
        if (chunk)
            this.bodyChunks.push(chunk.toString());
        return true;
    }
    end(chunk) {
        if (chunk)
            this.bodyChunks.push(chunk.toString());
        const body = this.bodyChunks.join("");
        const msg = {
            type: "response",
            id: this.id,
            statusCode: this.statusCode,
            headers: this.headers,
            data: body,
        };
        this.client.send(JSON.stringify(msg));
    }
}
//# sourceMappingURL=client.js.map