# @openclaw/ai-ops-cli

**Self-hosted AI cost and performance monitor.** Track spending across OpenAI, Anthropic, Google AI, and Ollama — no cloud account, no data leaves your server.

```bash
npm install -g @openclaw/ai-ops-cli

# Initialize (creates ~/.ai-ops/data.db)
ai-ops init

# Track a request manually
ai-ops track --provider openai --model gpt-4o --prompt-tokens 100 --completion-tokens 200 --latency-ms 450

# Track from an API response file
ai-ops track --provider openai --model gpt-4o --from-file ./response.json

# View dashboard
ai-ops dashboard --since 7

# Generate a report
ai-ops report --format json --since 30 -o report.json
```

## Features

- **Multi-provider cost tracking** — OpenAI, Anthropic, Google AI, Ollama
- **Automatic cost calculation** — uses official pricing, no manual entry
- **Local SQLite storage** — all data stays on your machine, zero external dependency
- **Terminal dashboard** — ASCII charts, no browser needed
- **JSON/CSV reports** — pipe into your existing BI tools
- **File-based tracking** — post-process API responses from any source

## Commands

### `ai-ops init`
Initialize the SQLite database at `~/.ai-ops/data.db`. Run once to set up storage.

### `ai-ops track`
Track an AI API call. Costs are calculated automatically from token counts.

```bash
# Manual entry
ai-ops track --provider openai --model gpt-4o \
  --prompt-tokens 1000 --completion-tokens 500 \
  --latency-ms 890

# From saved API response (OpenAI format)
ai-ops track --provider openai --model gpt-4o --from-file response.json

# From Anthropic response
ai-ops track --provider anthropic --model claude-3-5-sonnet-latest --from-file response.json
```

### `ai-ops dashboard`
Show an ASCII terminal dashboard with costs, error rates, and daily spend.

```bash
ai-ops dashboard              # last 7 days
ai-ops dashboard --since 30   # last 30 days
```

### `ai-ops report`
Export a cost report in JSON or CSV format.

```bash
ai-ops report --format json --since 30
ai-ops report --format csv --since 7 -o costs.csv
```

## Programmatic API

```typescript
import {
  getDb,
  insertRequest,
  getCostByProvider,
  getTotalCost,
  calculateOpenAiCost,
} from '@openclaw/ai-ops-cli';

// Insert a tracked request
const db = getDb();
insertRequest(db, {
  provider: 'openai',
  model: 'gpt-4o',
  operation: 'chat',
  prompt_tokens: 1000,
  completion_tokens: 500,
  total_tokens: 1500,
  cost_usd: calculateOpenAiCost('gpt-4o', 1000, 500),
  latency_ms: 890,
  status_code: 200,
});

// Query costs
const total = getTotalCost(db);
const byProvider = getCostByProvider(db);
```

## Pricing

Prices are sourced from official provider pricing pages and updated as rates change. Run `ai-ops track` with `--from-file` to let the library calculate costs automatically, or pass `--total-cost` manually.

## License

MIT
