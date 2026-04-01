import { Server } from "http";
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
export declare function createTunnelServer(options: TunnelServerOptions): Server;
//# sourceMappingURL=server.d.ts.map