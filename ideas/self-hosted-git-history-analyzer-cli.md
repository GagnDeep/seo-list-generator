# Self-Hosted Git History Analyzer CLI

## What It Would Be

A CLI tool (`git-inspect`) that analyzes git history to answer questions developers actually have: Who broke this file? Which commits introduced performance regressions? What's the true blast radius of this change? Which files change together most often?

```bash
# Find who last touched a line (blame but smarter)
git-inspect blame src/auth.ts --show-email

# Find commits that touched related files (what else changed with this PR?)
git-inspect blast-radius --commit abc123

# Find performance-related commits (large diffs, many files)
git-inspect find-regressions --metric size --since "2 weeks ago"

# Analyze which files always change together (detect hidden coupling)
git-inspect coupling --min-commits 3

# Find the most impactful commits by diff size
git-inspect impact --top 20 --by churn
```

## Why This Doesn't Exist

- `git blame` is line-level, not commit-level
- `git bisect` is for finding WHEN, not WHO or WHY
- No tool answers "which commits touched files that ALSO changed when X changed"
- Coupling analysis exists in expensive SaaS tools (CodeScene, gitential) but not OSS

## Market Gap

- Large codebases (500+ files) have hidden dependencies that aren't visible in dependency graphs
- Onboarding new devs: "what does this file connect to?" — no answer
- Incident postmortems: "which commits in the last sprint touched the auth system?"
- Performance work: finding which commits added the most code churn

## Tech Stack

- **Runtime**: Node.js 20+, TypeScript strict
- **Git integration**: `simple-git` for git operations
- **CLI**: Commander.js with colored output
- **Analysis**: Custom diff parsing, file coupling algorithms
- **Visualization**: ASCII charts for terminal, optional JSON output for CI integration
- **Storage**: Optional SQLite for caching analysis results across runs

## What's Close

- `git-blamer` — basic blame with GitHub API only
- `codescene` — full coupling analysis but SaaS-only, expensive
- `git-of-theseus` — commit count analysis only, not coupling
- `refract` — code coupling but for code structure, not git history

## Revenue Model

- Open source (MIT) — core analysis is free
- **Paid tier**: GitHub/GitLab integration (PR comments with blast radius), Slack notifications on risky commits, team dashboard
- CI/CD integration as a paid add-on

## Status

[READY]
