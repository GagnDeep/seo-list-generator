# GitHub Activity README

## What It Is
A GitHub Profile README generator that displays real contribution statistics, top repositories, recent activity, and tech stack from actual GitHub data. Generates the markdown snippet you paste into your GitHub profile README. Updates via GitHub Actions or manual trigger.

## Why It Doesn't Exist Well as Open Source
`github-readme-stats` is the most popular but uses unofficial APIs with rate limit issues. `readme-scribe` exists but has limited visualizations. `github-profile-readme-generator` is a web tool, not a CLI. There's no clean CLI tool that generates a beautiful, accurate contribution section with real data.

## Developer Pain Point
Every developer wants an impressive GitHub profile but most README stats tools are either broken, have rate limits, or look generic. This tool uses proper GitHub API with personal access token support and generates beautiful, unique visualizations. Developers would use it to stand out on GitHub.

## Suggested Tech Stack
- Node.js with TypeScript
- `@octokit/rest` for GitHub API
- GitHub Actions for auto-update (weekly cron)
- Markdown generation with custom templates
- SVG generation for charts (using `svgo` or custom)

## What's Close (GitHub repos to reference)
- [github-readme-stats](https://github.com/anuraghazra/github-readme-stats) — most popular, but rate limited and unofficial API
- [readme-scribe](https://github.com/kYLE correa/readme-scribe) — limited visualizations
- [github-profile-readme-generator](https://github.com/rahul-dl/github-profile-readme-generator) — web-based, not a CLI

## What to Build (MVP Scope)
1. `github-activity <username>` — generates markdown snippet
2. Shows: total commits, stars, PRs merged, issues opened (last year)
3. Top 5 starred repositories with descriptions
4. Recent activity feed (commits, PRs, issues)
5. Tech stack extraction from popular repos
6. Multiple theme options (minimal, dark, colorful)
7. Outputs markdown ready to paste into README

## Category
Tool
