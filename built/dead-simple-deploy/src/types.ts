/**
 * Configuration options for deployment.
 */
export interface DeployConfig {
  /** Path to the folder to deploy */
  folder: string;
  /** S3 bucket name */
  bucket: string;
  /** AWS region or custom endpoint region */
  region: string;
  /** Custom S3-compatible endpoint (e.g., Cloudflare R2, MinIO) */
  endpoint?: string;
  /** S3 access key ID (defaults to AWS_ACCESS_KEY_ID env var) */
  accessKeyId?: string;
  /** S3 secret access key (defaults to AWS_SECRET_ACCESS_KEY env var) */
  secretAccessKey?: string;
  /** S3 session token (defaults to AWS_SESSION_TOKEN env var) */
  sessionToken?: string;
  /** CloudFront distribution ID for invalidation */
  distributionId?: string;
  /** Prefix to add to all uploaded keys */
  prefix?: string;
  /** Enable dry run mode (no actual uploads) */
  dryRun?: boolean;
  /** Delete files in bucket that don't exist locally */
  delete?: boolean;
  /** Maximum concurrent uploads */
  concurrency?: number;
  /** Custom cache control for specific file patterns */
  cacheControl?: CacheControlConfig;
  /** ACL setting for uploaded objects */
  acl?: string;
}

/**
 * Cache control configuration for different file types.
 */
export interface CacheControlConfig {
  /** Cache control for hashed files (default: 1 year, immutable) */
  hashed?: string;
  /** Cache control for HTML files (default: 5 minutes) */
  html?: string;
  /** Cache control for other files (default: 1 hour) */
  default?: string;
}

/**
 * Result of a deployment operation.
 */
export interface DeployResult {
  /** Number of files uploaded */
  uploaded: number;
  /** Number of files deleted */
  deleted: number;
  /** Number of files skipped (unchanged) */
  skipped: number;
  /** List of uploaded file keys */
  files: string[];
  /** CloudFront invalidation ID if applicable */
  invalidationId?: string;
  /** Total bytes transferred */
  bytesTransferred: number;
}

/**
 * File upload information.
 */
export interface FileUpload {
  /** Local file path */
  localPath: string;
  /** S3 key (destination) */
  key: string;
  /** MIME type */
  contentType: string;
  /** Cache control header */
  cacheControl: string;
  /** File size in bytes */
  size: number;
  /** MD5 hash of file content */
  md5: string;
}

/**
 * Deployment progress callback.
 */
export type ProgressCallback = (event: DeployProgressEvent) => void;

/**
 * Progress event during deployment.
 */
export interface DeployProgressEvent {
  /** Event type */
  type: 'upload' | 'delete' | 'skip' | 'invalidation' | 'complete' | 'error';
  /** Current file key (for upload/delete/skip events) */
  key?: string;
  /** Current progress number */
  current?: number;
  /** Total files to process */
  total?: number;
  /** Error message if type is 'error' */
  error?: string;
  /** Invalidation ID if type is 'invalidation' */
  invalidationId?: string;
}
