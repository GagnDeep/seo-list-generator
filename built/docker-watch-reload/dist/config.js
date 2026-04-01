"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_IGNORE_PATTERNS = void 0;
exports.loadConfig = loadConfig;
const fs_1 = require("fs");
const js_yaml_1 = require("js-yaml");
const path_1 = require("path");
/** Default ignore patterns */
exports.DEFAULT_IGNORE_PATTERNS = [
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
function loadConfig(configPath) {
    const searchPaths = configPath
        ? [(0, path_1.resolve)(configPath)]
        : [(0, path_1.resolve)('.watch.yml'), (0, path_1.resolve)('.watch.yaml')];
    for (const path of searchPaths) {
        if ((0, fs_1.existsSync)(path)) {
            const raw = (0, fs_1.readFileSync)(path, 'utf-8');
            const config = (0, js_yaml_1.load)(raw);
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
//# sourceMappingURL=config.js.map