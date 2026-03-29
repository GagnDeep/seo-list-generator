# GitHub Repo CLI

## What It Is
A CLI tool that scaffolds a full production-ready GitHub repository in seconds. Feed it a project name and it generates: a proper README.md with badges, CI workflow (GitHub Actions), .gitignore, PR template, issue templates, LICENSE file, and initial commit. Zero configuration required for opinionated defaults.

## Why It Doesn't Exist Well as Open Source
`create-next-app`, `yeoman`, and `generator-github` exist but they're either framework-specific or haven't been updated in years. There's no single tool that scaffolds a complete, CI/CD-ready repo with proper GitHub Actions, PR templates, and issue workflows out of the box. Most developers manually create these files or copy from old projects.

## Developer Pain Point
Starting a new project means creating the same 10 files over and over: `.gitignore`, `LICENSE`, `README`, `.github/workflows/ci.yml`, `PULL_REQUEST_TEMPLATE.md`. This tool eliminates that boilerplate. Developers would clone it and use it daily for every new project.

## Suggested Tech Stack
- Node.js 20+ with TypeScript
- Commander.js for CLI argument parsing
- Mustache or Handlebars for template rendering
- `gh` CLI integration for optional repo creation

## What's Close (GitHub repos to reference)
- [ Yeoman generators](https://github.com/yeoman) — general purpose but dated UI
- [projen](https://github.com/projen/projen) — great for AWS/CDK projects, overkill for simple repos
- [gitignore.io](https://github.com/joeblackbro/gii) — generates .gitignore only, not full repo

## What to Build (MVP Scope)
1. `ghrepo init <name>` — creates full repo structure
2. Interactive mode: prompts for project type (Node, Python, Go, Rust)
3. Generates: README.md, .gitignore, LICENSE, PR template, issue templates, GitHub Actions CI
4. Optional: creates GitHub repo via `gh` CLI and pushes
5. Help output: `--help` with all options documented

## Category
CLI
