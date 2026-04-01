#!/usr/bin/env node

import { Command } from 'commander';
import picocolors from 'picocolors';
import { parseCompose } from './compose.js';
import { createWatcher } from './watcher.js';
import { loadConfig } from './config.js';
import { isDockerAvailable } from './builder.js';


const program = new Command();

program
  .name('docker-watch')
  .description(
    'Watch source files and automatically rebuild Docker containers on change.',
  )
  .version('0.1.0')
  .option(
    '-f, --file <path>',
    'Path to docker-compose.yml',
    'docker-compose.yml',
  )
  .option(
    '-c, --config <path>',
    'Path to .watch.yml config file',
  )
  .option('-v, --verbose', 'Enable verbose output')
  .option(
    '--debounce <ms>',
    'Debounce delay in milliseconds',
    (value) => parseInt(value, 10),
  )
  .option(
    '--ignore <patterns>',
    'Comma-separated ignore patterns (overrides config file)',
  )
  .argument('[paths...]', 'Specific paths to watch (overrides config)')
  .action(async (_paths: string[], opts: Record<string, unknown>) => {
    // Check docker availability
    const dockerOk = await isDockerAvailable();
    if (!dockerOk) {
      console.error(picocolors.red('❌ docker or docker compose not found. Is Docker installed?'));
      process.exit(1);
    }

    const composeFile = (opts['file'] as string) || 'docker-compose.yml';
    const verbose = Boolean(opts['verbose']);
    const configPath = opts['config'] as string | undefined;
    const debounceMs = (opts['debounce'] as number) || 300;
    const ignoreArg = opts['ignore'] as string | undefined;

    // Load config
    const config = loadConfig(configPath);
    if (debounceMs !== 300) {
      config.debounceMs = debounceMs;
    }
    if (ignoreArg) {
      config.ignore = ignoreArg.split(',').map((p: string) => p.trim());
    }

    // Parse compose
    let compose;
    try {
      compose = parseCompose(composeFile);
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error(picocolors.red(`❌ Failed to parse ${composeFile}: ${error.message}`));
      process.exit(1);
    }

    if (compose.serviceNames.length === 0) {
      console.error(picocolors.red(`❌ No services found in ${composeFile}`));
      process.exit(1);
    }

    const hasBuild = [...compose.services.values()].some((s) => s.build);
    if (!hasBuild) {
      console.error(picocolors.red('❌ No services with build sections found. Nothing to rebuild.'));
      process.exit(1);
    }

    console.log(picocolors.bold(picocolors.blue('🐳 Docker Watch Reload')));
    console.log(picocolors.gray(`   Compose: ${composeFile}`));
    console.log(picocolors.gray(`   Services: ${compose.serviceNames.join(', ')}`));
    console.log(picocolors.gray(`   Debounce: ${config.debounceMs}ms`));
    console.log();

    const watcher = createWatcher({
      compose,
      config,
      composeFile,
      verbose,
    });

    console.log(picocolors.green('👀 Watching for file changes...'));
    console.log(picocolors.gray('   Press Ctrl+C to stop.\n'));

    // Graceful shutdown
    const shutdown = () => {
      console.log(picocolors.yellow('\n👋 Stopping watcher...'));
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
