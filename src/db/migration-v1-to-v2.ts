/**
 * Data migration — AsyncStorage (v1) → SQLite (v2).
 *
 * Reads legacy JSON blobs stored under well-known keys, transforms them into
 * rows compatible with the new SQLite schema, and inserts them.  Once the
 * migration succeeds the legacy keys are **deleted** so the migration is
 * idempotent (it will never run twice).
 *
 * Called from DatabaseProvider after the database is opened and schema
 * migrations have run.
 */

import type { SQLiteDatabase } from 'expo-sqlite';
import { Storage } from '../utils/storage';

// ─── Legacy AsyncStorage keys ─────────────────────────────
const LEGACY_KEYS = {
  workoutHistory: 'fitness_workout_history',
  pausedWorkout: 'fitness_paused_workout',
  deloadState: 'fitness_deload_state',
  mesocycleState: 'mesocycleState',
  weightHistory: 'fitness_app_weight_history',
  oneRepMax: 'fitness_app_one_rep_max',
  // theme is kept in AsyncStorage — it's tiny and used before DB opens
} as const;

// Migration marker stored in the app_meta table so we never run twice.
const MIGRATION_KEY = 'legacy_migration_complete';

// ─── Public API ───────────────────────────────────────────

/** Returns true if the legacy→SQLite migration has already run. */
export async function isMigrationComplete(db: SQLiteDatabase): Promise<boolean> {
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_meta WHERE key = ?',
    [MIGRATION_KEY],
  );
  return row?.value === '1';
}

/**
 * Run the one-time migration from AsyncStorage JSON to SQLite rows.
 * Safe to call multiple times — it's a no-op if the marker exists.
 */
