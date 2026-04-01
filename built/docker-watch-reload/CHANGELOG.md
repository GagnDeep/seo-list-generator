# Changelog

## 0.1.0 (2026-04-01)

### Added
- `docker-watch` CLI with chokidar-based file watching
- `parseCompose()` to parse docker-compose.yml and extract service/build info
- `getAffectedServices()` to determine which services are impacted by a changed file
- `createWatcher()` for watching files and scheduling debounced rebuilds
- `loadConfig()` for loading `.watch.yml` configuration
- `docker-watch init` command to generate example config
- `--verbose`, `--debounce`, `--ignore`, `--config`, `--file` CLI flags
- Default ignore patterns (node_modules, .git, dist, etc.)
- TypeScript types for all public APIs
- Unit tests (Vitest)
