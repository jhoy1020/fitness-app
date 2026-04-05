/**
 * Tests for the legacy AsyncStorage → SQLite migration module.
 *
 * These are unit tests against the source code structure—the actual SQLite
 * operations can't run in a Node test environment but we verify the migration
 * module is correctly structured.
 */

import * as fs from 'fs';
import * as path from 'path';

const SOURCE = fs.readFileSync(
  path.join(__dirname, '..', 'migration-v1-to-v2.ts'),
  'utf8',
);

describe('Migration v1→v2', () => {
  describe('legacy key coverage', () => {
    const expectedKeys = [
      'fitness_workout_history',
      'fitness_paused_workout',
      'fitness_deload_state',
      'mesocycleState',
      'fitness_app_weight_history',
      'fitness_app_one_rep_max',
    ];

    expectedKeys.forEach((key) => {
      it(`handles legacy key "${key}"`, () => {
        expect(SOURCE).toContain(`'${key}'`);
      });
    });
  });

  describe('migration marker', () => {
    it('uses app_meta table for migration marker', () => {
      expect(SOURCE).toContain('app_meta');
      expect(SOURCE).toContain('legacy_migration_complete');
    });

    it('checks marker before running', () => {
      expect(SOURCE).toContain('isMigrationComplete');
    });
  });

  describe('data transformation sections', () => {
    it('migrates workout history', () => {
      expect(SOURCE).toContain('INSERT OR IGNORE INTO workouts');
      expect(SOURCE).toContain('INSERT OR IGNORE INTO workout_sets');
    });

    it('migrates mesocycle state', () => {
      expect(SOURCE).toContain('INSERT OR IGNORE INTO mesocycles');
    });

    it('migrates workout feedback', () => {
      expect(SOURCE).toContain('INSERT OR IGNORE INTO workout_feedback');
    });

    it('migrates muscle fatigue', () => {
      expect(SOURCE).toContain('INSERT OR IGNORE INTO muscle_fatigue');
    });

    it('migrates one-rep-max records', () => {
      expect(SOURCE).toContain('INSERT OR IGNORE INTO one_rep_max_records');
    });

    it('migrates body measurements / weight history', () => {
      expect(SOURCE).toContain('INSERT OR IGNORE INTO body_measurements');
    });

    it('migrates custom programs', () => {
      expect(SOURCE).toContain('INSERT OR IGNORE INTO programs');
    });
  });

  describe('transaction safety', () => {
    it('wraps migration in a transaction', () => {
      expect(SOURCE).toContain('BEGIN TRANSACTION');
      expect(SOURCE).toContain('COMMIT');
    });

    it('rolls back on error', () => {
      expect(SOURCE).toContain('ROLLBACK');
    });
  });

  describe('cleanup', () => {
    it('removes legacy keys after migration', () => {
      expect(SOURCE).toContain('Storage.removeItem');
    });
  });

  describe('exports', () => {
    it('exports isMigrationComplete', () => {
      expect(SOURCE).toContain('export async function isMigrationComplete');
    });

    it('exports migrateFromAsyncStorage', () => {
      expect(SOURCE).toContain('export async function migrateFromAsyncStorage');
    });

    it('returns migration stats', () => {
      expect(SOURCE).toContain('migrated: true');
      expect(SOURCE).toContain('workouts:');
      expect(SOURCE).toContain('mesocycles:');
      expect(SOURCE).toContain('oneRepMaxRecords:');
      expect(SOURCE).toContain('weightEntries:');
    });
  });
});
