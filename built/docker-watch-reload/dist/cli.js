#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const picocolors_1 = __importDefault(require("picocolors"));
const compose_js_1 = require("./compose.js");
const watcher_js_1 = require("./watcher.js");
const config_js_1 = require("./config.js");
const builder_js_1 = require("./builder.js");
const program = new commander_1.Command();
program
    .name('docker-watch')
    .description('Watch source files and automatically rebuild Docker containers on change.')
    .version('0.1.0')
    .option('-f, --file <path>', 'Path to docker-compose.yml', 'docker-compose.yml')
    .option('-c, --config <path>', 'Path to .watch.yml config file')
    .option('-v, --verbose', 'Enable verbose output')
    .option('--debounce <ms>', 'Debounce delay in milliseconds', (value) => parseInt(value, 10))
    .option('--ignore <patterns>', 'Comma-separated ignore patterns (overrides config file)')
    .argument('[paths...]', 'Specific paths to watch (overrides config)')
    .action(async (_paths, opts) => {
    // Check docker availability
    const dockerOk = await (0, builder_js_1.isDockerAvailable)();
    if (!dockerOk) {
        console.error(picocolors_1.default.red('❌ docker or docker compose not found. Is Docker installed?'));
        process.exit(1);
    }
    const composeFile = opts['file'] || 'docker-compose.yml';
    const verbose = Boolean(opts['verbose']);
    const configPath = opts['config'];
    const debounceMs = opts['debounce'] || 300;
    const ignoreArg = opts['ignore'];
    // Load config
    const config = (0, config_js_1.loadConfig)(configPath);
    if (debounceMs !== 300) {
        config.debounceMs = debounceMs;
    }
    if (ignoreArg) {
        config.ignore = ignoreArg.split(',').map((p) => p.trim());
    }
    // Parse compose
    let compose;
    try {
        compose = (0, compose_js_1.parseCompose)(composeFile);
    }
    catch (err) {
        const error = err;
        console.error(picocolors_1.default.red(`❌ Failed to parse ${composeFile}: ${error.message}`));
        process.exit(1);
    }
    if (compose.serviceNames.length === 0) {
        console.error(picocolors_1.default.red(`❌ No services found in ${composeFile}`));
        process.exit(1);
    }
    const hasBuild = [...compose.services.values()].some((s) => s.build);
    if (!hasBuild) {
        console.error(picocolors_1.default.red('❌ No services with build sections found. Nothing to rebuild.'));
        process.exit(1);
    }
    console.log(picocolors_1.default.bold(picocolors_1.default.blue('🐳 Docker Watch Reload')));
    console.log(picocolors_1.default.gray(`   Compose: ${composeFile}`));
    console.log(picocolors_1.default.gray(`   Services: ${compose.serviceNames.join(', ')}`));
    console.log(picocolors_1.default.gray(`   Debounce: ${config.debounceMs}ms`));
    console.log();
    const watcher = (0, watcher_js_1.createWatcher)({
        compose,
        config,
        composeFile,
        verbose,
    });
    console.log(picocolors_1.default.green('👀 Watching for file changes...'));
    console.log(picocolors_1.default.gray('   Press Ctrl+C to stop.\n'));
    // Graceful shutdown
    const shutdown = () => {
        console.log(picocolors_1.default.yellow('\n👋 Stopping watcher...'));
        watcher.close();
        process.exit(0);
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
});
program
    .command('init')
    .description('Generate a .watch.yml config file')
    .action(() => {
    const exampleConfig = `# Docker Watch Reload configuration
# https://github.com/seo-list/docker-watch-reload

# Per-service overrides
services:
  web:
    paths:
      - ./src
      - ./package.json
    ignore:
      - "**/*.test.ts"
    beforeBuild:
      - echo "Running before build..."

  api:
    paths:
      - ./server

# Global ignore patterns
ignore:
  - "**/dist/**"
  - "**/*.log"

# Debounce delay in ms (default: 300)
debounceMs: 300
`;
    console.log(exampleConfig);
});
program.parse();
//# sourceMappingURL=cli.js.map