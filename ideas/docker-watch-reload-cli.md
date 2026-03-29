# Docker Watch Reload CLI

## What It Is
A CLI tool for local development that watches source files and automatically rebuilds and restarts Docker containers when files change. No more manual `docker-compose down && docker-compose up --build`. Point it at your docker-compose.yml and code. It handles the rest.

## Why It Doesn't Exist Well as Open Source
`docker-compose watch` exists in newer Docker Compose but has limited configuration. `tilt` is excellent but complex and Kubernetes-focused. `reflex` watches files but doesn't understand Docker. There's no simple, zero-config tool that just works like Vite/HMR for Docker containers.

## Developer Pain Point
Every developer using Docker for local development wastes time on manual rebuilds. `docker-compose watch` is decent but new and not widely known. This tool provides a better developer experience with instant rebuilds. Developers would install it to eliminate Docker rebuild friction.

## Suggested Tech Stack
- Go (for single binary distribution, no Node dependency)
- `chokidar` or `fsnotify` for file watching (or Go's `fsnotify` package)
- Docker Engine API via `docker.go` or direct `docker compose` command invocation
- YAML config file (`.watch.yml`) for customization

## What's Close (GitHub repos to reference)
- [docker-compose watch](https://github.com/docker/compose) — built-in but new, limited options
- [tilt](https://github.com/tilt-dev/tilt) — powerful but complex, requires Tiltfile
- [reflex](https://github.com/cespare/reflex) — general file watcher, no Docker integration

## What to Build (MVP Scope)
1. `docker-watch` — reads docker-compose.yml and watches all source directories
2. Rebuilds and restarts affected services on file change
3. Ignore patterns (node_modules, .git, build artifacts)
4. Debounce rapid file changes (100ms default)
5. Service-specific watch paths (not just "rebuild everything")
6. Clean output with service name and changed file
7. Help output and `--verbose` mode

## Category
CLI
