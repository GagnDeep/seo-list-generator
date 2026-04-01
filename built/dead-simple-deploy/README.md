# @openclaw/dead-simple-deploy

One-command static site deployment to S3-compatible storage with automatic cache headers and CDN invalidation.

[![npm version](https://img.shields.io/npm/v/@openclaw/dead-simple-deploy)](https://www.npmjs.com/package/@openclaw/dead-simple-deploy)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Why?

You've built your static site. Now you need to deploy it. You could:
- Use AWS CLI and configure everything manually
- Use Vercel/Netlify and give up control
- Write 50 lines of CI script and maintain it forever

Or you could just run:

```bash
deploy ./dist --bucket my-bucket --region us-east-1
```

## Features

- 🚀 **One command** — Point at a folder, done
- 🎯 **Smart caching** — Auto-detects hashed files for long cache, HTML for short cache
- ⚡ **Fast** — Concurrent uploads with configurable parallelism
- 🔒 **Safe** — Dry-run mode, skips unchanged files
- 🌐 **CDN Support** — CloudFront invalidation built-in
- 🔌 **Universal** — Works with AWS S3, Cloudflare R2, MinIO, any S3-compatible storage
- 📦 **Zero config** — Uses environment variables, no config files needed

## Installation

```bash
# Global CLI
npm install -g @openclaw/dead-simple-deploy

# Or as a project dependency
npm install @openclaw/dead-simple-deploy
```

## Quick Start

```bash
# Deploy to AWS S3
deploy ./dist --bucket my-bucket --region us-east-1

# Deploy to Cloudflare R2
deploy ./dist --bucket my-bucket --endpoint https://account-id.r2.cloudflarestorage.com

# Dry run (see what would happen)
deploy ./dist --bucket my-bucket --dry-run

# Deploy with prefix
deploy ./dist --bucket my-bucket --prefix v2

# Deploy and delete removed files
deploy ./dist --bucket my-bucket --delete

# Deploy with CloudFront invalidation
deploy ./dist --bucket my-bucket --distribution-id EXXXXXXXXXXXXX
```

## CLI Options

```
Usage: deploy [options] <folder>

Arguments:
  folder                     Path to the folder to deploy

Options:
  -V, --version              Output version number
  -b, --bucket <bucket>      S3 bucket name (required)
  -r, --region <region>      AWS region (default: "us-east-1")
  -e, --endpoint <url>       Custom S3-compatible endpoint
  -p, --prefix <prefix>      Key prefix for all uploaded files
  -d, --distribution-id <id> CloudFront distribution ID
  --dry-run                  Show what would be uploaded without doing it
  --delete                   Delete remote files not present locally
  --concurrency <n>          Maximum concurrent uploads (default: 10)
  -h, --help                 Display help information
```

## Programmatic API

```typescript
import { deploy } from '@openclaw/dead-simple-deploy';

const result = await deploy({
  folder: './dist',
  bucket: 'my-bucket',
  region: 'us-east-1',
  distributionId: 'EXXXXXXXXXXXXX',
}, (event) => {
  if (event.type === 'upload') {
    console.log(`Uploading: ${event.key} (${event.current}/${event.total})`);
  }
});

console.log(`Uploaded ${result.uploaded} files`);
console.log(`Skipped ${result.skipped} files`);
console.log(`Deleted ${result.deleted} files`);
```

### DeployConfig

| Property | Type | Description |
|----------|------|-------------|
| `folder` | `string` | Path to the folder to deploy |
| `bucket` | `string` | S3 bucket name |
| `region` | `string` | AWS region |
| `endpoint` | `string?` | Custom S3-compatible endpoint |
| `accessKeyId` | `string?` | AWS access key (defaults to `AWS_ACCESS_KEY_ID`) |
| `secretAccessKey` | `string?` | AWS secret key (defaults to `AWS_SECRET_ACCESS_KEY`) |
| `sessionToken` | `string?` | AWS session token |
| `distributionId` | `string?` | CloudFront distribution ID for invalidation |
| `prefix` | `string?` | Prefix for all uploaded keys |
| `dryRun` | `boolean?` | Show what would be uploaded |
| `delete` | `boolean?` | Delete remote files not present locally |
| `concurrency` | `number?` | Max concurrent uploads (default: 10) |
| `cacheControl` | `CacheControlConfig?` | Custom cache control headers |

### DeployResult

| Property | Type | Description |
|----------|------|-------------|
| `uploaded` | `number` | Number of files uploaded |
| `deleted` | `number` | Number of files deleted |
| `skipped` | `number` | Number of files skipped (unchanged) |
| `files` | `string[]` | List of uploaded file keys |
| `invalidationId` | `string?` | CloudFront invalidation ID |
| `bytesTransferred` | `number` | Total bytes transferred |

## Cache Headers

The deployer automatically sets optimal cache headers:

| File Type | Cache Control | Example |
|-----------|---------------|---------|
| Hashed files | 1 year, immutable | `app.abc123.js`, `main-def456.css` |
| HTML files | 5 minutes | `index.html`, `about.html` |
| Other files | 1 hour | `styles.css`, `robots.txt` |

## Environment Variables

- `AWS_ACCESS_KEY_ID` — AWS access key
- `AWS_SECRET_ACCESS_KEY` — AWS secret key
- `AWS_SESSION_TOKEN` — AWS session token (optional)
- `AWS_REGION` — Default region

## Common Providers

### AWS S3

```bash
export AWS_ACCESS_KEY_ID=your-key
export AWS_SECRET_ACCESS_KEY=your-secret
deploy ./dist --bucket my-site --region us-east-1
```

### Cloudflare R2

```bash
export AWS_ACCESS_KEY_ID=your-r2-key
export AWS_SECRET_ACCESS_KEY=your-r2-secret
deploy ./dist --bucket my-site --endpoint https://account-id.r2.cloudflarestorage.com
```

### MinIO

```bash
export AWS_ACCESS_KEY_ID=minioadmin
export AWS_SECRET_ACCESS_KEY=minioadmin
deploy ./dist --bucket my-site --endpoint http://localhost:9000
```

## License

MIT
