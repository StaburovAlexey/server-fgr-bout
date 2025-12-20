import type Database from 'better-sqlite3';
import { getDb } from '../db/connection.js';
import type { UserRecord } from './usersRepository.js';

export type ScoreRecord = {
  id: number;
  uuid: string;
  chapter_id: number;
  mode_id: number;
  score: number;
  created_at: string;
  updated_at: string;
};

export type ScoreWithUser = ScoreRecord & {
  user: Pick<UserRecord, 'name' | 'alerts'>;
};

const db = getDb();

export const scoresRepository = {
  getByUuid(uuid: string): ScoreRecord[] {
    const stmt = db.prepare<[string], ScoreRecord>(
      'SELECT * FROM scores WHERE uuid = ? ORDER BY chapter_id ASC, mode_id ASC'
    );
    return stmt.all(uuid) as ScoreRecord[];
  },

  upsertScore(payload: {
    uuid: string;
    chapter_id: number;
    mode_id: number;
    score: number;
  }): ScoreRecord {
    const stmt = db.prepare(
      `INSERT INTO scores (uuid, chapter_id, mode_id, score)
       VALUES (@uuid, @chapter_id, @mode_id, @score)
       ON CONFLICT(uuid, chapter_id, mode_id)
       DO UPDATE SET score = excluded.score, updated_at = datetime('now')`
    );
    stmt.run(payload);

    const select = db.prepare<[string, number, number], ScoreRecord>(
      'SELECT * FROM scores WHERE uuid = ? AND chapter_id = ? AND mode_id = ?'
    );
    return select.get(payload.uuid, payload.chapter_id, payload.mode_id) as ScoreRecord;
  },

  getLeaderboard(chapter_id: number, mode_id: number): ScoreWithUser[] {
    const stmt = db.prepare<[number, number], ScoreRecord & { user_name: string; user_alerts: number }>(
      `SELECT s.*, u.name as user_name, u.alerts as user_alerts
       FROM scores s
       JOIN users u ON s.uuid = u.uuid
       WHERE s.chapter_id = ? AND s.mode_id = ?
       ORDER BY s.score DESC, s.updated_at ASC`
    );
    const rows = stmt.all(chapter_id, mode_id) as (ScoreRecord & {
      user_name: string;
      user_alerts: number;
    })[];

    return rows.map((row) => ({
      id: row.id,
      uuid: row.uuid,
      chapter_id: row.chapter_id,
      mode_id: row.mode_id,
      score: row.score,
      created_at: row.created_at,
      updated_at: row.updated_at,
      user: {
        name: row.user_name,
        alerts: Boolean(row.user_alerts),
      },
    }));
  },
};
