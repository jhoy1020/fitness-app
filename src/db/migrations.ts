// Database Migration Runner
// Uses SQLite user_version pragma to track which migrations have been applied.

import type { SQLiteDatabase } from 'expo-sqlite';
import { SCHEMA_V1, SCHEMA_VERSION } from './schema';

/**
 * Each migration is a function that receives the database handle
 * and applies DDL / DML changes for that version.
 */
type Migration = (db: SQLiteDatabase) => Promise<void>;

const migrations: Record<number, Migration> = {
  /**
   * v1 — Initial schema.
   * Creates all tables from scratch.
   */
  1: async (db: SQLiteDatabase) => {
    // Split multi-statement string and execute each statement individually
    const statements = SCHEMA_V1
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const stmt of statements) {
      await db.execAsync(stmt);
    }
  },

  // Future migrations go here:
  // 2: async (db) => { ... },
};

/**
 * Run all pending migrations from current version to SCHEMA_VERSION.
 * Safe to call on every app launch — it's a no-op if already up to date.
 */
export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  // Enable WAL mode for better concurrent read performance
  await db.execAsync('PRAGMA journal_mode = WAL');

  // Enable foreign keys
  await db.execAsync('PRAGMA foreign_keys = ON');

  // Get current version
  const result = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version'
  );
  const currentVersion = result?.user_version ?? 0;

  if (currentVersion >= SCHEMA_VERSION) {
    return; // Already up to date
  }

  // Run each pending migration in order
  for (let v = currentVersion + 1; v <= SCHEMA_VERSION; v++) {
    const migrate = migrations[v];
    if (!migrate) {
      throw new Error(`Missing migration for version ${v}`);
    }

    await db.execAsync('BEGIN TRANSACTION');
    try {
      await migrate(db);
      await db.execAsync(`PRAGMA user_version = ${v}`);
      await db.execAsync('COMMIT');
    } catch (err) {
      await db.execAsync('ROLLBACK');
      throw new Error(
        `Migration to v${v} failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }
}
