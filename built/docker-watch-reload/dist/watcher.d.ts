import { type FSWatcher } from 'chokidar';
import { type ParsedCompose } from './compose.js';
import { type WatchConfig } from './config.js';
export interface WatcherOptions {
    /** Parsed compose file */
    compose: ParsedCompose;
    /** Watch config (.watch.yml) */
    config: WatchConfig;
    /** Path to docker-compose.yml */
    composeFile: string;
    /** Enable verbose output */
    verbose?: boolean;
    /** Called when a change is detected */
    onChange?: (changedPath: string, affectedServices: string[]) => void;
    /** Called after rebuild */
    onBuild?: (service: string, success: boolean) => void;
}
/**
 * Create a file watcher for Docker Compose services.
 */
export declare function createWatcher(options: WatcherOptions): FSWatcher;
//# sourceMappingURL=watcher.d.ts.map