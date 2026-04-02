import Database from 'better-sqlite3';
import { homedir } from 'os';
import { join } from 'path';
import { mkdirSync } from 'fs';
import { initSchema } from './schema.js';
let db = null;
export function getDb() {
    if (db)
        return db;
    const dataDir = join(homedir(), '.ai-ops');
    mkdirSync(dataDir, { recursive: true });
    const dbPath = join(dataDir, 'data.db');
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    initSchema(db);
    return db;
}
export function closeDb() {
    if (db) {
        db.close();
        db = null;
    }
}
//# sourceMappingURL=db.js.map