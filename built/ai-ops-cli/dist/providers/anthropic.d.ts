/**
 * Anthropic pricing constants (as of 2024).
 * Prices are per 1M tokens.
 */
export declare const ANTHROPIC_PRICING: Record<string, {
    input: number;
    output: number;
}>;
/**
 * Calculate cost in USD for an Anthropic API call.
 */
export declare function calculateAnthropicCost(model: string, inputTokens: number, outputTokens: number): number;
//# sourceMappingURL=anthropic.d.ts.map