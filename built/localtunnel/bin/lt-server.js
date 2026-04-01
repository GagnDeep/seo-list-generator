#!/usr/bin/env node
import { createTunnelServer } from "../dist/server.js";
import { Command } from "commander";
import { readFileSync } from "fs";
import { resolve } from "path";

const pkg = JSON.parse(readFileSync(resolve(__dirname, "../package.json"), "utf-8"));

const program = new Command();

program
  .name("lt-server")
  .description("Start a local tunnel server")
  .version(pkg.version);

program
  .option("-p, --port <number>", "WebSocket port for clients", "3001")
  .option("-h, --http-port <number>", "HTTP port for internet traffic", "3000")
  .option("-d, --domain <name>", "Domain for subdomains", "localtunnel.dev")
  .option("-a, --auth <user:pass>", "Global basic auth for all tunnels")
  .action((opts) => {
    console.log(`[server] starting local tunnel server v${pkg.version}...`);
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

program.parse(process.argv);
