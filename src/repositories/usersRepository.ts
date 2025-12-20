import { randomUUID } from 'crypto';
import type Database from 'better-sqlite3';
import { getDb } from '../db/connection.js';

export type UserRecord = {
  uuid: string;
  telegram_id: number;
  name: string;
  alerts: boolean;
  created_at: string;
  updated_at: string;
};

const db = getDb();

export const usersRepository = {
  findByTelegramId(telegramId: number): UserRecord | undefined {
    const stmt = db.prepare<[number], UserRecord>('SELECT * FROM users WHERE telegram_id = ?');
    const row = stmt.get(telegramId) as UserRecord | undefined;
    return row ? mapUser(row) : undefined;
  },

  findByUuid(uuid: string): UserRecord | undefined {
    const stmt = db.prepare<[string], UserRecord>('SELECT * FROM users WHERE uuid = ?');
    const row = stmt.get(uuid) as UserRecord | undefined;
    return row ? mapUser(row) : undefined;
  },

  create(user: { telegram_id: number; name: string; alerts?: boolean }): UserRecord {
    const uuid = randomUUID();
    const alerts = user.alerts ?? true;
    const stmt = db.prepare(
      'INSERT INTO users (uuid, telegram_id, name, alerts) VALUES (?, ?, ?, ?)'
    );
    stmt.run(uuid, user.telegram_id, user.name, alerts ? 1 : 0);
    return this.findByUuid(uuid)!;
  },

  updateName(uuid: string, name: string): UserRecord {
    const stmt = db.prepare('UPDATE users SET name = ?, updated_at = datetime(\'now\') WHERE uuid = ?');
    stmt.run(name, uuid);
    return this.findByUuid(uuid)!;
  },

  updateAlerts(uuid: string, alerts: boolean): UserRecord | undefined {
    const stmt = db.prepare(
      'UPDATE users SET alerts = ?, updated_at = datetime(\'now\') WHERE uuid = ?'
    );
    stmt.run(alerts ? 1 : 0, uuid);
    return this.findByUuid(uuid);
  },
};

const mapUser = (row: UserRecord): UserRecord => ({
  ...row,
  alerts: Boolean(row.alerts),
});
