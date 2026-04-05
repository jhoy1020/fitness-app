// Mesocycle Queries — CRUD for mesocycles, workout_feedback, muscle_fatigue

import type { SQLiteDatabase } from 'expo-sqlite';
import type {
  MesoCycle,
  MesoCycleWeek,
  WorkoutFeedback,
  MuscleFatigue,
  MuscleGroup,
} from '../../types';
import { v4 as uuid } from 'uuid';

// ═══════════════════════════════════════════
// Mesocycle
// ═══════════════════════════════════════════

interface MesocycleRow {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  status: string;
  total_weeks: number;
  current_week: number;
  weeks_json: string;
  muscle_priorities_json: string;
  weekly_frequency_json: string;
  starting_volume_json: string;
  volume_progression_per_week: number;
  program_id: string | null;
  program_name: string | null;
  week_template_json: string | null;
  week_templates_json: string | null;
  total_workouts: number;
  completed_workouts: number;
  created_at: string;
  updated_at: string;
}

function rowToMesocycle(row: MesocycleRow): MesoCycle {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    startDate: row.start_date,
    endDate: row.end_date ?? undefined,
    status: row.status as MesoCycle['status'],
    totalWeeks: row.total_weeks,
    currentWeek: row.current_week,
    weeks: JSON.parse(row.weeks_json) as MesoCycleWeek[],
    musclePriorities: JSON.parse(row.muscle_priorities_json),
    weeklyFrequency: JSON.parse(row.weekly_frequency_json),
    startingVolume: JSON.parse(row.starting_volume_json),
    volumeProgressionPerWeek: row.volume_progression_per_week,
    programId: row.program_id ?? undefined,
    programName: row.program_name ?? undefined,
    weekTemplate: row.week_template_json
      ? JSON.parse(row.week_template_json)
      : undefined,
    weekTemplates: row.week_templates_json
      ? JSON.parse(row.week_templates_json)
      : undefined,
    totalWorkouts: row.total_workouts,
    completedWorkouts: row.completed_workouts,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getActiveMesocycle(db: SQLiteDatabase): Promise<MesoCycle | null> {
  const row = await db.getFirstAsync<MesocycleRow>(
    "SELECT * FROM mesocycles WHERE status = 'active' LIMIT 1"
  );
  return row ? rowToMesocycle(row) : null;
}

export async function getMesocycleById(
  db: SQLiteDatabase,
  id: string
): Promise<MesoCycle | null> {
  const row = await db.getFirstAsync<MesocycleRow>(
    'SELECT * FROM mesocycles WHERE id = ?',
    [id]
  );
  return row ? rowToMesocycle(row) : null;
}

export async function getAllMesocycles(db: SQLiteDatabase): Promise<MesoCycle[]> {
  const rows = await db.getAllAsync<MesocycleRow>(
    'SELECT * FROM mesocycles ORDER BY created_at DESC'
  );
  return rows.map(rowToMesocycle);
}

export async function createMesocycle(
  db: SQLiteDatabase,
  meso: MesoCycle
): Promise<MesoCycle> {
  const id = meso.id || uuid();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO mesocycles (
       id, name, description, start_date, end_date, status,
       total_weeks, current_week, weeks_json,
       muscle_priorities_json, weekly_frequency_json, starting_volume_json,
       volume_progression_per_week, program_id, program_name,
       week_template_json, week_templates_json,
       total_workouts, completed_workouts, created_at, updated_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      meso.name,
      meso.description ?? null,
      meso.startDate,
      meso.endDate ?? null,
      meso.status,
      meso.totalWeeks,
      meso.currentWeek,
      JSON.stringify(meso.weeks),
      JSON.stringify(meso.musclePriorities),
      JSON.stringify(meso.weeklyFrequency),
      JSON.stringify(meso.startingVolume),
      meso.volumeProgressionPerWeek,
      meso.programId ?? null,
      meso.programName ?? null,
      meso.weekTemplate ? JSON.stringify(meso.weekTemplate) : null,
      meso.weekTemplates ? JSON.stringify(meso.weekTemplates) : null,
      meso.totalWorkouts,
      meso.completedWorkouts,
      now,
      now,
    ]
  );
  return { ...meso, id, createdAt: now, updatedAt: now };
}

