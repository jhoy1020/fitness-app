// Database Schema Definitions
// All table DDL for expo-sqlite. Includes future-ready columns (nullable)
// that will be used when the backend is wired in (Phase 8).

/** Current schema version — bump this when adding migrations. */
export const SCHEMA_VERSION = 1;

/**
 * All CREATE TABLE statements for v1.
 * Order matters due to foreign key references.
 */
export const SCHEMA_V1 = `
  -- ─── Exercises ───
  CREATE TABLE IF NOT EXISTS exercises (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    muscle_group TEXT NOT NULL,
    secondary_muscles TEXT,          -- JSON array of MuscleGroup[]
    equipment TEXT NOT NULL,
    tracking_type TEXT DEFAULT 'weight_reps',
    default_rest_seconds INTEGER NOT NULL DEFAULT 120,
    instructions TEXT,
    tips TEXT,
    is_custom INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_exercises_muscle ON exercises(muscle_group);
  CREATE INDEX IF NOT EXISTS idx_exercises_name ON exercises(name);

  -- ─── Workout Templates ───
  CREATE TABLE IF NOT EXISTS workout_templates (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  -- ─── Template Exercises ───
  CREATE TABLE IF NOT EXISTS template_exercises (
    id TEXT PRIMARY KEY NOT NULL,
    template_id TEXT NOT NULL,
    exercise_id TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    target_sets INTEGER NOT NULL DEFAULT 3,
    target_reps_min INTEGER NOT NULL DEFAULT 8,
    target_reps_max INTEGER NOT NULL DEFAULT 12,
    rest_seconds INTEGER,
    notes TEXT,
    FOREIGN KEY (template_id) REFERENCES workout_templates(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id)
  );

  CREATE INDEX IF NOT EXISTS idx_template_exercises_template ON template_exercises(template_id);

  -- ─── Workouts ───
  CREATE TABLE IF NOT EXISTS workouts (
    id TEXT PRIMARY KEY NOT NULL,
    template_id TEXT,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    started_at TEXT,
    completed_at TEXT,
    duration_minutes REAL,
    duration REAL,
    notes TEXT,
    strava_activity_id TEXT,
    day_type TEXT DEFAULT 'workout',
    -- Cardio fields
    cardio_type TEXT,
    distance_miles REAL,
    distance_km REAL,
    pace_min_per_mile REAL,
    pace_min_per_km REAL,
    calories_burned REAL,
    avg_heart_rate REAL,
    max_heart_rate REAL,
    elevation_gain_ft REAL,
    -- Denormalized summaries (JSON)
    sets_json TEXT,                   -- JSON: inline set summaries
    exercises_json TEXT,              -- JSON: exercise summaries
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (template_id) REFERENCES workout_templates(id)
  );

  CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(date DESC);
  CREATE INDEX IF NOT EXISTS idx_workouts_completed ON workouts(completed_at DESC);

  -- ─── Workout Sets ───
  CREATE TABLE IF NOT EXISTS workout_sets (
    id TEXT PRIMARY KEY NOT NULL,
    workout_id TEXT NOT NULL,
    exercise_id TEXT NOT NULL,
    set_number INTEGER NOT NULL,
    weight REAL NOT NULL DEFAULT 0,
    weight_unit TEXT NOT NULL DEFAULT 'lbs',
    reps INTEGER NOT NULL DEFAULT 0,
    duration_seconds REAL,
    rpe REAL,
    rir INTEGER,
    is_warmup INTEGER NOT NULL DEFAULT 0,
    rest_taken_seconds REAL,
    notes TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id)
  );

  CREATE INDEX IF NOT EXISTS idx_workout_sets_workout ON workout_sets(workout_id);
  CREATE INDEX IF NOT EXISTS idx_workout_sets_exercise ON workout_sets(exercise_id);

  -- ─── User Profile ───
  CREATE TABLE IF NOT EXISTS user_profile (
    id TEXT PRIMARY KEY NOT NULL,
    weight REAL NOT NULL,
    weight_unit TEXT NOT NULL DEFAULT 'lbs',
    height REAL NOT NULL,
    height_unit TEXT NOT NULL DEFAULT 'in',
    age INTEGER NOT NULL,
    gender TEXT NOT NULL DEFAULT 'male',
    body_fat_percent REAL,
    lean_mass REAL,
    bmr_override REAL,
    activity_level TEXT NOT NULL DEFAULT 'moderate',
    goal_body_fat_percent REAL,
    goal_type TEXT NOT NULL DEFAULT 'maintain',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    -- Phase 8: auth fields (nullable until backend)
    email TEXT,
    display_name TEXT,
    remote_user_id TEXT,
    auth_provider TEXT,
    avatar_url TEXT
  );

  -- ─── Exercise Goals ───
  CREATE TABLE IF NOT EXISTS exercise_goals (
    id TEXT PRIMARY KEY NOT NULL,
    exercise_id TEXT NOT NULL,
    current_1rm REAL NOT NULL,
    target_1rm REAL NOT NULL,
    target_date TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id)
  );

  -- ─── Body Measurements ───
  CREATE TABLE IF NOT EXISTS body_measurements (
    id TEXT PRIMARY KEY NOT NULL,
    date TEXT NOT NULL,
    weight REAL,
    body_fat_percent REAL,
    lean_mass REAL,
    neck REAL,
    chest REAL,
    waist REAL,
    hips REAL,
    bicep_left REAL,
    bicep_right REAL,
    thigh_left REAL,
    thigh_right REAL,
    calf_left REAL,
    calf_right REAL,
    notes TEXT,
    created_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_body_measurements_date ON body_measurements(date DESC);

  -- ─── One Rep Max Records ───
  CREATE TABLE IF NOT EXISTS one_rep_max_records (
    id TEXT PRIMARY KEY NOT NULL,
    exercise_name TEXT NOT NULL,
    weight REAL NOT NULL,
    unit TEXT NOT NULL DEFAULT 'lbs',
    tested_date TEXT NOT NULL,
    method TEXT NOT NULL DEFAULT 'tested',
    notes TEXT
  );

  -- ─── Training Programs ───
  CREATE TABLE IF NOT EXISTS programs (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    difficulty TEXT NOT NULL DEFAULT 'intermediate',
    duration_weeks INTEGER NOT NULL,
    days_per_week INTEGER NOT NULL,
    split TEXT NOT NULL,
    goals_json TEXT,                    -- JSON: string[]
    muscle_priorities_json TEXT,        -- JSON: Record<MuscleGroup, MusclePriority>
    weekly_frequency_json TEXT,         -- JSON: MuscleFrequency
    week_template_json TEXT NOT NULL,   -- JSON: ProgramWeekTemplate
    week_templates_json TEXT,           -- JSON: ProgramWeekTemplate[] (optional)
    starting_volume_multiplier REAL NOT NULL DEFAULT 1.0,
    volume_progression_per_week REAL NOT NULL DEFAULT 1,
    tags_json TEXT,                     -- JSON: string[]
    is_premade INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    -- Phase 8: sharing fields (nullable until backend)
    creator_id TEXT,
    creator_name TEXT,
    remote_id TEXT,
    visibility TEXT DEFAULT 'private',
    downloads INTEGER DEFAULT 0,
    rating REAL,
    rating_count INTEGER DEFAULT 0,
    source TEXT DEFAULT 'local',
    cloned_from_id TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_programs_difficulty ON programs(difficulty);
  CREATE INDEX IF NOT EXISTS idx_programs_visibility ON programs(visibility);

  -- ─── Mesocycles ───
  CREATE TABLE IF NOT EXISTS mesocycles (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    start_date TEXT NOT NULL,
    end_date TEXT,
    status TEXT NOT NULL DEFAULT 'planned',
    total_weeks INTEGER NOT NULL,
    current_week INTEGER NOT NULL DEFAULT 1,
    weeks_json TEXT NOT NULL,             -- JSON: MesoCycleWeek[]
    muscle_priorities_json TEXT NOT NULL,  -- JSON: Record<MuscleGroup, MusclePriority>
    weekly_frequency_json TEXT NOT NULL,   -- JSON: MuscleFrequency
    starting_volume_json TEXT NOT NULL,    -- JSON: Record<MuscleGroup, number>
    volume_progression_per_week REAL NOT NULL DEFAULT 1,
    program_id TEXT,
    program_name TEXT,
    week_template_json TEXT,              -- JSON: ProgramWeekTemplate
    week_templates_json TEXT,             -- JSON: ProgramWeekTemplate[]
    total_workouts INTEGER NOT NULL DEFAULT 0,
    completed_workouts INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (program_id) REFERENCES programs(id)
  );

  CREATE INDEX IF NOT EXISTS idx_mesocycles_status ON mesocycles(status);

  -- ─── Workout Feedback ───
  CREATE TABLE IF NOT EXISTS workout_feedback (
    id TEXT PRIMARY KEY NOT NULL,
    workout_id TEXT NOT NULL,
    date TEXT NOT NULL,
    pump_rating INTEGER NOT NULL DEFAULT 0,
    soreness_rating INTEGER NOT NULL DEFAULT 0,
    performance_rating INTEGER NOT NULL DEFAULT 0,
    total_score INTEGER NOT NULL DEFAULT 0,
    muscles_feedback_json TEXT,            -- JSON: Record<MuscleGroup, {pump, soreness}>
    notes TEXT,
    FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE
  );

  -- ─── Muscle Fatigue Tracking ───
  CREATE TABLE IF NOT EXISTS muscle_fatigue (
    muscle_group TEXT PRIMARY KEY NOT NULL,
    current_fatigue REAL NOT NULL DEFAULT 0,
    last_trained_date TEXT,
    recovery_rate REAL NOT NULL DEFAULT 10,
    consecutive_hard_sessions INTEGER NOT NULL DEFAULT 0,
    needs_deload INTEGER NOT NULL DEFAULT 0
  );

  -- ─── Export History ───
  CREATE TABLE IF NOT EXISTS export_history (
    id TEXT PRIMARY KEY NOT NULL,
    export_type TEXT NOT NULL,
    export_date TEXT NOT NULL,
    file_path TEXT,
    table_name TEXT
  );

  -- ─── App Metadata (key-value store for migration flags, etc.) ───
  CREATE TABLE IF NOT EXISTS app_meta (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT
  );
`;
