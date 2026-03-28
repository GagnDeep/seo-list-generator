#!/bin/bash
#===========================================================
# SEO LIST GENERATOR — ORCHESTRATOR
# Two-agent system: Topic Discovery + List Generation
#===========================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
AGENTS_DIR="$PROJECT_ROOT/agents"
MEMORY_DIR="$PROJECT_ROOT/memory"
OUTPUT_DIR="$PROJECT_ROOT/outputs/generated_lists"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

#-----------------------------------------------------------
# Phase 1: Topic Discovery
#-----------------------------------------------------------

run_topic_discovery() {
    local niche="$1"
    local max_topics="${2:-10}"
    
    log "Phase 1: Discovering topics for '${niche}'..."
    
    mkdir -p "$MEMORY_DIR"
    
    # Spawn isolated agent for topic research
    local discovery_prompt=$(cat << 'EOF'
You are the Topic Discovery Agent. Conduct deep research for: NICHE_PLACEHOLDER

Follow your SYSTEM.md instructions exactly:
1. Phase 1: Keyword Landscape Scan (5+ searches across different sources)
2. Phase 2: Gap Analysis (evaluate existing lists)
3. Phase 3: Scoring (apply the 5-factor scoring framework)
4. Phase 4: Output (top MAX_TOPICS_PLACEHOLDER topic briefs)

Return your findings as structured markdown. For each topic include:
- Target Keyword
- Secondary Keywords
- Angle (what makes this list different)
- Gap Score (1-10)
- Why Now (timeliness)
- Est. Search Volume
- Competition Level
- Suggested List Length

Save your research log to memory/research_log.md
Save top topics to TOPICS_OUTPUT.md

NICHE_PLACEHOLDER
MAX_TOPICS_PLACEHOLDER
EOF
)
    
    # Replace placeholders
    discovery_prompt="${discovery_prompt//NICHE_PLACEHOLDER/$niche}"
    discovery_prompt="${discovery_prompt//MAX_TOPICS_PLACEHOLDER/$max_topics}"
    
    # Spawn the discovery agent
    cd "$PROJECT_ROOT"
    openclaw agents spawn \
        --name "topic-discovery" \
        --model "minimax/MiniMax-M2.7" \
        --runtime "isolated" \
        --message "$discovery_prompt" \
        2>/dev/null &
    
    local agent_pid=$!
    log "Discovery agent spawned (PID: $agent_pid)"
    log "Waiting for research to complete..."
    
    # Wait for output file with timeout
    local timeout=300  # 5 minutes
    local elapsed=0
    while [ ! -f "$PROJECT_ROOT/TOPICS_OUTPUT.md" ] && [ $elapsed -lt $timeout ]; do
        sleep 10
        elapsed=$((elapsed + 10))
        log "  ... still researching ($elapsed)s"
    done
    
    if [ ! -f "$PROJECT_ROOT/TOPICS_OUTPUT.md" ]; then
        warn "Discovery timed out, checking what we have..."
    fi
    
    if [ -f "$PROJECT_ROOT/TOPICS_OUTPUT.md" ]; then
        success "Topic discovery complete!"
        cat "$PROJECT_ROOT/TOPICS_OUTPUT.md"
        return 0
    else
        error "Discovery failed to produce output"
        return 1
    fi
}

#-----------------------------------------------------------
# Phase 2: List Generation
#-----------------------------------------------------------

