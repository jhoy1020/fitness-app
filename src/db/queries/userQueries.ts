// User Queries — CRUD for user_profile, exercise_goals, body_measurements, one_rep_max_records

import type { SQLiteDatabase } from 'expo-sqlite';
import type {
  UserProfile,
  ExerciseGoal,
  BodyMeasurement,
  OneRepMaxRecord,
  ExportRecord,
} from '../../types';
import { v4 as uuid } from 'uuid';

// ═══════════════════════════════════════════
// User Profile
// ═══════════════════════════════════════════

interface ProfileRow {
  id: string;
  weight: number;
  weight_unit: string;
  height: number;
  height_unit: string;
  age: number;
  gender: string;
  body_fat_percent: number | null;
  lean_mass: number | null;
  bmr_override: number | null;
  activity_level: string;
  goal_body_fat_percent: number | null;
  goal_type: string;
  created_at: string;
  updated_at: string;
  email: string | null;
  display_name: string | null;
  remote_user_id: string | null;
  auth_provider: string | null;
  avatar_url: string | null;
}

function rowToProfile(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    weight: row.weight,
    weightUnit: row.weight_unit as 'lbs' | 'kg',
    height: row.height,
    heightUnit: row.height_unit as 'in' | 'cm',
    age: row.age,
    gender: row.gender as 'male' | 'female' | 'other',
    bodyFatPercent: row.body_fat_percent ?? undefined,
    leanMass: row.lean_mass ?? undefined,
    bmrOverride: row.bmr_override ?? undefined,
    activityLevel: row.activity_level as UserProfile['activityLevel'],
    goalBodyFatPercent: row.goal_body_fat_percent ?? undefined,
    goalType: row.goal_type as UserProfile['goalType'],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    email: row.email ?? undefined,
    displayName: row.display_name ?? undefined,
    remoteUserId: row.remote_user_id ?? undefined,
    authProvider: (row.auth_provider as UserProfile['authProvider']) ?? undefined,
    avatarUrl: row.avatar_url ?? undefined,
  };
}

export async function getUserProfile(db: SQLiteDatabase): Promise<UserProfile | null> {
  const row = await db.getFirstAsync<ProfileRow>('SELECT * FROM user_profile LIMIT 1');
  return row ? rowToProfile(row) : null;
}

