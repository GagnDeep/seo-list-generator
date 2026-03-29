#!/bin/bash
#===========================================================
# SEO LIST GENERATOR — PER-REPO ORCHESTRATOR
# Creates each SEO list as its own GitHub awesome-list repo
# Built by Codex via tmux
# VERSION 2.0 - Enhanced with verification and gap detection
#===========================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
GITHUB_USER="GagnDeep"
CODEX_SESSION="codex-seo-gen"
CODEX_PROMPT_FILE="$PROJECT_ROOT/.codex/prompt.txt"

# Topics already taken (don't use these)
TAKEN_TOPICS=(
    "awesome-open-source-saas-alternatives-2026"
    "awesome-self-hostable-ai-tools"
    "best-ai-coding-tools-solo-developers-2026"
    "best-ai-tools-newsletter-writers-2026"
    "best-free-ai-tools-professionals-2026"
    "best-webhook-tools-developers-2026"
    "awesome-best-ai-tools-for-freelancers-2026"
    "awesome-best-ai-tools-for-fitness-trainers-2026"
)

# Minimum tool requirements
MIN_TOOLS=25
PREFERRED_TOOLS=50

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

#-----------------------------------------------------------
# Helper Functions
#-----------------------------------------------------------

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[!]${NC} $1"
}

error() {
    echo -e "${RED}[✗]${NC} $1"
}

slugify() {
    # Convert topic to slug: lowercase, spaces to dashes, remove special chars
    echo "$1" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd 'a-z0-9-'
}

is_topic_taken() {
    local slug="$1"
    for taken in "${TAKEN_TOPICS[@]}"; do
        if [[ "$slug" == "$taken" ]]; then
            return 0
        fi
    done
    return 1
}

#-----------------------------------------------------------
# Phase 0: Pre-flight checks
#-----------------------------------------------------------

preflight_checks() {
    log "Phase 0: Running pre-flight checks..."
    
    # Check gh CLI
    if ! command -v gh &> /dev/null; then
        error "gh CLI not installed. Please install from https://cli.github.com"
        exit 1
    fi
    
    # Check gh auth
    if ! gh auth status &>/dev/null; then
        error "GitHub CLI not authenticated. Run: gh auth login"
        exit 1
    fi
    
    # Check jq
    if ! command -v jq &> /dev/null; then
        error "jq not installed. Please install jq"
        exit 1
    fi
    
    # Check tmux
    if ! command -v tmux &> /dev/null; then
        error "tmux not installed. Please install tmux"
        exit 1
    fi
    
    # Check codex
    if ! command -v codex &> /dev/null; then
        warn "codex not found in PATH. Will try to use openclaw or warn user"
    fi
    
    success "Pre-flight checks passed"
    mkdir -p "$PROJECT_ROOT/logs"
    mkdir -p "$PROJECT_ROOT/memory"
    mkdir -p "$PROJECT_ROOT/ideas"
}

#-----------------------------------------------------------
# Phase 1: Research with enhanced gap detection
#-----------------------------------------------------------