run_list_generation() {
    local topic_brief="$1"
    local agent_session="$2"
    
    log "Phase 2: Generating SEO list..."
    
    # Extract topic name from brief for filename
    local topic_name=$(echo "$topic_brief" | grep -i "target keyword" | head -1 | sed 's/.*:\s*//' | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd 'a-z0-9-')
    local slug="${topic_name:-list-$(date +%s)}"
    
    mkdir -p "$OUTPUT_DIR"
    
    # Build the generation prompt
    local generation_prompt=$(cat << 'EOF'
You are the List Generation Agent. Generate an SEO list based on this brief:

TOPIC_BRIEF_PLACEHOLDER

Follow your SYSTEM.md instructions exactly:
1. Research each list item with authoritative sources
2. Build article structure (H1, intro, TL;DR, numbered list, FAQ, conclusion)
3. Use Codex to create the file at: OUTPUT_DIR_PLACEHOLDER/SLUG_PLACEHOLDER.md
4. Include metadata block at top

Quality Requirements:
- 1,500-3,000 words
- 15-30 items (from brief)
- 10+ authoritative sources
- Primary keyword in H1 + first 100 words
- FAQ section with schema-ready questions
- Internal link placeholders

After generation, update memory/list_performance.md with this list's info.
Run: openclaw system event --text "List generation complete: SLUG_PLACEHOLDER" --mode now
EOF
)
    
    generation_prompt="${generation_prompt//TOPIC_BRIEF_PLACEHOLDER/$topic_brief}"
    generation_prompt="${generation_prompt//OUTPUT_DIR_PLACEHOLDER/$OUTPUT_DIR}"
    generation_prompt="${generation_prompt//SLUG_PLACEHOLDER/$slug}"
    
    # Set up tmux session for Codex
    log "Setting up Codex session..."
    tmux new-session -d -s "list-gen" -c "$PROJECT_ROOT" 2>/dev/null || true
    
    # Send the generation command
    log "Sending generation task to Codex..."
    tmux send-keys -t "list-gen" "cd $PROJECT_ROOT && codex --yolo exec '$generation_prompt'" Enter
    
    # Monitor progress
    log "Monitoring Codex generation..."
    local timeout=600  # 10 minutes
    local elapsed=0
    while [ $elapsed -lt $timeout ]; do
        sleep 30
        elapsed=$((elapsed + 30))
        
        local pane_output=$(tmux capture-pane -t "list-gen" -p 2>/dev/null | tail -5)
        echo -e "${BLUE}[$elapsed s]${NC} $pane_output"
        
        # Check if done
        if echo "$pane_output" | grep -qiE "done|complete|error|failed"; then
            break
        fi
    done
    
    # Capture final output
    log "Capturing final output..."
    tmux capture-pane -t "list-gen" -p -S - > "$PROJECT_ROOT/logs/codex_output_$(date +%s).txt" 2>/dev/null || true
    
    # Check if file was created
    local output_file="$OUTPUT_DIR/${slug}.md"
    if [ -f "$output_file" ]; then
        success "List generated: $output_file"
        echo -e "\n${GREEN}=== METADATA ===${NC}"
        head -20 "$output_file"
        return 0
    else
        warn "Output file not found, check logs"
        return 1
    fi
}

#-----------------------------------------------------------
# Main Orchestration
#-----------------------------------------------------------

main() {
    echo -e "${GREEN}"
    echo "=============================================="
    echo "  SEO LIST GENERATOR — ORCHESTRATOR v1.0"
    echo "=============================================="
    echo -e "${NC}"
    
    local niche="${1:-}"
    local max_topics="${2:-10}"
    
    if [ -z "$niche" ]; then
        echo "Usage: $0 <niche/topic> [max_topics]"
        echo "Example: $0 'productivity apps' 10"
        exit 1
    fi
    
    mkdir -p "$PROJECT_ROOT/logs"
    
    log "Starting SEO list generation for: $niche"
    log "Max topics to generate: $max_topics"
    
    # Phase 1: Discovery
    if ! run_topic_discovery "$niche" "$max_topics"; then
        error "Phase 1 (Discovery) failed"
        exit 1
    fi
    
    echo -e "\n${YELLOW}=== SELECT A TOPIC ===${NC}"
    echo "Review the topics above and provide a topic number or paste a specific topic brief"
    echo -n "Your choice: "
    read user_choice
    
    # Phase 2: Generation
    if [ -f "$PROJECT_ROOT/TOPICS_OUTPUT.md" ]; then
        # Extract selected topic (handle numeric selection or direct paste)
        local selected_topic="$user_choice"
        
        log "Generating list for selection..."
        if ! run_list_generation "$selected_topic" "list-gen"; then
            error "Phase 2 (Generation) failed"
            exit 1
        fi
    else
        warn "No topics file found — try a direct topic request"
    fi
    
    success "Orchestration complete!"
    echo -e "\n${GREEN}Output files:${NC}"
    find "$OUTPUT_DIR" -name "*.md" -type f 2>/dev/null | head -10
}

#-----------------------------------------------------------
# Evolution: Update agent guidance based on results
#-----------------------------------------------------------

evolve() {
    # Called when performance data is available
    log "Evolution triggered — updating agent guidance..."
    
    # Read latest performance data
    if [ -f "$MEMORY_DIR/list_performance.md" ]; then
        local recent_lists=$(tail -50 "$MEMORY_DIR/list_performance.md")
        # Analyze what worked and update patterns
        log "Analyzing recent performance data..."
    fi
    
    success "Evolution complete"
}

#-----------------------------------------------------------
# Entry Point
#-----------------------------------------------------------

case "${1:-}" in
    evolve)
        evolve
        ;;
    *)
        main "$@"
        ;;
esac