export async function updateMesocycle(
  db: SQLiteDatabase,
  id: string,
  updates: Partial<MesoCycle>
): Promise<MesoCycle | null> {
  const existing = await getMesocycleById(db, id);
  if (!existing) return null;

  const merged = { ...existing, ...updates };
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE mesocycles SET
       name = ?, description = ?, start_date = ?, end_date = ?, status = ?,
       total_weeks = ?, current_week = ?, weeks_json = ?,
       muscle_priorities_json = ?, weekly_frequency_json = ?, starting_volume_json = ?,
       volume_progression_per_week = ?, program_id = ?, program_name = ?,
       week_template_json = ?, week_templates_json = ?,
       total_workouts = ?, completed_workouts = ?, updated_at = ?
     WHERE id = ?`,
    [
      merged.name,
      merged.description ?? null,
      merged.startDate,
      merged.endDate ?? null,
      merged.status,
      merged.totalWeeks,
      merged.currentWeek,
      JSON.stringify(merged.weeks),
      JSON.stringify(merged.musclePriorities),
      JSON.stringify(merged.weeklyFrequency),
      JSON.stringify(merged.startingVolume),
      merged.volumeProgressionPerWeek,
      merged.programId ?? null,
      merged.programName ?? null,
      merged.weekTemplate ? JSON.stringify(merged.weekTemplate) : null,
      merged.weekTemplates ? JSON.stringify(merged.weekTemplates) : null,
      merged.totalWorkouts,
      merged.completedWorkouts,
      now,
      id,
    ]
  );
  return { ...merged, updatedAt: now };
}

export async function deleteMesocycle(
  db: SQLiteDatabase,
  id: string
): Promise<boolean> {
  const result = await db.runAsync('DELETE FROM mesocycles WHERE id = ?', [id]);
  return result.changes > 0;
}

// ═══════════════════════════════════════════
// Workout Feedback
// ═══════════════════════════════════════════

interface FeedbackRow {
  id: string;
  workout_id: string;
  date: string;
  pump_rating: number;
  soreness_rating: number;
  performance_rating: number;
  total_score: number;
  muscles_feedback_json: string | null;
  notes: string | null;
}

function rowToFeedback(row: FeedbackRow): WorkoutFeedback {
  return {
    id: row.id,
    workoutId: row.workout_id,
    date: row.date,
    pumpRating: row.pump_rating as 0 | 1 | 2,
    sorenessRating: row.soreness_rating as 0 | 1 | 2,
    performanceRating: row.performance_rating as 0 | 1 | 2 | 3,
    totalScore: row.total_score,
    musclesFeedback: row.muscles_feedback_json
      ? JSON.parse(row.muscles_feedback_json)
      : undefined,
    notes: row.notes ?? undefined,
  };
}

export async function getAllFeedback(db: SQLiteDatabase): Promise<WorkoutFeedback[]> {
  const rows = await db.getAllAsync<FeedbackRow>(
    'SELECT * FROM workout_feedback ORDER BY date DESC'
  );
  return rows.map(rowToFeedback);
}

export async function createFeedback(
  db: SQLiteDatabase,
  feedback: WorkoutFeedback
): Promise<WorkoutFeedback> {
  const id = feedback.id || uuid();
  await db.runAsync(
    `INSERT INTO workout_feedback (
       id, workout_id, date, pump_rating, soreness_rating,
       performance_rating, total_score, muscles_feedback_json, notes
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      feedback.workoutId,
      feedback.date,
      feedback.pumpRating,
      feedback.sorenessRating,
      feedback.performanceRating,
      feedback.totalScore,
      feedback.musclesFeedback ? JSON.stringify(feedback.musclesFeedback) : null,
      feedback.notes ?? null,
    ]
  );
  return { ...feedback, id };
}

// ═══════════════════════════════════════════
// Muscle Fatigue
// ═══════════════════════════════════════════

interface FatigueRow {
  muscle_group: string;
  current_fatigue: number;
  last_trained_date: string | null;
  recovery_rate: number;
  consecutive_hard_sessions: number;
  needs_deload: number;
}

function rowToFatigue(row: FatigueRow): MuscleFatigue {
  return {
    muscleGroup: row.muscle_group as MuscleGroup,
    currentFatigue: row.current_fatigue,
    lastTrainedDate: row.last_trained_date ?? undefined,
    recoveryRate: row.recovery_rate,
    consecutiveHardSessions: row.consecutive_hard_sessions,
    needsDeload: row.needs_deload === 1,
  };
}

export async function getAllMuscleFatigue(
  db: SQLiteDatabase
): Promise<Record<MuscleGroup, MuscleFatigue>> {
  const rows = await db.getAllAsync<FatigueRow>('SELECT * FROM muscle_fatigue');
  const result = {} as Record<MuscleGroup, MuscleFatigue>;
  for (const row of rows) {
    const f = rowToFatigue(row);
    result[f.muscleGroup] = f;
  }
  return result;
}

export async function upsertMuscleFatigue(
  db: SQLiteDatabase,
  fatigue: MuscleFatigue
): Promise<void> {
  await db.runAsync(
    `INSERT OR REPLACE INTO muscle_fatigue (
       muscle_group, current_fatigue, last_trained_date, recovery_rate,
       consecutive_hard_sessions, needs_deload
     ) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      fatigue.muscleGroup,
      fatigue.currentFatigue,
      fatigue.lastTrainedDate ?? null,
      fatigue.recoveryRate,
      fatigue.consecutiveHardSessions,
      fatigue.needsDeload ? 1 : 0,
    ]
  );
}

// ═══════════════════════════════════════════
// App Metadata (key-value)
// ═══════════════════════════════════════════

export async function getAppMeta(
  db: SQLiteDatabase,
  key: string
): Promise<string | null> {
  const row = await db.getFirstAsync<{ value: string | null }>(
    'SELECT value FROM app_meta WHERE key = ?',
    [key]
  );
  return row?.value ?? null;
}

export async function setAppMeta(
  db: SQLiteDatabase,
  key: string,
  value: string
): Promise<void> {
  await db.runAsync(
    'INSERT OR REPLACE INTO app_meta (key, value) VALUES (?, ?)',
    [key, value]
  );
}
