PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS users (
  uuid TEXT PRIMARY KEY,
  telegram_id INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  alerts INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT NOT NULL,
  chapter_id INTEGER NOT NULL,
  mode_id INTEGER NOT NULL,
  score INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (uuid) REFERENCES users(uuid) ON DELETE CASCADE,
  UNIQUE (uuid, chapter_id, mode_id)
);

CREATE INDEX IF NOT EXISTS idx_scores_chapter_mode_score ON scores (chapter_id, mode_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_scores_uuid ON scores (uuid);
