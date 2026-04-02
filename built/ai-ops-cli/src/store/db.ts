import Database from 'better-sqlite3';
import { homedir } from 'os';
import { join } from 'path';
import { mkdirSync } from 'fs';
import { initSchema } from './schema.js';

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  const dataDir = join(homedir(), '.ai-ops');
  mkdirSync(dataDir, { recursive: true });
  const dbPath = join(dataDir, 'data.db');

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  initSchema(db);

  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
