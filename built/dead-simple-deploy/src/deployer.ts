import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from '@aws-sdk/client-cloudfront';
import { readFile } from 'node:fs/promises';
import type {
  DeployConfig,
  DeployResult,
  FileUpload,
  ProgressCallback,
} from './types.js';
import { scanFolder } from './scanner.js';

/**
 * Deploys a folder to S3-compatible storage.
 *
 * @param config - Deployment configuration
 * @param onProgress - Optional progress callback
 * @returns Deployment result with upload/delete/skip counts
 *
 * @example
 * ```typescript
 * const result = await deploy({
 *   folder: './dist',
 *   bucket: 'my-bucket',
 *   region: 'us-east-1',
 * });
 * console.log(`Uploaded ${result.uploaded} files`);
 * ```
 */
export async function deploy(
  config: DeployConfig,
  onProgress?: ProgressCallback,
): Promise<DeployResult> {
  const {
    folder,
    bucket,
    region,
    endpoint,
    accessKeyId,
    secretAccessKey,
    sessionToken,
    distributionId,
    prefix = '',
    dryRun = false,
    delete: shouldDelete = false,
    concurrency = 10,
    cacheControl,
  } = config;

  // Create S3 client
  const s3Client = new S3Client({
    region,
    endpoint,
    credentials: accessKeyId
      ? {
          accessKeyId,
          secretAccessKey: secretAccessKey ?? '',
          sessionToken,
        }
      : undefined,
    forcePathStyle: !!endpoint, // Required for non-AWS endpoints
  });

  // Scan folder for files
  const files = await scanFolder(folder, { cacheControl, prefix });

  if (files.length === 0) {
    return { uploaded: 0, deleted: 0, skipped: 0, files: [], bytesTransferred: 0 };
  }

  const result: DeployResult = {
    uploaded: 0,
    deleted: 0,
    skipped: 0,
    files: [],
    bytesTransferred: 0,
  };

  // Get existing files for comparison and deletion
  const existingKeys = await listExistingKeys(s3Client, bucket, prefix);

  // Process uploads with concurrency control
  const uploadQueue: Promise<void>[] = [];
  let currentIndex = 0;

  for (const file of files) {
    const shouldUpload = await shouldUploadFile(
      s3Client,
      bucket,
      file,
      existingKeys,
    );

    if (!shouldUpload) {
      result.skipped++;
      onProgress?.({
        type: 'skip',
        key: file.key,
        current: ++currentIndex,
        total: files.length,
      });
      continue;
    }

    // Queue upload with concurrency control
    const uploadPromise = uploadFile(s3Client, bucket, file, dryRun).then(
      () => {
        result.uploaded++;
        result.files.push(file.key);
        result.bytesTransferred += file.size;
        onProgress?.({
          type: 'upload',
          key: file.key,
          current: ++currentIndex,
          total: files.length,
        });
      },
    );

    uploadQueue.push(uploadPromise);

    // Wait if we hit concurrency limit
    if (uploadQueue.length >= concurrency) {
      await Promise.race(uploadQueue);
      // Clean up completed promises
      const settled = await Promise.allSettled(uploadQueue);
      uploadQueue.length = 0;
      // Re-add pending promises
      for (const s of settled) {
        if (s.status === 'rejected') {
          throw new Error(`Upload failed: ${s.reason}`);
        }
      }
    }
  }

  // Wait for remaining uploads
  await Promise.all(uploadQueue);

  // Delete extraneous files
  if (shouldDelete) {
    const localKeys = new Set(files.map((f) => f.key));
    const toDelete = existingKeys.filter((key) => !localKeys.has(key));

    for (const key of toDelete) {
      if (!dryRun) {
        await s3Client.send(
          new DeleteObjectCommand({ Bucket: bucket, Key: key }),
        );
      }
      result.deleted++;
      onProgress?.({ type: 'delete', key });
    }
  }

  // CloudFront invalidation
  if (distributionId && !dryRun && result.uploaded > 0) {
    const invalidationId = await invalidateCloudFront(
      region,
      distributionId,
      result.files,
      accessKeyId,
      secretAccessKey,
    );
    result.invalidationId = invalidationId;
    onProgress?.({ type: 'invalidation', invalidationId });
  }

  onProgress?.({ type: 'complete' });

  return result;
}

/**
 * Lists all existing object keys in a bucket with optional prefix.
 *
 * @param s3Client - S3 client instance
 * @param bucket - Bucket name
 * @param prefix - Key prefix filter
 * @returns Array of existing keys
 */
async function listExistingKeys(
  s3Client: S3Client,
  bucket: string,
  prefix: string,
): Promise<string[]> {
  const keys: string[] = [];
  let continuationToken: string | undefined;

  do {
    const response = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix || undefined,
        ContinuationToken: continuationToken,
      }),
    );

    if (response.Contents) {
      for (const obj of response.Contents) {
        if (obj.Key) {
          keys.push(obj.Key);
        }
      }
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return keys;
}

/**
 * Determines if a file should be uploaded based on ETag comparison.
 *
 * @param s3Client - S3 client instance
 * @param bucket - Bucket name
 * @param file - File upload info
 * @param existingKeys - Set of existing keys
 * @returns True if the file should be uploaded
 */
async function shouldUploadFile(
  s3Client: S3Client,
  bucket: string,
  file: FileUpload,
  existingKeys: string[],
): Promise<boolean> {
  if (!existingKeys.includes(file.key)) {
    return true;
  }

  try {
    const headResponse = await s3Client.send(
      new HeadObjectCommand({ Bucket: bucket, Key: file.key }),
    );

    // Compare ETags (S3 ETags are MD5 hashes wrapped in quotes)
    const existingETag = headResponse.ETag?.replace(/"/g, '');
    return existingETag !== file.md5;
  } catch {
    // If HeadObject fails, upload the file
    return true;
  }
}

/**
 * Uploads a single file to S3.
 *
 * @param s3Client - S3 client instance
 * @param bucket - Bucket name
 * @param file - File upload info
 * @param dryRun - If true, don't actually upload
 */
async function uploadFile(
  s3Client: S3Client,
  bucket: string,
  file: FileUpload,
  dryRun: boolean,
): Promise<void> {
  if (dryRun) {
    return;
  }

  const content = await readFile(file.localPath);

  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: file.key,
      Body: content,
      ContentType: file.contentType,
      CacheControl: file.cacheControl,
      ContentMD5: Buffer.from(file.md5, 'hex').toString('base64'),
    }),
  );
}

/**
 * Creates a CloudFront invalidation for the deployed files.
 *
 * @param region - AWS region
 * @param distributionId - CloudFront distribution ID
 * @param keys - Array of S3 keys to invalidate
 * @param accessKeyId - Optional access key
 * @param secretAccessKey - Optional secret key
 * @returns Invalidation ID
 */
async function invalidateCloudFront(
  region: string,
  distributionId: string,
  keys: string[],
  accessKeyId?: string,
  secretAccessKey?: string,
): Promise<string> {
  const cfClient = new CloudFrontClient({
    region,
    credentials: accessKeyId
      ? { accessKeyId, secretAccessKey: secretAccessKey ?? '' }
      : undefined,
  });

  // CloudFront invalidations are limited to 3000 paths per request
  // For simplicity, we invalidate /* which covers everything
  const response = await cfClient.send(
    new CreateInvalidationCommand({
      DistributionId: distributionId,
      InvalidationBatch: {
        Paths: {
          Quantity: 1,
          Items: ['/*'],
        },
        CallerReference: `deploy-${Date.now()}`,
      },
    }),
  );

  return response.Invalidation?.Id ?? 'unknown';
}
