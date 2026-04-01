# Local Tunnel CLI

Self-hosted ngrok alternative. Expose your localhost to the internet via a reverse proxy tunnel — no account required, no rate limits, runs on your own infrastructure.

## Install

```bash
npm install -g @localtunnel/server
```

## Quick Start

### 1. Start a server (on a VPS)

```bash
lt-server
# or with options:
lt-server --http-port 3000 --port 3001 --domain mytunnels.com
```

### 2. Connect your local app

```bash
tunnel connect 3000 --host tunnels.example.com --port 3001
```

You'll get a public URL like `http://a1b2c3d4e5f6.localhost:3000` pointing to your local port 3000.

## Client Usage

```
tunnel connect <port> [options]
```

**Options:**

| Flag | Description | Default |
|------|-------------|---------|
| `-h, --host <hostname>` | Tunnel server host | `localhost` |
| `-p, --port <number>` | Tunnel server WebSocket port | `3001` |
| `-s, --subdomain <name>` | Request a specific subdomain | random |
| `-a, --auth <user:pass>` | Basic auth for the tunnel | none |

**Examples:**

```bash
# Expose local port 8080
tunnel connect 8080

# With custom subdomain
tunnel connect 8080 --subdomain my-app

# With basic auth
tunnel connect 3000 --auth admin:secret

# Connect to a remote server
tunnel connect 5173 --host tunnels.example.com --port 3001
```

## Server Usage

```
lt-server [options]
```

**Options:**

| Flag | Description | Default |
|------|-------------|---------|
| `-p, --port <number>` | WebSocket port for clients | `3001` |
| `-h, --http-port <number>` | HTTP port for internet traffic | `3000` |
| `-d, --domain <name>` | Domain for subdomains | `localtunnel.dev` |
| `-a, --auth <user:pass>` | Global basic auth for all tunnels | none |

**Example:**

```bash
# Run on a $5 VPS
lt-server --http-port 80 --port 3001 --domain mytunnels.com --auth admin:secret
```

## Use as a Library

```typescript
import { createTunnelClient, createTunnelServer } from "@localtunnel/server";

// Client
const tunnel = await createTunnelClient({
  host: "tunnels.example.com",
  port: 3001,
  localPort: 3000,
  subdomain: "my-app",
  auth: "user:pass",
});

console.log(`Tunnel URL: ${tunnel.url}`);

// Server
const server = createTunnelServer({
  port: 3001,
  httpPort: 80,
  domain: "mytunnels.com",
});
```

## How It Works

```
Browser → HTTP Request → lt-server (public) → WebSocket → tunnel client → localhost:3000
```

1. The **client** connects to the **server** via WebSocket
2. The **server** assigns a random subdomain (or your requested one)
3. When **internet traffic** hits the subdomain, the **server** forwards it over the WebSocket to the **client**
4. The **client** proxies the request to your **local service** and sends the response back

## API

### `createTunnelClient(options)`

Connect to a tunnel server and expose a local port.

**Options:**

```typescript
interface TunnelClientOptions {
  host: string;           // Tunnel server hostname
  port: number;           // WebSocket port on server
  localPort: number;      // Local port to expose
  subdomain?: string;     // Request specific subdomain
  auth?: string;          // Basic auth 'user:pass'
}
```

**Returns:** `Promise<TunnelInfo>`

```typescript
interface TunnelInfo {
  url: string;             // Public tunnel URL
  client: WebSocket;       // Raw WebSocket connection
  localPort: number;       // The exposed local port
}
```

### `createTunnelServer(options)`

Start a tunnel server that accepts client connections and proxies HTTP traffic.

**Options:**

```typescript
interface TunnelServerOptions {
  port: number;            // WebSocket port for clients
  httpPort: number;         // HTTP port for internet traffic
  domain?: string;         // Domain for subdomains
  globalAuth?: string;     // Global basic auth 'user:pass'
}
```

**Returns:** `Server` (Node.js HTTP server)

## License

MIT
