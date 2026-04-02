/**
 * Anthropic pricing constants (as of 2024).
 * Prices are per 1M tokens.
 */
export const ANTHROPIC_PRICING = {
    'claude-3-5-sonnet-latest': { input: 3.0, output: 15.0 },
    'claude-3-5-sonnet-20241022': { input: 3.0, output: 15.0 },
    'claude-3-5-sonnet-20240620': { input: 3.0, output: 15.0 },
    'claude-3-opus-latest': { input: 15.0, output: 75.0 },
    'claude-3-opus-20240229': { input: 15.0, output: 75.0 },
    'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
    'claude-3-sonnet-20240229': { input: 3.0, output: 15.0 },
};
/**
 * Calculate cost in USD for an Anthropic API call.
 */
export function calculateAnthropicCost(model, inputTokens, outputTokens) {
    const pricing = ANTHROPIC_PRICING[model] ?? { input: 3.0, output: 15.0 };
    const inputCost = (inputTokens / 1_000_000) * pricing.input;
    const outputCost = (outputTokens / 1_000_000) * pricing.output;
    return Math.round((inputCost + outputCost) * 1_000_000) / 1_000_000;
}
//# sourceMappingURL=anthropic.js.map