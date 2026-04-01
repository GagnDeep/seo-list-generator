import { Command } from "commander";
import { createTunnelClient } from "./client.js";
import { createTunnelServer } from "./server.js";
const program = new Command();
program
    .name("tunnel")
    .description("Expose your localhost to the internet via a reverse proxy tunnel.")
    .version("1.0.0");
program
    .command("connect")
    .description("Connect to a tunnel server and expose a local port")
    .argument("<port>", "Local port to expose")
    .option("-h, --host <hostname>", "Tunnel server host", "localhost")
    .option("-p, --port <number>", "Tunnel server WebSocket port", "3001")
    .option("-s, --subdomain <name>", "Request a specific subdomain")
    .option("-a, --auth <user:pass>", "Basic auth for the tunnel")
    .action(async (port, opts) => {
    const localPort = parseInt(port, 10);
    if (isNaN(localPort) || localPort < 1 || localPort > 65535) {
        console.error(`[tunnel] invalid port: ${port}`);
        process.exit(1);
    }
    try {
        const info = await createTunnelClient({
            host: opts.host,
            port: parseInt(opts.port, 10),
            localPort,
            subdomain: opts.subdomain,
            auth: opts.auth,
        });
        console.log(`[tunnel] connected to server`);
        console.log(`[tunnel] local port: ${localPort}`);
        console.log(`[tunnel] url: ${info.url}`);
        console.log(`[tunnel] press Ctrl+C to disconnect`);
        // Keep alive with periodic pings
        const interval = setInterval(() => {
            if (info.client.readyState === 1) {
                info.client.ping();
            }
        }, 30000);
        process.on("SIGINT", () => {
            clearInterval(interval);
            info.client.close();
            console.log("\n[tunnel] disconnected");
            process.exit(0);
        });
    }
    catch (err) {
        console.error(`[tunnel] failed to connect: ${err.message}`);
        process.exit(1);
    }
});
program
    .command("server")
    .description("Start a tunnel server (run on a VPS)")
    .option("-p, --port <number>", "WebSocket port for clients", "3001")
    .option("-h, --http-port <number>", "HTTP port for internet traffic", "3000")
    .option("-d, --domain <name>", "Domain for subdomains", "localtunnel.dev")
    .option("-a, --auth <user:pass>", "Global basic auth for all tunnels")
    .action(async (opts) => {
    console.log(`[server] starting local tunnel server...`);
    const httpServer = createTunnelServer({
        port: parseInt(opts.port, 10),
        httpPort: parseInt(opts.httpPort, 10),
        domain: opts.domain,
        globalAuth: opts.auth,
    });
    process.on("SIGINT", () => {
        httpServer.close();
        console.log("\n[server] stopped");
        process.exit(0);
    });
});
export { program };
//# sourceMappingURL=cli.js.map