"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWatcher = createWatcher;
const chokidar_1 = __importDefault(require("chokidar"));
const picocolors_1 = __importDefault(require("picocolors"));
const compose_js_1 = require("./compose.js");
const config_js_1 = require("./config.js");
const builder_js_1 = require("./builder.js");
/**
 * Debounce helper
 */
function debounce(fn, ms) {
    let timer = null;
    return ((...args) => {
        if (timer)
            clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
    });
}
/**
 * Create a file watcher for Docker Compose services.
 */
function createWatcher(options) {
    const { compose, config, composeFile, verbose = false, onChange, onBuild, } = options;
    // Determine which paths to watch per service
    const serviceWatchPaths = new Map();
    for (const [name, service] of compose.services) {
        const serviceConfig = config.services[name];
        if (serviceConfig?.paths?.length) {
            serviceWatchPaths.set(name, serviceConfig.paths);
        }
        else if (service.build) {
            // Default: watch the build context
            serviceWatchPaths.set(name, [service.build.context || './']);
        }
        else if (service.volumes?.length) {
            // Watch volume sources
            serviceWatchPaths.set(name, service.volumes
                .filter((v) => !v.startsWith('/'))
                .map((v) => v.split(':')[0]));
        }
    }
    // Flatten all paths for the watcher
    const allPaths = [...new Set([...serviceWatchPaths.values()].flat())];
    if (allPaths.length === 0) {
        allPaths.push('./');
    }
    const ignorePatterns = [
        ...config_js_1.DEFAULT_IGNORE_PATTERNS,
        ...(config.ignore || []),
    ];
    if (verbose) {
        console.log(picocolors_1.default.blue('🔍 Watching paths:'), allPaths.join(', '));
        console.log(picocolors_1.default.blue('⤴️  Ignore patterns:'), ignorePatterns.join(', '));
        console.log();
    }
    // Track pending builds per service
    const pendingBuilds = new Map(); // service -> Set of changed files
    const scheduleRebuild = debounce(() => {
        const allServices = new Set();
        for (const [, files] of pendingBuilds) {
            for (const file of files) {
                const affected = (0, compose_js_1.getAffectedServices)(file, compose.services, compose.baseDir);
                affected.forEach((s) => allServices.add(s));
            }
        }
        if (allServices.size === 0) {
            if (verbose)
                console.log(picocolors_1.default.gray('  (no affected services, skipping)'));
            pendingBuilds.clear();
            return;
        }
        const servicesToBuild = [...allServices];
        console.log(picocolors_1.default.yellow(`📦 Rebuilding: ${servicesToBuild.join(', ')}`));
        (0, builder_js_1.buildMultiple)(servicesToBuild, composeFile, verbose).then((results) => {
            for (const [service, success] of results) {
                onBuild?.(service, success);
                if (success) {
                    console.log(picocolors_1.default.green(`✅ ${service} rebuilt & restarted`));
                }
                else {
                    console.log(picocolors_1.default.red(`❌ ${service} rebuild failed`));
                }
            }
            pendingBuilds.clear();
        });
    }, config.debounceMs ?? 300);
    const watcher = chokidar_1.default.watch(allPaths, {
        ignored: ignorePatterns,
        persistent: true,
        ignoreInitial: true,
        followSymlinks: false,
        usePolling: false,
    });
    watcher.on('change', (path) => {
        console.log(picocolors_1.default.dim(`  ${path} changed`));
        const affected = (0, compose_js_1.getAffectedServices)(path, compose.services, compose.baseDir);
        if (affected.length > 0) {
            pendingBuilds.set(path, new Set([path]));
            onChange?.(path, affected);
        }
        scheduleRebuild();
    });
    watcher.on('add', (path) => {
        console.log(picocolors_1.default.dim(`  + ${path}`));
        const affected = (0, compose_js_1.getAffectedServices)(path, compose.services, compose.baseDir);
        if (affected.length > 0) {
            pendingBuilds.set(path, new Set([path]));
            onChange?.(path, affected);
        }
        scheduleRebuild();
    });
    watcher.on('unlink', (path) => {
        console.log(picocolors_1.default.dim(`  - ${path}`));
        const affected = (0, compose_js_1.getAffectedServices)(path, compose.services, compose.baseDir);
        if (affected.length > 0) {
            pendingBuilds.set(path, new Set([path]));
            onChange?.(path, affected);
        }
        scheduleRebuild();
    });
    watcher.on('error', (err) => {
        console.error(picocolors_1.default.red(`Watcher error: ${err.message}`));
    });
    return watcher;
}
//# sourceMappingURL=watcher.js.map