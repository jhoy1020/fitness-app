// Workout Queries — CRUD for workouts and workout_sets tables

import type { SQLiteDatabase } from 'expo-sqlite';
import type { Workout, WorkoutSet, WorkoutTemplate, TemplateExercise } from '../../types';
import { v4 as uuid } from 'uuid';

// ── Row shapes ──
interface WorkoutRow {
  id: string;
  template_id: string | null;
  name: string;
  date: string;
  started_at: string | null;
  completed_at: string | null;
  duration_minutes: number | null;
  duration: number | null;
  notes: string | null;
  strava_activity_id: string | null;
  day_type: string | null;
  cardio_type: string | null;
  distance_miles: number | null;
  distance_km: number | null;
  pace_min_per_mile: number | null;
  pace_min_per_km: number | null;
  calories_burned: number | null;
  avg_heart_rate: number | null;
  max_heart_rate: number | null;
  elevation_gain_ft: number | null;
  sets_json: string | null;
  exercises_json: string | null;
  created_at: string;
  updated_at: string;
}

interface WorkoutSetRow {
  id: string;
  workout_id: string;
  exercise_id: string;
  set_number: number;
  weight: number;
  weight_unit: string;
  reps: number;
  duration_seconds: number | null;
  rpe: number | null;
  rir: number | null;
  is_warmup: number;
  rest_taken_seconds: number | null;
  notes: string | null;
  created_at: string;
}

