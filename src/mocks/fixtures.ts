// Shared Test Fixtures
//
// Pure, side-effect-free builders that produce the canonical test data set
// used by both the local seed (src/db/seedTestData.ts) and the mock API
// handlers (src/mocks/handlers.ts). Keeping one source prevents drift
// between the two test surfaces.
//
// Deterministic: repeated calls with the same inputs return the same data,
// so snapshot tests and manual QA see a stable fixture.

import type {
  AuthUser,
} from '../context/AuthContext';
import type {
  BodyMeasurement,
  Exercise,
  MesoCycle,
  MesoCycleWeek,
  MuscleGroup,
  OneRepMaxRecord,
  UserProfile,
  Workout,
  WorkoutSet,
} from '../types';
import { generateUUID, toISODate } from '../utils';

// ─── Public API ────────────────────────────────────────────

export interface TestFixture {
  users: Array<AuthUser & { password: string }>;
  profile: UserProfile;
  workouts: Workout[];
  workoutSets: WorkoutSet[];
  measurements: BodyMeasurement[];
  oneRepMaxRecords: OneRepMaxRecord[];
  mesocycle: MesoCycle;
}

export interface BuildFixtureOptions {
  /** Reference date — defaults to `new Date()`. Pass a fixed date for snapshot-stable tests. */
  now?: Date;
  /** Map of exercise name (lowercased) → Exercise, used to link sets to real IDs. */
  exercisesByName?: Map<string, Exercise>;
  /** Override the seed used for deterministic randomness. */
  randomSeed?: number;
}

/**
 * Build a complete test fixture — idempotent, no side effects.
 * Pass to `seedTestData` (local storage) or `mockDb.load` (mock API) to populate.
 */
export function buildTestFixture(opts: BuildFixtureOptions = {}): TestFixture {
  const now = opts.now ?? new Date();
  const exercisesByName = opts.exercisesByName ?? new Map();

  const users = buildUsers();
  const profile = buildProfile(now);
  const { workouts, workoutSets } = buildWorkouts(now, exercisesByName);
  const measurements = buildMeasurements(now);
  const oneRepMaxRecords = buildOneRepMax(now);
  const mesocycle = buildMesocycle(now, workouts);

  return { users, profile, workouts, workoutSets, measurements, oneRepMaxRecords, mesocycle };
}

// ─── Users ─────────────────────────────────────────────────

function buildUsers(): Array<AuthUser & { password: string }> {
  return [
    {
      id: 'test-user-1',
      email: 'test@fitness.local',
      displayName: 'Alex Carter (Test)',
      authProvider: 'email',
      createdAt: '2026-01-01T00:00:00.000Z',
      password: 'test1234',
    },
    {
      id: 'test-user-2',
      email: 'demo@fitness.local',
      displayName: 'Jamie Rivera',
      authProvider: 'email',
      createdAt: '2026-02-15T00:00:00.000Z',
      password: 'demo1234',
    },
  ];
}

// ─── Profile ───────────────────────────────────────────────

function buildProfile(now: Date): UserProfile {
  return {
    id: 'test-profile-1',
    weight: 178,
    weightUnit: 'lbs',
    height: 70,
    heightUnit: 'in',
    age: 29,
    gender: 'male',
    bodyFatPercent: 17,
    leanMass: 147.7,
    activityLevel: 'active',
    goalBodyFatPercent: 12,
    goalType: 'cut',
    createdAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: now.toISOString(),
  };
}

// ─── Workouts ──────────────────────────────────────────────

export type ExerciseBlueprint = {
  name: string;
  muscleGroup: MuscleGroup;
  sets: number;
  reps: [number, number];
  baseWeight: number;
  progressionPerWeek: number;
};

export const PUSH_DAY: ExerciseBlueprint[] = [
  { name: 'Barbell Bench Press', muscleGroup: 'chest', sets: 4, reps: [6, 8], baseWeight: 185, progressionPerWeek: 2.5 },
  { name: 'Incline Dumbbell Press', muscleGroup: 'chest', sets: 3, reps: [8, 10], baseWeight: 60, progressionPerWeek: 1.25 },
  { name: 'Overhead Press', muscleGroup: 'shoulders', sets: 3, reps: [6, 8], baseWeight: 115, progressionPerWeek: 2.5 },
  { name: 'Lateral Raises', muscleGroup: 'shoulders', sets: 3, reps: [12, 15], baseWeight: 20, progressionPerWeek: 0.5 },
  { name: 'Tricep Pushdown', muscleGroup: 'triceps', sets: 3, reps: [10, 12], baseWeight: 60, progressionPerWeek: 1.25 },
];

export const PULL_DAY: ExerciseBlueprint[] = [
  { name: 'Barbell Deadlift', muscleGroup: 'back', sets: 4, reps: [5, 6], baseWeight: 275, progressionPerWeek: 5 },
  { name: 'Pull-Ups', muscleGroup: 'back', sets: 4, reps: [6, 10], baseWeight: 0, progressionPerWeek: 0 },
  { name: 'Barbell Row', muscleGroup: 'back', sets: 3, reps: [8, 10], baseWeight: 155, progressionPerWeek: 2.5 },
  { name: 'Face Pulls', muscleGroup: 'shoulders', sets: 3, reps: [12, 15], baseWeight: 40, progressionPerWeek: 1 },
  { name: 'Barbell Curl', muscleGroup: 'biceps', sets: 3, reps: [8, 10], baseWeight: 75, progressionPerWeek: 1.25 },
];