export async function saveUserProfile(
  db: SQLiteDatabase,
  profile: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>
): Promise<UserProfile> {
  const existing = await getUserProfile(db);
  const now = new Date().toISOString();

  if (existing) {
    await db.runAsync(
      `UPDATE user_profile SET
         weight = ?, weight_unit = ?, height = ?, height_unit = ?,
         age = ?, gender = ?, body_fat_percent = ?, lean_mass = ?,
         bmr_override = ?, activity_level = ?, goal_body_fat_percent = ?,
         goal_type = ?, updated_at = ?,
         email = ?, display_name = ?, remote_user_id = ?,
         auth_provider = ?, avatar_url = ?
       WHERE id = ?`,
      [
        profile.weight,
        profile.weightUnit,
        profile.height,
        profile.heightUnit,
        profile.age,
        profile.gender,
        profile.bodyFatPercent ?? null,
        profile.leanMass ?? null,
        profile.bmrOverride ?? null,
        profile.activityLevel,
        profile.goalBodyFatPercent ?? null,
        profile.goalType,
        now,
        profile.email ?? null,
        profile.displayName ?? null,
        profile.remoteUserId ?? null,
        profile.authProvider ?? null,
        profile.avatarUrl ?? null,
        existing.id,
      ]
    );
    return {
      ...profile,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: now,
    };
  }

  const id = uuid();
  await db.runAsync(
    `INSERT INTO user_profile (
       id, weight, weight_unit, height, height_unit, age, gender,
       body_fat_percent, lean_mass, bmr_override, activity_level,
       goal_body_fat_percent, goal_type, created_at, updated_at,
       email, display_name, remote_user_id, auth_provider, avatar_url
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      profile.weight,
      profile.weightUnit,
      profile.height,
      profile.heightUnit,
      profile.age,
      profile.gender,
      profile.bodyFatPercent ?? null,
      profile.leanMass ?? null,
      profile.bmrOverride ?? null,
      profile.activityLevel,
      profile.goalBodyFatPercent ?? null,
      profile.goalType,
      now,
      now,
      profile.email ?? null,
      profile.displayName ?? null,
      profile.remoteUserId ?? null,
      profile.authProvider ?? null,
      profile.avatarUrl ?? null,
    ]
  );
  return { ...profile, id, createdAt: now, updatedAt: now };
}

// ═══════════════════════════════════════════
// Exercise Goals
// ═══════════════════════════════════════════

interface GoalRow {
  id: string;
  exercise_id: string;
  current_1rm: number;
  target_1rm: number;
  target_date: string | null;
  created_at: string;
  updated_at: string;
}

function rowToGoal(row: GoalRow): ExerciseGoal {
  return {
    id: row.id,
    exerciseId: row.exercise_id,
    current1RM: row.current_1rm,
    target1RM: row.target_1rm,
    targetDate: row.target_date ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAllExerciseGoals(db: SQLiteDatabase): Promise<ExerciseGoal[]> {
  const rows = await db.getAllAsync<GoalRow>('SELECT * FROM exercise_goals');
  return rows.map(rowToGoal);
}

export async function saveExerciseGoal(
  db: SQLiteDatabase,
  goal: Omit<ExerciseGoal, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ExerciseGoal> {
  const now = new Date().toISOString();
  // Upsert by exercise_id
  const existing = await db.getFirstAsync<GoalRow>(
    'SELECT * FROM exercise_goals WHERE exercise_id = ?',
    [goal.exerciseId]
  );

  if (existing) {
    await db.runAsync(
      `UPDATE exercise_goals SET current_1rm = ?, target_1rm = ?, target_date = ?, updated_at = ?
       WHERE id = ?`,
      [goal.current1RM, goal.target1RM, goal.targetDate ?? null, now, existing.id]
    );
    return { ...goal, id: existing.id, createdAt: existing.created_at, updatedAt: now };
  }

  const id = uuid();
  await db.runAsync(
    `INSERT INTO exercise_goals (id, exercise_id, current_1rm, target_1rm, target_date, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, goal.exerciseId, goal.current1RM, goal.target1RM, goal.targetDate ?? null, now, now]
  );
  return { ...goal, id, createdAt: now, updatedAt: now };
}

export async function deleteExerciseGoal(
  db: SQLiteDatabase,
  id: string
): Promise<boolean> {
  const result = await db.runAsync('DELETE FROM exercise_goals WHERE id = ?', [id]);
  return result.changes > 0;
}

// ═══════════════════════════════════════════
// Body Measurements
// ═══════════════════════════════════════════

interface MeasurementRow {
  id: string;
  date: string;
  weight: number | null;
  body_fat_percent: number | null;
  lean_mass: number | null;
  neck: number | null;
  chest: number | null;
  waist: number | null;
  hips: number | null;
  bicep_left: number | null;
  bicep_right: number | null;
  thigh_left: number | null;
  thigh_right: number | null;
  calf_left: number | null;
  calf_right: number | null;
  notes: string | null;
  created_at: string;
}

function rowToMeasurement(row: MeasurementRow): BodyMeasurement {
  return {
    id: row.id,
    date: row.date,
    weight: row.weight ?? undefined,
    bodyFatPercent: row.body_fat_percent ?? undefined,
    leanMass: row.lean_mass ?? undefined,
    neck: row.neck ?? undefined,
    chest: row.chest ?? undefined,
    waist: row.waist ?? undefined,
    hips: row.hips ?? undefined,
    bicepLeft: row.bicep_left ?? undefined,
    bicepRight: row.bicep_right ?? undefined,
    thighLeft: row.thigh_left ?? undefined,
    thighRight: row.thigh_right ?? undefined,
    calfLeft: row.calf_left ?? undefined,
    calfRight: row.calf_right ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  };
}

