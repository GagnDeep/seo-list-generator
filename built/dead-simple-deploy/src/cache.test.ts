import { describe, it, expect } from 'vitest';
import { getCacheControl, isHashedFile, isHtmlFile, DEFAULT_CACHE_CONTROL } from '../cache.js';

describe('cache', () => {
  describe('isHashedFile', () => {
    it('should detect hashed files with dots', () => {
      expect(isHashedFile('app.abc123def.js')).toBe(true);
      expect(isHashedFile('main.a1b2c3d4.css')).toBe(true);
      expect(isHashedFile('chunk.1234567890abcdef.js')).toBe(true);
    });

    it('should detect hashed files with dashes', () => {
      expect(isHashedFile('app-abc123def.js')).toBe(true);
      expect(isHashedFile('main-a1b2c3d4.css')).toBe(true);
    });

    it('should detect hashed files with underscores', () => {
      expect(isHashedFile('app_abc123def.js')).toBe(false); // No underscore pattern by default
    });

    it('should not detect non-hashed files', () => {
      expect(isHashedFile('index.html')).toBe(false);
      expect(isHashedFile('styles.css')).toBe(false);
      expect(isHashedFile('app.js')).toBe(false);
      expect(isHashedFile('robots.txt')).toBe(false);
    });

    it('should detect long hashes', () => {
      expect(isHashedFile('app.abc123def456789012345678901234567890.js')).toBe(true);
    });
  });

  describe('isHtmlFile', () => {
    it('should detect HTML files', () => {
      expect(isHtmlFile('index.html')).toBe(true);
      expect(isHtmlFile('about.html')).toBe(true);
      expect(isHtmlFile('page.htm')).toBe(true);
    });

    it('should handle paths with directories', () => {
      expect(isHtmlFile('/path/to/index.html')).toBe(true);
      expect(isHtmlFile('nested/dir/page.htm')).toBe(true);
    });

    it('should not detect non-HTML files', () => {
      expect(isHtmlFile('styles.css')).toBe(false);
      expect(isHtmlFile('app.js')).toBe(false);
      expect(isHtmlFile('image.png')).toBe(false);
    });
  });

  describe('getCacheControl', () => {
    it('should return immutable cache for hashed files', () => {
      const result = getCacheControl('assets/app.abc123.js');
      expect(result).toBe(DEFAULT_CACHE_CONTROL.hashed);
    });

    it('should return short cache for HTML files', () => {
      const result = getCacheControl('index.html');
      expect(result).toBe(DEFAULT_CACHE_CONTROL.html);
    });

    it('should return default cache for other files', () => {
      const result = getCacheControl('styles.css');
      expect(result).toBe(DEFAULT_CACHE_CONTROL.default);
    });

    it('should use custom cache config when provided', () => {
      const result = getCacheControl('styles.css', {
        default: 'public, max-age=7200',
      });
      expect(result).toBe('public, max-age=7200');
    });

    it('should handle nested paths', () => {
      const result = getCacheControl('assets/chunks/main.abc123.js');
      expect(result).toBe(DEFAULT_CACHE_CONTROL.hashed);
    });
  });
});
