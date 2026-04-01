#!/usr/bin/env node

import { Command } from 'commander';
import { deploy } from './deployer.js';
import type { DeployConfig, DeployProgressEvent } from './types.js';

/**
 * Formats file size in human-readable format.
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}

/**
 * Handles progress events and prints to console.
 */
function handleProgress(event: DeployProgressEvent): void {
  switch (event.type) {
    case 'upload':
      process.stdout.write(
        `\r  ↑ ${event.key} (${event.current}/${event.total})`,
      );
      if (event.current === event.total) {
        process.stdout.write('\n');
      }
      break;
    case 'delete':
      console.log(`  ✗ Deleted: ${event.key}`);
      break;
    case 'skip':
      console.log(`  ○ Skipped: ${event.key} (unchanged)`);
      break;
    case 'invalidation':
      console.log(`  ⟳ CloudFront invalidation: ${event.invalidationId}`);
      break;
    case 'error':
      console.error(`  ✖ Error: ${event.error}`);
      break;
  }
}

const program = new Command();

program
  .name('deploy')
  .description(
    'One-command static site deployment to S3-compatible storage',
  )
  .version('1.0.0')
  .argument('<folder>', 'Path to the folder to deploy')
  .requiredOption('-b, --bucket <bucket>', 'S3 bucket name')
  .option('-r, --region <region>', 'AWS region', 'us-east-1')
  .option(
    '-e, --endpoint <url>',
    'Custom S3-compatible endpoint (e.g., Cloudflare R2, MinIO)',
  )
  .option('-p, --prefix <prefix>', 'Key prefix for all uploaded files')
  .option('-d, --distribution-id <id>', 'CloudFront distribution ID')
  .option('--dry-run', 'Show what would be uploaded without actually doing it', false)
  .option('--delete', 'Delete remote files not present locally', false)
  .option(
    '--concurrency <n>',
    'Maximum concurrent uploads',
    '10',
  )
  .action(async (folder: string, options) => {
    const config: DeployConfig = {
      folder,
      bucket: options.bucket,
      region: options.region,
      endpoint: options.endpoint,
      prefix: options.prefix,
      distributionId: options.distributionId,
      dryRun: options.dryRun,
      delete: options.delete,
      concurrency: parseInt(options.concurrency, 10),
    };

    console.log(`\n  🚀 Deploying ${folder} to ${config.bucket}`);
    if (config.endpoint) {
      console.log(`  📡 Endpoint: ${config.endpoint}`);
    }
    if (config.prefix) {
      console.log(`  📁 Prefix: ${config.prefix}`);
    }
    if (config.dryRun) {
      console.log('  🔍 Dry run mode (no changes will be made)');
    }
    console.log('');

    try {
      const result = await deploy(config, handleProgress);

      console.log('');
      console.log('  ✅ Deployment complete!');
      console.log(`     Uploaded: ${result.uploaded} files`);
      console.log(`     Skipped: ${result.skipped} files (unchanged)`);
      if (result.deleted > 0) {
        console.log(`     Deleted: ${result.deleted} files`);
      }
      console.log(`     Transferred: ${formatBytes(result.bytesTransferred)}`);
      if (result.invalidationId) {
        console.log(`     Invalidation: ${result.invalidationId}`);
      }
      console.log('');
    } catch (error) {
      console.error('');
      console.error(
        '  ❌ Deployment failed:',
        error instanceof Error ? error.message : error,
      );
      console.error('');
      process.exit(1);
    }
  });

program.parse();