research_topic() {
    local topic="$1"
    local research_file="$PROJECT_ROOT/memory/research_$(date +%s).md"
    local category_counts_file="$PROJECT_ROOT/memory/category_counts_$(date +%s).txt"
    
    log "Phase 1: Researching topic (GitHub-focused): '$topic'"
    
    # Define search queries - minimum 5, each returning 50 repos
    local search_queries=(
        "open source $topic"
        "self-hosted $topic"
        "free $topic github"
        "$topic MIT license"
        "$topic API"
        "$topic database"
        "$topic alternative"
    )
    
    {
        echo "# GitHub Repository Research for: $topic"
        echo "Generated: $(date)"
        echo ""
        echo "## GitHub Search Commands Used"
        echo ""
    } > "$research_file"
    
    declare -A category_tools
    local total_repos=0
    
    # Run gh search commands to find repos
    for query in "${search_queries[@]}"; do
        log "Searching: $query"
        echo "### Query: $query" >> "$research_file"
        echo "" >> "$research_file"
        
        # Search for repos with gh CLI
        local results=$(gh search repos "$query" --stars ">20" --limit 50 --json name,url,description,stars,primaryLanguage,license 2>/dev/null)
        
        if [ -n "$results" ] && [ "$results" != "[]" ]; then
            echo "$results" | jq -r '.[] | "- **[\(.name)](\(.url))** (⭐ \(.stars // 0) | \(.primaryLanguage // "N/A") | \(.license // "N/A"))"' >> "$research_file" 2>/dev/null || true
            local count=$(echo "$results" | jq '. | length' 2>/dev/null || echo "0")
            echo "  Found: $count repos" >> "$research_file"
            total_repos=$((total_repos + count))
        else
            echo "  (No results found)" >> "$research_file"
        fi
        
        echo "" >> "$research_file"
        
        # Log to memory
        echo "$(date +%Y-%m-%d_%H:%M:%S) | $query | $total_repos" >> "$PROJECT_ROOT/memory/gh_search_log.txt"
    done
    
    # Also perform web searches for additional context
    log "Performing web searches for additional context..."
    {
        echo "## Web Search Results"
        echo ""
    } >> "$research_file"
    
    web_search "site:github.com \"$topic\" open source" 2>/dev/null | head -20 >> "$research_file" || true
    
    # Detect gaps: categories with fewer than 5 repos
    log "Detecting gaps in the research..."
    {
        echo "## Gap Analysis"
        echo ""
        echo "Categories with fewer than 5 tools represent opportunities:"
        echo ""
    } >> "$research_file"
    
    # Calculate category distribution (simplified)
    if [ $total_repos -lt $MIN_TOOLS ]; then
        warn "Found only $total_repos repos (minimum: $MIN_TOOLS)"
        echo "WARNING: Low repo count for topic '$topic'. Consider broadening search." >> "$research_file"
    fi
    
    success "Research complete: $research_file"
    success "Total repos found: $total_repos"
    
    # Store for later verification
    echo "TOTAL_REPOS=$total_repos" > "$PROJECT_ROOT/memory/research_stats.txt"
    
    cat "$research_file"
    echo "$research_file"
    return 0
}

#-----------------------------------------------------------
# Phase 1b: Verify tools meet minimum requirements
#-----------------------------------------------------------

verify_tools() {
    local research_file="$1"
    
    log "Phase 1b: Verifying tools meet requirements..."
    
    # Count verified repos from research
    local verified_count=$(grep -c "github.com" "$research_file" 2>/dev/null || echo "0")
    
    if [ "$verified_count" -lt $MIN_TOOLS ]; then
        error "Only $verified_count tools verified (minimum: $MIN_TOOLS)"
        error "Please broaden your search or try a different topic"
        return 1
    fi
    
    success "Verified $verified_count tools meet minimum requirements"
    
    if [ "$verified_count" -ge $PREFERRED_TOOLS ]; then
        success "Target of $PREFERRED_TOOLS tools exceeded!"
    fi
    
    return 0
}

#-----------------------------------------------------------
# Phase 1c: Auto-generate idea files for gaps
#-----------------------------------------------------------

