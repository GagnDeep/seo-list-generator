export interface ServiceInfo {
    name: string;
    hasBuild: boolean;
}
/**
 * Rebuild and restart a specific Docker Compose service.
 */
export declare function buildAndRestart(serviceName: string, composeFile: string, verbose: boolean): Promise<{
    success: boolean;
    output: string;
}>;
/**
 * Rebuild and restart multiple services.
 */
export declare function buildMultiple(serviceNames: string[], composeFile: string, verbose: boolean): Promise<Map<string, boolean>>;
/**
 * Check if docker compose is available.
 */
export declare function isDockerAvailable(): Promise<boolean>;
//# sourceMappingURL=builder.d.ts.map