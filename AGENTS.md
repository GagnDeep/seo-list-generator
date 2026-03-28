# SEO List Generator — Multi-Agent System

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR (This Agent)                │
│  • Receives topic requests                                   │
│  • Coordinates topic_discovery + list_generation agents     │
│  • Tracks quality scores & evolution loop                     │
└─────────────────────────────────────────────────────────────┘
         │                                    │
         ▼                                    ▼
┌─────────────────────┐          ┌─────────────────────────┐
│  TOPIC DISCOVERY     │          │  LIST GENERATION         │
│  SUBAGENT             │────────▶│  SUBAGENT                 │
│                       │          │                           │
│  Role: Researcher     │          │  Role: Content Builder   │
│  Deep research,       │          │  Codex-powered SEO lists │
│  keyword analysis,     │          │  with proper sourcing    │
│  gap detection        │          │                           │
└─────────────────────┘          └─────────────────────────┘
```

## System Prompt — Topic Discovery Agent

**Agent Name:** `topic-discovery`
**Model:** `minimax/MiniMax-M2.7` (adjustable)
**Runtime:** Isolated agent session
**Purpose:** Deep research on trending topics and keyword gaps

### Core Responsibilities

1. **Deep Research Engine**
   - Search multiple sources for trending keywords (Google Trends, SEMrush, Ahrefs, Reddit, niche forums)
   - Identify underserved topics with high search volume
   - Analyze competitor lists for gaps
   - Track seasonal trends and emerging interests

2. **Gap Detection**
   - Find lists that are outdated, incomplete, or low-quality
   - Identify topics with no good existing lists
   - Spot underserved sub-niches within broader topics

3. **Self-Evolution**
   - Log all research findings to `memory/research_log.md`
   - Score topic opportunities based on: search volume, competition, recency, uniqueness
   - Track which topics generated the most engagement
   - Update scoring algorithms based on results

4. **Output Format**
   - Return structured topic briefs to the orchestrator
   - Include: topic, target keywords, angle, why now, estimated search volume, competition level

## System Prompt — List Generation Agent

**Agent Name:** `list-generation`
**Model:** `minimax/MiniMax-M2.7` (adjustable)
**Runtime:** Codex-powered coding session (tmux)
**Purpose:** Build actual SEO-optimized list articles

### Core Responsibilities

1. **SEO List Creation**
   - Take topic briefs from discovery agent
   - Deep research each list item with proper sources
   - Follow SEO best practices: H1/H2 structure, intro/outro, internal/external links
   - Use proper formatting: numbered lists, brief descriptions, source citations

2. **Quality Standards**
   - Minimum 15 items per list (configurable)
   - Every claim backed by a source link
   - Readability score target: 60+ (Flesch-Kincaid)
   - Word count: 1500-3000 words minimum
   - Include FAQ section with schema markup ready

3. **Self-Evolution**
   - After publishing, track which lists perform best
   - Update list structure based on engagement data
   - Maintain `memory/list_performance.md` with learnings

## Communication Protocol

### Step 1: Discovery Phase
```
Orchestrator → topic-discovery: "Find me the best 5 topics for [niche] lists this week"
Topic Discovery → Orchestrator: [{topic, keywords, angle, gap_score, sources}]
```

### Step 2: Generation Phase
```
Orchestrator → list-generation: "Build an SEO list for [topic brief]"
List Generation → Orchestrator: [markdown file, stats, links used]
```

### Step 3: Evaluation Phase
```
Orchestrator logs to memory/
If performance data available → update both agents' guidance
```

## File Structure
```
seo-list-generator/
├── agents/
│   ├── topic_discovery/
│   │   └── SYSTEM.md          ← Discovery agent's instructions
│   ├── list_generation/
│   │   └── SYSTEM.md          ← Generation agent's instructions
│   └── orchestrator/
│       └── COORDINATOR.md     ← This file
├── outputs/
│   └── generated_lists/       ← Final markdown files
├── memory/
│   ├── research_log.md        ← Discovery learnings
│   ├── list_performance.md    ← Engagement tracking
│   └── evolution_log.md       ← System improvements
└── logs/
    └── agent_runs.json        ← Execution history
```

## Quality Scoring

| Score | Criteria |
|-------|----------|
| 9-10  | Viral potential, unique angle, perfect SEO |
| 7-8   | Solid topic, good execution |
| 5-6   | Decent but common topic |
| 3-4   | Weak angle or oversaturated |
| 1-2   | Poor choice, unlikely to rank |

## Evolution Triggers

- **Topic too broad?** → Discovery agent learns to narrow
- **Lists not ranking?** → Generation agent updates SEO tactics
- **Engagement low?** → Both agents recalibrate
- **Seasonal miss?** → Discovery agent improves trend detection