generate_gap_ideas() {
    local topic="$1"
    
    log "Phase 1c: Generating idea files for discovered gaps..."
    
    # Check if ideas folder exists
    mkdir -p "$PROJECT_ROOT/ideas"
    
    # Detect common gap patterns and create idea files
    local slug=$(slugify "$topic")
    local idea_file="$PROJECT_ROOT/ideas/${slug}-opportunity.md"
    
    # If topic is fitness-related, note fitness gaps
    if [[ "$topic" == *"fitness"* ]] || [[ "$topic" == *"workout"* ]]; then
        if [ ! -f "$PROJECT_ROOT/ideas/ai-workout-generator-open-source.md" ]; then
            cat > "$PROJECT_ROOT/ideas/ai-workout-generator-open-source.md" << 'IDEAEOF'
# AI Workout Generator Open Source

## What It Would Be
An AI-powered workout generator that creates personalized training programs based on client goals, available equipment, fitness level, and injury history.

## Why This Doesn't Exist as Open Source
Building a genuinely useful workout AI needs large datasets of programming knowledge that don't exist in open source form.

## Market Gap
Personal trainers spend 2-4 hours per week writing programs manually. A capable open source alternative could capture trainers who want customization and data ownership.

## Suggested Tech Stack
- Python (ML), TypeScript (frontend)
- Next.js for admin dashboard, FastAPI for backend
- PyTorch for workout generation model

## Revenue Model
- Community-sponsored development
- Premium training datasets as paid add-ons
- Hosted SaaS version for trainers
IDEAEOF
            success "Created idea file: ai-workout-generator-open-source.md"
        fi
    fi
    
    # If topic is freelancer-related, note freelancer gaps
    if [[ "$topic" == *"freelancer"* ]] || [[ "$topic" == *"freelance"* ]]; then
        if [ ! -f "$PROJECT_ROOT/ideas/ai-client-management-open-source.md" ]; then
            cat > "$PROJECT_ROOT/ideas/ai-client-management-open-source.md" << 'IDEAEOF'
# AI Client Management Open Source

## What It Would Be
A self-hosted CRM specifically designed for freelancers with AI-powered insights, automatic email parsing, and project tracking.

## Why This Doesn't Exist as Open Source
True AI-powered CRMs don't exist in open source because the AI components require ongoing API costs.

## Market Gap
60+ million freelancers globally need better client management tools. A self-hosted solution with AI generation could command significant market share.

## Suggested Tech Stack
- TypeScript/Node.js (backend), React (frontend)
- LangChain for orchestration, Ollama or OpenAI for LLM
- PostgreSQL with pgvector for semantic search

## Revenue Model
- Community funding
- Premium AI processing for self-hosted installs
- Hosted SaaS version with included AI credits
IDEAEOF
            success "Created idea file: ai-client-management-open-source.md"
        fi
    fi
    
    success "Gap analysis complete"
}

#-----------------------------------------------------------
# Phase 2: Create temp dir and initialize repo structure
#-----------------------------------------------------------

create_repo_structure() {
    local topic="$1"
    local slug=$(slugify "$topic")
    local temp_dir="/tmp/awesome-$slug-$$"
    
    log "Phase 2: Creating repo structure for '$slug'"
    
    # Create temp directory
    mkdir -p "$temp_dir"
    cd "$temp_dir"
    
    # Initialize git
    git init
    git config user.name "SEO List Generator"
    git config user.email "agent@openclaw.local"
    
    # Create basic structure (Codex will fill in content)
    touch README.md
    touch LICENSE
    touch CONTRIBUTING.md
    
    echo "$temp_dir"
    return 0
}

#-----------------------------------------------------------
# Phase 3: Build content via Codex
#-----------------------------------------------------------

