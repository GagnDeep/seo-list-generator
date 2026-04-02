import { Command } from 'commander';
import { getDb, closeDb } from '../store/db.js';
import { getCostByProvider, getCostByModel, getDailyCosts, getTotalCost, getErrorRate } from '../store/schema.js';

export const reportCommand = new Command('report')
  .description('Generate a cost report (JSON or CSV)')
  .requiredOption('-f, --format <json|csv>', 'Output format', 'json')
  .option('--since <days>', 'Report for last N days', parseInt, 30)
  .option('-o, --output <file>', 'Write to file instead of stdout')
  .action(async (options: { format: string; since: number; output?: string }) => {
    const db = getDb();

    try {
      const totalCost = getTotalCost(db);
      const byProvider = getCostByProvider(db);
      const byModel = getCostByModel(db);
      const daily = getDailyCosts(db, options.since);
      const errorRates = getErrorRate(db);

      let output: string;

      if (options.format === 'csv') {
        const lines: string[] = ['date,cost_usd,requests'];
        for (const day of daily) {
          lines.push(`${day.date},${day.cost},${day.requests}`);
        }
        output = lines.join('\n');

        // Also include provider summary
        output += '\n\nprovider,total_cost,total_requests,total_tokens\n';
        for (const row of byProvider) {
          output += `${row.provider},${row.total_cost},${row.total_requests},${row.total_tokens}\n`;
        }
      } else {
        const report = {
          generated_at: new Date().toISOString(),
          period_days: options.since,
          total_cost_usd: totalCost,
          by_provider: byProvider,
          by_model: byModel,
          daily: daily,
          error_rates: errorRates,
        };
        output = JSON.stringify(report, null, 2);
      }

      if (options.output) {
        const { writeFileSync } = await import('fs');
        writeFileSync(options.output, output);
        console.log(`✓ Report written to ${options.output}`);
      } else {
        console.log(output);
      }

      closeDb();
      process.exit(0);
    } catch (err) {
      console.error('Error generating report:', err);
      closeDb();
      process.exit(1);
    }
  });
