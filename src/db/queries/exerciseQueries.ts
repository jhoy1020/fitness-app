// Exercise Queries — CRUD for the exercises table

import type { SQLiteDatabase } from 'expo-sqlite';
import type { Exercise, MuscleGroup, Equipment, ExerciseTrackingType } from '../../types';
import { v4 as uuid } from 'uuid';

// ── Row shape coming from SQLite ──
interface ExerciseRow {
  id: string;
  name: string;
  muscle_group: string;
  secondary_muscles: string | null;
  equipment: string;
  tracking_type: string | null;
  default_rest_seconds: number;
  instructions: string | null;
  tips: string | null;
  is_custom: number;
  created_at: string;
  updated_at: string;
}

function rowToExercise(row: ExerciseRow): Exercise {
  return {
    id: row.id,
    name: row.name,
    muscleGroup: row.muscle_group as MuscleGroup,
    secondaryMuscles: row.secondary_muscles
      ? JSON.parse(row.secondary_muscles) as MuscleGroup[]
      : undefined,
    equipment: row.equipment as Equipment,
    trackingType: (row.tracking_type as ExerciseTrackingType) || 'weight_reps',
    defaultRestSeconds: row.default_rest_seconds,
    instructions: row.instructions ?? undefined,
    isCustom: row.is_custom === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAllExercises(db: SQLiteDatabase): Promise<Exercise[]> {
  const rows = await db.getAllAsync<ExerciseRow>(
    'SELECT * FROM exercises ORDER BY muscle_group, name'
  );
  return rows.map(rowToExercise);
}

export async function getExerciseById(
  db: SQLiteDatabase,
  id: string
): Promise<Exercise | null> {
  const row = await db.getFirstAsync<ExerciseRow>(
    'SELECT * FROM exercises WHERE id = ?',
    [id]
  );
  return row ? rowToExercise(row) : null;
}

export async function getExercisesByMuscleGroup(
  db: SQLiteDatabase,
  muscleGroup: MuscleGroup
): Promise<Exercise[]> {
  const rows = await db.getAllAsync<ExerciseRow>(
    'SELECT * FROM exercises WHERE muscle_group = ? ORDER BY name',
    [muscleGroup]
  );
  return rows.map(rowToExercise);
}

export async function createExercise(
  db: SQLiteDatabase,
  exercise: Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Exercise> {
  const id = uuid();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO exercises (id, name, muscle_group, secondary_muscles, equipment,
       tracking_type, default_rest_seconds, instructions, is_custom, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      exercise.name,
      exercise.muscleGroup,
      exercise.secondaryMuscles ? JSON.stringify(exercise.secondaryMuscles) : null,
      exercise.equipment,
      exercise.trackingType ?? 'weight_reps',
      exercise.defaultRestSeconds,
      exercise.instructions ?? null,
      exercise.isCustom ? 1 : 0,
      now,
      now,
    ]
  );
  return { ...exercise, id, createdAt: now, updatedAt: now };
}

export async function updateExercise(
  db: SQLiteDatabase,
  id: string,
  updates: Partial<Exercise>
): Promise<Exercise | null> {
  const existing = await getExerciseById(db, id);
  if (!existing) return null;

  const merged = { ...existing, ...updates };
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE exercises SET
       name = ?, muscle_group = ?, secondary_muscles = ?, equipment = ?,
       tracking_type = ?, default_rest_seconds = ?, instructions = ?,
       is_custom = ?, updated_at = ?
     WHERE id = ?`,
    [
      merged.name,
      merged.muscleGroup,
      merged.secondaryMuscles ? JSON.stringify(merged.secondaryMuscles) : null,
      merged.equipment,
      merged.trackingType ?? 'weight_reps',
      merged.defaultRestSeconds,
      merged.instructions ?? null,
      merged.isCustom ? 1 : 0,
      now,
      id,
    ]
  );
  return { ...merged, updatedAt: now };
}

export async function deleteExercise(
  db: SQLiteDatabase,
  id: string
): Promise<boolean> {
  const result = await db.runAsync('DELETE FROM exercises WHERE id = ?', [id]);
  return result.changes > 0;
}

/**
 * Bulk-insert seed exercises (used on first launch).
 * Skips exercises that already exist (by name).
 */
export async function seedExercises(
  db: SQLiteDatabase,
  exercises: Array<Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'> & { tips?: string }>
): Promise<void> {
  const now = new Date().toISOString();
  for (const ex of exercises) {
    const id = uuid();
    await db.runAsync(
      `INSERT OR IGNORE INTO exercises (id, name, muscle_group, secondary_muscles, equipment,
         tracking_type, default_rest_seconds, instructions, tips, is_custom, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        ex.name,
        ex.muscleGroup,
        ex.secondaryMuscles ? JSON.stringify(ex.secondaryMuscles) : null,
        ex.equipment,
        ex.trackingType ?? 'weight_reps',
        ex.defaultRestSeconds,
        ex.instructions ?? null,
        (ex as any).tips ?? null,
        ex.isCustom ? 1 : 0,
        now,
        now,
      ]
    );
  }
}
