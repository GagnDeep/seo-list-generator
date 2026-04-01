import { describe, it, expect, beforeEach } from 'vitest';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { parseCompose, getAffectedServices } from './compose.js';
import { loadConfig, DEFAULT_IGNORE_PATTERNS } from './config.js';

describe('parseCompose', () => {
  const tmpDir = join('/tmp', 'docker-watch-test-' + Date.now());
  beforeEach(() => {
    mkdirSync(tmpDir, { recursive: true });
  });

  it('parses a basic docker-compose.yml', () => {
    const content = `
services:
  web:
    build: ./web
    volumes:
      - ./src:/app/src
  api:
    image: nginx:latest
`;
    writeFileSync(join(tmpDir, 'docker-compose.yml'), content);
    const result = parseCompose(join(tmpDir, 'docker-compose.yml'));
    expect(result.serviceNames).toContain('web');
    expect(result.serviceNames).toContain('api');
    expect(result.services.get('web')?.build).toEqual({ context: './web' });
    expect(result.services.get('api')?.image).toBe('nginx:latest');
    expect(result.baseDir).toBe(tmpDir);
  });

  it('parses build with context and dockerfile', () => {
    const content = `
services:
  app:
    build:
      context: ./app
      dockerfile: Dockerfile.dev
`;
    writeFileSync(join(tmpDir, 'docker-compose.yml'), content);
    const result = parseCompose(join(tmpDir, 'docker-compose.yml'));
    expect(result.services.get('app')?.build).toEqual({
      context: './app',
      dockerfile: 'Dockerfile.dev',
    });
  });

  it('throws on invalid compose file', () => {
    const content = `
version: '3'
`;
    writeFileSync(join(tmpDir, 'docker-compose.yml'), content);
    expect(() => parseCompose(join(tmpDir, 'docker-compose.yml'))).toThrow(
      'no "services" key found',
    );
  });
});

describe('getAffectedServices', () => {
  it('returns services whose build context contains the changed file', () => {
    const content = `
services:
  web:
    build:
      context: ./web
`;
    const tmpDir = join('/tmp', 'docker-watch-test2-' + Date.now());
    mkdirSync(tmpDir, { recursive: true });
    writeFileSync(join(tmpDir, 'docker-compose.yml'), content);

    const { services, baseDir } = parseCompose(join(tmpDir, 'docker-compose.yml'));

    // A file inside web/ should affect the web service
    const affected = getAffectedServices(
      join(tmpDir, 'web/src/index.ts'),
      services,
      baseDir,
    );
    expect(affected).toContain('web');
  });

  it('returns empty array when no services match', () => {
    const content = `
services:
  web:
    build:
      context: ./web
`;
    const tmpDir = join('/tmp', 'docker-watch-test3-' + Date.now());
    mkdirSync(tmpDir, { recursive: true });
    writeFileSync(join(tmpDir, 'docker-compose.yml'), content);

    const { services, baseDir } = parseCompose(join(tmpDir, 'docker-compose.yml'));

    // A file outside web/ should not affect the web service
    const affected = getAffectedServices(
      join(tmpDir, 'api/src/index.ts'),
      services,
      baseDir,
    );
    expect(affected).not.toContain('web');
  });
});

describe('loadConfig', () => {
  it('returns default config when no config file exists', () => {
    const config = loadConfig('/nonexistent/path/.watch.yml');
    expect(config.services).toEqual({});
    expect(config.ignore).toEqual([]);
    expect(config.debounceMs).toBe(300);
  });

  it('loads config from specified path', () => {
    const tmpDir = join('/tmp', 'docker-watch-config-' + Date.now());
    mkdirSync(tmpDir, { recursive: true });
    writeFileSync(
      join(tmpDir, '.watch.yml'),
      `
services:
  web:
    paths:
      - ./src
debounceMs: 500
`,
    );
    const config = loadConfig(join(tmpDir, '.watch.yml'));
    expect(config.services['web']?.paths).toContain('./src');
    expect(config.debounceMs).toBe(500);
  });
});

describe('DEFAULT_IGNORE_PATTERNS', () => {
  it('contains common development patterns', () => {
    expect(DEFAULT_IGNORE_PATTERNS).toContain('**/node_modules/**');
    expect(DEFAULT_IGNORE_PATTERNS).toContain('**/.git/**');
    expect(DEFAULT_IGNORE_PATTERNS).toContain('**/dist/**');
  });
});
