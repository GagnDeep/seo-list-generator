import type Database from 'better-sqlite3';
export interface AiRequest {
    id?: number;
    provider: string;
    model: string;
    operation: string;
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    cost_usd: number;
    latency_ms: number;
    status_code: number;
    error_message?: string;
    metadata?: string;
    created_at?: string;
}
export interface CostSummary {
    provider: string;
    total_cost: number;
    total_requests: number;
    total_tokens: number;
}
export interface LatencyPercentiles {
    p50: number;
    p95: number;
    p99: number;
}
export declare function initSchema(db: Database.Database): void;
export declare function insertRequest(db: Database.Database, req: AiRequest): number;
export declare function getCostByProvider(db: Database.Database, since?: string): CostSummary[];
export declare function getCostByModel(db: Database.Database, since?: string): (CostSummary & {
    model: string;
})[];
export declare function getLatencyPercentiles(db: Database.Database, provider?: string): LatencyPercentiles;
export declare function getErrorRate(db: Database.Database, since?: string): {
    provider: string;
    error_rate: number;
    total_requests: number;
}[];
export declare function getDailyCosts(db: Database.Database, days?: number): {
    date: string;
    cost: number;
    requests: number;
}[];
export declare function getTotalCost(db: Database.Database, since?: string): number;
//# sourceMappingURL=schema.d.ts.map