build_with_codex() {
    local topic="$1"
    local temp_dir="$2"
    local slug=$(slugify "$topic")
    
    log "Phase 3: Building content with Codex..."
    
    # Read research file (most recent one)
    local research_file=$(ls -t "$PROJECT_ROOT/memory"/research_*.md 2>/dev/null | head -1)
    local research_content=""
    if [ -n "$research_file" ] && [ -f "$research_file" ]; then
        research_content=$(cat "$research_file")
    fi
    
    # Check total repos found
    local total_repos=0
    if [ -f "$PROJECT_ROOT/memory/research_stats.txt" ]; then
        source "$PROJECT_ROOT/memory/research_stats.txt"
    fi
    
    # Create the Codex prompt with all context
    local codex_prompt=$(cat << PROMPT_EOF
Build a complete SEO-optimized GitHub awesome-list repository for: "$topic"

## CRITICAL CONSTRAINTS
- EVERY tool MUST have a github.com URL
- NO proprietary SaaS tools (Stripe, Calendly Pro, Notion cloud, etc.)
- ONLY include tools that exist as public GitHub repositories
- Minimum $MIN_TOOLS verified tools required ($PREFERRED_TOOLS+ preferred)
- If a category has fewer than 5 repos, document it honestly as a gap

## REPOSITORY COUNT TARGET
Minimum: $MIN_TOOLS verified tools
Preferred: $PREFERRED_TOOLS+ tools
Currently found: $total_repos repos (expand research if needed)

## YOUR TASK
Create a professional, complete awesome-list repo with:
- README.md (main content - see format below)
- LICENSE (MIT)
- CONTRIBUTING.md

## REPO STRUCTURE
Work in this directory: $temp_dir
The repo name should be: awesome-$slug
GitHub URL will be: https://github.com/$GITHUB_USER/awesome-$slug

## README.md FORMAT (MUST FOLLOW EXACTLY)

---
title: "$topic"
description: "[150-160 char description for SEO - make it compelling and keyword-rich]"
icon: 📋
category: [pick best category]
---

# [H1 Title - Primary Keyword]

[![Awesome](https://cdn.jsdelivr.net/gh/sindresorhus/awesome@main/media/badge.svg)](https://github.com/sindresorhus/awesome)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![Topics](https://img.shields.io/github/stars/$GITHUB_USER/awesome-$slug?style=social)

> [Compelling intro - 2-3 sentences, primary keyword in first 100 words]

## Table of Contents
- [TL;DR](#tldr)
- [Why This List](#why-this-list)
- [Open Source Tools](#open-source-tools)
- [FAQ](#faq)
- [Contributing](#contributing)
- [License](#license)

## TL;DR
[Quick summary - 3-5 bullet points of the best open source options]

## Why This List
[Brief section on why open source tools matter for this use case - include primary keyword naturally]

## Open Source Tools

### [Category 1]
[15-30 items if possible, each with this structure:]

#### [Tool Name](https://github.com/username/repo)
> **Description:** [80-150 words from the GitHub README - what it does, key features, how it's licensed. MUST include: last commit date, stars count, primary language, license type from GitHub.]

- **GitHub:** [github.com/username/repo](https://github.com/username/repo)
- **Stars:** [number] ⭐
- **Language:** [primary language]
- **License:** [MIT/Apache/GPL/etc from GitHub]
- **Last Commit:** [date]
- **Category:** [tag1, tag2]
- **Best for:** [specific use case]

---

### [Category 2]
[more items...]

## FAQ
[5-7 questions targeting long-tail keywords]

## GitHub Search Queries Used
[Include the actual gh search commands used to find these tools]

## Contributing
[Standard contributing guide - must require GitHub repo URL for submissions]

## License
[MIT License - see LICENSE file]
---

## RESEARCH DATA (use this to build accurate items)
$research_content

## REQUIREMENTS
1. EVERY tool MUST have a github.com URL (no exceptions)
2. Include stars count, primary language, license from GitHub
3. Primary keyword MUST appear in first 100 words
4. Include $MIN_TOOLS+ items total ($PREFERRED_TOOLS+ preferred)
5. Use semantic headings (H2, H3)
6. Descriptions must be from actual GitHub READMEs - unique and specific
7. Target long-tail keywords in FAQ section
8. Format with Markdown - use tables where appropriate
9. Include the GitHub search queries used to find these tools

## OUTPUT
After creating all files, verify the structure:
- README.md with complete content (minimum $MIN_TOOLS tools)
- LICENSE file with MIT license
- CONTRIBUTING.md file

Run: ls -la
Run: wc -l README.md
Count the tools in your README and verify you have $MIN_TOOLS+ entries
Report: DONE with repo URL and tool count
PROMPT_EOF
)
    
    # Kill existing session if running
    tmux kill-session -t "$CODEX_SESSION" 2>/dev/null || true
    
    # Create new tmux session
    log "Creating Codex tmux session: $CODEX_SESSION"
    tmux new-session -d -s "$CODEX_SESSION" -c "$temp_dir"
    
    # Send prompt to Codex
    log "Sending build task to Codex..."
    tmux send-keys -t "$CODEX_SESSION" "cd $temp_dir && codex --yolo exec '$codex_prompt'" Enter
    
    # Monitor Codex progress
    log "Monitoring Codex build (this may take 5-10 minutes)..."
    local timeout=600
    local elapsed=0
    local last_output=""
    
    while [ $elapsed -lt $timeout ]; do
        sleep 30
        elapsed=$((elapsed + 30))
        
        # Get latest output
        local pane_output=$(tmux capture-pane -t "$CODEX_SESSION" -p 2>/dev/null | tail -10)
        
        if [ "$pane_output" != "$last_output" ]; then
            echo -e "${CYAN}[$elapsed s]${NC} $pane_output"
            last_output="$pane_output"
        fi
        
        # Check for completion markers
        if echo "$pane_output" | grep -qiE "DONE|complete|finished|repo url|tool count"; then
            success "Codex appears to have finished"
            break
        fi
        
        # Check for errors
        if echo "$pane_output" | grep -qiE "error|failed|exception"; then
            warn "Possible error detected, checking..."
        fi
    done
    
    # Give a moment for final writes
    sleep 5
    
    # Capture final output
    log "Capturing final Codex output..."
    tmux capture-pane -t "$CODEX_SESSION" -p -S - > "$PROJECT_ROOT/logs/codex_build_$(date +%s).log" 2>/dev/null || true
    
    # Check what was created
    log "Checking created files..."
    ls -la "$temp_dir/"
    
    if [ -f "$temp_dir/README.md" ]; then
        local lines=$(wc -l < "$temp_dir/README.md")
        local tools=$(grep -c "github.com" "$temp_dir/README.md" 2>/dev/null || echo "0")
        success "README.md created ($lines lines, $tools tools found)"
        
        if [ "$tools" -lt $MIN_TOOLS ]; then
            warn "Only $tools tools found (minimum: $MIN_TOOLS). Consider expanding research."
        fi
    else
        error "README.md not found!"
    fi
}

#-----------------------------------------------------------
# Phase 4: Create GitHub repo and push
#-----------------------------------------------------------

create_github_repo() {
    local topic="$1"
    local temp_dir="$2"
    local slug=$(slugify "$topic")
    local repo_name="awesome-$slug"
    
    log "Phase 4: Creating GitHub repo: $repo_name"
    
    cd "$temp_dir"
    
    # Stage all files
    git add -A
    git commit -m "Initial commit: $topic awesome list"
    
    # Create GitHub repo (public)
    if gh repo create "$repo_name" --public --source=. --push 2>&1; then
        success "GitHub repo created and pushed!"
        echo "https://github.com/$GITHUB_USER/$repo_name"
        return 0
    else
        error "Failed to create GitHub repo"
        return 1
    fi
}

#-----------------------------------------------------------
# Phase 5: Commit aggregator update
#-----------------------------------------------------------

commit_aggregator_update() {
    local topic="$1"
    local slug=$(slugify "$topic")
    
    log "Phase 5: Committing aggregator update..."
    
    cd "$PROJECT_ROOT"
    
    # Update topics list
    if [ -f "$PROJECT_ROOT/outputs/topics-generated.md" ]; then
        echo "- $(date +%Y-%m-%d): $topic (https://github.com/$GITHUB_USER/awesome-$slug)" >> "$PROJECT_ROOT/outputs/topics-generated.md"
    else
        echo "# Generated SEO Lists" > "$PROJECT_ROOT/outputs/topics-generated.md"
        echo "" >> "$PROJECT_ROOT/outputs/topics-generated.md"
        echo "- $(date +%Y-%m-%d): $topic (https://github.com/$GITHUB_USER/awesome-$slug)" >> "$PROJECT_ROOT/outputs/topics-generated.md"
    fi
    
    git add outputs/topics-generated.md 2>/dev/null || true
    git commit -m "docs: add $topic to generated lists" 2>/dev/null || true
    git push 2>/dev/null || true
    
    success "Aggregator updated"
}

#-----------------------------------------------------------
# Phase 6: Cleanup
#-----------------------------------------------------------

cleanup() {
    local temp_dir="$1"
    local slug="$2"
    
    log "Phase 6: Cleaning up temp directory..."
    
    if [ -d "$temp_dir" ]; then
        rm -rf "$temp_dir"
        success "Cleaned up: $temp_dir"
    fi
    
    # Kill Codex session
    tmux kill-session -t "$CODEX_SESSION" 2>/dev/null || true
}

#-----------------------------------------------------------
# Main Orchestration
#-----------------------------------------------------------

main() {
    local topic="$1"
    
    echo -e "${GREEN}"
    echo "=============================================="
    echo "  SEO LIST GENERATOR — PER-REPO MODE"
    echo "  Each list → its own GitHub repo"
    echo "  OPEN SOURCE GITHUB-ONLY FOCUS"
    echo "  MINIMUM: $MIN_TOOLS TOOLS | PREFERRED: $PREFERRED_TOOLS+"
    echo "=============================================="
    echo -e "${NC}"
    
    if [ -z "$topic" ]; then
        echo "Usage: $0 \"<topic name>\""
        echo ""
        echo "Example: $0 \"best-ai-tools-for-freelancers-2026\""
        echo ""
        echo "Topics already taken:"
        printf "  - %s\n" "${TAKEN_TOPICS[@]}"
        exit 1
    fi
    
    local slug=$(slugify "$topic")
    
    # Check if topic is taken
    if is_topic_taken "$slug"; then
        error "Topic '$slug' is already taken!"
        echo "Choose a different topic. Already taken:"
        printf "  - %s\n" "${TAKEN_TOPICS[@]}"
        exit 1
    fi
    
    # Run preflight checks
    preflight_checks
    
    mkdir -p "$PROJECT_ROOT/logs"
    mkdir -p "$PROJECT_ROOT/outputs"
    
    log "Starting: $topic"
    log "Slug: $slug"
    log "Repo: https://github.com/$GITHUB_USER/awesome-$slug"
    log "Minimum tools required: $MIN_TOOLS (preferred: $PREFERRED_TOOLS)"
    echo ""
    
    # Run phases
    local research_file=$(research_topic "$topic")
    
    # Verify tools before proceeding
    if ! verify_tools "$research_file"; then
        error "Verification failed. Not enough tools found for '$topic'"
        error "Try a broader topic or different search terms"
        exit 1
    fi
    
    # Generate idea files for gaps
    generate_gap_ideas "$topic"
    
    local temp_dir=$(create_repo_structure "$topic")
    build_with_codex "$topic" "$temp_dir"
    
    local repo_url=""
    if create_github_repo "$topic" "$temp_dir"; then
        repo_url="https://github.com/$GITHUB_USER/awesome-$slug"
    fi
    
    commit_aggregator_update "$topic"
    cleanup "$temp_dir" "$slug"
    
    echo ""
    echo -e "${GREEN}=============================================="
    echo "  COMPLETE!"
    echo "  Repo: $repo_url"
    echo "  Ideas: $PROJECT_ROOT/ideas/"
    echo "==============================================${NC}"
}

#-----------------------------------------------------------
# Entry Point
#-----------------------------------------------------------

main "$@"
