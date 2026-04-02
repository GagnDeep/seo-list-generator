import { Command } from 'commander';
import { getDb, closeDb } from '../store/db.js';
import { getCostByProvider, getCostByModel, getErrorRate, getDailyCosts, getTotalCost } from '../store/schema.js';

export const dashboardCommand = new Command('dashboard')
  .description('Show cost and performance dashboard in the terminal')
  .option('--since <days>', 'Show stats for the last N days')
  .option('--provider <name>', 'Filter by provider (openai, anthropic, etc.)')
  .action((options: { since: number; provider?: string }) => {
    const db = getDb();
    // The since parameter is passed as days which gets converted internally
    // For provider filtering, we compute the date threshold
    // Compute the date threshold in JS to avoid SQL injection risks
    const sinceDays = typeof options.since === 'number' ? options.since : parseInt(String(options.since), 10) || 7;
    const sinceDate = (() => {
      const d = new Date();
      d.setDate(d.getDate() - sinceDays);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    })();

    const totalCost = getTotalCost(db, sinceDate);
    const byProvider = getCostByProvider(db, sinceDate);
    const byModel = getCostByModel(db, sinceDate);
    const errorRates = getErrorRate(db, sinceDate);
    const daily = getDailyCosts(db, options.since);

    console.log('\n  AI OPS DASHBOARD\n');
    console.log(`  Period: last ${sinceDays} days\n`);

    console.log(`  Total Cost: $${totalCost.toFixed(4)}\n`);

    // Provider breakdown
    console.log('  PROVIDER BREAKDOWN');
    console.log('  ─────────────────────────────');
    for (const row of byProvider) {
      const pct = totalCost > 0 ? ((row.total_cost / totalCost) * 100).toFixed(1) : '0.0';
      console.log(`  ${row.provider.padEnd(12)} $${row.total_cost.toFixed(4).padStart(10)} (${pct}%)  ${row.total_requests} reqs`);
    }

    // Model breakdown
    console.log('\n  MODEL BREAKDOWN');
    console.log('  ─────────────────────────────');
    const topModels = byModel.slice(0, 10);
    if (topModels.length === 0) {
      console.log('  (no data)');
    }
    for (const row of topModels) {
      console.log(`  ${(row.provider + '/' + row.model).padEnd(30)} $${row.total_cost.toFixed(4)}  ${row.total_requests} reqs`);
    }

    // Error rates
    console.log('\n  ERROR RATES');
    console.log('  ─────────────────────────────');
    if (errorRates.length === 0) {
      console.log('  (no data)');
    }
    for (const row of errorRates) {
      const icon = row.error_rate > 5 ? 'X' : row.error_rate > 1 ? '~' : 'OK';
      console.log(`  [${icon}] ${row.provider.padEnd(12)} ${row.error_rate.toFixed(1).padStart(6)}%  (${row.total_requests} reqs)`);
    }

    // Daily trend
    if (daily.length > 0) {
      console.log('\n  DAILY SPEND');
      console.log('  ─────────────────────────────');
      const maxCost = Math.max(...daily.map(d => d.cost), 0.0001);
      for (const day of daily) {
        const barLen = Math.round((day.cost / maxCost) * 30);
        const bar = '\u2588'.repeat(barLen);
        console.log(`  ${day.date}  $${day.cost.toFixed(4).padStart(8)}  ${bar || '.'}`);
      }
    }

    console.log('\n');
    closeDb();
  });
