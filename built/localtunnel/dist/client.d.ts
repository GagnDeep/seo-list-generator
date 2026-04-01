import { WebSocket } from "ws";
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
export declare function createTunnelClient(options: TunnelClientOptions): Promise<TunnelInfo>;
//# sourceMappingURL=client.d.ts.map