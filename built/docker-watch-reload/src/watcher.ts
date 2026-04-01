import chokidar, { type FSWatcher } from 'chokidar';
import picocolors from 'picocolors';
import { getAffectedServices, type ParsedCompose } from './compose.js';
import { type WatchConfig, DEFAULT_IGNORE_PATTERNS } from './config.js';
import { buildMultiple } from './builder.js';

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
 * Debounce helper
 */
function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return ((...args: unknown[]) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}

/**
 * Create a file watcher for Docker Compose services.
 */
export function createWatcher(options: WatcherOptions): FSWatcher {
  const {
    compose,
    config,
    composeFile,
    verbose = false,
    onChange,
    onBuild,
  } = options;

  // Determine which paths to watch per service
  const serviceWatchPaths = new Map<string, string[]>();

  for (const [name, service] of compose.services) {
    const serviceConfig = config.services[name];
    if (serviceConfig?.paths?.length) {
      serviceWatchPaths.set(name, serviceConfig.paths);
    } else if (service.build) {
      // Default: watch the build context
      serviceWatchPaths.set(name, [service.build.context || './']);
    } else if (service.volumes?.length) {
      // Watch volume sources
      serviceWatchPaths.set(
        name,
        service.volumes
          .filter((v) => !v.startsWith('/'))
          .map((v) => v.split(':')[0]),
      );
    }
  }

  // Flatten all paths for the watcher
  const allPaths = [...new Set([...serviceWatchPaths.values()].flat())];
  if (allPaths.length === 0) {
    allPaths.push('./');
  }

  const ignorePatterns = [
    ...DEFAULT_IGNORE_PATTERNS,
    ...(config.ignore || []),
  ];

  if (verbose) {
    console.log(picocolors.blue('🔍 Watching paths:'), allPaths.join(', '));
    console.log(picocolors.blue('⤴️  Ignore patterns:'), ignorePatterns.join(', '));
    console.log();
  }

  // Track pending builds per service
  const pendingBuilds = new Map<string, Set<string>>(); // service -> Set of changed files
  const scheduleRebuild = debounce(() => {
    const allServices = new Set<string>();
    for (const [, files] of pendingBuilds) {
      for (const file of files) {
        const affected = getAffectedServices(file, compose.services, compose.baseDir);
        affected.forEach((s) => allServices.add(s));
      }
    }

    if (allServices.size === 0) {
      if (verbose) console.log(picocolors.gray('  (no affected services, skipping)'));
      pendingBuilds.clear();
      return;
    }

    const servicesToBuild = [...allServices];
    console.log(
      picocolors.yellow(`📦 Rebuilding: ${servicesToBuild.join(', ')}`),
    );

    buildMultiple(servicesToBuild, composeFile, verbose).then((results) => {
      for (const [service, success] of results) {
        onBuild?.(service, success);
        if (success) {
          console.log(picocolors.green(`✅ ${service} rebuilt & restarted`));
        } else {
          console.log(picocolors.red(`❌ ${service} rebuild failed`));
        }
      }
      pendingBuilds.clear();
    });
  }, config.debounceMs ?? 300);

  const watcher = chokidar.watch(allPaths, {
    ignored: ignorePatterns,
    persistent: true,
    ignoreInitial: true,
    followSymlinks: false,
    usePolling: false,
  });

  watcher.on(
    'change',
    (path: string) => {
      console.log(picocolors.dim(`  ${path} changed`));
      const affected = getAffectedServices(path, compose.services, compose.baseDir);
      if (affected.length > 0) {
        pendingBuilds.set(path, new Set([path]));
        onChange?.(path, affected);
      }
      scheduleRebuild();
    },
  );

  watcher.on(
    'add',
    (path: string) => {
      console.log(picocolors.dim(`  + ${path}`));
      const affected = getAffectedServices(path, compose.services, compose.baseDir);
      if (affected.length > 0) {
        pendingBuilds.set(path, new Set([path]));
        onChange?.(path, affected);
      }
      scheduleRebuild();
    },
  );

  watcher.on(
    'unlink',
    (path: string) => {
      console.log(picocolors.dim(`  - ${path}`));
      const affected = getAffectedServices(path, compose.services, compose.baseDir);
      if (affected.length > 0) {
        pendingBuilds.set(path, new Set([path]));
        onChange?.(path, affected);
      }
      scheduleRebuild();
    },
  );

  watcher.on('error', (err: Error) => {
    console.error(picocolors.red(`Watcher error: ${err.message}`));
  });

  return watcher;
}
