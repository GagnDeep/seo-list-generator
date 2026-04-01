export interface ComposeService {
    name: string;
    build?: {
        context?: string;
        dockerfile?: string;
    };
    volumes?: string[];
    image?: string;
}
export interface ParsedCompose {
    services: Map<string, ComposeService>;
    serviceNames: string[];
    /** Absolute path to the directory containing the compose file */
    baseDir: string;
}
/**
 * Parse a docker-compose.yml file and extract service information.
 * @param composePath - Path to docker-compose.yml
 * @returns ParsedCompose with service name-to-info mapping
 */
export declare function parseCompose(composePath: string): ParsedCompose;
/**
 * Find which services are affected by a changed file path.
 * Returns service names whose build context or volume source matches the file.
 */
export declare function getAffectedServices(changedPath: string, services: Map<string, ComposeService>, baseDir: string): string[];
//# sourceMappingURL=compose.d.ts.map