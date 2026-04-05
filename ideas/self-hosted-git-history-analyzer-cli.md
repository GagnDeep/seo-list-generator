# Self-Hosted Git History Analyzer CLI

## What It Would Be

A CLI tool that analyzes git repository history to produce actionable insights:
- **Coupling analysis** — Which files change together most often? (reveals hidden module boundaries)
- **Blast radius estimation** — Before changing a file, see how many other files typically co-change with it
- **Hotspot detection** — Which files are changed most frequently (might need refactoring)?
- **Authorship stats** — Who owns which parts of the codebase?
- **Commit clustering** — Groups commits into logical changesets even when git doesn't know about them
- **"Who should review this?"** — Given a diff, suggest the right reviewers based on change history

## Why This Doesn't Exist

Existing git analysis tools are either:
1. **GitHub/GitLab-centric** — require cloud accounts, don't work on local repos
2. **Academic coupling tools** — research prototypes, not developer tools, no CLI
3. **Basic `git log` wrappers** — just pretty-print, no actual analysis

Developers genuinely want to know "if I change this file, what else will likely break?" and there is no fast, local, no-account tool that answers that.

## Market Gap

Every developer on a team >5 people has asked: "who knows about this file?" or "should I refactor this hot spot?" The alternatives are tribal knowledge, painful code review discovery, or just... guessing. This tool serves both individual developers (`git history-analyzer ./src/auth.py`) and CI/CD pipelines (pre-commit blast radius checks).

## Tech Stack

- **Language:** Python (git runs everywhere, Python has mature git libs)
- **Git parsing:** `git2` via PyO3 or `dulwich` for pure Python
- **CLI:** Click or Typer (beautiful CLI, colored output)
- **Visualization:** Rich tables + ASCII graphs for terminal; optional `--json` for CI
- **Optional:** matplotlib for heatmaps if `--html` is requested

## What's Close

- `git-of-theseus` — analyzes commit frequency but not coupling
- `git-quick-stats` — authorship stats only, no coupling
- `grimoire-lab` — too enterprise, needs Elasticsearch
- `coupling-analysis-tooling` — academic, not a usable CLI

## Revenue Model

- **MIT open source** — free for everyone
- **GitHub Action** (`git-history-analyzer-action`) — monetized via GitHub Marketplace (team plans $5-20/seat)
- **Optional:** Cloud version with team dashboards and PR integration (sliding scale)

## Status

[READY]

## Notes

- Core insight: use file co-change frequency as a proxy for coupling (evolutionary coupling vs structural coupling)
- Implementation: parse `git log --name-only`, build co-change matrix, compute Jaccard similarity between files
- Keep it fast: use SQLite for caching analysis results, `--force` to invalidate
