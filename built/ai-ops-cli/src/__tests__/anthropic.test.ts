import { describe, it, expect } from 'vitest';
import { calculateAnthropicCost } from '../providers/anthropic.js';

describe('Anthropic pricing', () => {
  it('calculates claude-3-5-sonnet cost correctly', () => {
    // claude-3-5-sonnet: $3/M input, $15/M output
    const cost = calculateAnthropicCost('claude-3-5-sonnet-latest', 1_000_000, 1_000_000);
    expect(cost).toBe(18.0);
  });

  it('calculates claude-3-opus cost correctly', () => {
    // claude-3-opus: $15/M input, $75/M output
    const cost = calculateAnthropicCost('claude-3-opus-latest', 100_000, 100_000);
    // $1.50 + $7.50 = $9.00 per 200k tokens
    expect(cost).toBe(9.0);
  });

  it('calculates claude-3-haiku cost correctly', () => {
    // claude-3-haiku: $0.25/M input, $1.25/M output
    const cost = calculateAnthropicCost('claude-3-haiku-20240307', 1_000_000, 500_000);
    // $0.25 + $0.625 = $0.875
    expect(cost).toBe(0.875);
  });

  it('handles zero tokens', () => {
    const cost = calculateAnthropicCost('claude-3-5-sonnet-latest', 0, 0);
    expect(cost).toBe(0);
  });

  it('uses default pricing for unknown model', () => {
    const cost = calculateAnthropicCost('unknown-model', 100_000, 100_000);
    // default: $3/M input, $15/M output
    expect(cost).toBe(1.8);
  });
});
