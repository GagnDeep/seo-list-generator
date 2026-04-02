import { Command } from 'commander';
import { getDb, closeDb } from '../store/db.js';

export const initCommand = new Command('init')
  .description('Initialize the ai-ops database')
  .action(() => {
    try {
      const db = getDb();
      const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
      console.log('✓ Database initialized at ~/.ai-ops/data.db');
      console.log(`✓ Tables created: ${tables.length}`);
      closeDb();
    } catch (err) {
      console.error('Failed to initialize database:', err);
      process.exit(1);
    }
  });
