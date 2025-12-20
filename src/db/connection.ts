import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from '../config/env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let dbInstance: Database.Database | null = null;

const loadSchema = () => {
  const candidates = [
    // compiled build (dist/db/schema.sql)
    path.resolve(__dirname, 'schema.sql'),
    // fallback to source tree (src/db/schema.sql)
    path.resolve(process.cwd(), 'src/db/schema.sql'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return fs.readFileSync(candidate, 'utf-8');
    }
  }

  throw new Error(`schema.sql not found. Checked: ${candidates.join(', ')}`);
};

const ensureDir = (targetPath: string) => {
  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

export const getDb = (): Database.Database => {
  if (dbInstance) return dbInstance;

  ensureDir(env.DATABASE_PATH);
  dbInstance = new Database(env.DATABASE_PATH);
  dbInstance.pragma('journal_mode = WAL');
  dbInstance.pragma('foreign_keys = ON');

  const schema = loadSchema();
  dbInstance.exec(schema);

  return dbInstance;
};

export const closeDb = () => {
  dbInstance?.close();
  dbInstance = null;
};
