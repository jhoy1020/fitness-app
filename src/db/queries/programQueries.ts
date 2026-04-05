// Program Queries — CRUD for the programs table

import type { SQLiteDatabase } from 'expo-sqlite';
import type { TrainingProgram } from '../../types';
import { v4 as uuid } from 'uuid';

// ── Row shape ──
interface ProgramRow {
  id: string;
  name: string;
  description: string | null;
  difficulty: string;
  duration_weeks: number;
  days_per_week: number;
  split: string;
  goals_json: string | null;
  muscle_priorities_json: string | null;
  weekly_frequency_json: string | null;
  week_template_json: string;
  week_templates_json: string | null;
  starting_volume_multiplier: number;
  volume_progression_per_week: number;
  tags_json: string | null;
  is_premade: number;
  created_at: string;
  updated_at: string;
  // Phase 8 columns
  creator_id: string | null;
  creator_name: string | null;
  remote_id: string | null;
  visibility: string | null;
  downloads: number | null;
  rating: number | null;
  rating_count: number | null;
  source: string | null;
  cloned_from_id: string | null;
}

function rowToProgram(row: ProgramRow): TrainingProgram {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    difficulty: row.difficulty as TrainingProgram['difficulty'],
    durationWeeks: row.duration_weeks,
    daysPerWeek: row.days_per_week,
    split: row.split,
    goals: row.goals_json ? JSON.parse(row.goals_json) : [],
    musclePriorities: row.muscle_priorities_json
      ? JSON.parse(row.muscle_priorities_json)
      : {},
    weeklyFrequency: row.weekly_frequency_json
      ? JSON.parse(row.weekly_frequency_json)
      : {},
    weekTemplate: JSON.parse(row.week_template_json),
    weekTemplates: row.week_templates_json
      ? JSON.parse(row.week_templates_json)
      : undefined,
    startingVolumeMultiplier: row.starting_volume_multiplier,
    volumeProgressionPerWeek: row.volume_progression_per_week,
    tags: row.tags_json ? JSON.parse(row.tags_json) : [],
    // Phase 8 fields
    creatorId: row.creator_id ?? undefined,
    creatorName: row.creator_name ?? undefined,
    remoteId: row.remote_id ?? undefined,
    visibility: (row.visibility as TrainingProgram['visibility']) ?? undefined,
    downloads: row.downloads ?? undefined,
    rating: row.rating ?? undefined,
    ratingCount: row.rating_count ?? undefined,
    source: (row.source as TrainingProgram['source']) ?? undefined,
    clonedFromId: row.cloned_from_id ?? undefined,
  };
}

export async function getAllPrograms(db: SQLiteDatabase): Promise<TrainingProgram[]> {
  const rows = await db.getAllAsync<ProgramRow>(
    'SELECT * FROM programs ORDER BY name'
  );
  return rows.map(rowToProgram);
}

export async function getProgramById(
  db: SQLiteDatabase,
  id: string
): Promise<TrainingProgram | null> {
  const row = await db.getFirstAsync<ProgramRow>(
    'SELECT * FROM programs WHERE id = ?',
    [id]
  );
  return row ? rowToProgram(row) : null;
}

export async function getCustomPrograms(db: SQLiteDatabase): Promise<TrainingProgram[]> {
  const rows = await db.getAllAsync<ProgramRow>(
    'SELECT * FROM programs WHERE is_premade = 0 ORDER BY updated_at DESC'
  );
  return rows.map(rowToProgram);
}

export async function getPremadePrograms(db: SQLiteDatabase): Promise<TrainingProgram[]> {
  const rows = await db.getAllAsync<ProgramRow>(
    'SELECT * FROM programs WHERE is_premade = 1 ORDER BY difficulty, name'
  );
  return rows.map(rowToProgram);
}

