import type { CacheControlConfig } from './types.js';

/**
 * Default cache control configuration.
 * - Hashed files: 1 year, immutable
 * - HTML files: 5 minutes
 * - Other files: 1 hour
 */
export const DEFAULT_CACHE_CONTROL: Required<CacheControlConfig> = {
  hashed: 'public, max-age=31536000, immutable',
  html: 'public, max-age=300, must-revalidate',
  default: 'public, max-age=3600',
};

/**
 * Patterns that indicate a file has content hashes in its name.
 * Matches common bundler patterns like:
 * - app.abc123.js
 * - main-abc123.css
 * - chunk.abc123def456.js
 */
const HASHED_FILE_PATTERNS = [
  /[.-][a-f0-9]{8,64}[.-]/i,
  /[.-][a-f0-9]{8,64}\./i,
  /\.[a-f0-9]{8,64}\./i,
];

/**
 * HTML file extensions that should use short cache TTL.
 */
const HTML_EXTENSIONS = new Set(['.html', '.htm']);

/**
 * Checks if a filename appears to contain a content hash.
 *
 * @param filename - The filename to check
 * @returns True if the filename appears hashed
 *
 * @example
 * ```typescript
 * isHashedFile('app.abc123def.js'); // true
 * isHashedFile('main.css'); // false
 * ```
 */
export function isHashedFile(filename: string): boolean {
  return HASHED_FILE_PATTERNS.some((pattern) => pattern.test(filename));
}

/**
 * Checks if a filename is an HTML file.
 *
 * @param filename - The filename to check
 * @returns True if the file is HTML
 *
 * @example
 * ```typescript
 * isHtmlFile('index.html'); // true
 * isHtmlFile('styles.css'); // false
 * ```
 */
export function isHtmlFile(filename: string): boolean {
  const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase();
  return HTML_EXTENSIONS.has(ext);
}

/**
 * Determines the appropriate cache control header for a file.
 *
 * @param key - The S3 key (file path)
 * @param config - Custom cache control configuration
 * @returns The cache control header value
 *
 * @example
 * ```typescript
 * getCacheControl('app.abc123.js'); // 'public, max-age=31536000, immutable'
 * getCacheControl('index.html'); // 'public, max-age=300, must-revalidate'
 * getCacheControl('styles.css'); // 'public, max-age=3600'
 * ```
 */
export function getCacheControl(
  key: string,
  config: CacheControlConfig = {},
): string {
  const merged = { ...DEFAULT_CACHE_CONTROL, ...config };

  // Extract just the filename for pattern matching
  const filename = key.slice(key.lastIndexOf('/') + 1);

  if (isHtmlFile(filename)) {
    return merged.html;
  }

  if (isHashedFile(filename)) {
    return merged.hashed;
  }

  return merged.default;
}
