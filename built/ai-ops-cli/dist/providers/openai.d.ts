/**
 * OpenAI pricing constants (as of 2024).
 * Prices are per 1M tokens.
 */
export declare const OPENAI_PRICING: Record<string, {
    input: number;
    output: number;
}>;
/**
 * Calculate cost in USD for an OpenAI API call.
 */
export declare function calculateOpenAiCost(model: string, promptTokens: number, completionTokens: number): number;
/**
 * Detect model from various OpenAI API response formats.
 */
export declare function detectOpenAIModel(responseBody: unknown, modelHint?: string): string;
//# sourceMappingURL=openai.d.ts.map