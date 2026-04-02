import { Command } from 'commander';
import { readFileSync } from 'fs';
import { getDb, closeDb } from '../store/db.js';
import { insertRequest } from '../store/schema.js';
import { calculateOpenAiCost, detectOpenAIModel } from '../providers/openai.js';
import { calculateAnthropicCost } from '../providers/anthropic.js';
export const trackCommand = new Command('track')
    .description('Track an AI API call')
    .requiredOption('-p, --provider <provider>', 'AI provider (openai, anthropic, google, ollama)')
    .requiredOption('-m, --model <model>', 'Model name (e.g. gpt-4o, claude-3-5-sonnet-latest)')
    .option('-o, --operation <op>', 'Operation type', 'chat')
    .option('--prompt-tokens <n>', 'Number of prompt tokens', parseInt)
    .option('--completion-tokens <n>', 'Number of completion tokens', parseInt)
    .option('--total-tokens <n>', 'Total tokens (overrides prompt+completion)', parseInt)
    .option('--latency-ms <n>', 'Latency in milliseconds', parseInt)
    .option('--status-code <n>', 'HTTP status code', parseInt, 200)
    .option('--error-message <msg>', 'Error message if failed')
    .option('--metadata <json>', 'Additional metadata as JSON')
    .option('-f, --from-file <path>', 'Track from an API response JSON file')
    .action((options) => {
    const db = getDb();
    try {
        // Commander.js stores kebab-case options as camelCase on the options object
        let promptTokens = options.promptTokens;
        let completionTokens = options.completionTokens;
        let totalTokens = options.totalTokens;
        let model = options.model;
        let errorMessage;
        let statusCode = options.statusCode ?? 200;
        if (options.fromFile) {
            const content = readFileSync(options.fromFile, 'utf-8');
            const data = JSON.parse(content);
            if (options.provider === 'openai') {
                const openaiData = data;
                const usage = openaiData.usage;
                if (usage) {
                    promptTokens = usage.prompt_tokens ?? 0;
                    completionTokens = usage.completion_tokens ?? 0;
                }
                model = detectOpenAIModel(openaiData, model !== 'unknown' ? model : undefined);
                statusCode = openaiData.error ? 500 : 200;
                errorMessage = openaiData.error?.message;
            }
            else if (options.provider === 'anthropic') {
                const anthropicData = data;
                const usage = anthropicData.usage;
                if (usage) {
                    promptTokens = usage.input_tokens ?? 0;
                    completionTokens = usage.output_tokens ?? 0;
                }
                statusCode = anthropicData.error ? 500 : 200;
                errorMessage = anthropicData.error?.error?.message;
            }
        }
        const p = promptTokens ?? 0;
        const c = completionTokens ?? 0;
        const total = totalTokens ?? (p + c);
        let costUsd = 0;
        if (options.provider === 'openai') {
            costUsd = calculateOpenAiCost(model, p, c);
        }
        else if (options.provider === 'anthropic') {
            costUsd = calculateAnthropicCost(model, p, c);
        }
        const id = insertRequest(db, {
            provider: options.provider,
            model,
            operation: options.operation ?? 'chat',
            prompt_tokens: p,
            completion_tokens: c,
            total_tokens: total,
            cost_usd: costUsd,
            latency_ms: options.latencyMs ?? 0,
            status_code: statusCode,
            error_message: errorMessage ?? options.errorMessage,
            metadata: options.metadata,
        });
        const icon = costUsd > 0 ? '✓' : '·';
        console.log(`${icon} Tracked: ${options.provider}/${model} — ${total} tokens — $${costUsd.toFixed(6)} (id: ${id})`);
        closeDb();
        process.exit(0);
    }
    catch (err) {
        console.error('Error tracking request:', err);
        closeDb();
        process.exit(1);
    }
});
//# sourceMappingURL=track.js.map