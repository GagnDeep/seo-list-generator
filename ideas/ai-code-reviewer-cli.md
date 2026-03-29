# AI Code Reviewer CLI

## What It Is
A CLI tool that reviews pull requests using local LLMs (Ollama). Feed it a PR diff or set of changed files and get an AI-powered code review with issue detection, security vulnerabilities, and suggestions — no data leaves your machine. Integrates with GitHub Actions or runs standalone.

## Why It Doesn't Exist Well as Open Source
`code-review-bot` and similar GitHub Action tools exist but send code to external APIs. `metareview` is interesting but limited. `llm-code-review` hasn't been updated. There's no polished CLI that works offline with Ollama and produces actionable review comments.

## Developer Pain Point
Developers want AI code review but don't want to send proprietary code to third-party APIs. This tool runs locally with Ollama and works on any repo. Developers would install it to get GPT-4 quality review without data privacy concerns.

## Suggested Tech Stack
- Node.js with TypeScript
- Ollama API integration (`http://localhost:11434/api/generate`)
- Commander.js for CLI
- `diff` parsing for multi-file PRs
- Optional: GitHub CLI integration for commenting

## What's Close (GitHub repos to reference)
- [code-review-bot](https://github.com/codereview-bot/code-review-bot) — cloud-only
- [metareview](https://github.com/yourusername/metareview) — limited scope
- [llm-code-review](https://github.com/typon/llm-code-review) — not updated since 2022

## What to Build (MVP Scope)
1. `review-pr <pr-url>` — fetches PR diff via GitHub API and reviews
2. `review-diff <file>` — reviews a local diff file
3. Configurable Ollama model (default: `codellama`)
4. Outputs structured review: files changed, issues found, suggestions
5. Severity levels: CRITICAL, WARNING, SUGGESTION
6. `--github-comment` flag to post review as PR comment
7. Help output with all options

## Category
CLI
