import { readFileSync, existsSync } from 'fs';
import { load as yamlLoad } from 'js-yaml';
import { resolve } from 'path';

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
export const DEFAULT_IGNORE_PATTERNS = [
  '**/node_modules/**',
  '**/.git/**',
  '**/dist/**',
  '**/build/**',
  '**/.next/**',
  '**/coverage/**',
  '**/*.log',
  '**/tmp/**',
  '**/.cache/**',
];

/**
 * Load watch config from .watch.yml or .watch.yaml in the current directory.
 */
export function loadConfig(configPath?: string): WatchConfig {
  const searchPaths = configPath
    ? [resolve(configPath)]
    : [resolve('.watch.yml'), resolve('.watch.yaml')];

  for (const path of searchPaths) {
    if (existsSync(path)) {
      const raw = readFileSync(path, 'utf-8');
      const config = yamlLoad(raw) as WatchConfig;
      return {
        services: config.services || {},
        ignore: config.ignore || [],
        debounceMs: config.debounceMs || 300,
        composeFile: config.composeFile,
      };
    }
  }

  return {
    services: {},
    ignore: [],
    debounceMs: 300,
  };
}
