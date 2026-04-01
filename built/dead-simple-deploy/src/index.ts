/**
 * @module @openclaw/dead-simple-deploy
 *
 * One-command static site deployment to S3-compatible storage
 * with automatic cache headers and CDN invalidation.
 *
 * @packageDocumentation
 */

export { deploy } from './deployer.js';
export { scanFolder } from './scanner.js';
export { getCacheControl, isHashedFile, isHtmlFile, DEFAULT_CACHE_CONTROL } from './cache.js';
export type {
  DeployConfig,
  DeployResult,
  FileUpload,
  CacheControlConfig,
  ProgressCallback,
  DeployProgressEvent,
} from './types.js';
