"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const fs_1 = require("fs");
const path_1 = require("path");
const compose_js_1 = require("./compose.js");
const config_js_1 = require("./config.js");
(0, vitest_1.describe)('parseCompose', () => {
    const tmpDir = (0, path_1.join)('/tmp', 'docker-watch-test-' + Date.now());
    (0, vitest_1.beforeEach)(() => {
        (0, fs_1.mkdirSync)(tmpDir, { recursive: true });
    });
    (0, vitest_1.it)('parses a basic docker-compose.yml', () => {
        const content = `
services:
  web:
    build: ./web
    volumes:
      - ./src:/app/src
  api:
    image: nginx:latest
`;
        (0, fs_1.writeFileSync)((0, path_1.join)(tmpDir, 'docker-compose.yml'), content);
        const result = (0, compose_js_1.parseCompose)((0, path_1.join)(tmpDir, 'docker-compose.yml'));
        (0, vitest_1.expect)(result.serviceNames).toContain('web');
        (0, vitest_1.expect)(result.serviceNames).toContain('api');
        (0, vitest_1.expect)(result.services.get('web')?.build).toEqual({ context: './web' });
        (0, vitest_1.expect)(result.services.get('api')?.image).toBe('nginx:latest');
        (0, vitest_1.expect)(result.baseDir).toBe(tmpDir);
    });
    (0, vitest_1.it)('parses build with context and dockerfile', () => {
        const content = `
services:
  app:
    build:
      context: ./app
      dockerfile: Dockerfile.dev
`;
        (0, fs_1.writeFileSync)((0, path_1.join)(tmpDir, 'docker-compose.yml'), content);
        const result = (0, compose_js_1.parseCompose)((0, path_1.join)(tmpDir, 'docker-compose.yml'));
        (0, vitest_1.expect)(result.services.get('app')?.build).toEqual({
            context: './app',
            dockerfile: 'Dockerfile.dev',
        });
    });
    (0, vitest_1.it)('throws on invalid compose file', () => {
        const content = `
version: '3'
`;
        (0, fs_1.writeFileSync)((0, path_1.join)(tmpDir, 'docker-compose.yml'), content);
        (0, vitest_1.expect)(() => (0, compose_js_1.parseCompose)((0, path_1.join)(tmpDir, 'docker-compose.yml'))).toThrow('no "services" key found');
    });
});
(0, vitest_1.describe)('getAffectedServices', () => {
    (0, vitest_1.it)('returns services whose build context contains the changed file', () => {
        const content = `
services:
  web:
    build:
      context: ./web
`;
        const tmpDir = (0, path_1.join)('/tmp', 'docker-watch-test2-' + Date.now());
        (0, fs_1.mkdirSync)(tmpDir, { recursive: true });
        (0, fs_1.writeFileSync)((0, path_1.join)(tmpDir, 'docker-compose.yml'), content);
        const { services, baseDir } = (0, compose_js_1.parseCompose)((0, path_1.join)(tmpDir, 'docker-compose.yml'));
        // A file inside web/ should affect the web service
        const affected = (0, compose_js_1.getAffectedServices)((0, path_1.join)(tmpDir, 'web/src/index.ts'), services, baseDir);
        (0, vitest_1.expect)(affected).toContain('web');
    });
    (0, vitest_1.it)('returns empty array when no services match', () => {
        const content = `
services:
  web:
    build:
      context: ./web
`;
        const tmpDir = (0, path_1.join)('/tmp', 'docker-watch-test3-' + Date.now());
        (0, fs_1.mkdirSync)(tmpDir, { recursive: true });
        (0, fs_1.writeFileSync)((0, path_1.join)(tmpDir, 'docker-compose.yml'), content);
        const { services, baseDir } = (0, compose_js_1.parseCompose)((0, path_1.join)(tmpDir, 'docker-compose.yml'));
        // A file outside web/ should not affect the web service
        const affected = (0, compose_js_1.getAffectedServices)((0, path_1.join)(tmpDir, 'api/src/index.ts'), services, baseDir);
        (0, vitest_1.expect)(affected).not.toContain('web');
    });
});
(0, vitest_1.describe)('loadConfig', () => {
    (0, vitest_1.it)('returns default config when no config file exists', () => {
        const config = (0, config_js_1.loadConfig)('/nonexistent/path/.watch.yml');
        (0, vitest_1.expect)(config.services).toEqual({});
        (0, vitest_1.expect)(config.ignore).toEqual([]);
        (0, vitest_1.expect)(config.debounceMs).toBe(300);
    });
    (0, vitest_1.it)('loads config from specified path', () => {
        const tmpDir = (0, path_1.join)('/tmp', 'docker-watch-config-' + Date.now());
        (0, fs_1.mkdirSync)(tmpDir, { recursive: true });
        (0, fs_1.writeFileSync)((0, path_1.join)(tmpDir, '.watch.yml'), `
services:
  web:
    paths:
      - ./src
debounceMs: 500
`);
        const config = (0, config_js_1.loadConfig)((0, path_1.join)(tmpDir, '.watch.yml'));
        (0, vitest_1.expect)(config.services['web']?.paths).toContain('./src');
        (0, vitest_1.expect)(config.debounceMs).toBe(500);
    });
});
(0, vitest_1.describe)('DEFAULT_IGNORE_PATTERNS', () => {
    (0, vitest_1.it)('contains common development patterns', () => {
        (0, vitest_1.expect)(config_js_1.DEFAULT_IGNORE_PATTERNS).toContain('**/node_modules/**');
        (0, vitest_1.expect)(config_js_1.DEFAULT_IGNORE_PATTERNS).toContain('**/.git/**');
        (0, vitest_1.expect)(config_js_1.DEFAULT_IGNORE_PATTERNS).toContain('**/dist/**');
    });
});
//# sourceMappingURL=compose.test.js.map