export const LEG_DAY: ExerciseBlueprint[] = [
  { name: 'Barbell Back Squat', muscleGroup: 'quadriceps', sets: 4, reps: [6, 8], baseWeight: 225, progressionPerWeek: 5 },
  { name: 'Romanian Deadlift', muscleGroup: 'hamstrings', sets: 3, reps: [8, 10], baseWeight: 185, progressionPerWeek: 2.5 },
  { name: 'Leg Press', muscleGroup: 'quadriceps', sets: 3, reps: [10, 12], baseWeight: 360, progressionPerWeek: 5 },
  { name: 'Lying Leg Curl', muscleGroup: 'hamstrings', sets: 3, reps: [10, 12], baseWeight: 90, progressionPerWeek: 1.25 },
  { name: 'Standing Calf Raise', muscleGroup: 'calves', sets: 4, reps: [12, 15], baseWeight: 140, progressionPerWeek: 2.5 },
];

const ROTATION: Array<{ name: string; blueprint: ExerciseBlueprint[] }> = [
  { name: 'Push Day', blueprint: PUSH_DAY },
  { name: 'Pull Day', blueprint: PULL_DAY },
  { name: 'Leg Day', blueprint: LEG_DAY },
];

const TRAINING_DAYS = [1, 3, 5]; // Mon / Wed / Fri
export const WEEKS_OF_HISTORY = 8;

function buildWorkouts(
  now: Date,
  exercisesByName: Map<string, Exercise>
): { workouts: Workout[]; workoutSets: WorkoutSet[] } {
  const workouts: Workout[] = [];
  const workoutSets: WorkoutSet[] = [];

  const startOfOldestWeek = new Date(now);
  startOfOldestWeek.setHours(0, 0, 0, 0);
  startOfOldestWeek.setDate(startOfOldestWeek.getDate() - (WEEKS_OF_HISTORY - 1) * 7);
  const dayOfWeek = startOfOldestWeek.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  startOfOldestWeek.setDate(startOfOldestWeek.getDate() + mondayOffset);

  let workoutIndex = 0;

  for (let week = 0; week < WEEKS_OF_HISTORY; week++) {
    for (const trainingDay of TRAINING_DAYS) {
      const session = ROTATION[workoutIndex % ROTATION.length];
      const date = new Date(startOfOldestWeek);
      date.setDate(date.getDate() + week * 7 + (trainingDay - 1));

      if (date > now) {
        workoutIndex++;
        continue;
      }

      const startedAt = new Date(date);
      startedAt.setHours(17, 30, 0, 0);
      const durationMinutes = 55 + Math.floor(seededRandom(workoutIndex) * 20);
      const completedAt = new Date(startedAt);
      completedAt.setMinutes(completedAt.getMinutes() + durationMinutes);

      const inlineSets: NonNullable<Workout['sets']> = [];
      const exercisesSummary: NonNullable<Workout['exercises']> = [];
      const workoutId = `workout-${workoutIndex.toString().padStart(3, '0')}`;

      for (const bp of session.blueprint) {
        const weight = roundToNearest(
          bp.baseWeight + bp.progressionPerWeek * week,
          bp.name === 'Pull-Ups' ? 1 : 2.5
        );
        const exerciseRow = exercisesByName.get(bp.name.toLowerCase());
        const exerciseId = exerciseRow?.id ?? `exercise-${slugify(bp.name)}`;

        const exerciseSets: NonNullable<Workout['exercises']>[number]['sets'] = [];

        for (let setNum = 1; setNum <= bp.sets; setNum++) {
          const targetReps = Math.floor((bp.reps[0] + bp.reps[1]) / 2);
          const actualReps =
            setNum === bp.sets
              ? bp.reps[0] + Math.floor(seededRandom(workoutIndex * 100 + setNum) * 2)
              : targetReps + Math.floor(seededRandom(workoutIndex * 100 + setNum) * 2);
          const rir = setNum === bp.sets ? 0 : 2;

          inlineSets.push({
            exerciseName: bp.name,
            muscleGroup: bp.muscleGroup,
            weight,
            reps: actualReps,
            rir,
            timestamp: new Date(startedAt),
          });

          exerciseSets.push({
            weight,
            targetReps,
            actualReps,
            rir,
            completed: true,
          });

          workoutSets.push({
            id: `set-${workoutIndex}-${slugify(bp.name)}-${setNum}`,
            workoutId,
            exerciseId,
            setNumber: setNum,
            weight,
            weightUnit: 'lbs',
            reps: actualReps,
            rir,
            isWarmup: false,
            createdAt: startedAt.toISOString(),
          });
        }

        exercisesSummary.push({
          exerciseId,
          exerciseName: bp.name,
          sets: exerciseSets,
        });
      }

      workouts.push({
        id: workoutId,
        name: session.name,
        date: date.toISOString(),
        startedAt: startedAt.toISOString(),
        completedAt: completedAt.toISOString(),
        durationMinutes,
        sets: inlineSets,
        exercises: exercisesSummary,
        createdAt: completedAt.toISOString(),
        updatedAt: completedAt.toISOString(),
      });

      workoutIndex++;
    }
  }

  return { workouts, workoutSets };
}

