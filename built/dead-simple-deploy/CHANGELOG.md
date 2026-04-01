# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-04-01

### Added

- Initial release
- `deploy` CLI command for one-command static site deployment
- Automatic cache headers based on file type (hashed files get immutable, HTML gets short TTL)
- Support for any S3-compatible storage (AWS S3, Cloudflare R2, MinIO)
- CloudFront CDN invalidation support
- Dry-run mode to preview changes
- Concurrent uploads with configurable parallelism
- Smart file comparison to skip unchanged files
- Optional deletion of remote files not present locally
- Key prefix support for versioned deployments
- TypeScript programmatic API with full type definitions
- Progress callback for real-time deployment status

### Features

- `--bucket` - Required S3 bucket name
- `--region` - AWS region (default: us-east-1)
- `--endpoint` - Custom S3-compatible endpoint
- `--prefix` - Key prefix for all files
- `--distribution-id` - CloudFront distribution ID for invalidation
- `--dry-run` - Preview mode without actual uploads
- `--delete` - Remove remote files not in local folder
- `--concurrency` - Max concurrent uploads (default: 10)

### Programmatic API

- `deploy(config, onProgress?)` - Deploy a folder to S3
- `scanFolder(folder, options?)` - Scan folder for upload info
- `getCacheControl(key, config?)` - Get cache control header for a file
- `isHashedFile(filename)` - Check if file has content hash
- `isHtmlFile(filename)` - Check if file is HTML
