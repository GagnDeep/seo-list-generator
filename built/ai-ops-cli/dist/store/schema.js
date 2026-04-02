export function initSchema(db) {
    db.exec(`
    CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provider TEXT NOT NULL,
      model TEXT NOT NULL,
      operation TEXT NOT NULL DEFAULT 'chat',
      prompt_tokens INTEGER NOT NULL DEFAULT 0,
      completion_tokens INTEGER NOT NULL DEFAULT 0,
      total_tokens INTEGER NOT NULL DEFAULT 0,
      cost_usd REAL NOT NULL DEFAULT 0,
      latency_ms INTEGER NOT NULL DEFAULT 0,
      status_code INTEGER NOT NULL DEFAULT 200,
      error_message TEXT,
      metadata TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_requests_provider ON requests(provider);
    CREATE INDEX IF NOT EXISTS idx_requests_model ON requests(model);
    CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at);
  `);
}
export function insertRequest(db, req) {
    const stmt = db.prepare(`
    INSERT INTO requests (provider, model, operation, prompt_tokens, completion_tokens, total_tokens, cost_usd, latency_ms, status_code, error_message, metadata)
    VALUES (@provider, @model, @operation, @prompt_tokens, @completion_tokens, @total_tokens, @cost_usd, @latency_ms, @status_code, @error_message, @metadata)
  `);
    const result = stmt.run({
        provider: req.provider,
        model: req.model,
        operation: req.operation,
        prompt_tokens: req.prompt_tokens,
        completion_tokens: req.completion_tokens,
        total_tokens: req.total_tokens,
        cost_usd: req.cost_usd,
        latency_ms: req.latency_ms,
        status_code: req.status_code,
        error_message: req.error_message ?? null,
        metadata: req.metadata ?? null,
    });
    return result.lastInsertRowid;
}
export function getCostByProvider(db, since) {
    if (since) {
        return db
            .prepare(`
      SELECT
        provider,
        ROUND(SUM(cost_usd), 6) as total_cost,
        COUNT(*) as total_requests,
        SUM(total_tokens) as total_tokens
      FROM requests
      WHERE created_at >= ?
      GROUP BY provider
      ORDER BY total_cost DESC
    `)
            .all(since);
    }
    return db
        .prepare(`
    SELECT
      provider,
      ROUND(SUM(cost_usd), 6) as total_cost,
      COUNT(*) as total_requests,
      SUM(total_tokens) as total_tokens
    FROM requests
    GROUP BY provider
    ORDER BY total_cost DESC
  `)
        .all();
}
export function getCostByModel(db, since) {
    if (since) {
        return db
            .prepare(`
      SELECT
        provider,
        model,
        ROUND(SUM(cost_usd), 6) as total_cost,
        COUNT(*) as total_requests,
        SUM(total_tokens) as total_tokens
      FROM requests
      WHERE created_at >= ?
      GROUP BY provider, model
      ORDER BY total_cost DESC
    `)
            .all(since);
    }
    return db
        .prepare(`
    SELECT
      provider,
      model,
      ROUND(SUM(cost_usd), 6) as total_cost,
      COUNT(*) as total_requests,
      SUM(total_tokens) as total_tokens
    FROM requests
    GROUP BY provider, model
    ORDER BY total_cost DESC
  `)
        .all();
}
export function getLatencyPercentiles(db, provider) {
    const where = provider ? `WHERE provider = '${provider}'` : '';
    const row = db
        .prepare(`
    SELECT
      ROUND(AVG(latency_ms), 2) as median_val,
      ROUND(
        (SELECT latency_ms FROM requests ${where} ORDER BY latency_ms LIMIT 1 OFFSET (SELECT (COUNT(*) * 95 / 100) FROM requests ${where})
      ), 2) as p95_val,
      ROUND(
        (SELECT latency_ms FROM requests ${where} ORDER BY latency_ms LIMIT 1 OFFSET (SELECT (COUNT(*) * 99 / 100) FROM requests ${where})
      ), 2) as p99_val
    FROM requests ${where}
  `)
        .get();
    return {
        p50: row.median_val ?? 0,
        p95: row.p95_val ?? 0,
        p99: row.p99_val ?? 0,
    };
}
export function getErrorRate(db, since) {
    if (since) {
        return db
            .prepare(`
      SELECT
        provider,
        ROUND(SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as error_rate,
        COUNT(*) as total_requests
      FROM requests
      WHERE created_at >= ?
      GROUP BY provider
    `)
            .all(since);
    }
    return db
        .prepare(`
    SELECT
      provider,
      ROUND(SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as error_rate,
      COUNT(*) as total_requests
    FROM requests
    GROUP BY provider
  `)
        .all();
}
export function getDailyCosts(db, days = 7) {
    return db
        .prepare(`
    SELECT
      date(created_at) as date,
      ROUND(SUM(cost_usd), 6) as cost,
      COUNT(*) as requests
    FROM requests
    WHERE created_at >= datetime('now', ?)
    GROUP BY date(created_at)
    ORDER BY date ASC
  `)
        .all(`-${days} days`);
}
export function getTotalCost(db, since) {
    if (since) {
        const row = db
            .prepare(`SELECT ROUND(COALESCE(SUM(cost_usd), 0), 6) as total FROM requests WHERE created_at >= ?`)
            .get(since);
        return row.total;
    }
    const row = db
        .prepare(`SELECT ROUND(COALESCE(SUM(cost_usd), 0), 6) as total FROM requests`)
        .get();
    return row.total;
}
//# sourceMappingURL=schema.js.map