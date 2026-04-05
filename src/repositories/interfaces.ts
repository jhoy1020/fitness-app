// Repository Interfaces
//
// The repository pattern abstracts data access behind a uniform interface.
// Phase 1–7: only LocalXxxRepository (expo-sqlite) is implemented.
// Phase 8: RemoteXxxRepository (HTTP API) will implement the same interfaces,
// and a HybridRepository can wrap both for offline-first sync.
//
// Rules:
//   - Every method returns Promise<T> (works for both local & remote).
//   - Repositories are injected via DatabaseProvider context.
//   - Hooks consume repositories — never SQLite directly.
//   - Screens consume hooks — never repositories directly.

import type {
  Exercise,
  MuscleGroup,
  Workout,
  WorkoutSet,
  WorkoutTemplate,
  TemplateExercise,
  TrainingProgram,
  UserProfile,
  ExerciseGoal,
  BodyMeasurement,
  OneRepMaxRecord,
  MesoCycle,
  WorkoutFeedback,
  MuscleFatigue,
  ExportRecord,
  ProgramSearchFilters,
  PaginatedResponse,
} from '../types';

// ═══════════════════════════════════════════
// Exercise Repository
// ═══════════════════════════════════════════

export interface IExerciseRepository {
  getAll(): Promise<Exercise[]>;
  getById(id: string): Promise<Exercise | null>;
  getByMuscleGroup(muscleGroup: MuscleGroup): Promise<Exercise[]>;
  create(exercise: Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>): Promise<Exercise>;
  update(id: string, updates: Partial<Exercise>): Promise<Exercise | null>;
  delete(id: string): Promise<boolean>;
}

// ═══════════════════════════════════════════
// Workout Repository
// ═══════════════════════════════════════════

export interface IWorkoutRepository {
  getAll(): Promise<Workout[]>;
  getById(id: string): Promise<Workout | null>;
  getRecent(limit?: number): Promise<Workout[]>;
  create(workout: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>): Promise<Workout>;
  update(id: string, updates: Partial<Workout>): Promise<Workout | null>;
  delete(id: string): Promise<boolean>;

  // Sets
  getSetsByWorkoutId(workoutId: string): Promise<WorkoutSet[]>;
  getSetsByExerciseId(exerciseId: string, limit?: number): Promise<WorkoutSet[]>;
  createSet(set: Omit<WorkoutSet, 'id' | 'createdAt'>): Promise<WorkoutSet>;
  updateSet(id: string, updates: Partial<WorkoutSet>): Promise<WorkoutSet | null>;
  deleteSet(id: string): Promise<boolean>;

  // Templates
  getAllTemplates(): Promise<WorkoutTemplate[]>;
  getTemplateById(id: string): Promise<WorkoutTemplate | null>;
  createTemplate(template: Omit<WorkoutTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkoutTemplate>;
  updateTemplate(id: string, updates: Partial<WorkoutTemplate>): Promise<WorkoutTemplate | null>;
  deleteTemplate(id: string): Promise<boolean>;
  getTemplateExercises(templateId: string): Promise<TemplateExercise[]>;
  createTemplateExercise(te: Omit<TemplateExercise, 'id'>): Promise<TemplateExercise>;
}

// ═══════════════════════════════════════════
// Program Repository
// ═══════════════════════════════════════════

export interface IProgramRepository {
  getAll(): Promise<TrainingProgram[]>;
  getById(id: string): Promise<TrainingProgram | null>;
  getCustom(): Promise<TrainingProgram[]>;
  getPremade(): Promise<TrainingProgram[]>;
  create(program: TrainingProgram, isPremade?: boolean): Promise<TrainingProgram>;
  update(id: string, updates: Partial<TrainingProgram>): Promise<TrainingProgram | null>;
  upsert(program: TrainingProgram, isPremade?: boolean): Promise<TrainingProgram>;
  delete(id: string): Promise<boolean>;

  // ── Phase 8 stubs (not implemented in local repository) ──
  /** Browse the public program library (requires backend). */
  getPublicPrograms?(filters: ProgramSearchFilters): Promise<PaginatedResponse<TrainingProgram>>;
  /** Clone a public program to the current user's account. */
  cloneProgram?(programId: string): Promise<TrainingProgram>;
  /** Submit a rating for a public program. */
  rateProgram?(programId: string, rating: number, review?: string): Promise<void>;
}

// ═══════════════════════════════════════════
// User Repository
// ═══════════════════════════════════════════

export interface IUserRepository {
  getProfile(): Promise<UserProfile | null>;
  saveProfile(profile: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserProfile>;

  // Goals
  getAllGoals(): Promise<ExerciseGoal[]>;
  saveGoal(goal: Omit<ExerciseGoal, 'id' | 'createdAt' | 'updatedAt'>): Promise<ExerciseGoal>;
  deleteGoal(id: string): Promise<boolean>;

  // Measurements
  getAllMeasurements(): Promise<BodyMeasurement[]>;
  createMeasurement(m: Omit<BodyMeasurement, 'id' | 'createdAt'>): Promise<BodyMeasurement>;

  // 1RM Records
  getAllOneRepMax(): Promise<OneRepMaxRecord[]>;
  upsertOneRepMax(record: Omit<OneRepMaxRecord, 'id'> & { id?: string }): Promise<OneRepMaxRecord>;
  deleteOneRepMax(id: string): Promise<boolean>;

  // Export History
  getExportHistory(): Promise<ExportRecord[]>;
}

// ═══════════════════════════════════════════
// Mesocycle Repository
// ═══════════════════════════════════════════

export interface IMesoCycleRepository {
  getActive(): Promise<MesoCycle | null>;
  getById(id: string): Promise<MesoCycle | null>;
  getAll(): Promise<MesoCycle[]>;
  create(meso: MesoCycle): Promise<MesoCycle>;
  update(id: string, updates: Partial<MesoCycle>): Promise<MesoCycle | null>;
  delete(id: string): Promise<boolean>;

  // Feedback
  getAllFeedback(): Promise<WorkoutFeedback[]>;
  createFeedback(feedback: WorkoutFeedback): Promise<WorkoutFeedback>;

  // Fatigue
  getAllFatigue(): Promise<Record<MuscleGroup, MuscleFatigue>>;
  upsertFatigue(fatigue: MuscleFatigue): Promise<void>;

  // App Metadata
  getMeta(key: string): Promise<string | null>;
  setMeta(key: string, value: string): Promise<void>;
}

// ═══════════════════════════════════════════
// Aggregate — all repositories in one object
// ═══════════════════════════════════════════

export interface Repositories {
  exercises: IExerciseRepository;
  workouts: IWorkoutRepository;
  programs: IProgramRepository;
  users: IUserRepository;
  mesocycles: IMesoCycleRepository;
}
