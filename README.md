# SEO List Generator — Self-Evolving Multi-Agent System

A two-agent system that researches trending topics and generates SEO-optimized list articles, with built-in self-improvement loops.

## Architecture

```
ORCHESTRATOR (coordinator.sh)
    │
    ├─── TOPIC DISCOVERY AGENT
    │    │  Deep research, keyword analysis, gap detection
    │    │  System: agents/topic_discovery/SYSTEM.md
    │    │  Memory: memory/research_log.md, keyword_patterns.md
    │    │
    │    └──▶ Ranked topic briefs (TOPICS_OUTPUT.md)
    │
    └─── LIST GENERATION AGENT
         │  Codex-powered article generation
         │  System: agents/list_generation/SYSTEM.md
         │  Memory: memory/list_performance.md, content_patterns.md
         │
         └──▶ Published markdown articles (outputs/generated_lists/)
```

## Quick Start

```bash
cd ~/Projects/seo-list-generator

# Run the full pipeline: discover topics then generate
./agents/orchestrator/COORDINATOR.sh "productivity apps" 10

# Or spawn agents directly via OpenClaw
openclaw agents spawn --name topic-discovery --runtime isolated
```

## Agents

### Topic Discovery Agent
**Purpose:** Find the best topics for SEO lists using deep research

**Inputs:**
- Any niche or broad topic
- Desired number of topic candidates

**Process:**
1. Keyword landscape scan (5+ searches)
2. Gap analysis on existing lists
3. 5-factor scoring (volume, competition, recency, uniqueness, list potential)
4. Output structured topic briefs

**Outputs:**
- `TOPICS_OUTPUT.md` — Ranked topic briefs
- `memory/research_log.md` — Session learnings

### List Generation Agent
**Purpose:** Build complete SEO-optimized list articles

**Inputs:**
- Topic brief from discovery agent
- SEO requirements and quality standards

**Process:**
1. Research each list item with authoritative sources
2. Build article structure (H1, intro, TL;DR, numbered list, FAQ, conclusion)
3. Execute via Codex in tmux session
4. Self-validate against quality standards

**Outputs:**
- `outputs/generated_lists/[slug].md` — Complete article
- `memory/list_performance.md` — Generation tracking

## Self-Evolution

The system improves through feedback loops:

1. **Discovery → Performance:** Which topics ranked well?
2. **Generation → Performance:** Which list structures engaged most?
3. **Continuous:** Both agents update guidance based on outcomes

### Evolution Triggers
- When performance data arrives, run: `./agents/orchestrator/COORDINATOR.sh evolve`
- This reads `memory/list_performance.md` and updates `memory/keyword_patterns.md` and `memory/content_patterns.md`

## File Structure

```
seo-list-generator/
├── agents/
│   ├── orchestrator/
│   │   └── COORDINATOR.sh       ← Main orchestration script
│   ├── topic_discovery/
│   │   └── SYSTEM.md            ← Discovery agent's instructions
│   └── list_generation/
│       └── SYSTEM.md            ← Generation agent's instructions
├── outputs/
│   └── generated_lists/         ← Final markdown articles
├── memory/
│   ├── research_log.md          ← Discovery learnings
│   ├── list_performance.md     ← Engagement tracking
│   ├── keyword_patterns.md     ← What makes topics win
│   ├── content_patterns.md     ← What makes lists succeed
│   └── evolution_log.md        ← System improvement log
├── logs/
│   └── agent_runs.json          ← Execution history
└── README.md
```

## Quality Standards

### Topic Discovery
- Minimum gap score: 6.5/10
- 5+ research sources per topic
- Honest uncertainty assessment

### List Generation
| Metric | Target |
|--------|--------|
| Word count | 1,500–3,000 |
| List items | 15–30 |
| External links | 10+ authoritative |
| Primary keyword placement | H1 + first 100 words |
| FAQ section | 5–8 questions |

## Memory Files

| File | Purpose |
|------|---------|
| `research_log.md` | Session-by-session discovery learnings |
| `keyword_patterns.md` | Generalized patterns from winners/losers |
| `list_performance.md` | Generation history + performance data |
| `content_patterns.md` | What works in list structure |
| `evolution_log.md` | Tracking system improvements |

## Requirements

- OpenClaw with agent spawning
- Codex CLI (`codex --yolo exec ...`)
- tmux for session management
- Web search capability (for research)

## Todo

- [ ] Add performance tracking integration (Google Analytics, Search Console)
- [ ] Build topic queue system for batch processing
- [ ] Add image/asset gathering per list item
- [ ] Multi-language support
- [ ] Integration with CMS platforms (WordPress, Ghost)
