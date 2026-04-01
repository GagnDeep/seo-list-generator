import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { scanFolder } from '../scanner.js';

describe('scanner', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = join(tmpdir(), `deploy-test-${Date.now()}`);
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  it('should scan a folder with files', async () => {
    await writeFile(join(testDir, 'index.html'), '<html></html>');
    await writeFile(join(testDir, 'styles.css'), 'body {}');

    const files = await scanFolder(testDir);

    expect(files).toHaveLength(2);
    expect(files.find((f) => f.key === 'index.html')).toBeDefined();
    expect(files.find((f) => f.key === 'styles.css')).toBeDefined();
  });

  it('should detect correct content types', async () => {
    await writeFile(join(testDir, 'index.html'), '<html></html>');
    await writeFile(join(testDir, 'styles.css'), 'body {}');
    await writeFile(join(testDir, 'app.js'), 'console.log("hi")');
    await writeFile(join(testDir, 'image.png'), 'PNG');

    const files = await scanFolder(testDir);

    const html = files.find((f) => f.key === 'index.html');
    const css = files.find((f) => f.key === 'styles.css');
    const js = files.find((f) => f.key === 'app.js');
    const png = files.find((f) => f.key === 'image.png');

    expect(html?.contentType).toBe('text/html');
    expect(css?.contentType).toBe('text/css');
    expect(js?.contentType).toBe('application/javascript');
    expect(png?.contentType).toBe('image/png');
  });

  it('should handle nested directories', async () => {
    await mkdir(join(testDir, 'assets'), { recursive: true });
    await writeFile(join(testDir, 'assets', 'main.js'), 'code');

    const files = await scanFolder(testDir);

    expect(files).toHaveLength(1);
    expect(files[0].key).toBe('assets/main.js');
  });

  it('should add prefix to keys', async () => {
    await writeFile(join(testDir, 'index.html'), '<html></html>');

    const files = await scanFolder(testDir, { prefix: 'v2' });

    expect(files[0].key).toBe('v2/index.html');
  });

  it('should compute MD5 hashes', async () => {
    await writeFile(join(testDir, 'test.txt'), 'hello world');

    const files = await scanFolder(testDir);

    expect(files[0].md5).toMatch(/^[a-f0-9]{32}$/);
  });

  it('should return empty array for empty folder', async () => {
    const files = await scanFolder(testDir);

    expect(files).toEqual([]);
  });

  it('should apply correct cache control for hashed files', async () => {
    await writeFile(join(testDir, 'app.abc123def.js'), 'code');

    const files = await scanFolder(testDir);

    expect(files[0].cacheControl).toContain('immutable');
  });

  it('should apply correct cache control for HTML files', async () => {
    await writeFile(join(testDir, 'index.html'), '<html></html>');

    const files = await scanFolder(testDir);

    expect(files[0].cacheControl).toContain('300');
  });
});
