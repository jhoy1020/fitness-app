// Premade Training Programs
// Science-based program templates inspired by RP Hypertrophy methodology

import type { TrainingProgram, MuscleGroup, ProgramDayTemplate } from '../types';

const ALL_MUSCLES: MuscleGroup[] = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
  'quadriceps', 'hamstrings', 'glutes', 'calves', 'core'
];

// Helper to create default priorities
const normalPriorities = (): Record<MuscleGroup, 'focus' | 'normal' | 'maintain'> => 
  Object.fromEntries(ALL_MUSCLES.map(m => [m, 'normal'])) as Record<MuscleGroup, 'focus' | 'normal' | 'maintain'>;

const defaultFrequency = (freq: number): Record<MuscleGroup, number> =>
  Object.fromEntries(ALL_MUSCLES.map(m => [m, freq])) as Record<MuscleGroup, number>;

export const TRAINING_PROGRAMS: TrainingProgram[] = [
  // ============================================
  // BEGINNER PROGRAMS
  // ============================================
  {
    id: 'full-body-3x',
    name: 'Full Body 3x/Week',
    description: 'Perfect for beginners. Train your whole body 3 times per week with compound movements. Great for building a foundation.',
    difficulty: 'beginner',
    durationWeeks: 5,
    daysPerWeek: 3,
    split: 'Full Body',
    goals: ['hypertrophy', 'general_fitness'],
    musclePriorities: normalPriorities(),
    weeklyFrequency: defaultFrequency(3),
    startingVolumeMultiplier: 1.0, // Start at MEV
    volumeProgressionPerWeek: 1,
    tags: ['beginner', 'full-body', '3-days'],
    weekTemplate: {
      days: [
        {
          dayNumber: 1,
          name: 'Full Body A',
          muscleGroups: ['quadriceps', 'chest', 'back', 'shoulders', 'core'],
          exercises: [
            { muscleGroup: 'quadriceps', exerciseName: 'Barbell Back Squat', category: 'compound', sets: 3, repsMin: 8, repsMax: 12, rirTarget: 2, restSeconds: 180 },
            { muscleGroup: 'chest', exerciseName: 'Barbell Bench Press', category: 'compound', sets: 3, repsMin: 8, repsMax: 12, rirTarget: 2, restSeconds: 150 },
            { muscleGroup: 'back', exerciseName: 'Barbell Row', category: 'compound', sets: 3, repsMin: 8, repsMax: 12, rirTarget: 2, restSeconds: 150 },
            { muscleGroup: 'shoulders', exerciseName: 'Overhead Press', category: 'compound', sets: 2, repsMin: 8, repsMax: 12, rirTarget: 2, restSeconds: 120 },
            { muscleGroup: 'core', exerciseName: 'Plank', category: 'isolation', sets: 2, repsMin: 30, repsMax: 60, rirTarget: 1, restSeconds: 60, notes: 'seconds' },
          ],
        },
        {
          dayNumber: 2,
          name: 'Full Body B',
          muscleGroups: ['hamstrings', 'chest', 'back', 'biceps', 'triceps'],
          exercises: [
            { muscleGroup: 'hamstrings', exerciseName: 'Romanian Deadlift', category: 'compound', sets: 3, repsMin: 8, repsMax: 12, rirTarget: 2, restSeconds: 180 },
            { muscleGroup: 'chest', exerciseName: 'Incline Dumbbell Press', category: 'compound', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 120 },
            { muscleGroup: 'back', exerciseName: 'Lat Pulldown', category: 'compound', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 120 },
            { muscleGroup: 'biceps', exerciseName: 'Barbell Curl', category: 'isolation', sets: 2, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 90 },
            { muscleGroup: 'triceps', exerciseName: 'Tricep Pushdown', category: 'isolation', sets: 2, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 90 },
          ],
        },
        {
          dayNumber: 3,
          name: 'Full Body C',
          muscleGroups: ['glutes', 'back', 'shoulders', 'calves', 'core'],
          exercises: [
            { muscleGroup: 'glutes', exerciseName: 'Hip Thrust', category: 'compound', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 120 },
            { muscleGroup: 'back', exerciseName: 'Seated Cable Row', category: 'compound', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 120 },
            { muscleGroup: 'shoulders', exerciseName: 'Lateral Raises', category: 'isolation', sets: 3, repsMin: 12, repsMax: 20, rirTarget: 1, restSeconds: 60 },
            { muscleGroup: 'calves', exerciseName: 'Standing Calf Raise', category: 'isolation', sets: 3, repsMin: 12, repsMax: 20, rirTarget: 1, restSeconds: 60 },
            { muscleGroup: 'core', exerciseName: 'Cable Crunch', category: 'isolation', sets: 2, repsMin: 12, repsMax: 20, rirTarget: 2, restSeconds: 60 },
          ],
        },
      ],
    },
  },

  // ============================================
  // INTERMEDIATE PROGRAMS
  // ============================================
  {
    id: 'upper-lower-4x',
    name: 'Upper/Lower 4x/Week',
    description: 'Classic upper/lower split hitting each muscle group twice per week. Great balance of volume and recovery.',
    difficulty: 'intermediate',
    durationWeeks: 6,
    daysPerWeek: 4,
    split: 'Upper/Lower',
    goals: ['hypertrophy'],
    musclePriorities: normalPriorities(),
    weeklyFrequency: defaultFrequency(2),
    startingVolumeMultiplier: 1.1,
    volumeProgressionPerWeek: 2,
    tags: ['intermediate', 'upper-lower', '4-days'],
    weekTemplate: {
      days: [
        {
          dayNumber: 1,
          name: 'Upper A (Push Focus)',
          muscleGroups: ['chest', 'shoulders', 'triceps', 'back', 'biceps'],
          exercises: [
            { muscleGroup: 'chest', exerciseName: 'Barbell Bench Press', category: 'compound', sets: 4, repsMin: 6, repsMax: 10, rirTarget: 2, restSeconds: 180 },
            { muscleGroup: 'back', exerciseName: 'Barbell Row', category: 'compound', sets: 3, repsMin: 8, repsMax: 12, rirTarget: 2, restSeconds: 150 },
            { muscleGroup: 'shoulders', exerciseName: 'Overhead Press', category: 'compound', sets: 3, repsMin: 8, repsMax: 12, rirTarget: 2, restSeconds: 150 },
            { muscleGroup: 'chest', exerciseName: 'Incline Dumbbell Press', category: 'compound', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 120 },
            { muscleGroup: 'triceps', exerciseName: 'Tricep Pushdown', category: 'isolation', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 1, restSeconds: 90 },
            { muscleGroup: 'biceps', exerciseName: 'Incline Dumbbell Curls', category: 'isolation', sets: 2, repsMin: 10, repsMax: 15, rirTarget: 1, restSeconds: 90 },
          ],
        },
        {
          dayNumber: 2,
          name: 'Lower A (Quad Focus)',
          muscleGroups: ['quadriceps', 'hamstrings', 'glutes', 'calves', 'core'],
          exercises: [
            { muscleGroup: 'quadriceps', exerciseName: 'Barbell Back Squat', category: 'compound', sets: 4, repsMin: 6, repsMax: 10, rirTarget: 2, restSeconds: 180 },
            { muscleGroup: 'hamstrings', exerciseName: 'Romanian Deadlift', category: 'compound', sets: 3, repsMin: 8, repsMax: 12, rirTarget: 2, restSeconds: 150 },
            { muscleGroup: 'quadriceps', exerciseName: 'Leg Press', category: 'compound', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 120 },
            { muscleGroup: 'glutes', exerciseName: 'Hip Thrust', category: 'compound', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 120 },
            { muscleGroup: 'calves', exerciseName: 'Standing Calf Raise', category: 'isolation', sets: 4, repsMin: 12, repsMax: 20, rirTarget: 1, restSeconds: 60 },
            { muscleGroup: 'core', exerciseName: 'Cable Crunch', category: 'isolation', sets: 3, repsMin: 12, repsMax: 20, rirTarget: 1, restSeconds: 60 },
          ],
        },
        {
          dayNumber: 3,
          name: 'Upper B (Pull Focus)',
          muscleGroups: ['back', 'biceps', 'shoulders', 'chest', 'triceps'],
          exercises: [
            { muscleGroup: 'back', exerciseName: 'Pull-Ups', category: 'compound', sets: 4, repsMin: 6, repsMax: 12, rirTarget: 2, restSeconds: 180 },
            { muscleGroup: 'chest', exerciseName: 'Dumbbell Bench Press', category: 'compound', sets: 3, repsMin: 8, repsMax: 12, rirTarget: 2, restSeconds: 150 },
            { muscleGroup: 'back', exerciseName: 'Seated Cable Row', category: 'compound', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 120 },
            { muscleGroup: 'shoulders', exerciseName: 'Lateral Raises', category: 'isolation', sets: 4, repsMin: 12, repsMax: 20, rirTarget: 1, restSeconds: 60 },
            { muscleGroup: 'biceps', exerciseName: 'Barbell Curl', category: 'isolation', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 1, restSeconds: 90 },
            { muscleGroup: 'triceps', exerciseName: 'Overhead Tricep Extension', category: 'isolation', sets: 2, repsMin: 10, repsMax: 15, rirTarget: 1, restSeconds: 90 },
          ],
        },
        {
          dayNumber: 4,
          name: 'Lower B (Posterior Focus)',
          muscleGroups: ['hamstrings', 'glutes', 'quadriceps', 'calves', 'core'],
          exercises: [
            { muscleGroup: 'hamstrings', exerciseName: 'Conventional Deadlift', category: 'compound', sets: 4, repsMin: 5, repsMax: 8, rirTarget: 2, restSeconds: 180 },
            { muscleGroup: 'quadriceps', exerciseName: 'Front Squat', category: 'compound', sets: 3, repsMin: 8, repsMax: 12, rirTarget: 2, restSeconds: 150 },
            { muscleGroup: 'glutes', exerciseName: 'Bulgarian Split Squat', category: 'compound', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 120 },
            { muscleGroup: 'hamstrings', exerciseName: 'Lying Leg Curl', category: 'isolation', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 1, restSeconds: 90 },
            { muscleGroup: 'calves', exerciseName: 'Seated Calf Raise', category: 'isolation', sets: 4, repsMin: 12, repsMax: 20, rirTarget: 1, restSeconds: 60 },
            { muscleGroup: 'core', exerciseName: 'Hanging Leg Raise', category: 'isolation', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 60 },
          ],
        },
      ],
    },
  },

  // ============================================
  // ADVANCED PROGRAMS
  // ============================================
  {
    id: 'ppl-6x',
    name: 'Push/Pull/Legs 6x/Week',
    description: 'Classic PPL split hitting each muscle group twice per week with high frequency. For experienced lifters ready for high volume.',
    difficulty: 'advanced',
    durationWeeks: 6,
    daysPerWeek: 6,
    split: 'Push/Pull/Legs',
    goals: ['hypertrophy'],
    musclePriorities: normalPriorities(),
    weeklyFrequency: defaultFrequency(2),
    startingVolumeMultiplier: 1.2,
    volumeProgressionPerWeek: 2,
    tags: ['advanced', 'ppl', '6-days', 'high-volume'],
    weekTemplate: {
      days: [
        {
          dayNumber: 1,
          name: 'Push A',
          muscleGroups: ['chest', 'shoulders', 'triceps'],
          exercises: [
            { muscleGroup: 'chest', exerciseName: 'Barbell Bench Press', category: 'compound', sets: 4, repsMin: 6, repsMax: 10, rirTarget: 2, restSeconds: 180 },
            { muscleGroup: 'shoulders', exerciseName: 'Overhead Press', category: 'compound', sets: 4, repsMin: 6, repsMax: 10, rirTarget: 2, restSeconds: 150 },
            { muscleGroup: 'chest', exerciseName: 'Incline Dumbbell Press', category: 'compound', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 120 },
            { muscleGroup: 'shoulders', exerciseName: 'Lateral Raises', category: 'isolation', sets: 4, repsMin: 12, repsMax: 20, rirTarget: 1, restSeconds: 60 },
            { muscleGroup: 'triceps', exerciseName: 'Tricep Pushdown', category: 'isolation', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 1, restSeconds: 90 },
            { muscleGroup: 'triceps', exerciseName: 'Overhead Tricep Extension', category: 'isolation', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 1, restSeconds: 90 },
          ],
        },
        {
          dayNumber: 2,
          name: 'Pull A',
          muscleGroups: ['back', 'biceps', 'shoulders'],
          exercises: [
            { muscleGroup: 'back', exerciseName: 'Barbell Row', category: 'compound', sets: 4, repsMin: 6, repsMax: 10, rirTarget: 2, restSeconds: 180 },
            { muscleGroup: 'back', exerciseName: 'Pull-Ups', category: 'compound', sets: 4, repsMin: 6, repsMax: 12, rirTarget: 2, restSeconds: 150 },
            { muscleGroup: 'back', exerciseName: 'Seated Cable Row', category: 'compound', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 120 },
            { muscleGroup: 'shoulders', exerciseName: 'Face Pulls', category: 'isolation', sets: 4, repsMin: 15, repsMax: 20, rirTarget: 1, restSeconds: 60 },
            { muscleGroup: 'biceps', exerciseName: 'Barbell Curl', category: 'isolation', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 1, restSeconds: 90 },
            { muscleGroup: 'biceps', exerciseName: 'Incline Dumbbell Curls', category: 'isolation', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 1, restSeconds: 90 },
          ],
        },
        {
          dayNumber: 3,
          name: 'Legs A',
          muscleGroups: ['quadriceps', 'hamstrings', 'glutes', 'calves'],
          exercises: [
            { muscleGroup: 'quadriceps', exerciseName: 'Barbell Back Squat', category: 'compound', sets: 4, repsMin: 6, repsMax: 10, rirTarget: 2, restSeconds: 180 },
            { muscleGroup: 'hamstrings', exerciseName: 'Romanian Deadlift', category: 'compound', sets: 4, repsMin: 8, repsMax: 12, rirTarget: 2, restSeconds: 150 },
            { muscleGroup: 'quadriceps', exerciseName: 'Leg Press', category: 'compound', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 120 },
            { muscleGroup: 'glutes', exerciseName: 'Hip Thrust', category: 'compound', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 120 },
            { muscleGroup: 'hamstrings', exerciseName: 'Lying Leg Curl', category: 'isolation', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 1, restSeconds: 90 },
            { muscleGroup: 'calves', exerciseName: 'Standing Calf Raise', category: 'isolation', sets: 5, repsMin: 12, repsMax: 20, rirTarget: 1, restSeconds: 60 },
          ],
        },
        {
          dayNumber: 4,
          name: 'Push B',
          muscleGroups: ['chest', 'shoulders', 'triceps'],
          exercises: [
            { muscleGroup: 'chest', exerciseName: 'Incline Barbell Bench Press', category: 'compound', sets: 4, repsMin: 6, repsMax: 10, rirTarget: 2, restSeconds: 180 },
            { muscleGroup: 'shoulders', exerciseName: 'Dumbbell Shoulder Press', category: 'compound', sets: 4, repsMin: 8, repsMax: 12, rirTarget: 2, restSeconds: 150 },
            { muscleGroup: 'chest', exerciseName: 'Cable Fly', category: 'isolation', sets: 3, repsMin: 12, repsMax: 15, rirTarget: 1, restSeconds: 90 },
            { muscleGroup: 'shoulders', exerciseName: 'Lateral Raises', category: 'isolation', sets: 4, repsMin: 12, repsMax: 20, rirTarget: 1, restSeconds: 60 },
            { muscleGroup: 'triceps', exerciseName: 'Close Grip Bench Press', category: 'compound', sets: 3, repsMin: 8, repsMax: 12, rirTarget: 2, restSeconds: 120 },
            { muscleGroup: 'triceps', exerciseName: 'Skull Crushers', category: 'isolation', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 1, restSeconds: 90 },
          ],
        },
        {
          dayNumber: 5,
          name: 'Pull B',
          muscleGroups: ['back', 'biceps', 'shoulders'],
          exercises: [
            { muscleGroup: 'back', exerciseName: 'Lat Pulldown', category: 'compound', sets: 4, repsMin: 8, repsMax: 12, rirTarget: 2, restSeconds: 150 },
            { muscleGroup: 'back', exerciseName: 'Dumbbell Row', category: 'compound', sets: 4, repsMin: 8, repsMax: 12, rirTarget: 2, restSeconds: 150 },
            { muscleGroup: 'back', exerciseName: 'Cable Pullover', category: 'isolation', sets: 3, repsMin: 12, repsMax: 15, rirTarget: 1, restSeconds: 90 },
            { muscleGroup: 'shoulders', exerciseName: 'Rear Delt Flyes', category: 'isolation', sets: 4, repsMin: 12, repsMax: 20, rirTarget: 1, restSeconds: 60 },
            { muscleGroup: 'biceps', exerciseName: 'Hammer Curls', category: 'isolation', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 1, restSeconds: 90 },
            { muscleGroup: 'biceps', exerciseName: 'Preacher Curls', category: 'isolation', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 1, restSeconds: 90 },
          ],
        },
        {
          dayNumber: 6,
          name: 'Legs B',
          muscleGroups: ['quadriceps', 'hamstrings', 'glutes', 'calves'],
          exercises: [
            { muscleGroup: 'quadriceps', exerciseName: 'Front Squat', category: 'compound', sets: 4, repsMin: 6, repsMax: 10, rirTarget: 2, restSeconds: 180 },
            { muscleGroup: 'glutes', exerciseName: 'Bulgarian Split Squat', category: 'compound', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 120 },
            { muscleGroup: 'quadriceps', exerciseName: 'Leg Extension', category: 'isolation', sets: 3, repsMin: 12, repsMax: 15, rirTarget: 1, restSeconds: 90 },
            { muscleGroup: 'hamstrings', exerciseName: 'Seated Leg Curl', category: 'isolation', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 1, restSeconds: 90 },
            { muscleGroup: 'glutes', exerciseName: 'Cable Pull Through', category: 'isolation', sets: 3, repsMin: 12, repsMax: 15, rirTarget: 1, restSeconds: 90 },
            { muscleGroup: 'calves', exerciseName: 'Seated Calf Raise', category: 'isolation', sets: 5, repsMin: 12, repsMax: 20, rirTarget: 1, restSeconds: 60 },
          ],
        },
      ],
    },
  },

  // ============================================
  // SPECIALIZATION PROGRAMS
  // ============================================
  {
    id: 'arm-specialization',
    name: 'Arm Specialization',
    description: 'Focus on building bigger biceps and triceps while maintaining other muscle groups. Hit arms 3x/week with extra volume.',
    difficulty: 'intermediate',
    durationWeeks: 6,
    daysPerWeek: 5,
    split: 'Arms/Push/Pull/Legs',
    goals: ['hypertrophy'],
    musclePriorities: {
      ...normalPriorities(),
      biceps: 'focus',
      triceps: 'focus',
      forearms: 'focus',
    },
    weeklyFrequency: {
      ...defaultFrequency(2),
      biceps: 3,
      triceps: 3,
      forearms: 2,
    },
    startingVolumeMultiplier: 1.0,
    volumeProgressionPerWeek: 2,
    tags: ['intermediate', 'specialization', 'arms', '5-days'],
    weekTemplate: {
      days: [
        {
          dayNumber: 1,
          name: 'Arms Focus',
          muscleGroups: ['biceps', 'triceps', 'forearms'],
          exercises: [
            { muscleGroup: 'biceps', exerciseName: 'Barbell Curl', category: 'isolation', sets: 4, repsMin: 8, repsMax: 12, rirTarget: 2, restSeconds: 120 },
            { muscleGroup: 'triceps', exerciseName: 'Close Grip Bench Press', category: 'compound', sets: 4, repsMin: 8, repsMax: 12, rirTarget: 2, restSeconds: 150 },
            { muscleGroup: 'biceps', exerciseName: 'Incline Dumbbell Curls', category: 'isolation', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 1, restSeconds: 90 },
            { muscleGroup: 'triceps', exerciseName: 'Skull Crushers', category: 'isolation', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 1, restSeconds: 90 },
            { muscleGroup: 'biceps', exerciseName: 'Hammer Curls', category: 'isolation', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 1, restSeconds: 90 },
            { muscleGroup: 'triceps', exerciseName: 'Tricep Pushdown', category: 'isolation', sets: 3, repsMin: 12, repsMax: 15, rirTarget: 1, restSeconds: 60 },
            { muscleGroup: 'forearms', exerciseName: 'Wrist Curl', category: 'isolation', sets: 3, repsMin: 15, repsMax: 20, rirTarget: 1, restSeconds: 60 },
          ],
        },
        {
          dayNumber: 2,
          name: 'Push',
          muscleGroups: ['chest', 'shoulders', 'triceps'],
          exercises: [
            { muscleGroup: 'chest', exerciseName: 'Barbell Bench Press', category: 'compound', sets: 3, repsMin: 6, repsMax: 10, rirTarget: 2, restSeconds: 180 },
            { muscleGroup: 'shoulders', exerciseName: 'Overhead Press', category: 'compound', sets: 3, repsMin: 8, repsMax: 12, rirTarget: 2, restSeconds: 150 },
            { muscleGroup: 'chest', exerciseName: 'Incline Dumbbell Press', category: 'compound', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 120 },
            { muscleGroup: 'shoulders', exerciseName: 'Lateral Raises', category: 'isolation', sets: 3, repsMin: 12, repsMax: 20, rirTarget: 1, restSeconds: 60 },
            { muscleGroup: 'triceps', exerciseName: 'Overhead Tricep Extension', category: 'isolation', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 1, restSeconds: 90 },
          ],
        },
        {
          dayNumber: 3,
          name: 'Pull',
          muscleGroups: ['back', 'biceps', 'shoulders'],
          exercises: [
            { muscleGroup: 'back', exerciseName: 'Barbell Row', category: 'compound', sets: 3, repsMin: 6, repsMax: 10, rirTarget: 2, restSeconds: 180 },
            { muscleGroup: 'back', exerciseName: 'Lat Pulldown', category: 'compound', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 120 },
            { muscleGroup: 'back', exerciseName: 'Seated Cable Row', category: 'compound', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 120 },
            { muscleGroup: 'shoulders', exerciseName: 'Face Pulls', category: 'isolation', sets: 3, repsMin: 15, repsMax: 20, rirTarget: 1, restSeconds: 60 },
            { muscleGroup: 'biceps', exerciseName: 'Preacher Curls', category: 'isolation', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 1, restSeconds: 90 },
          ],
        },
        {
          dayNumber: 4,
          name: 'Legs',
          muscleGroups: ['quadriceps', 'hamstrings', 'glutes', 'calves'],
          exercises: [
            { muscleGroup: 'quadriceps', exerciseName: 'Barbell Back Squat', category: 'compound', sets: 4, repsMin: 6, repsMax: 10, rirTarget: 2, restSeconds: 180 },
            { muscleGroup: 'hamstrings', exerciseName: 'Romanian Deadlift', category: 'compound', sets: 3, repsMin: 8, repsMax: 12, rirTarget: 2, restSeconds: 150 },
            { muscleGroup: 'quadriceps', exerciseName: 'Leg Press', category: 'compound', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 120 },
            { muscleGroup: 'glutes', exerciseName: 'Hip Thrust', category: 'compound', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 120 },
            { muscleGroup: 'calves', exerciseName: 'Standing Calf Raise', category: 'isolation', sets: 4, repsMin: 12, repsMax: 20, rirTarget: 1, restSeconds: 60 },
          ],
        },
        {
          dayNumber: 5,
          name: 'Arms + Shoulders',
          muscleGroups: ['biceps', 'triceps', 'shoulders'],
          exercises: [
            { muscleGroup: 'shoulders', exerciseName: 'Dumbbell Shoulder Press', category: 'compound', sets: 3, repsMin: 8, repsMax: 12, rirTarget: 2, restSeconds: 150 },
            { muscleGroup: 'biceps', exerciseName: 'Cable Curls', category: 'isolation', sets: 3, repsMin: 12, repsMax: 15, rirTarget: 1, restSeconds: 90 },
            { muscleGroup: 'triceps', exerciseName: 'Dip', category: 'compound', sets: 3, repsMin: 8, repsMax: 12, rirTarget: 2, restSeconds: 120 },
            { muscleGroup: 'shoulders', exerciseName: 'Lateral Raises', category: 'isolation', sets: 4, repsMin: 12, repsMax: 20, rirTarget: 1, restSeconds: 60 },
            { muscleGroup: 'biceps', exerciseName: 'Concentration Curls', category: 'isolation', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 1, restSeconds: 90 },
            { muscleGroup: 'triceps', exerciseName: 'Tricep Kickback', category: 'isolation', sets: 3, repsMin: 12, repsMax: 15, rirTarget: 1, restSeconds: 60 },
          ],
        },
      ],
    },
  },

  {
    id: 'leg-specialization',
    name: 'Leg Specialization',
    description: 'Build bigger quads, hamstrings, and glutes with extra leg volume. Ideal for those looking to bring up lagging legs.',
    difficulty: 'intermediate',
    durationWeeks: 6,
    daysPerWeek: 5,
    split: 'Legs/Upper',
    goals: ['hypertrophy'],
    musclePriorities: {
      ...normalPriorities(),
      quadriceps: 'focus',
      hamstrings: 'focus',
      glutes: 'focus',
      calves: 'focus',
    },
    weeklyFrequency: {
      ...defaultFrequency(2),
      quadriceps: 3,
      hamstrings: 3,
      glutes: 3,
      calves: 3,
    },
    startingVolumeMultiplier: 1.0,
    volumeProgressionPerWeek: 2,
    tags: ['intermediate', 'specialization', 'legs', '5-days'],
    weekTemplate: {
      days: [
        {
          dayNumber: 1,
          name: 'Legs - Quad Focus',
          muscleGroups: ['quadriceps', 'glutes', 'calves'],
          exercises: [
            { muscleGroup: 'quadriceps', exerciseName: 'Barbell Back Squat', category: 'compound', sets: 5, repsMin: 6, repsMax: 10, rirTarget: 2, restSeconds: 180 },
            { muscleGroup: 'quadriceps', exerciseName: 'Leg Press', category: 'compound', sets: 4, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 150 },
            { muscleGroup: 'quadriceps', exerciseName: 'Leg Extension', category: 'isolation', sets: 3, repsMin: 12, repsMax: 15, rirTarget: 1, restSeconds: 90 },
            { muscleGroup: 'glutes', exerciseName: 'Hip Thrust', category: 'compound', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 120 },
            { muscleGroup: 'calves', exerciseName: 'Standing Calf Raise', category: 'isolation', sets: 4, repsMin: 12, repsMax: 20, rirTarget: 1, restSeconds: 60 },
          ],
        },
        {
          dayNumber: 2,
          name: 'Upper Push',
          muscleGroups: ['chest', 'shoulders', 'triceps'],
          exercises: [
            { muscleGroup: 'chest', exerciseName: 'Barbell Bench Press', category: 'compound', sets: 3, repsMin: 6, repsMax: 10, rirTarget: 2, restSeconds: 180 },
            { muscleGroup: 'shoulders', exerciseName: 'Overhead Press', category: 'compound', sets: 3, repsMin: 8, repsMax: 12, rirTarget: 2, restSeconds: 150 },
            { muscleGroup: 'chest', exerciseName: 'Incline Dumbbell Press', category: 'compound', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 120 },
            { muscleGroup: 'shoulders', exerciseName: 'Lateral Raises', category: 'isolation', sets: 3, repsMin: 12, repsMax: 20, rirTarget: 1, restSeconds: 60 },
            { muscleGroup: 'triceps', exerciseName: 'Tricep Pushdown', category: 'isolation', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 1, restSeconds: 90 },
          ],
        },
        {
          dayNumber: 3,
          name: 'Legs - Posterior Focus',
          muscleGroups: ['hamstrings', 'glutes', 'calves'],
          exercises: [
            { muscleGroup: 'hamstrings', exerciseName: 'Romanian Deadlift', category: 'compound', sets: 5, repsMin: 8, repsMax: 12, rirTarget: 2, restSeconds: 180 },
            { muscleGroup: 'glutes', exerciseName: 'Bulgarian Split Squat', category: 'compound', sets: 4, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 150 },
            { muscleGroup: 'hamstrings', exerciseName: 'Lying Leg Curl', category: 'isolation', sets: 4, repsMin: 10, repsMax: 15, rirTarget: 1, restSeconds: 90 },
            { muscleGroup: 'glutes', exerciseName: 'Cable Pull Through', category: 'isolation', sets: 3, repsMin: 12, repsMax: 15, rirTarget: 1, restSeconds: 90 },
            { muscleGroup: 'calves', exerciseName: 'Seated Calf Raise', category: 'isolation', sets: 4, repsMin: 12, repsMax: 20, rirTarget: 1, restSeconds: 60 },
          ],
        },
        {
          dayNumber: 4,
          name: 'Upper Pull',
          muscleGroups: ['back', 'biceps', 'shoulders'],
          exercises: [
            { muscleGroup: 'back', exerciseName: 'Barbell Row', category: 'compound', sets: 3, repsMin: 6, repsMax: 10, rirTarget: 2, restSeconds: 180 },
            { muscleGroup: 'back', exerciseName: 'Lat Pulldown', category: 'compound', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 120 },
            { muscleGroup: 'back', exerciseName: 'Seated Cable Row', category: 'compound', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 120 },
            { muscleGroup: 'shoulders', exerciseName: 'Face Pulls', category: 'isolation', sets: 3, repsMin: 15, repsMax: 20, rirTarget: 1, restSeconds: 60 },
            { muscleGroup: 'biceps', exerciseName: 'Barbell Curl', category: 'isolation', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 1, restSeconds: 90 },
          ],
        },
        {
          dayNumber: 5,
          name: 'Legs - All Around',
          muscleGroups: ['quadriceps', 'hamstrings', 'glutes', 'calves'],
          exercises: [
            { muscleGroup: 'quadriceps', exerciseName: 'Front Squat', category: 'compound', sets: 4, repsMin: 6, repsMax: 10, rirTarget: 2, restSeconds: 180 },
            { muscleGroup: 'hamstrings', exerciseName: 'Good Morning', category: 'compound', sets: 3, repsMin: 8, repsMax: 12, rirTarget: 2, restSeconds: 150 },
            { muscleGroup: 'glutes', exerciseName: 'Walking Lunge', category: 'compound', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 120 },
            { muscleGroup: 'quadriceps', exerciseName: 'Leg Extension', category: 'isolation', sets: 3, repsMin: 12, repsMax: 15, rirTarget: 1, restSeconds: 90 },
            { muscleGroup: 'hamstrings', exerciseName: 'Seated Leg Curl', category: 'isolation', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 1, restSeconds: 90 },
            { muscleGroup: 'calves', exerciseName: 'Donkey Calf Raise', category: 'isolation', sets: 4, repsMin: 12, repsMax: 20, rirTarget: 1, restSeconds: 60 },
          ],
        },
      ],
    },
  },
];

export default TRAINING_PROGRAMS;
