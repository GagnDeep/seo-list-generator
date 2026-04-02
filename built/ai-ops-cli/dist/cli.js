#!/usr/bin/env node
import { Command } from 'commander';
import { trackCommand } from './commands/track.js';
import { dashboardCommand } from './commands/dashboard.js';
import { reportCommand } from './commands/report.js';
import { initCommand } from './commands/init.js';
const program = new Command();
program
    .name('ai-ops')
    .description('Self-hosted AI cost and performance monitor')
    .version('0.1.0');
program.addCommand(initCommand);
program.addCommand(trackCommand);
program.addCommand(dashboardCommand);
program.addCommand(reportCommand);
program.parse();
//# sourceMappingURL=cli.js.map