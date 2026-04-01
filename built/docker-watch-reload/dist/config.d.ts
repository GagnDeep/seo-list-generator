export interface WatchConfig {
    /** Service-specific watch overrides */
    services: Record<string, {
        /** Paths to watch for this service (globs supported) */
        paths: string[];
        /** Patterns to ignore for this service */
        ignore?: string[];
        /** Commands to run before rebuilding */
        beforeBuild?: string[];
    }>;
    /** Global ignore patterns */
    ignore?: string[];
    /** Debounce delay in ms (default: 300) */
    debounceMs?: number;
    /** Compose file path */
    composeFile?: string;
}
/** Default ignore patterns */
export declare const DEFAULT_IGNORE_PATTERNS: string[];
/**
 * Load watch config from .watch.yml or .watch.yaml in the current directory.
 */
export declare function loadConfig(configPath?: string): WatchConfig;
//# sourceMappingURL=config.d.ts.map