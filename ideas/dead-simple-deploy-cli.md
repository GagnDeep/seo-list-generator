# Dead Simple Deploy CLI

## What It Is
A self-hosted one-command deployment CLI for static sites. Point it at a dist folder, run `deploy`, and it pushes to your own S3-compatible storage (AWS S3, Cloudflare R2, MinIO) with proper cache headers and instant invalidation. Vercel/Netlify experience, self-hosted freedom.

## Why It Doesn't Exist Well as Open Source
`aws-cli` can do it but requires manual bucket configuration and doesn't handle cache invalidation. `netlify-cli` and `vercel-cli` are closed-source and tied to their platforms. `s3-deploy` is abandonware. There's no clean, self-hosted tool that just deploys a folder to any S3-compatible endpoint with zero config.

## Developer Pain Point
Developers want Vercel's one-command deployment experience but need to self-host for cost, privacy, or compliance reasons. This tool gives you `deploy` and done. Developers would install it to replace 50 lines of CI script with a single command.

## Suggested Tech Stack
- Node.js with TypeScript
- `@aws-sdk/client-s3` for S3-compatible storage
- `@aws-sdk/client-cloudfront` for AWS CloudFront invalidation (optional)
- Commander.js for CLI
- Environment variables for credentials (no config files needed)

## What's Close (GitHub repos to reference)
- [aws-cli](https://github.com/aws/aws-cli) — powerful but verbose, not a deploy tool
- [s3-deploy](https://github.com/jubqanski/s3-deploy) — abandonware, no CloudFront support
- [static-deploy](https://github.com/static-deploy/static-deploy) — unclear status, complex setup

## What to Build (MVP Scope)
1. `deploy <folder> --bucket <bucket> --region <region>`
2. Auto-detects index.html and sets Content-Type headers correctly
3. Sets cache headers (immutable for hashed files, short TTL for HTML)
4. CloudFront/invalidation support via flag
5. Dry-run mode (`--dry-run`)
6. Help output with all options

## Category
CLI