export async function getAllMeasurements(db: SQLiteDatabase): Promise<BodyMeasurement[]> {
  const rows = await db.getAllAsync<MeasurementRow>(
    'SELECT * FROM body_measurements ORDER BY date ASC'
  );
  return rows.map(rowToMeasurement);
}

export async function createMeasurement(
  db: SQLiteDatabase,
  measurement: Omit<BodyMeasurement, 'id' | 'createdAt'>
): Promise<BodyMeasurement> {
  const id = uuid();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO body_measurements (
       id, date, weight, body_fat_percent, lean_mass, neck, chest, waist, hips,
       bicep_left, bicep_right, thigh_left, thigh_right, calf_left, calf_right,
       notes, created_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      measurement.date,
      measurement.weight ?? null,
      measurement.bodyFatPercent ?? null,
      measurement.leanMass ?? null,
      measurement.neck ?? null,
      measurement.chest ?? null,
      measurement.waist ?? null,
      measurement.hips ?? null,
      measurement.bicepLeft ?? null,
      measurement.bicepRight ?? null,
      measurement.thighLeft ?? null,
      measurement.thighRight ?? null,
      measurement.calfLeft ?? null,
      measurement.calfRight ?? null,
      measurement.notes ?? null,
      now,
    ]
  );
  return { ...measurement, id, createdAt: now };
}

// ═══════════════════════════════════════════
// One Rep Max Records
// ═══════════════════════════════════════════

interface ORMRow {
  id: string;
  exercise_name: string;
  weight: number;
  unit: string;
  tested_date: string;
  method: string;
  notes: string | null;
}

function rowToORM(row: ORMRow): OneRepMaxRecord {
  return {
    id: row.id,
    exerciseName: row.exercise_name,
    weight: row.weight,
    unit: row.unit as 'lbs' | 'kg',
    testedDate: row.tested_date,
    method: row.method as 'tested' | 'calculated',
    notes: row.notes ?? undefined,
  };
}

export async function getAllOneRepMaxRecords(db: SQLiteDatabase): Promise<OneRepMaxRecord[]> {
  const rows = await db.getAllAsync<ORMRow>('SELECT * FROM one_rep_max_records');
  return rows.map(rowToORM);
}

export async function upsertOneRepMax(
  db: SQLiteDatabase,
  record: Omit<OneRepMaxRecord, 'id'> & { id?: string }
): Promise<OneRepMaxRecord> {
  const id = record.id || uuid();
  // Replace any existing record for the same exercise
  await db.runAsync(
    'DELETE FROM one_rep_max_records WHERE LOWER(exercise_name) = LOWER(?)',
    [record.exerciseName]
  );
  await db.runAsync(
    `INSERT INTO one_rep_max_records (id, exercise_name, weight, unit, tested_date, method, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, record.exerciseName, record.weight, record.unit, record.testedDate, record.method, record.notes ?? null]
  );
  return { ...record, id };
}

export async function deleteOneRepMax(
  db: SQLiteDatabase,
  id: string
): Promise<boolean> {
  const result = await db.runAsync('DELETE FROM one_rep_max_records WHERE id = ?', [id]);
  return result.changes > 0;
}

// ═══════════════════════════════════════════
// Export History
// ═══════════════════════════════════════════

export async function getExportHistory(db: SQLiteDatabase): Promise<ExportRecord[]> {
  const rows = await db.getAllAsync<{
    id: string; export_type: string; export_date: string;
    file_path: string | null; table_name: string | null;
  }>('SELECT * FROM export_history ORDER BY export_date DESC');
  return rows.map(r => ({
    id: r.id,
    exportType: r.export_type as 'csv' | 'json',
    exportDate: r.export_date,
    filePath: r.file_path ?? undefined,
    tableName: r.table_name ?? undefined,
  }));
}