export async function createProgram(
  db: SQLiteDatabase,
  program: TrainingProgram,
  isPremade = false
): Promise<TrainingProgram> {
  const id = program.id || uuid();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO programs (
       id, name, description, difficulty, duration_weeks, days_per_week, split,
       goals_json, muscle_priorities_json, weekly_frequency_json,
       week_template_json, week_templates_json,
       starting_volume_multiplier, volume_progression_per_week,
       tags_json, is_premade, created_at, updated_at,
       creator_id, creator_name, remote_id, visibility,
       downloads, rating, rating_count, source, cloned_from_id
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      program.name,
      program.description ?? null,
      program.difficulty,
      program.durationWeeks,
      program.daysPerWeek,
      program.split,
      JSON.stringify(program.goals),
      JSON.stringify(program.musclePriorities),
      JSON.stringify(program.weeklyFrequency),
      JSON.stringify(program.weekTemplate),
      program.weekTemplates ? JSON.stringify(program.weekTemplates) : null,
      program.startingVolumeMultiplier,
      program.volumeProgressionPerWeek,
      JSON.stringify(program.tags),
      isPremade ? 1 : 0,
      now,
      now,
      program.creatorId ?? null,
      program.creatorName ?? null,
      program.remoteId ?? null,
      program.visibility ?? 'private',
      program.downloads ?? 0,
      program.rating ?? null,
      program.ratingCount ?? 0,
      program.source ?? 'local',
      program.clonedFromId ?? null,
    ]
  );
  return { ...program, id };
}

export async function updateProgram(
  db: SQLiteDatabase,
  id: string,
  updates: Partial<TrainingProgram>
): Promise<TrainingProgram | null> {
  const existing = await getProgramById(db, id);
  if (!existing) return null;

  const merged = { ...existing, ...updates };
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE programs SET
       name = ?, description = ?, difficulty = ?, duration_weeks = ?,
       days_per_week = ?, split = ?, goals_json = ?,
       muscle_priorities_json = ?, weekly_frequency_json = ?,
       week_template_json = ?, week_templates_json = ?,
       starting_volume_multiplier = ?, volume_progression_per_week = ?,
       tags_json = ?, updated_at = ?,
       creator_id = ?, creator_name = ?, remote_id = ?, visibility = ?,
       downloads = ?, rating = ?, rating_count = ?, source = ?, cloned_from_id = ?
     WHERE id = ?`,
    [
      merged.name,
      merged.description ?? null,
      merged.difficulty,
      merged.durationWeeks,
      merged.daysPerWeek,
      merged.split,
      JSON.stringify(merged.goals),
      JSON.stringify(merged.musclePriorities),
      JSON.stringify(merged.weeklyFrequency),
      JSON.stringify(merged.weekTemplate),
      merged.weekTemplates ? JSON.stringify(merged.weekTemplates) : null,
      merged.startingVolumeMultiplier,
      merged.volumeProgressionPerWeek,
      JSON.stringify(merged.tags),
      now,
      merged.creatorId ?? null,
      merged.creatorName ?? null,
      merged.remoteId ?? null,
      merged.visibility ?? 'private',
      merged.downloads ?? 0,
      merged.rating ?? null,
      merged.ratingCount ?? 0,
      merged.source ?? 'local',
      merged.clonedFromId ?? null,
      id,
    ]
  );
  return { ...merged };
}

export async function deleteProgram(
  db: SQLiteDatabase,
  id: string
): Promise<boolean> {
  const result = await db.runAsync('DELETE FROM programs WHERE id = ?', [id]);
  return result.changes > 0;
}

/**
 * Upsert a program — insert if new, update if exists.
 * Used for both saving custom programs and seeding premade ones.
 */
export async function upsertProgram(
  db: SQLiteDatabase,
  program: TrainingProgram,
  isPremade = false
): Promise<TrainingProgram> {
  const existing = await getProgramById(db, program.id);
  if (existing) {
    const updated = await updateProgram(db, program.id, program);
    return updated!;
  }
  return createProgram(db, program, isPremade);
}

/**
 * Bulk-seed premade programs.
 */
export async function seedPrograms(
  db: SQLiteDatabase,
  programs: TrainingProgram[]
): Promise<void> {
  for (const program of programs) {
    await upsertProgram(db, program, true);
  }
}
