#!/bin/bash
#===========================================================
# SEO LIST GENERATOR — PER-REPO ORCHESTRATOR
# Creates each SEO list as its own GitHub awesome-list repo
# Built by Codex via tmux
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
)

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
# Phase 1: Research the topic via web searches
#-----------------------------------------------------------

research_topic() {
    local topic="$1"
    local research_file="$PROJECT_ROOT/memory/research_$(date +%s).md"
    
    log "Phase 1: Researching topic: '$topic'"
    mkdir -p "$PROJECT_ROOT/memory"
    
    # Spawn research agent for 5+ web searches
    openclaw agents spawn \
        --name "topic-research-$(date +%s)" \
        --model "minimax/MiniMax-M2.7" \
        --runtime "isolated" \
        --message "Research this SEO topic deeply. Perform 5+ web searches to gather:
1. Current best tools/services in this space
2. Popular existing lists (to differentiate)
3. Search trends and volume indicators
4. Key pain points and use cases
5. Expert recommendations and comparisons

Topic: $topic

Save findings to: $research_file
Format with:
- ## Top Tools/Services (with URLs)
- ## Market Trends
- ## Differentiation Opportunities
- ## Key Search Terms" 2>/dev/null &
    
    local agent_pid=$!
    log "Research agent spawned (PID: $agent_pid)"
    
    # Wait for research with timeout
    local timeout=180
    local elapsed=0
    while [ ! -f "$research_file" ] && [ $elapsed -lt $timeout ]; do
        sleep 10
        elapsed=$((elapsed + 10))
    done
    
    if [ -f "$research_file" ]; then
        success "Research complete: $research_file"
        cat "$research_file"
        echo "$research_file"
        return 0
    else
        warn "Research timed out, continuing anyway"
        echo "$research_file"
        return 1
    fi
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
    
    # Create the Codex prompt with all context
    local codex_prompt=$(cat << PROMPT_EOF
Build a complete SEO-optimized GitHub awesome-list repository for the topic: "$topic"

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
- [Tools & Services](#tools--services)
- [FAQ](#faq)
- [Contributing](#contributing)
- [License](#license)

## TL;DR
[Quick summary - 3-5 bullet points of the best options]

## Why This List
[Brief section on why this matters now - include primary keyword naturally]

## Tools & Services

### [Category 1]
[15-30 items, each with this structure:]

#### [Tool Name](https://tool-url.com)
> **Description:** [80-150 words describing the tool, its use case, and why it's valuable. Include specific features, pricing context if relevant, and what makes it stand out.]

- **Category:** [tag1, tag2]
- **Pricing:** [Free/Paid/Freemium + starting price if applicable]
- **Best for:** [specific use case]

---

#### [Another Tool...]
[repeat for each item...]

### [Category 2]
[more items...]

## FAQ
[5-7 questions targeting long-tail keywords]

### What is [primary keyword topic]?
[Answer with 80-150 words...]

### How do I choose the right [topic] tool?
[Answer...]

### Are there free options for [topic]?
[Answer...]

### How often is this list updated?
[Answer mentioning you'll keep it current...]

## Contributing
[Standard contributing guide - short]

## License
[MIT License - see LICENSE file]
---

## RESEARCH DATA (use this to build accurate items)
$research_content

## REQUIREMENTS
1. Each tool/service MUST have: Name, Description (80-150 words), URL, Category tags
2. Primary keyword MUST appear in first 100 words
3. Include 15-30 items total
4. Every tool MUST have a real, working URL
5. Use semantic headings (H2, H3)
6. Descriptions must be unique - no generic copy-paste
7. Target long-tail keywords in FAQ section
8. Format with Markdown - use tables where appropriate

## OUTPUT
After creating all files, verify the structure:
- README.md with complete content
- LICENSE file with MIT license
- CONTRIBUTING.md file

Run: ls -la
Run: head -50 README.md
Report: DONE with repo URL
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
        if echo "$pane_output" | grep -qiE "DONE|complete|finished|repo url"; then
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
        success "README.md created ($(wc -l < "$temp_dir/README.md") lines)"
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
    
    # Check if gh is authenticated
    if ! gh repo list "$GITHUB_USER" &>/dev/null; then
        error "GitHub CLI not authenticated. Run: gh auth login"
        exit 1
    fi
    
    mkdir -p "$PROJECT_ROOT/logs"
    mkdir -p "$PROJECT_ROOT/outputs"
    
    log "Starting: $topic"
    log "Slug: $slug"
    log "Repo: https://github.com/$GITHUB_USER/awesome-$slug"
    echo ""
    
    # Run phases
    local research_file=$(research_topic "$topic")
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
    echo "==============================================${NC}"
}

#-----------------------------------------------------------
# Entry Point
#-----------------------------------------------------------

main "$@"