export async function migrateFromAsyncStorage(db: SQLiteDatabase): Promise<{
  migrated: boolean;
  workouts: number;
  mesocycles: number;
  oneRepMaxRecords: number;
  weightEntries: number;
}> {
  // Skip if already migrated
  if (await isMigrationComplete(db)) {
    return { migrated: false, workouts: 0, mesocycles: 0, oneRepMaxRecords: 0, weightEntries: 0 };
  }

  const stats = { workouts: 0, mesocycles: 0, oneRepMaxRecords: 0, weightEntries: 0 };

  try {
    await db.execAsync('BEGIN TRANSACTION');

    // ── 1. Workout history ──────────────────────────────────
    const workoutHistoryRaw = await Storage.getItem(LEGACY_KEYS.workoutHistory);
    if (workoutHistoryRaw) {
      const workouts: any[] = JSON.parse(workoutHistoryRaw);
      for (const w of workouts) {
        await db.runAsync(
          `INSERT OR IGNORE INTO workouts
            (id, name, date, duration_seconds, notes, day_type, cardio_type,
             duration_minutes, distance_miles, pace_min_per_mile,
             calories_burned, avg_heart_rate)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            w.id,
            w.name || 'Workout',
            w.date,
            w.duration || 0,
            w.notes || null,
            w.dayType || 'workout',
            w.cardioType || null,
            w.durationMinutes || null,
            w.distanceMiles || null,
            w.paceMinPerMile || null,
            w.caloriesBurned || null,
            w.avgHeartRate || null,
          ],
        );

        // Migrate embedded sets
        const sets: any[] = w.sets || [];
        for (let i = 0; i < sets.length; i++) {
          const s = sets[i];
          await db.runAsync(
            `INSERT OR IGNORE INTO workout_sets
              (id, workout_id, exercise_id, exercise_name, muscle_group,
               set_number, weight, reps, is_warmup, rir, duration_seconds)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              `${w.id}-set-${i}`,
              w.id,
              s.exerciseId || null,
              s.exerciseName || null,
              s.muscleGroup || null,
              i + 1,
              s.weight || 0,
              s.reps || 0,
              s.isWarmup ? 1 : 0,
              s.rir ?? null,
              s.durationSeconds || null,
            ],
          );
        }
        stats.workouts++;
      }
    }

    // ── 2. Mesocycle state ──────────────────────────────────
    const mesoRaw = await Storage.getItem(LEGACY_KEYS.mesocycleState);
    if (mesoRaw) {
      const mesoState: any = JSON.parse(mesoRaw);

      // Active + history mesocycles
      const allMesos: any[] = [
        ...(mesoState.mesoCycleHistory || []),
      ];
      if (mesoState.activeMesoCycle) {
        // Make sure active isn't duplicated in history
        const existsInHistory = allMesos.some(m => m.id === mesoState.activeMesoCycle.id);
        if (!existsInHistory) {
          allMesos.push(mesoState.activeMesoCycle);
        }
      }

      for (const m of allMesos) {
        const isActive = mesoState.activeMesoCycle?.id === m.id;
        await db.runAsync(
          `INSERT OR IGNORE INTO mesocycles
            (id, name, program_id, status, current_week, total_weeks,
             completed_workouts, total_workouts, start_date, end_date,
             config_json)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            m.id,
            m.name || 'Program',
            m.programId || null,
            isActive ? 'active' : (m.status || 'completed'),
            m.currentWeek || 1,
            m.totalWeeks || 4,
            m.completedWorkouts || 0,
            m.totalWorkouts || 0,
            m.startDate || new Date().toISOString(),
            m.endDate || null,
            // Store the full mesocycle JSON for any fields we can't map 1:1
            JSON.stringify(m),
          ],
        );
        stats.mesocycles++;
      }

      // Workout feedback
      const feedbacks: any[] = mesoState.workoutFeedback || [];
      for (const fb of feedbacks) {
        await db.runAsync(
          `INSERT OR IGNORE INTO workout_feedback
            (id, mesocycle_id, week, workout_name, pump_rating,
             soreness_rating, performance_rating, fatigue_rating, total_score, notes, date)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            fb.id || `fb-${Date.now()}-${Math.random()}`,
            mesoState.activeMesoCycle?.id || 'unknown',
            fb.week || 1,
            fb.workoutName || '',
            fb.pumpRating || 0,
            fb.sorenessRating || 0,
            fb.performanceRating || 0,
            fb.fatigueRating || 0,
            fb.totalScore || 0,
            fb.notes || null,
            fb.date || new Date().toISOString(),
          ],
        );
      }

      // Muscle fatigue
      const fatigueMap: Record<string, any> = mesoState.muscleFatigue || {};
      for (const [muscle, fatigue] of Object.entries(fatigueMap)) {
        if (!fatigue) continue;
        await db.runAsync(
          `INSERT OR IGNORE INTO muscle_fatigue
            (id, mesocycle_id, muscle_group, current_fatigue,
             recovery_rate, consecutive_hard_sessions, needs_deload, last_updated)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            `fatigue-${muscle}`,
            mesoState.activeMesoCycle?.id || 'unknown',
            muscle,
            (fatigue as any).currentFatigue || 0,
            (fatigue as any).recoveryRate || 15,
            (fatigue as any).consecutiveHardSessions || 0,
            (fatigue as any).needsDeload ? 1 : 0,
            new Date().toISOString(),
          ],
        );
      }
    }

    // ── 3. One-rep-max records ──────────────────────────────
    const ormRaw = await Storage.getItem(LEGACY_KEYS.oneRepMax);
    if (ormRaw) {
      const records: any[] = JSON.parse(ormRaw);
      for (const r of records) {
        await db.runAsync(
          `INSERT OR IGNORE INTO one_rep_max_records
            (id, exercise_name, weight, unit, date, method, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            r.id || `orm-${Date.now()}-${Math.random()}`,
            r.exerciseName || r.exercise || '',
            r.weight || 0,
            r.unit || 'lbs',
            r.date || new Date().toISOString(),
            r.method || 'tested',
            r.notes || null,
          ],
        );
        stats.oneRepMaxRecords++;
      }
    }

    // ── 4. Weight / body-measurement history ────────────────
    const weightRaw = await Storage.getItem(LEGACY_KEYS.weightHistory);
    if (weightRaw) {
      const entries: any[] = JSON.parse(weightRaw);
      for (const e of entries) {
        await db.runAsync(
          `INSERT OR IGNORE INTO body_measurements
            (id, date, weight, weight_unit, body_fat_percent, notes)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            e.id || `bm-${Date.now()}-${Math.random()}`,
            e.date || new Date().toISOString(),
            e.weight || 0,
            e.unit || 'lbs',
            e.bodyFatPercent || null,
            e.notes || null,
          ],
        );
        stats.weightEntries++;
      }
    }

    // ── 5. Store custom programs from mesocycle state ────────
    // Programs are also embedded in mesocycleState.availablePrograms sometimes
    if (mesoRaw) {
      const mesoState: any = JSON.parse(mesoRaw);
      const programs: any[] = mesoState.availablePrograms || [];
      for (const p of programs) {
        if (!p.isCustom) continue; // Only migrate user-created programs
        await db.runAsync(
          `INSERT OR IGNORE INTO programs
            (id, name, description, split_type, weeks, is_premade,
             difficulty, equipment, config_json)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            p.id,
            p.name || 'Custom Program',
            p.description || null,
            p.splitType || 'custom',
            p.weeks || 4,
            0, // not premade
            p.difficulty || 'intermediate',
            p.equipment ? JSON.stringify(p.equipment) : null,
            JSON.stringify(p),
          ],
        );
      }
    }

    // ── Mark migration complete ─────────────────────────────
    await db.runAsync(
      'INSERT OR REPLACE INTO app_meta (key, value) VALUES (?, ?)',
      [MIGRATION_KEY, '1'],
    );

    await db.execAsync('COMMIT');

    // ── Clean up legacy keys ────────────────────────────────
    // Do this outside the transaction so a failure to delete doesn't roll back the migration
    for (const key of Object.values(LEGACY_KEYS)) {
      try {
        await Storage.removeItem(key);
      } catch {
        // Not critical — the migration marker prevents re-running
      }
    }

    console.log('[Migration] Completed:', stats);
    return { migrated: true, ...stats };
  } catch (error) {
    // Roll back on any error
    try {
      await db.execAsync('ROLLBACK');
    } catch {
      // ignore rollback failure
    }
    console.error('[Migration] Failed:', error);
    throw error;
  }
}
