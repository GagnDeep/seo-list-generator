import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join, relative, extname } from 'node:path';
import { glob } from 'glob';
import mime from 'mime-types';
import type { FileUpload, CacheControlConfig } from './types.js';
import { getCacheControl } from './cache.js';

/**
 * Options for scanning a folder.
 */
export interface ScanOptions {
  /** Custom cache control configuration */
  cacheControl?: CacheControlConfig;
  /** Prefix to add to all S3 keys */
  prefix?: string;
}

/**
 * Scans a folder and returns file upload information.
 *
 * @param folder - The folder path to scan
 * @param options - Scan options including cache control and prefix
 * @returns Array of file upload information
 *
 * @example
 * ```typescript
 * const files = await scanFolder('./dist');
 * // Returns: [{ localPath: '...', key: 'index.html', contentType: 'text/html', ... }]
 * ```
 */
export async function scanFolder(
  folder: string,
  options: ScanOptions = {},
): Promise<FileUpload[]> {
  const { cacheControl, prefix = '' } = options;

  // Find all files, excluding directories
  const matches = await glob('**/*', {
    cwd: folder,
    nodir: true,
    dot: true,
  });

  const files: FileUpload[] = [];

  for (const match of matches) {
    const localPath = join(folder, match);
    const key = prefix ? `${prefix}/${match}` : match;
    const content = await readFile(localPath);

    files.push({
      localPath,
      key,
      contentType: mime.lookup(extname(match)) || 'application/octet-stream',
      cacheControl: getCacheControl(key, cacheControl),
      size: content.length,
      md5: createHash('md5').update(content).digest('hex'),
    });
  }

  return files.sort((a, b) => a.key.localeCompare(b.key));
}

/**
 * Computes the MD5 hash of a file.
 *
 * @param content - The file content as a Buffer
 * @returns The MD5 hash as a hex string
 *
 * @example
 * ```typescript
 * computeMD5(Buffer.from('hello')); // '5d41402abc4b2a76b9719d911017c592'
 * ```
 */
export function computeMD5(content: Buffer): string {
  return createHash('md5').update(content).digest('hex');
}

/**
 * Gets the relative path from a base folder.
 *
 * @param basePath - The base folder path
 * @param filePath - The file path
 * @returns The relative path
 *
 * @example
 * ```typescript
 * getRelativePath('/app/dist', '/app/dist/index.html'); // 'index.html'
 * ```
 */
export function getRelativePath(basePath: string, filePath: string): string {
  return relative(basePath, filePath);
}
