import { describe, it, expect } from 'vitest';
import { calculateOpenAiCost, detectOpenAIModel } from '../providers/openai.js';

describe('OpenAI pricing', () => {
  it('calculates gpt-4o cost correctly', () => {
    // gpt-4o: $5/M input, $15/M output
    // 1M prompt + 1M completion = $5 + $15 = $20
    const cost = calculateOpenAiCost('gpt-4o', 1_000_000, 1_000_000);
    expect(cost).toBe(20.0);
  });

  it('calculates gpt-4o-mini cost correctly', () => {
    // gpt-4o-mini: $0.15/M input, $0.60/M output
    const cost = calculateOpenAiCost('gpt-4o-mini', 100_000, 50_000);
    // $0.015 + $0.03 = $0.045
    expect(cost).toBe(0.045);
  });

  it('calculates gpt-3.5-turbo cost correctly', () => {
    const cost = calculateOpenAiCost('gpt-3.5-turbo', 100_000, 100_000);
    // $0.5/1M input + $1.5/1M output = $0.05 + $0.15 = $0.20 per 200k tokens
    expect(cost).toBe(0.2);
  });

  it('handles zero tokens', () => {
    const cost = calculateOpenAiCost('gpt-4o', 0, 0);
    expect(cost).toBe(0);
  });

  it('handles unknown model with zero pricing', () => {
    const cost = calculateOpenAiCost('unknown-model', 1000, 1000);
    expect(cost).toBe(0);
  });
});

describe('detectOpenAIModel', () => {
  it('returns model from response body', () => {
    const model = detectOpenAIModel({ model: 'gpt-4o' });
    expect(model).toBe('gpt-4o');
  });

  it('prefers explicit hint over body', () => {
    const model = detectOpenAIModel({ model: 'gpt-4o' }, 'gpt-4o-mini');
    expect(model).toBe('gpt-4o-mini');
  });

  it('returns unknown when no info available', () => {
    const model = detectOpenAIModel({});
    expect(model).toBe('unknown');
  });
});
