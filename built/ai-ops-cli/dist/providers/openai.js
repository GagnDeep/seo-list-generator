/**
 * OpenAI pricing constants (as of 2024).
 * Prices are per 1M tokens.
 */
export const OPENAI_PRICING = {
    'gpt-4o': { input: 5.0, output: 15.0 },
    'gpt-4o-mini': { input: 0.15, output: 0.6 },
    'gpt-4-turbo': { input: 10.0, output: 30.0 },
    'gpt-4': { input: 30.0, output: 60.0 },
    'gpt-3.5-turbo': { input: 0.5, output: 1.5 },
    'o1-preview': { input: 15.0, output: 60.0 },
    'o1-mini': { input: 3.0, output: 12.0 },
    'o1': { input: 15.0, output: 60.0 },
};
/**
 * Calculate cost in USD for an OpenAI API call.
 */
export function calculateOpenAiCost(model, promptTokens, completionTokens) {
    const pricing = OPENAI_PRICING[model] ?? { input: 0, output: 0 };
    const inputCost = (promptTokens / 1_000_000) * pricing.input;
    const outputCost = (completionTokens / 1_000_000) * pricing.output;
    return Math.round((inputCost + outputCost) * 1_000_000) / 1_000_000;
}
/**
 * Detect model from various OpenAI API response formats.
 */
export function detectOpenAIModel(responseBody, modelHint) {
    if (typeof modelHint === 'string')
        return modelHint;
    const body = responseBody;
    if (typeof body.model === 'string')
        return body.model;
    return 'unknown';
}
//# sourceMappingURL=openai.js.map