function rowToWorkout(row: WorkoutRow): Workout {
  return {
    id: row.id,
    templateId: row.template_id ?? undefined,
    name: row.name,
    date: row.date,
    startedAt: row.started_at ?? undefined,
    completedAt: row.completed_at ?? undefined,
    durationMinutes: row.duration_minutes ?? undefined,
    duration: row.duration ?? undefined,
    notes: row.notes ?? undefined,
    stravaActivityId: row.strava_activity_id ?? undefined,
    dayType: (row.day_type as Workout['dayType']) ?? undefined,
    cardioType: (row.cardio_type as Workout['cardioType']) ?? undefined,
    distanceMiles: row.distance_miles ?? undefined,
    distanceKm: row.distance_km ?? undefined,
    paceMinPerMile: row.pace_min_per_mile ?? undefined,
    paceMinPerKm: row.pace_min_per_km ?? undefined,
    caloriesBurned: row.calories_burned ?? undefined,
    avgHeartRate: row.avg_heart_rate ?? undefined,
    maxHeartRate: row.max_heart_rate ?? undefined,
    elevationGainFt: row.elevation_gain_ft ?? undefined,
    sets: row.sets_json ? JSON.parse(row.sets_json) : undefined,
    exercises: row.exercises_json ? JSON.parse(row.exercises_json) : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToWorkoutSet(row: WorkoutSetRow): WorkoutSet {
  return {
    id: row.id,
    workoutId: row.workout_id,
    exerciseId: row.exercise_id,
    setNumber: row.set_number,
    weight: row.weight,
    weightUnit: row.weight_unit as 'lbs' | 'kg',
    reps: row.reps,
    durationSeconds: row.duration_seconds ?? undefined,
    rpe: row.rpe ?? undefined,
    rir: row.rir ?? undefined,
    isWarmup: row.is_warmup === 1,
    restTakenSeconds: row.rest_taken_seconds ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  };
}

// ── Workout CRUD ──

export async function getAllWorkouts(db: SQLiteDatabase): Promise<Workout[]> {
  const rows = await db.getAllAsync<WorkoutRow>(
    'SELECT * FROM workouts ORDER BY date DESC'
  );
  return rows.map(rowToWorkout);
}

export async function getWorkoutById(
  db: SQLiteDatabase,
  id: string
): Promise<Workout | null> {
  const row = await db.getFirstAsync<WorkoutRow>(
    'SELECT * FROM workouts WHERE id = ?',
    [id]
  );
  return row ? rowToWorkout(row) : null;
}

export async function getRecentWorkouts(
  db: SQLiteDatabase,
  limit = 10
): Promise<Workout[]> {
  const rows = await db.getAllAsync<WorkoutRow>(
    'SELECT * FROM workouts ORDER BY date DESC LIMIT ?',
    [limit]
  );
  return rows.map(rowToWorkout);
}

export async function createWorkout(
  db: SQLiteDatabase,
  workout: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Workout> {
  const id = uuid();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO workouts (
       id, template_id, name, date, started_at, completed_at,
       duration_minutes, duration, notes, strava_activity_id,
       day_type, cardio_type, distance_miles, distance_km,
       pace_min_per_mile, pace_min_per_km, calories_burned,
       avg_heart_rate, max_heart_rate, elevation_gain_ft,
       sets_json, exercises_json, created_at, updated_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      workout.templateId ?? null,
      workout.name,
      workout.date,
      workout.startedAt ?? null,
      workout.completedAt ?? null,
      workout.durationMinutes ?? null,
      workout.duration ?? null,
      workout.notes ?? null,
      workout.stravaActivityId ?? null,
      workout.dayType ?? 'workout',
      workout.cardioType ?? null,
      workout.distanceMiles ?? null,
      workout.distanceKm ?? null,
      workout.paceMinPerMile ?? null,
      workout.paceMinPerKm ?? null,
      workout.caloriesBurned ?? null,
      workout.avgHeartRate ?? null,
      workout.maxHeartRate ?? null,
      workout.elevationGainFt ?? null,
      workout.sets ? JSON.stringify(workout.sets) : null,
      workout.exercises ? JSON.stringify(workout.exercises) : null,
      now,
      now,
    ]
  );
  return { ...workout, id, createdAt: now, updatedAt: now };
}

export async function updateWorkout(
  db: SQLiteDatabase,
  id: string,
  updates: Partial<Workout>
): Promise<Workout | null> {
  const existing = await getWorkoutById(db, id);
  if (!existing) return null;

  const merged = { ...existing, ...updates };
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE workouts SET
       template_id = ?, name = ?, date = ?, started_at = ?, completed_at = ?,
       duration_minutes = ?, duration = ?, notes = ?, strava_activity_id = ?,
       day_type = ?, cardio_type = ?, distance_miles = ?, distance_km = ?,
       pace_min_per_mile = ?, pace_min_per_km = ?, calories_burned = ?,
       avg_heart_rate = ?, max_heart_rate = ?, elevation_gain_ft = ?,
       sets_json = ?, exercises_json = ?, updated_at = ?
     WHERE id = ?`,
    [
      merged.templateId ?? null,
      merged.name,
      merged.date,
      merged.startedAt ?? null,
      merged.completedAt ?? null,
      merged.durationMinutes ?? null,
      merged.duration ?? null,
      merged.notes ?? null,
      merged.stravaActivityId ?? null,
      merged.dayType ?? 'workout',
      merged.cardioType ?? null,
      merged.distanceMiles ?? null,
      merged.distanceKm ?? null,
      merged.paceMinPerMile ?? null,
      merged.paceMinPerKm ?? null,
      merged.caloriesBurned ?? null,
      merged.avgHeartRate ?? null,
      merged.maxHeartRate ?? null,
      merged.elevationGainFt ?? null,
      merged.sets ? JSON.stringify(merged.sets) : null,
      merged.exercises ? JSON.stringify(merged.exercises) : null,
      now,
      id,
    ]
  );
  return { ...merged, updatedAt: now };
}

export async function deleteWorkout(
  db: SQLiteDatabase,
  id: string
): Promise<boolean> {
  // CASCADE deletes workout_sets
  const result = await db.runAsync('DELETE FROM workouts WHERE id = ?', [id]);
  return result.changes > 0;
}

// ── WorkoutSet CRUD ──

export async function getSetsByWorkoutId(
  db: SQLiteDatabase,
  workoutId: string
): Promise<WorkoutSet[]> {
  const rows = await db.getAllAsync<WorkoutSetRow>(
    'SELECT * FROM workout_sets WHERE workout_id = ? ORDER BY set_number',
    [workoutId]
  );
  return rows.map(rowToWorkoutSet);
}

export async function getSetsByExerciseId(
  db: SQLiteDatabase,
  exerciseId: string,
  limit?: number
): Promise<WorkoutSet[]> {
  const sql = limit
    ? 'SELECT * FROM workout_sets WHERE exercise_id = ? ORDER BY created_at DESC LIMIT ?'
    : 'SELECT * FROM workout_sets WHERE exercise_id = ? ORDER BY created_at DESC';
  const params = limit ? [exerciseId, limit] : [exerciseId];
  const rows = await db.getAllAsync<WorkoutSetRow>(sql, params);
  return rows.map(rowToWorkoutSet);
}

export async function createWorkoutSet(
  db: SQLiteDatabase,
  set: Omit<WorkoutSet, 'id' | 'createdAt'>
): Promise<WorkoutSet> {
  const id = uuid();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO workout_sets (
       id, workout_id, exercise_id, set_number, weight, weight_unit,
       reps, duration_seconds, rpe, rir, is_warmup, rest_taken_seconds,
       notes, created_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      set.workoutId,
      set.exerciseId,
      set.setNumber,
      set.weight,
      set.weightUnit,
      set.reps,
      set.durationSeconds ?? null,
      set.rpe ?? null,
      set.rir ?? null,
      set.isWarmup ? 1 : 0,
      set.restTakenSeconds ?? null,
      set.notes ?? null,
      now,
    ]
  );
  return { ...set, id, createdAt: now };
}

export async function updateWorkoutSet(
  db: SQLiteDatabase,
  id: string,
  updates: Partial<WorkoutSet>
): Promise<WorkoutSet | null> {
  const row = await db.getFirstAsync<WorkoutSetRow>(
    'SELECT * FROM workout_sets WHERE id = ?',
    [id]
  );
  if (!row) return null;

  const existing = rowToWorkoutSet(row);
  const merged = { ...existing, ...updates };
  await db.runAsync(
    `UPDATE workout_sets SET
       weight = ?, weight_unit = ?, reps = ?, duration_seconds = ?,
       rpe = ?, rir = ?, is_warmup = ?, rest_taken_seconds = ?, notes = ?
     WHERE id = ?`,
    [
      merged.weight,
      merged.weightUnit,
      merged.reps,
      merged.durationSeconds ?? null,
      merged.rpe ?? null,
      merged.rir ?? null,
      merged.isWarmup ? 1 : 0,
      merged.restTakenSeconds ?? null,
      merged.notes ?? null,
      id,
    ]
  );
  return merged;
}

export async function deleteWorkoutSet(
  db: SQLiteDatabase,
  id: string
): Promise<boolean> {
  const result = await db.runAsync('DELETE FROM workout_sets WHERE id = ?', [id]);
  return result.changes > 0;
}

// ── Workout Templates CRUD ──

interface TemplateRow {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

function rowToTemplate(row: TemplateRow): WorkoutTemplate {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAllTemplates(db: SQLiteDatabase): Promise<WorkoutTemplate[]> {
  const rows = await db.getAllAsync<TemplateRow>(
    'SELECT * FROM workout_templates ORDER BY name'
  );
  return rows.map(rowToTemplate);
}

export async function getTemplateById(
  db: SQLiteDatabase,
  id: string
): Promise<WorkoutTemplate | null> {
  const row = await db.getFirstAsync<TemplateRow>(
    'SELECT * FROM workout_templates WHERE id = ?',
    [id]
  );
  return row ? rowToTemplate(row) : null;
}

export async function createTemplate(
  db: SQLiteDatabase,
  template: Omit<WorkoutTemplate, 'id' | 'createdAt' | 'updatedAt'>
): Promise<WorkoutTemplate> {
  const id = uuid();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO workout_templates (id, name, description, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?)`,
    [id, template.name, template.description ?? null, now, now]
  );
  return { ...template, id, createdAt: now, updatedAt: now };
}

export async function updateTemplate(
  db: SQLiteDatabase,
  id: string,
  updates: Partial<WorkoutTemplate>
): Promise<WorkoutTemplate | null> {
  const existing = await getTemplateById(db, id);
  if (!existing) return null;
  const merged = { ...existing, ...updates };
  const now = new Date().toISOString();
  await db.runAsync(
    'UPDATE workout_templates SET name = ?, description = ?, updated_at = ? WHERE id = ?',
    [merged.name, merged.description ?? null, now, id]
  );
  return { ...merged, updatedAt: now };
}

export async function deleteTemplate(
  db: SQLiteDatabase,
  id: string
): Promise<boolean> {
  const result = await db.runAsync('DELETE FROM workout_templates WHERE id = ?', [id]);
  return result.changes > 0;
}

// ── Template Exercises ──

interface TemplateExerciseRow {
  id: string;
  template_id: string;
  exercise_id: string;
  order_index: number;
  target_sets: number;
  target_reps_min: number;
  target_reps_max: number;
  rest_seconds: number | null;
  notes: string | null;
}

function rowToTemplateExercise(row: TemplateExerciseRow): TemplateExercise {
  return {
    id: row.id,
    templateId: row.template_id,
    exerciseId: row.exercise_id,
    orderIndex: row.order_index,
    targetSets: row.target_sets,
    targetRepsMin: row.target_reps_min,
    targetRepsMax: row.target_reps_max,
    restSeconds: row.rest_seconds ?? undefined,
    notes: row.notes ?? undefined,
  };
}

export async function getTemplateExercises(
  db: SQLiteDatabase,
  templateId: string
): Promise<TemplateExercise[]> {
  const rows = await db.getAllAsync<TemplateExerciseRow>(
    'SELECT * FROM template_exercises WHERE template_id = ? ORDER BY order_index',
    [templateId]
  );
  return rows.map(rowToTemplateExercise);
}

export async function createTemplateExercise(
  db: SQLiteDatabase,
  te: Omit<TemplateExercise, 'id'>
): Promise<TemplateExercise> {
  const id = uuid();
  await db.runAsync(
    `INSERT INTO template_exercises (id, template_id, exercise_id, order_index, target_sets, target_reps_min, target_reps_max, rest_seconds, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      te.templateId,
      te.exerciseId,
      te.orderIndex,
      te.targetSets,
      te.targetRepsMin,
      te.targetRepsMax,
      te.restSeconds ?? null,
      te.notes ?? null,
    ]
  );
  return { ...te, id };
}
