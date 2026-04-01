# Docker Watch Reload

Watch source files and automatically rebuild Docker containers when code changes. No more manual `docker-compose down && docker-compose up --build`.

## Install

```bash
npm install -g @seo-list/docker-watch-reload
```

Or use without installing (npx):

```bash
npx @seo-list/docker-watch-reload
```

Requires:
- [Docker](https://docs.docker.com/get-docker/) and `docker compose` (v2+)
- Node.js 18+

## Usage

```bash
# Watch the current directory's docker-compose.yml
docker-watch

# Specify a custom compose file
docker-watch -f docker-compose.dev.yml

# Enable verbose output
docker-watch --verbose

# Override debounce delay
docker-watch --debounce 500

# Generate a .watch.yml config file
docker-watch init
```

## Configuration

Create a `.watch.yml` file in your project root:

```yaml
# Per-service watch overrides
services:
  web:
    paths:
      - ./src
      - ./package.json
    ignore:
      - "**/*.test.ts"
  api:
    paths:
      - ./server

# Global ignore patterns (in addition to defaults)
ignore:
  - "**/dist/**"
  - "**/*.log"

# Debounce delay in ms (default: 300)
debounceMs: 300
```

### Default Ignore Patterns

The following patterns are always ignored:

```
**/node_modules/**
**/.git/**
**/dist/**
**/build/**
**/.next/**
**/coverage/**
**/*.log
**/tmp/**
**/.cache/**
```

## How It Works

1. Parses `docker-compose.yml` to find services with `build` sections
2. Determines which paths to watch for each service (build context or named volumes)
3. Watches for file changes using `chokidar`
4. When files change, uses `getAffectedServices()` to determine which services are impacted
5. Runs `docker compose build <service>` then `docker compose up -d --no-deps <service>`

## API

### `parseCompose(composePath)`

Parses a docker-compose.yml file.

```typescript
import { parseCompose } from '@seo-list/docker-watch-reload';

const { services, serviceNames, baseDir } = parseCompose('docker-compose.yml');
```

### `getAffectedServices(changedPath, services, baseDir)`

Returns which services are affected by a changed file path.

```typescript
import { getAffectedServices } from '@seo-list/docker-watch-reload';

const affected = getAffectedServices('/path/to/src/index.ts', services, baseDir);
// => ['web', 'api']
```

### `createWatcher(options)`

Creates a chokidar watcher with rebuild logic.

```typescript
import { createWatcher, parseCompose, loadConfig } from '@seo-list/docker-watch-reload';

const watcher = createWatcher({
  compose,
  config,
  composeFile: 'docker-compose.yml',
  verbose: true,
  onChange: (path, services) => { /* ... */ },
  onBuild: (service, success) => { /* ... */ },
});

// Clean up
watcher.close();
```

### `loadConfig(configPath?)`

Loads `.watch.yml` configuration. Returns defaults if no config file exists.

```typescript
import { loadConfig } from '@seo-list/docker-watch-reload';

const config = loadConfig(); // searches for .watch.yml or .watch.yaml
const config = loadConfig('/path/to/.watch.yml');
```

## License

MIT
