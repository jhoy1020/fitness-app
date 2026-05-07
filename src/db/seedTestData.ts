// Dev-only Test Data Seeder
//
// Persists the canonical test fixture (`mocks/fixtures.ts → buildTestFixture`)
// to every store the app reads from on launch:
//   1. AsyncStorage keys the WorkoutContext / UserContext hydrate from
//   2. The legacy services/db memory blob (`fitness_app_data`)
//   3. The SQLite database via repository writes
//
// Every persistence path uses the SAME workout IDs from the fixture, so a
// single logical workout is identified consistently across all three stores.
// Blueprint constants and the workout-building loop live in fixtures.ts —
// this module is now strictly a side-effects layer.
//
// Not imported by production code paths — invoked only from the dev button
// on the Profile screen.

import type { SQLiteDatabase } from 'expo-sqlite';
import type { MesoCycle, Workout } from '../types';
import { Storage } from '../utils/storage';
import * as svcDb from '../services/db';
import type { Repositories } from '../repositories/interfaces';
import { buildTestFixture } from '../mocks/fixtures';
// AsyncStorage keys are owned by the contexts that hydrate from them.
// We import the constants directly so a rename in either context can't
// drift from this seeder.
import { WORKOUT_HISTORY_STORAGE_KEY } from '../context/WorkoutContext';
import {
  ONE_REP_MAX_STORAGE_KEY,
  WEIGHT_HISTORY_STORAGE_KEY,
} from '../context/UserContext';

export interface TestDataSummary {
  workouts: number;
  sets: number;
  measurements: number;
  oneRepMaxRecords: number;
  mesocycle: boolean;
}

/**
 * Seed a realistic fixture into the app.
 *
 * Builds the fixture once with `buildTestFixture()`, then writes it to
 * every persistence path. SQLite writes (via db/repos) are best-effort —
 * they only run when the DatabaseProvider is mounted, so the seed works
 * on any build.
 */
export async function seedTestData(
  db: SQLiteDatabase | null,
  repos: Repositories | null
): Promise<TestDataSummary> {
  // Build the fixture using the same builder the mock API seeds with.
  // Linking sets to real exercise IDs (when repos is mounted) keeps the
  // SQLite foreign keys valid.
  const exerciseRows = repos ? await repos.exercises.getAll() : [];
  const exercisesByName = new Map(
    exerciseRows.map((e) => [e.name.toLowerCase(), e])
  );
  const fixture = buildTestFixture({ now: new Date(), exercisesByName });

  await persistProfile(fixture.profile);
  await persistWorkouts(fixture.workouts, db);
  await persistSets(fixture.workoutSets, repos);
  await persistMeasurements(fixture.measurements);
  await persistOneRepMax(fixture.oneRepMaxRecords);
  const mesocycle = repos ? await persistMesocycle(fixture.mesocycle, repos) : null;

  return {
    workouts: fixture.workouts.length,
    sets: fixture.workoutSets.length,
    measurements: fixture.measurements.length,
    oneRepMaxRecords: fixture.oneRepMaxRecords.length,
    mesocycle: mesocycle !== null,
  };
}

// ─── Persistence ───────────────────────────────────────────

async function persistProfile(profile: ReturnType<typeof buildTestFixture>['profile']): Promise<void> {
  // saveUserProfile owns its own id/timestamps — pass through the fixture's
  // body fields so the id discipline of services/db is respected.
  const { id: _id, createdAt: _c, updatedAt: _u, ...body } = profile;
  await svcDb.saveUserProfile(body);
}

async function persistWorkouts(
  workouts: Workout[],
  db: SQLiteDatabase | null
): Promise<void> {
  // Write to the legacy services/db memory blob WITHOUT going through
  // createWorkout (which assigns its own UUIDs). importData replaces the
  // store wholesale, so we read first, merge our fixture rows in, and
  // write back — preserving the fixture IDs end-to-end.
  const existing = await svcDb.getAllData();
  const byId = new Map(existing.workouts.map((w) => [w.id, w]));
  for (const w of workouts) byId.set(w.id, w);
  await svcDb.importData({ ...existing, workouts: Array.from(byId.values()) });

  // AsyncStorage key the WorkoutContext hydrates from. Newest first.
  const sortedNewestFirst = [...workouts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  await Storage.setItem(WORKOUT_HISTORY_STORAGE_KEY, JSON.stringify(sortedNewestFirst));

  // SQLite — best-effort. Same workout IDs as above.
  if (!db) return;
  for (const w of workouts) {
    try {
      await db.runAsync(
        `INSERT OR REPLACE INTO workouts (
           id, template_id, name, date, started_at, completed_at,
           duration_minutes, duration, notes, strava_activity_id,
           day_type, cardio_type, distance_miles, distance_km,
           pace_min_per_mile, pace_min_per_km, calories_burned,
           avg_heart_rate, max_heart_rate, elevation_gain_ft,
           sets_json, exercises_json, created_at, updated_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          w.id,
          null,
          w.name,
          w.date,
          w.startedAt ?? null,
          w.completedAt ?? null,
          w.durationMinutes ?? null,
          null,
          null,
          null,
          'workout',
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          null,
          JSON.stringify(w.sets ?? []),
          JSON.stringify(w.exercises ?? []),
          w.createdAt ?? new Date().toISOString(),
          w.updatedAt ?? new Date().toISOString(),
        ]
      );
    } catch (e) {
      console.warn('[seedTestData] SQLite workout write failed (non-fatal):', e);
    }
  }
}

async function persistSets(
  workoutSets: ReturnType<typeof buildTestFixture>['workoutSets'],
  repos: Repositories | null
): Promise<void> {
  if (!repos) return;
  for (const s of workoutSets) {
    try {
      // createSet ignores the fixture's id but keeps workoutId — so the
      // set ↔ workout link uses the same workout UUID across stores.
      const { id: _id, createdAt: _c, ...body } = s;
      await repos.workouts.createSet(body);
    } catch (e) {
      console.warn('[seedTestData] SQLite set write failed (non-fatal):', e);
    }
  }
}

async function persistMeasurements(
  measurements: ReturnType<typeof buildTestFixture>['measurements']
): Promise<void> {
  await Storage.setItem(WEIGHT_HISTORY_STORAGE_KEY, JSON.stringify(measurements));
}

async function persistOneRepMax(
  records: ReturnType<typeof buildTestFixture>['oneRepMaxRecords']
): Promise<void> {
  await Storage.setItem(ONE_REP_MAX_STORAGE_KEY, JSON.stringify(records));
}

async function persistMesocycle(
  meso: MesoCycle,
  repos: Repositories
): Promise<MesoCycle | null> {
  try {
    return await repos.mesocycles.create(meso);
  } catch (e) {
    console.warn('[seedTestData] Mesocycle seed failed:', e);
    return null;
  }
}
