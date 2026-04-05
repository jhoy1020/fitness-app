// Database Seed Module
// Seeds the exercise library and premade programs on first launch.

import type { SQLiteDatabase } from 'expo-sqlite';
import { EXERCISE_LIBRARY } from '../services/db/exerciseLibrary';
import { TRAINING_PROGRAMS } from '../data/programs/programs';
import { seedExercises } from './queries/exerciseQueries';
import { seedPrograms } from './queries/programQueries';
import { getAppMeta, setAppMeta } from './queries/mesocycleQueries';

const SEED_KEY = 'db_seeded_v1';

/**
 * Seed the database with the exercise library and premade programs.
 * Only runs once — sets a flag in app_meta to skip on subsequent launches.
 */
export async function seedDatabase(db: SQLiteDatabase): Promise<void> {
  const already = await getAppMeta(db, SEED_KEY);
  if (already === 'true') return;

  // Seed exercises
  await seedExercises(db, EXERCISE_LIBRARY);

  // Seed premade programs
  await seedPrograms(db, TRAINING_PROGRAMS);

  // Mark as seeded
  await setAppMeta(db, SEED_KEY, 'true');
}