// ─── Body Measurements ─────────────────────────────────────

function buildMeasurements(now: Date): BodyMeasurement[] {
  const measurements: BodyMeasurement[] = [];

  for (let i = WEEKS_OF_HISTORY; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i * 7);
    const weight = roundToNearest(178 + i * 0.8, 0.1);
    const bodyFatPercent = roundToNearest(17 + i * 0.3, 0.1);
    measurements.push({
      id: `measurement-${i.toString().padStart(2, '0')}`,
      date: date.toISOString(),
      weight,
      bodyFatPercent,
      leanMass: roundToNearest(weight * (1 - bodyFatPercent / 100), 0.1),
      waist: roundToNearest(33.5 + i * 0.15, 0.1),
      chest: 42,
      createdAt: date.toISOString(),
    });
  }

  return measurements;
}

// ─── 1RM Records ───────────────────────────────────────────

function buildOneRepMax(now: Date): OneRepMaxRecord[] {
  const today = now.toISOString();
  return [
    { id: 'orm-bench',    exerciseName: 'Barbell Bench Press', weight: 245, unit: 'lbs', testedDate: today, method: 'calculated' },
    { id: 'orm-deadlift', exerciseName: 'Barbell Deadlift',    weight: 365, unit: 'lbs', testedDate: today, method: 'tested' },
    { id: 'orm-squat',    exerciseName: 'Barbell Back Squat',  weight: 305, unit: 'lbs', testedDate: today, method: 'calculated' },
    { id: 'orm-ohp',      exerciseName: 'Overhead Press',      weight: 145, unit: 'lbs', testedDate: today, method: 'calculated' },
    { id: 'orm-row',      exerciseName: 'Barbell Row',         weight: 205, unit: 'lbs', testedDate: today, method: 'calculated' },
  ];
}

// ─── Active Mesocycle ──────────────────────────────────────

function buildMesocycle(now: Date, workouts: Workout[]): MesoCycle {
  const totalWeeks = 5;
  const currentWeek = 3;
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - (currentWeek - 1) * 7);

  const startingVolume = buildMuscleRecord<number>(() => 10);
  const musclePriorities = buildMuscleRecord<any>(() => 'normal');
  const weeklyFrequency = buildMuscleRecord<any>(() => 2);

  const weeks: MesoCycleWeek[] = Array.from({ length: totalWeeks }, (_, i) => {
    const weekNum = i + 1;
    const isDeload = weekNum === totalWeeks;
    const multiplier = isDeload ? 0.6 : 1 + i * 0.1;
    return {
      weekNumber: weekNum,
      isDeload,
      targetVolume: buildMuscleRecord<number>(() => Math.round(10 * multiplier)),
      completedVolume:
        weekNum < currentWeek
          ? buildMuscleRecord<number>(() => Math.round(10 * multiplier))
          : buildMuscleRecord<number>(() => 0),
      workoutIds: [],
      status:
        weekNum < currentWeek ? 'completed'
          : weekNum === currentWeek ? 'in_progress'
          : 'upcoming',
    };
  });

  for (const w of workouts) {
    const diffDays = Math.floor(
      (new Date(w.date).getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays < 0) continue;
    const weekIdx = Math.floor(diffDays / 7);
    if (weekIdx >= 0 && weekIdx < weeks.length) {
      weeks[weekIdx].workoutIds.push(w.id);
    }
  }

  const completedWorkouts = weeks
    .filter((w) => w.status !== 'upcoming')
    .reduce((sum, w) => sum + w.workoutIds.length, 0);

  return {
    id: 'mesocycle-active',
    name: 'Summer Cut Block',
    description: 'Hypertrophy-focused mesocycle with a deload on week 5.',
    startDate: startDate.toISOString(),
    status: 'active',
    totalWeeks,
    currentWeek,
    weeks,
    musclePriorities,
    weeklyFrequency,
    startingVolume,
    volumeProgressionPerWeek: 1,
    totalWorkouts: totalWeeks * 3,
    completedWorkouts,
    createdAt: startDate.toISOString(),
    updatedAt: now.toISOString(),
  };
}

// ─── Helpers ───────────────────────────────────────────────

function buildMuscleRecord<T>(valueFor: (m: MuscleGroup) => T): Record<MuscleGroup, T> {
  const all: MuscleGroup[] = [
    'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
    'quadriceps', 'hamstrings', 'glutes', 'calves', 'core', 'full_body',
  ];
  return Object.fromEntries(all.map((m) => [m, valueFor(m)])) as Record<MuscleGroup, T>;
}

function roundToNearest(value: number, step: number): number {
  return Math.round(value / step) * step;
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
