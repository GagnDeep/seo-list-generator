import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import {
  initSchema,
  insertRequest,
  getCostByProvider,
  getCostByModel,
  getTotalCost,
  getDailyCosts,
  getErrorRate,
} from '../store/schema.js';

describe('Schema functions', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(':memory:');
    initSchema(db);
  });

  it('inserts and retrieves a request', () => {
    const id = insertRequest(db, {
      provider: 'openai',
      model: 'gpt-4o',
      operation: 'chat',
      prompt_tokens: 1000,
      completion_tokens: 500,
      total_tokens: 1500,
      cost_usd: 0.02,
      latency_ms: 500,
      status_code: 200,
    });

    expect(id).toBeGreaterThan(0);
  });

  it('calculates total cost', () => {
    insertRequest(db, { provider: 'openai', model: 'gpt-4o', operation: 'chat', prompt_tokens: 1000, completion_tokens: 500, total_tokens: 1500, cost_usd: 0.02, latency_ms: 500, status_code: 200 });
    insertRequest(db, { provider: 'anthropic', model: 'claude-3-5-sonnet-latest', operation: 'chat', prompt_tokens: 1000, completion_tokens: 500, total_tokens: 1500, cost_usd: 0.018, latency_ms: 600, status_code: 200 });

    const total = getTotalCost(db);
    expect(total).toBeCloseTo(0.038, 5);
  });

  it('groups cost by provider', () => {
    insertRequest(db, { provider: 'openai', model: 'gpt-4o', operation: 'chat', prompt_tokens: 1000, completion_tokens: 500, total_tokens: 1500, cost_usd: 0.02, latency_ms: 500, status_code: 200 });
    insertRequest(db, { provider: 'openai', model: 'gpt-4o', operation: 'chat', prompt_tokens: 1000, completion_tokens: 500, total_tokens: 1500, cost_usd: 0.03, latency_ms: 400, status_code: 200 });
    insertRequest(db, { provider: 'anthropic', model: 'claude-3-5-sonnet-latest', operation: 'chat', prompt_tokens: 1000, completion_tokens: 500, total_tokens: 1500, cost_usd: 0.018, latency_ms: 600, status_code: 200 });

    const byProvider = getCostByProvider(db);
    const openai = byProvider.find(r => r.provider === 'openai');
    const anthropic = byProvider.find(r => r.provider === 'anthropic');

    expect(openai!.total_cost).toBeCloseTo(0.05, 4);
    expect(openai!.total_requests).toBe(2);
    expect(anthropic!.total_cost).toBeCloseTo(0.018, 4);
  });

  it('groups cost by model', () => {
    insertRequest(db, { provider: 'openai', model: 'gpt-4o', operation: 'chat', prompt_tokens: 1000, completion_tokens: 500, total_tokens: 1500, cost_usd: 0.02, latency_ms: 500, status_code: 200 });
    insertRequest(db, { provider: 'openai', model: 'gpt-4o-mini', operation: 'chat', prompt_tokens: 1000, completion_tokens: 500, total_tokens: 1500, cost_usd: 0.001, latency_ms: 200, status_code: 200 });

    const byModel = getCostByModel(db);
    expect(byModel.length).toBe(2);
    expect(byModel[0].model).toBe('gpt-4o');
  });

  it('calculates error rate', () => {
    insertRequest(db, { provider: 'openai', model: 'gpt-4o', operation: 'chat', prompt_tokens: 100, completion_tokens: 0, total_tokens: 100, cost_usd: 0, latency_ms: 100, status_code: 200 });
    insertRequest(db, { provider: 'openai', model: 'gpt-4o', operation: 'chat', prompt_tokens: 100, completion_tokens: 0, total_tokens: 100, cost_usd: 0, latency_ms: 100, status_code: 429 });
    insertRequest(db, { provider: 'openai', model: 'gpt-4o', operation: 'chat', prompt_tokens: 100, completion_tokens: 0, total_tokens: 100, cost_usd: 0, latency_ms: 100, status_code: 500 });

    const rates = getErrorRate(db);
    const openai = rates.find(r => r.provider === 'openai');
    expect(openai!.error_rate).toBeCloseTo(66.67, 1);
    expect(openai!.total_requests).toBe(3);
  });

  it('getDailyCosts returns array', () => {
    const daily = getDailyCosts(db, 7);
    expect(Array.isArray(daily)).toBe(true);
  });
});
