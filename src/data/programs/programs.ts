// Premade Training Programs
// Science-based program templates inspired by RP Hypertrophy methodology

import type { TrainingProgram, MuscleGroup, ProgramDayTemplate, AbFinisher } from '../../types';

const ALL_MUSCLES: MuscleGroup[] = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
  'quadriceps', 'hamstrings', 'glutes', 'calves', 'core'
];

// Helper to create default priorities
const normalPriorities = (): Record<MuscleGroup, 'focus' | 'normal' | 'maintain'> => 
  Object.fromEntries(ALL_MUSCLES.map(m => [m, 'normal'])) as Record<MuscleGroup, 'focus' | 'normal' | 'maintain'>;

const defaultFrequency = (freq: number): Record<MuscleGroup, number> =>
  Object.fromEntries(ALL_MUSCLES.map(m => [m, freq])) as Record<MuscleGroup, number>;

// ============================================
// AB FINISHER LIBRARY
// ============================================
export const AB_FINISHERS: Record<string, AbFinisher> = {
  // Quick finishers (5 min or less)
  quickCore: {
    name: 'Quick Core Blast',
    type: 'circuits',
    rounds: 2,
    restBetweenExercises: 0,
    restBetweenRounds: 30,
    description: 'Fast 5-minute ab finisher',
    exercises: [
      { name: 'Crunches', reps: 20 },
      { name: 'Leg Raises', reps: 15 },
      { name: 'Plank', duration: 30 },
    ],
  },
  plankChallenge: {
    name: 'Plank Challenge',
    type: 'straight_sets',
    description: 'Build core endurance with planks',
    exercises: [
      { name: 'Front Plank', duration: 45 },
      { name: 'Left Side Plank', duration: 30 },
      { name: 'Right Side Plank', duration: 30 },
      { name: 'Front Plank', duration: 45 },
    ],
    restBetweenExercises: 15,
  },
  
  // Medium finishers (5-10 min)
  sixPackCircuit: {
    name: '6-Pack Circuit',
    type: 'circuits',
    rounds: 3,
    restBetweenExercises: 10,
    restBetweenRounds: 45,
    description: 'Complete ab circuit hitting all areas',
    exercises: [
      { name: 'Bicycle Crunches', reps: 20 },
      { name: 'Reverse Crunches', reps: 15 },
      { name: 'Mountain Climbers', reps: 20 },
      { name: 'Dead Bug', reps: 10 },
    ],
  },
  coreEMOM: {
    name: 'Core EMOM',
    type: 'emom',
    durationMinutes: 8,
    description: 'Every minute on the minute - alternate exercises',
    exercises: [
      { name: 'Hanging Leg Raises', reps: 10 },
      { name: 'Ab Wheel Rollout', reps: 8 },
    ],
  },
  
  // Intense finishers (10+ min)
  absOfSteel: {
    name: 'Abs of Steel',
    type: 'circuits',
    rounds: 4,
    restBetweenExercises: 15,
    restBetweenRounds: 60,
    description: 'Intense ab circuit for advanced trainees',
    exercises: [
      { name: 'Hanging Leg Raises', reps: 12 },
      { name: 'Cable Crunch', reps: 15 },
      { name: 'Russian Twist', reps: 20 },
      { name: 'Plank', duration: 45 },
      { name: 'V-Ups', reps: 12 },
    ],
  },
  coreAMRAP: {
    name: '10-Min Core AMRAP',
    type: 'amrap',
    durationMinutes: 10,
    description: 'As many rounds as possible in 10 minutes',
    exercises: [
      { name: 'Sit-Ups', reps: 15 },
      { name: 'Flutter Kicks', reps: 20 },
      { name: 'Plank Shoulder Taps', reps: 10 },
    ],
  },
  
  // Bodyweight only
  noEquipmentAbs: {
    name: 'No Equipment Abs',
    type: 'circuits',
    rounds: 3,
    restBetweenExercises: 10,
    restBetweenRounds: 45,
    description: 'Effective abs with no equipment needed',
    exercises: [
      { name: 'Crunches', reps: 25 },
      { name: 'Leg Raises', reps: 15 },
      { name: 'Bicycle Crunches', reps: 20 },
      { name: 'Plank', duration: 40 },
      { name: 'Mountain Climbers', reps: 20 },
    ],
  },
  
  // Lower abs focus
  lowerAbsBlaster: {
    name: 'Lower Abs Blaster',
    type: 'circuits',
    rounds: 3,
    restBetweenExercises: 15,
    restBetweenRounds: 45,
    description: 'Target the hard-to-hit lower abs',
    exercises: [
      { name: 'Reverse Crunches', reps: 15 },
      { name: 'Leg Raises', reps: 12 },
      { name: 'Scissor Kicks', reps: 20 },
      { name: 'Dead Bug', reps: 10 },
    ],
  },
  
  // Obliques focus
  obliqueObliterator: {
    name: 'Oblique Obliterator',
    type: 'circuits',
    rounds: 3,
    restBetweenExercises: 15,
    restBetweenRounds: 45,
    description: 'Carve your obliques',
    exercises: [
      { name: 'Russian Twist', reps: 20 },
      { name: 'Side Plank Dips (Left)', reps: 12 },
      { name: 'Side Plank Dips (Right)', reps: 12 },
      { name: 'Bicycle Crunches', reps: 20 },
    ],
  },
};

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
          abFinisher: AB_FINISHERS.quickCore,
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
          abFinisher: AB_FINISHERS.plankChallenge,
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
        {
          dayNumber: 5,
          name: 'Cardio & Conditioning',
          dayType: 'cardio',
          notes: 'Optional cardio day. Choose any activity below or do your own.',
          cardioActivities: [
            { id: 'ul-cardio-1', type: 'walking', name: 'Incline Treadmill Walk', durationMinutes: 30, intensity: 'moderate' },
            { id: 'ul-cardio-2', type: 'cycling', name: 'Stationary Bike', durationMinutes: 25, intensity: 'moderate' },
          ],
        },
        {
          dayNumber: 6,
          name: 'Active Recovery',
          dayType: 'active_recovery',
          notes: 'Light movement and mobility work to prepare for next week.',
          recoverySuggestions: [
            { activity: 'yoga', name: 'Gentle Yoga Flow', durationMinutes: 30, description: 'Sun salutations at easy pace', targetMuscles: ['full_body'], rationale: 'Full body stretch and mobility' },
            { activity: 'foam_rolling', name: 'Full Body Roll', durationMinutes: 15, description: 'Roll all major muscle groups', targetMuscles: ['full_body'], rationale: 'Releases tension from training week' },
          ],
        },
        {
          dayNumber: 7,
          name: 'Rest Day',
          dayType: 'rest',
          notes: 'Complete rest. Sleep well and eat enough protein for recovery.',
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
          abFinisher: AB_FINISHERS.sixPackCircuit,
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
          abFinisher: AB_FINISHERS.lowerAbsBlaster,
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
          abFinisher: AB_FINISHERS.absOfSteel,
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
          abFinisher: AB_FINISHERS.coreEMOM,
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
          cardioFinisher: { type: 'walking', name: '10 min Incline Walk', durationMinutes: 10, intensity: 'low' },
        },
        {
          dayNumber: 7,
          name: 'Rest / Active Recovery',
          dayType: 'active_recovery',
          notes: 'Focus on recovery to prepare for next week. Light activity recommended.',
          recoverySuggestions: [
            { activity: 'foam_rolling', name: 'Full Body Roll', durationMinutes: 15, description: 'Roll all major muscle groups', targetMuscles: ['full_body'], rationale: 'Releases tension from high volume week' },
            { activity: 'light_walking', name: 'Easy Walk', durationMinutes: 20, description: 'Flat terrain, conversational pace', targetMuscles: ['full_body'], rationale: 'Promotes blood flow and recovery' },
            { activity: 'stretching', name: 'Full Body Stretch', durationMinutes: 15, description: 'Hold each stretch 30-60 seconds', targetMuscles: ['full_body'], rationale: 'Maintains flexibility after intense training' },
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

  // ============================================
  // SUPERSET / TIME-EFFICIENT PROGRAMS
  // ============================================
  {
    id: 'superset-upper-lower-4x',
    name: 'Superset Upper/Lower 4x/Week',
    description: 'Time-efficient program using supersets to cut workout time in half. Pairs antagonist muscles for maximum efficiency without sacrificing gains.',
    difficulty: 'intermediate',
    durationWeeks: 6,
    daysPerWeek: 4,
    split: 'Upper/Lower',
    goals: ['hypertrophy', 'general_fitness'],
    musclePriorities: normalPriorities(),
    weeklyFrequency: defaultFrequency(2),
    startingVolumeMultiplier: 1.1,
    volumeProgressionPerWeek: 2,
    tags: ['intermediate', 'upper-lower', '4-days', 'superset', 'time-efficient'],
    weekTemplate: {
      days: [
        {
          dayNumber: 1,
          name: 'Upper A (Supersets)',
          muscleGroups: ['chest', 'back', 'shoulders', 'biceps', 'triceps'],
          exercises: [
            // Superset 1: Chest + Back (antagonist pairing)
            { muscleGroup: 'chest', exerciseName: 'Barbell Bench Press', category: 'compound', sets: 4, repsMin: 6, repsMax: 10, rirTarget: 2, restSeconds: 30, supersetGroupId: 'upper-a-ss1', supersetOrder: 0, notes: 'Superset with Barbell Row' },
            { muscleGroup: 'back', exerciseName: 'Barbell Row', category: 'compound', sets: 4, repsMin: 6, repsMax: 10, rirTarget: 2, restSeconds: 120, supersetGroupId: 'upper-a-ss1', supersetOrder: 1, notes: 'Superset with Bench Press' },
            // Superset 2: Incline Press + Lat Pulldown
            { muscleGroup: 'chest', exerciseName: 'Incline Dumbbell Press', category: 'compound', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 30, supersetGroupId: 'upper-a-ss2', supersetOrder: 0, notes: 'Superset with Lat Pulldown' },
            { muscleGroup: 'back', exerciseName: 'Lat Pulldown', category: 'compound', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 90, supersetGroupId: 'upper-a-ss2', supersetOrder: 1, notes: 'Superset with Incline Press' },
            // Superset 3: Biceps + Triceps
            { muscleGroup: 'biceps', exerciseName: 'Barbell Curl', category: 'isolation', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 1, restSeconds: 15, supersetGroupId: 'upper-a-ss3', supersetOrder: 0, notes: 'Superset with Triceps' },
            { muscleGroup: 'triceps', exerciseName: 'Tricep Pushdown', category: 'isolation', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 1, restSeconds: 60, supersetGroupId: 'upper-a-ss3', supersetOrder: 1, notes: 'Superset with Curls' },
            // Standalone
            { muscleGroup: 'shoulders', exerciseName: 'Lateral Raises', category: 'isolation', sets: 4, repsMin: 12, repsMax: 20, rirTarget: 1, restSeconds: 60 },
          ],
        },
        {
          dayNumber: 2,
          name: 'Lower A (Supersets)',
          muscleGroups: ['quadriceps', 'hamstrings', 'glutes', 'calves', 'core'],
          exercises: [
            // Heavy compound first - no superset
            { muscleGroup: 'quadriceps', exerciseName: 'Barbell Back Squat', category: 'compound', sets: 4, repsMin: 6, repsMax: 10, rirTarget: 2, restSeconds: 180 },
            // Superset: Leg Press + RDL
            { muscleGroup: 'quadriceps', exerciseName: 'Leg Press', category: 'compound', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 30, supersetGroupId: 'lower-a-ss1', supersetOrder: 0, notes: 'Superset with RDL' },
            { muscleGroup: 'hamstrings', exerciseName: 'Romanian Deadlift', category: 'compound', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 90, supersetGroupId: 'lower-a-ss1', supersetOrder: 1, notes: 'Superset with Leg Press' },
            // Superset: Leg Extension + Leg Curl
            { muscleGroup: 'quadriceps', exerciseName: 'Leg Extension', category: 'isolation', sets: 3, repsMin: 12, repsMax: 15, rirTarget: 1, restSeconds: 15, supersetGroupId: 'lower-a-ss2', supersetOrder: 0, notes: 'Superset with Leg Curl' },
            { muscleGroup: 'hamstrings', exerciseName: 'Lying Leg Curl', category: 'isolation', sets: 3, repsMin: 12, repsMax: 15, rirTarget: 1, restSeconds: 60, supersetGroupId: 'lower-a-ss2', supersetOrder: 1, notes: 'Superset with Leg Extension' },
            // Superset: Calves + Core
            { muscleGroup: 'calves', exerciseName: 'Standing Calf Raise', category: 'isolation', sets: 4, repsMin: 12, repsMax: 20, rirTarget: 1, restSeconds: 15, supersetGroupId: 'lower-a-ss3', supersetOrder: 0, notes: 'Superset with Core' },
            { muscleGroup: 'core', exerciseName: 'Cable Crunch', category: 'isolation', sets: 3, repsMin: 12, repsMax: 20, rirTarget: 1, restSeconds: 45, supersetGroupId: 'lower-a-ss3', supersetOrder: 1, notes: 'Superset with Calves' },
          ],
        },
        {
          dayNumber: 3,
          name: 'Upper B (Supersets)',
          muscleGroups: ['back', 'chest', 'shoulders', 'biceps', 'triceps'],
          exercises: [
            // Superset 1: Pull-ups + OHP
            { muscleGroup: 'back', exerciseName: 'Pull-Ups', category: 'compound', sets: 4, repsMin: 6, repsMax: 12, rirTarget: 2, restSeconds: 30, supersetGroupId: 'upper-b-ss1', supersetOrder: 0, notes: 'Superset with OHP' },
            { muscleGroup: 'shoulders', exerciseName: 'Overhead Press', category: 'compound', sets: 4, repsMin: 6, repsMax: 10, rirTarget: 2, restSeconds: 120, supersetGroupId: 'upper-b-ss1', supersetOrder: 1, notes: 'Superset with Pull-ups' },
            // Superset 2: Cable Row + Dumbbell Press
            { muscleGroup: 'back', exerciseName: 'Seated Cable Row', category: 'compound', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 30, supersetGroupId: 'upper-b-ss2', supersetOrder: 0, notes: 'Superset with DB Press' },
            { muscleGroup: 'chest', exerciseName: 'Dumbbell Bench Press', category: 'compound', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 90, supersetGroupId: 'upper-b-ss2', supersetOrder: 1, notes: 'Superset with Row' },
            // Superset 3: Face Pulls + Lateral Raises
            { muscleGroup: 'shoulders', exerciseName: 'Face Pulls', category: 'isolation', sets: 3, repsMin: 15, repsMax: 20, rirTarget: 1, restSeconds: 15, supersetGroupId: 'upper-b-ss3', supersetOrder: 0, notes: 'Superset with Laterals' },
            { muscleGroup: 'shoulders', exerciseName: 'Lateral Raises', category: 'isolation', sets: 3, repsMin: 12, repsMax: 20, rirTarget: 1, restSeconds: 60, supersetGroupId: 'upper-b-ss3', supersetOrder: 1, notes: 'Superset with Face Pulls' },
            // Superset 4: Hammer Curls + Overhead Tricep
            { muscleGroup: 'biceps', exerciseName: 'Hammer Curls', category: 'isolation', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 1, restSeconds: 15, supersetGroupId: 'upper-b-ss4', supersetOrder: 0, notes: 'Superset with Tricep Ext' },
            { muscleGroup: 'triceps', exerciseName: 'Overhead Tricep Extension', category: 'isolation', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 1, restSeconds: 60, supersetGroupId: 'upper-b-ss4', supersetOrder: 1, notes: 'Superset with Hammer Curls' },
          ],
        },
        {
          dayNumber: 4,
          name: 'Lower B (Supersets)',
          muscleGroups: ['hamstrings', 'glutes', 'quadriceps', 'calves', 'core'],
          exercises: [
            // Heavy compound first
            { muscleGroup: 'hamstrings', exerciseName: 'Conventional Deadlift', category: 'compound', sets: 4, repsMin: 5, repsMax: 8, rirTarget: 2, restSeconds: 180 },
            // Superset: Split Squat + Hip Thrust
            { muscleGroup: 'quadriceps', exerciseName: 'Bulgarian Split Squat', category: 'compound', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 30, supersetGroupId: 'lower-b-ss1', supersetOrder: 0, notes: 'Superset with Hip Thrust' },
            { muscleGroup: 'glutes', exerciseName: 'Hip Thrust', category: 'compound', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 90, supersetGroupId: 'lower-b-ss1', supersetOrder: 1, notes: 'Superset with Split Squat' },
            // Superset: Good Morning + Walking Lunge
            { muscleGroup: 'hamstrings', exerciseName: 'Good Morning', category: 'compound', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 30, supersetGroupId: 'lower-b-ss2', supersetOrder: 0, notes: 'Superset with Lunges' },
            { muscleGroup: 'glutes', exerciseName: 'Walking Lunge', category: 'compound', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 90, supersetGroupId: 'lower-b-ss2', supersetOrder: 1, notes: 'Superset with Good Mornings' },
            // Superset: Calf + Core
            { muscleGroup: 'calves', exerciseName: 'Seated Calf Raise', category: 'isolation', sets: 4, repsMin: 12, repsMax: 20, rirTarget: 1, restSeconds: 15, supersetGroupId: 'lower-b-ss3', supersetOrder: 0, notes: 'Superset with Core' },
            { muscleGroup: 'core', exerciseName: 'Hanging Leg Raise', category: 'isolation', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 45, supersetGroupId: 'lower-b-ss3', supersetOrder: 1, notes: 'Superset with Calves' },
          ],
        },
      ],
    },
  },

  // ============================================
  // STRENGTH / POWERLIFTING PROGRAMS
  // ============================================
  {
    id: '531-bbb',
    name: '5/3/1 Boring But Big',
    description: 'Jim Wendler\'s proven 5/3/1 system with BBB accessory work. Build serious strength on squat, bench, deadlift, and overhead press with sustainable progression.',
    difficulty: 'intermediate',
    durationWeeks: 4,
    daysPerWeek: 4,
    split: 'Squat/Bench/Deadlift/Press',
    goals: ['strength', 'hypertrophy'],
    musclePriorities: {
      ...normalPriorities(),
      quadriceps: 'focus',
      chest: 'focus',
      back: 'focus',
      shoulders: 'focus',
    },
    weeklyFrequency: {
      ...defaultFrequency(1),
      quadriceps: 2,
      chest: 2,
      back: 2,
      shoulders: 2,
    },
    startingVolumeMultiplier: 1.0,
    volumeProgressionPerWeek: 0,
    tags: ['intermediate', 'strength', 'powerlifting', '4-days', '5/3/1'],
    weekTemplate: {
      days: [
        {
          dayNumber: 1,
          name: 'Squat Day',
          muscleGroups: ['quadriceps', 'hamstrings', 'glutes', 'core'],
          exercises: [
            { muscleGroup: 'quadriceps', exerciseName: 'Barbell Back Squat', category: 'compound', sets: 3, repsMin: 5, repsMax: 5, rirTarget: 1, restSeconds: 240, notes: '5/3/1 main sets at 65/75/85% (week 1)' },
            { muscleGroup: 'quadriceps', exerciseName: 'Barbell Back Squat', category: 'compound', sets: 5, repsMin: 10, repsMax: 10, rirTarget: 2, restSeconds: 120, notes: 'BBB sets at 50-60%' },
            { muscleGroup: 'hamstrings', exerciseName: 'Lying Leg Curl', category: 'isolation', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 90 },
            { muscleGroup: 'core', exerciseName: 'Hanging Leg Raise', category: 'isolation', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 60 },
          ],
        },
        {
          dayNumber: 2,
          name: 'Bench Day',
          muscleGroups: ['chest', 'triceps', 'shoulders'],
          exercises: [
            { muscleGroup: 'chest', exerciseName: 'Barbell Bench Press', category: 'compound', sets: 3, repsMin: 5, repsMax: 5, rirTarget: 1, restSeconds: 240, notes: '5/3/1 main sets at 65/75/85% (week 1)' },
            { muscleGroup: 'chest', exerciseName: 'Barbell Bench Press', category: 'compound', sets: 5, repsMin: 10, repsMax: 10, rirTarget: 2, restSeconds: 120, notes: 'BBB sets at 50-60%' },
            { muscleGroup: 'back', exerciseName: 'Barbell Row', category: 'compound', sets: 5, repsMin: 10, repsMax: 10, rirTarget: 2, restSeconds: 90 },
            { muscleGroup: 'triceps', exerciseName: 'Tricep Pushdown', category: 'isolation', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 60 },
          ],
          abFinisher: AB_FINISHERS.noEquipmentAbs,
        },
        {
          dayNumber: 3,
          name: 'Deadlift Day',
          muscleGroups: ['back', 'hamstrings', 'glutes', 'core'],
          exercises: [
            { muscleGroup: 'back', exerciseName: 'Conventional Deadlift', category: 'compound', sets: 3, repsMin: 5, repsMax: 5, rirTarget: 1, restSeconds: 240, notes: '5/3/1 main sets at 65/75/85% (week 1)' },
            { muscleGroup: 'back', exerciseName: 'Conventional Deadlift', category: 'compound', sets: 5, repsMin: 10, repsMax: 10, rirTarget: 2, restSeconds: 120, notes: 'BBB sets at 50-60%' },
            { muscleGroup: 'hamstrings', exerciseName: 'Good Morning', category: 'compound', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 90 },
            { muscleGroup: 'core', exerciseName: 'Ab Wheel Rollout', category: 'isolation', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 60 },
          ],
        },
        {
          dayNumber: 4,
          name: 'Overhead Press Day',
          muscleGroups: ['shoulders', 'triceps', 'back'],
          exercises: [
            { muscleGroup: 'shoulders', exerciseName: 'Overhead Press', category: 'compound', sets: 3, repsMin: 5, repsMax: 5, rirTarget: 1, restSeconds: 240, notes: '5/3/1 main sets at 65/75/85% (week 1)' },
            { muscleGroup: 'shoulders', exerciseName: 'Overhead Press', category: 'compound', sets: 5, repsMin: 10, repsMax: 10, rirTarget: 2, restSeconds: 120, notes: 'BBB sets at 50-60%' },
            { muscleGroup: 'back', exerciseName: 'Pull-Ups', category: 'compound', sets: 5, repsMin: 5, repsMax: 10, rirTarget: 2, restSeconds: 90, notes: 'Add weight if needed' },
            { muscleGroup: 'biceps', exerciseName: 'Barbell Curl', category: 'isolation', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 60 },
          ],
          abFinisher: AB_FINISHERS.obliqueObliterator,
        },
      ],
    },
  },

  {
    id: 'starting-strength',
    name: 'Starting Strength',
    description: 'Mark Rippetoe\'s classic novice program. Simple, effective linear progression with squat, bench, deadlift, press, and power cleans. Add weight every session.',
    difficulty: 'beginner',
    durationWeeks: 8,
    daysPerWeek: 3,
    split: 'Full Body A/B',
    goals: ['strength'],
    musclePriorities: {
      ...normalPriorities(),
      quadriceps: 'focus',
      back: 'focus',
      chest: 'focus',
      shoulders: 'focus',
    },
    weeklyFrequency: defaultFrequency(3),
    startingVolumeMultiplier: 1.0,
    volumeProgressionPerWeek: 0,
    tags: ['beginner', 'strength', 'linear-progression', '3-days'],
    weekTemplate: {
      days: [
        {
          dayNumber: 1,
          name: 'Workout A',
          muscleGroups: ['quadriceps', 'chest', 'back'],
          exercises: [
            { muscleGroup: 'quadriceps', exerciseName: 'Barbell Back Squat', category: 'compound', sets: 3, repsMin: 5, repsMax: 5, rirTarget: 1, restSeconds: 300, notes: 'Add 5lbs each session' },
            { muscleGroup: 'chest', exerciseName: 'Barbell Bench Press', category: 'compound', sets: 3, repsMin: 5, repsMax: 5, rirTarget: 1, restSeconds: 300, notes: 'Add 5lbs each session (alternates with OHP)' },
            { muscleGroup: 'back', exerciseName: 'Conventional Deadlift', category: 'compound', sets: 1, repsMin: 5, repsMax: 5, rirTarget: 1, restSeconds: 300, notes: 'Add 10lbs each session' },
          ],
        },
        {
          dayNumber: 2,
          name: 'Workout B',
          muscleGroups: ['quadriceps', 'shoulders', 'back'],
          exercises: [
            { muscleGroup: 'quadriceps', exerciseName: 'Barbell Back Squat', category: 'compound', sets: 3, repsMin: 5, repsMax: 5, rirTarget: 1, restSeconds: 300, notes: 'Add 5lbs each session' },
            { muscleGroup: 'shoulders', exerciseName: 'Overhead Press', category: 'compound', sets: 3, repsMin: 5, repsMax: 5, rirTarget: 1, restSeconds: 300, notes: 'Add 5lbs each session (alternates with Bench)' },
            { muscleGroup: 'back', exerciseName: 'Power Clean', category: 'compound', sets: 5, repsMin: 3, repsMax: 3, rirTarget: 1, restSeconds: 180, notes: 'Focus on explosive technique' },
          ],
        },
        {
          dayNumber: 3,
          name: 'Workout A',
          muscleGroups: ['quadriceps', 'chest', 'back'],
          exercises: [
            { muscleGroup: 'quadriceps', exerciseName: 'Barbell Back Squat', category: 'compound', sets: 3, repsMin: 5, repsMax: 5, rirTarget: 1, restSeconds: 300, notes: 'Add 5lbs each session' },
            { muscleGroup: 'chest', exerciseName: 'Barbell Bench Press', category: 'compound', sets: 3, repsMin: 5, repsMax: 5, rirTarget: 1, restSeconds: 300, notes: 'Add 5lbs each session' },
            { muscleGroup: 'back', exerciseName: 'Conventional Deadlift', category: 'compound', sets: 1, repsMin: 5, repsMax: 5, rirTarget: 1, restSeconds: 300, notes: 'Add 10lbs each session' },
          ],
        },
      ],
    },
  },

  {
    id: 'stronglifts-5x5',
    name: 'StrongLifts 5x5',
    description: 'Popularized by Mehdi, this beginner program builds strength with 5 sets of 5 reps on compound lifts. Simple A/B alternation with linear progression.',
    difficulty: 'beginner',
    durationWeeks: 12,
    daysPerWeek: 3,
    split: 'Full Body A/B',
    goals: ['strength'],
    musclePriorities: {
      ...normalPriorities(),
      quadriceps: 'focus',
      back: 'focus',
      chest: 'focus',
    },
    weeklyFrequency: defaultFrequency(3),
    startingVolumeMultiplier: 1.0,
    volumeProgressionPerWeek: 0,
    tags: ['beginner', 'strength', 'linear-progression', '3-days', '5x5'],
    weekTemplate: {
      days: [
        {
          dayNumber: 1,
          name: 'Workout A',
          muscleGroups: ['quadriceps', 'chest', 'back'],
          exercises: [
            { muscleGroup: 'quadriceps', exerciseName: 'Barbell Back Squat', category: 'compound', sets: 5, repsMin: 5, repsMax: 5, rirTarget: 1, restSeconds: 180, notes: 'Add 5lbs each session' },
            { muscleGroup: 'chest', exerciseName: 'Barbell Bench Press', category: 'compound', sets: 5, repsMin: 5, repsMax: 5, rirTarget: 1, restSeconds: 180, notes: 'Add 5lbs each session' },
            { muscleGroup: 'back', exerciseName: 'Barbell Row', category: 'compound', sets: 5, repsMin: 5, repsMax: 5, rirTarget: 1, restSeconds: 180, notes: 'Add 5lbs each session' },
          ],
        },
        {
          dayNumber: 2,
          name: 'Workout B',
          muscleGroups: ['quadriceps', 'shoulders', 'back'],
          exercises: [
            { muscleGroup: 'quadriceps', exerciseName: 'Barbell Back Squat', category: 'compound', sets: 5, repsMin: 5, repsMax: 5, rirTarget: 1, restSeconds: 180, notes: 'Add 5lbs each session' },
            { muscleGroup: 'shoulders', exerciseName: 'Overhead Press', category: 'compound', sets: 5, repsMin: 5, repsMax: 5, rirTarget: 1, restSeconds: 180, notes: 'Add 5lbs each session' },
            { muscleGroup: 'back', exerciseName: 'Conventional Deadlift', category: 'compound', sets: 1, repsMin: 5, repsMax: 5, rirTarget: 1, restSeconds: 300, notes: 'Add 10lbs each session' },
          ],
        },
        {
          dayNumber: 3,
          name: 'Workout A',
          muscleGroups: ['quadriceps', 'chest', 'back'],
          exercises: [
            { muscleGroup: 'quadriceps', exerciseName: 'Barbell Back Squat', category: 'compound', sets: 5, repsMin: 5, repsMax: 5, rirTarget: 1, restSeconds: 180, notes: 'Add 5lbs each session' },
            { muscleGroup: 'chest', exerciseName: 'Barbell Bench Press', category: 'compound', sets: 5, repsMin: 5, repsMax: 5, rirTarget: 1, restSeconds: 180, notes: 'Add 5lbs each session' },
            { muscleGroup: 'back', exerciseName: 'Barbell Row', category: 'compound', sets: 5, repsMin: 5, repsMax: 5, rirTarget: 1, restSeconds: 180, notes: 'Add 5lbs each session' },
          ],
        },
      ],
    },
  },

  {
    id: 'gzcl-method',
    name: 'GZCL Method',
    description: 'Cody LeFever\'s tiered approach to strength training. T1 heavy compounds, T2 supplemental work, T3 accessories. Flexible and effective for intermediate lifters.',
    difficulty: 'intermediate',
    durationWeeks: 4,
    daysPerWeek: 4,
    split: 'Squat/Bench/Deadlift/OHP',
    goals: ['strength', 'hypertrophy'],
    musclePriorities: {
      ...normalPriorities(),
      quadriceps: 'focus',
      chest: 'focus',
      back: 'focus',
      shoulders: 'focus',
    },
    weeklyFrequency: {
      ...defaultFrequency(2),
      quadriceps: 2,
      chest: 2,
      back: 3,
    },
    startingVolumeMultiplier: 1.0,
    volumeProgressionPerWeek: 1,
    tags: ['intermediate', 'strength', 'powerlifting', '4-days', 'gzcl'],
    weekTemplate: {
      days: [
        {
          dayNumber: 1,
          name: 'Squat Focus',
          muscleGroups: ['quadriceps', 'hamstrings', 'back', 'core'],
          exercises: [
            { muscleGroup: 'quadriceps', exerciseName: 'Barbell Back Squat', category: 'compound', sets: 5, repsMin: 3, repsMax: 3, rirTarget: 1, restSeconds: 300, notes: 'T1: Heavy singles/triples at 85-95%' },
            { muscleGroup: 'quadriceps', exerciseName: 'Front Squat', category: 'compound', sets: 3, repsMin: 8, repsMax: 10, rirTarget: 2, restSeconds: 150, notes: 'T2: Moderate weight, higher reps' },
            { muscleGroup: 'hamstrings', exerciseName: 'Romanian Deadlift', category: 'compound', sets: 3, repsMin: 10, repsMax: 12, rirTarget: 2, restSeconds: 120, notes: 'T2 supplemental' },
            { muscleGroup: 'back', exerciseName: 'Lat Pulldown', category: 'compound', sets: 3, repsMin: 12, repsMax: 15, rirTarget: 1, restSeconds: 60, notes: 'T3: Light, high reps' },
            { muscleGroup: 'core', exerciseName: 'Cable Crunch', category: 'isolation', sets: 3, repsMin: 15, repsMax: 20, rirTarget: 1, restSeconds: 45, notes: 'T3 accessory' },
          ],
        },
        {
          dayNumber: 2,
          name: 'Bench Focus',
          muscleGroups: ['chest', 'shoulders', 'triceps', 'back'],
          exercises: [
            { muscleGroup: 'chest', exerciseName: 'Barbell Bench Press', category: 'compound', sets: 5, repsMin: 3, repsMax: 3, rirTarget: 1, restSeconds: 300, notes: 'T1: Heavy at 85-95%' },
            { muscleGroup: 'chest', exerciseName: 'Close Grip Bench Press', category: 'compound', sets: 3, repsMin: 8, repsMax: 10, rirTarget: 2, restSeconds: 150, notes: 'T2 variation' },
            { muscleGroup: 'back', exerciseName: 'Barbell Row', category: 'compound', sets: 3, repsMin: 8, repsMax: 10, rirTarget: 2, restSeconds: 120, notes: 'T2 pull balance' },
            { muscleGroup: 'shoulders', exerciseName: 'Lateral Raises', category: 'isolation', sets: 3, repsMin: 15, repsMax: 20, rirTarget: 1, restSeconds: 45, notes: 'T3 accessory' },
            { muscleGroup: 'triceps', exerciseName: 'Tricep Pushdown', category: 'isolation', sets: 3, repsMin: 15, repsMax: 20, rirTarget: 1, restSeconds: 45, notes: 'T3 accessory' },
          ],
        },
        {
          dayNumber: 3,
          name: 'Deadlift Focus',
          muscleGroups: ['back', 'hamstrings', 'glutes', 'biceps'],
          exercises: [
            { muscleGroup: 'back', exerciseName: 'Conventional Deadlift', category: 'compound', sets: 5, repsMin: 3, repsMax: 3, rirTarget: 1, restSeconds: 300, notes: 'T1: Heavy at 85-95%' },
            { muscleGroup: 'back', exerciseName: 'Pull-Ups', category: 'compound', sets: 4, repsMin: 6, repsMax: 10, rirTarget: 2, restSeconds: 150, notes: 'T2: Weighted if possible' },
            { muscleGroup: 'hamstrings', exerciseName: 'Good Morning', category: 'compound', sets: 3, repsMin: 10, repsMax: 12, rirTarget: 2, restSeconds: 120, notes: 'T2 supplemental' },
            { muscleGroup: 'glutes', exerciseName: 'Hip Thrust', category: 'compound', sets: 3, repsMin: 12, repsMax: 15, rirTarget: 1, restSeconds: 60, notes: 'T3 accessory' },
            { muscleGroup: 'biceps', exerciseName: 'Hammer Curls', category: 'isolation', sets: 3, repsMin: 12, repsMax: 15, rirTarget: 1, restSeconds: 45, notes: 'T3 accessory' },
          ],
        },
        {
          dayNumber: 4,
          name: 'Overhead Press Focus',
          muscleGroups: ['shoulders', 'chest', 'back', 'triceps'],
          exercises: [
            { muscleGroup: 'shoulders', exerciseName: 'Overhead Press', category: 'compound', sets: 5, repsMin: 3, repsMax: 3, rirTarget: 1, restSeconds: 300, notes: 'T1: Heavy at 85-95%' },
            { muscleGroup: 'shoulders', exerciseName: 'Dumbbell Shoulder Press', category: 'compound', sets: 3, repsMin: 8, repsMax: 10, rirTarget: 2, restSeconds: 150, notes: 'T2 variation' },
            { muscleGroup: 'chest', exerciseName: 'Incline Dumbbell Press', category: 'compound', sets: 3, repsMin: 10, repsMax: 12, rirTarget: 2, restSeconds: 120, notes: 'T2 supplemental' },
            { muscleGroup: 'back', exerciseName: 'Face Pulls', category: 'isolation', sets: 3, repsMin: 15, repsMax: 20, rirTarget: 1, restSeconds: 45, notes: 'T3 for shoulder health' },
            { muscleGroup: 'triceps', exerciseName: 'Overhead Tricep Extension', category: 'isolation', sets: 3, repsMin: 12, repsMax: 15, rirTarget: 1, restSeconds: 45, notes: 'T3 accessory' },
          ],
        },
      ],
    },
  },

  {
    id: 'texas-method',
    name: 'Texas Method',
    description: 'Classic intermediate strength program with volume, recovery, and intensity days. Perfect for building squat, bench, deadlift, and press after linear progression stalls.',
    difficulty: 'intermediate',
    durationWeeks: 8,
    daysPerWeek: 3,
    split: 'Volume/Recovery/Intensity',
    goals: ['strength'],
    musclePriorities: {
      ...normalPriorities(),
      quadriceps: 'focus',
      chest: 'focus',
      back: 'focus',
      shoulders: 'focus',
    },
    weeklyFrequency: {
      ...defaultFrequency(1),
      quadriceps: 3,
      chest: 2,
      shoulders: 2,
      back: 2,
    },
    startingVolumeMultiplier: 1.0,
    volumeProgressionPerWeek: 0,
    tags: ['intermediate', 'strength', 'powerlifting', '3-days', 'texas-method'],
    weekTemplate: {
      days: [
        {
          dayNumber: 1,
          name: 'Volume Day',
          muscleGroups: ['quadriceps', 'chest', 'back'],
          exercises: [
            { muscleGroup: 'quadriceps', exerciseName: 'Barbell Back Squat', category: 'compound', sets: 5, repsMin: 5, repsMax: 5, rirTarget: 2, restSeconds: 240, notes: 'Use 90% of 5RM - accumulate volume' },
            { muscleGroup: 'chest', exerciseName: 'Barbell Bench Press', category: 'compound', sets: 5, repsMin: 5, repsMax: 5, rirTarget: 2, restSeconds: 240, notes: 'Use 90% of 5RM' },
            { muscleGroup: 'back', exerciseName: 'Barbell Row', category: 'compound', sets: 5, repsMin: 5, repsMax: 5, rirTarget: 2, restSeconds: 180 },
          ],
        },
        {
          dayNumber: 2,
          name: 'Recovery Day',
          muscleGroups: ['quadriceps', 'shoulders', 'back'],
          exercises: [
            { muscleGroup: 'quadriceps', exerciseName: 'Barbell Back Squat', category: 'compound', sets: 2, repsMin: 5, repsMax: 5, rirTarget: 4, restSeconds: 180, notes: 'Light - 80% of Monday weight' },
            { muscleGroup: 'shoulders', exerciseName: 'Overhead Press', category: 'compound', sets: 3, repsMin: 5, repsMax: 5, rirTarget: 2, restSeconds: 180, notes: 'Can push intensity here' },
            { muscleGroup: 'back', exerciseName: 'Pull-Ups', category: 'compound', sets: 3, repsMin: 5, repsMax: 10, rirTarget: 2, restSeconds: 120, notes: 'Bodyweight or weighted' },
            { muscleGroup: 'back', exerciseName: 'Back Extension', category: 'isolation', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 90 },
          ],
        },
        {
          dayNumber: 3,
          name: 'Intensity Day',
          muscleGroups: ['quadriceps', 'chest', 'back'],
          exercises: [
            { muscleGroup: 'quadriceps', exerciseName: 'Barbell Back Squat', category: 'compound', sets: 1, repsMin: 5, repsMax: 5, rirTarget: 0, restSeconds: 300, notes: 'New 5RM PR attempt!' },
            { muscleGroup: 'chest', exerciseName: 'Barbell Bench Press', category: 'compound', sets: 1, repsMin: 5, repsMax: 5, rirTarget: 0, restSeconds: 300, notes: 'New 5RM PR attempt!' },
            { muscleGroup: 'back', exerciseName: 'Conventional Deadlift', category: 'compound', sets: 1, repsMin: 5, repsMax: 5, rirTarget: 0, restSeconds: 300, notes: 'New 5RM PR attempt!' },
          ],
        },
      ],
    },
  },

  {
    id: 'pull-up-progression',
    name: 'Pull-Up Progression',
    description: 'Dedicated program to build from 0 to 20+ pull-ups. Uses greasing the groove, volume ladders, and weighted progressions. Perfect for military PT or calisthenic goals.',
    difficulty: 'beginner',
    durationWeeks: 8,
    daysPerWeek: 4,
    split: 'Pull-Up Focus + Full Body',
    goals: ['strength', 'general_fitness'],
    musclePriorities: {
      ...normalPriorities(),
      back: 'focus',
      biceps: 'focus',
    },
    weeklyFrequency: {
      ...defaultFrequency(2),
      back: 4,
      biceps: 3,
    },
    startingVolumeMultiplier: 1.0,
    volumeProgressionPerWeek: 2,
    tags: ['beginner', 'pull-ups', 'calisthenics', '4-days', 'military'],
    weekTemplate: {
      days: [
        {
          dayNumber: 1,
          name: 'Pull-Up Volume',
          muscleGroups: ['back', 'biceps', 'core'],
          exercises: [
            { muscleGroup: 'back', exerciseName: 'Pull-Ups', category: 'compound', sets: 5, repsMin: 3, repsMax: 8, rirTarget: 2, restSeconds: 180, notes: 'Do as many sets as needed to reach 25-50 total reps' },
            { muscleGroup: 'back', exerciseName: 'Inverted Row', category: 'compound', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 90, notes: 'Good for building pulling strength' },
            { muscleGroup: 'back', exerciseName: 'Lat Pulldown', category: 'compound', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 90 },
            { muscleGroup: 'biceps', exerciseName: 'Barbell Curl', category: 'isolation', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 60 },
            { muscleGroup: 'core', exerciseName: 'Hanging Leg Raise', category: 'isolation', sets: 3, repsMin: 8, repsMax: 15, rirTarget: 2, restSeconds: 60, notes: 'Dead hang builds grip for pull-ups' },
          ],
        },
        {
          dayNumber: 2,
          name: 'Lower Body + Push',
          muscleGroups: ['quadriceps', 'chest', 'shoulders', 'triceps'],
          exercises: [
            { muscleGroup: 'quadriceps', exerciseName: 'Barbell Back Squat', category: 'compound', sets: 4, repsMin: 6, repsMax: 10, rirTarget: 2, restSeconds: 180 },
            { muscleGroup: 'chest', exerciseName: 'Barbell Bench Press', category: 'compound', sets: 4, repsMin: 6, repsMax: 10, rirTarget: 2, restSeconds: 180 },
            { muscleGroup: 'shoulders', exerciseName: 'Overhead Press', category: 'compound', sets: 3, repsMin: 8, repsMax: 12, rirTarget: 2, restSeconds: 150 },
            { muscleGroup: 'triceps', exerciseName: 'Dip', category: 'compound', sets: 3, repsMin: 8, repsMax: 12, rirTarget: 2, restSeconds: 120 },
          ],
        },
        {
          dayNumber: 3,
          name: 'Pull-Up Max Effort',
          muscleGroups: ['back', 'biceps', 'forearms'],
          exercises: [
            { muscleGroup: 'back', exerciseName: 'Pull-Ups', category: 'compound', sets: 1, repsMin: 1, repsMax: 20, rirTarget: 0, restSeconds: 300, notes: 'Max rep test - track your progress!' },
            { muscleGroup: 'back', exerciseName: 'Pull-Ups', category: 'compound', sets: 4, repsMin: 3, repsMax: 5, rirTarget: 1, restSeconds: 180, notes: 'Quality reps - focus on form' },
            { muscleGroup: 'back', exerciseName: 'Chin-Ups', category: 'compound', sets: 3, repsMin: 5, repsMax: 10, rirTarget: 2, restSeconds: 150, notes: 'Underhand grip - more bicep' },
            { muscleGroup: 'biceps', exerciseName: 'Hammer Curls', category: 'isolation', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 60 },
            { muscleGroup: 'forearms', exerciseName: 'Dead Hang', category: 'isolation', sets: 3, repsMin: 30, repsMax: 60, rirTarget: 1, restSeconds: 60, notes: 'Hang for time - builds grip' },
          ],
        },
        {
          dayNumber: 4,
          name: 'Full Body + Pull',
          muscleGroups: ['hamstrings', 'back', 'shoulders', 'core'],
          exercises: [
            { muscleGroup: 'hamstrings', exerciseName: 'Romanian Deadlift', category: 'compound', sets: 4, repsMin: 8, repsMax: 12, rirTarget: 2, restSeconds: 150 },
            { muscleGroup: 'back', exerciseName: 'Pull-Ups', category: 'compound', sets: 4, repsMin: 5, repsMax: 10, rirTarget: 2, restSeconds: 150, notes: 'Greasing the groove - moderate effort' },
            { muscleGroup: 'back', exerciseName: 'Seated Cable Row', category: 'compound', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 90 },
            { muscleGroup: 'shoulders', exerciseName: 'Face Pulls', category: 'isolation', sets: 3, repsMin: 15, repsMax: 20, rirTarget: 1, restSeconds: 60 },
            { muscleGroup: 'core', exerciseName: 'Plank', category: 'isolation', sets: 3, repsMin: 30, repsMax: 60, rirTarget: 1, restSeconds: 45, notes: 'seconds' },
          ],
        },
      ],
    },
  },

  {
    id: 'big-5-strength',
    name: 'Big 5 Strength Builder',
    description: 'Focus on the 5 essential lifts: Squat, Bench, Deadlift, Overhead Press, and Pull-Ups. Build a strong foundation with balanced pushing and pulling.',
    difficulty: 'intermediate',
    durationWeeks: 6,
    daysPerWeek: 4,
    split: 'Upper/Lower (Big 5 Focus)',
    goals: ['strength', 'hypertrophy'],
    musclePriorities: {
      ...normalPriorities(),
      quadriceps: 'focus',
      chest: 'focus',
      back: 'focus',
      shoulders: 'focus',
    },
    weeklyFrequency: {
      ...defaultFrequency(2),
      quadriceps: 2,
      chest: 2,
      back: 3,
      shoulders: 2,
    },
    startingVolumeMultiplier: 1.0,
    volumeProgressionPerWeek: 1,
    tags: ['intermediate', 'strength', 'big-5', '4-days', 'compound-focus'],
    weekTemplate: {
      days: [
        {
          dayNumber: 1,
          name: 'Squat & Bench',
          muscleGroups: ['quadriceps', 'chest', 'triceps', 'core'],
          exercises: [
            { muscleGroup: 'quadriceps', exerciseName: 'Barbell Back Squat', category: 'compound', sets: 5, repsMin: 5, repsMax: 5, rirTarget: 1, restSeconds: 240, notes: 'Primary focus - track PRs' },
            { muscleGroup: 'chest', exerciseName: 'Barbell Bench Press', category: 'compound', sets: 5, repsMin: 5, repsMax: 5, rirTarget: 1, restSeconds: 240, notes: 'Primary focus - track PRs' },
            { muscleGroup: 'quadriceps', exerciseName: 'Leg Press', category: 'compound', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 120, notes: 'Supplemental volume' },
            { muscleGroup: 'triceps', exerciseName: 'Tricep Pushdown', category: 'isolation', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 60 },
            { muscleGroup: 'core', exerciseName: 'Ab Wheel Rollout', category: 'isolation', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 60 },
          ],
        },
        {
          dayNumber: 2,
          name: 'Deadlift & Pull-Ups',
          muscleGroups: ['back', 'hamstrings', 'biceps'],
          exercises: [
            { muscleGroup: 'back', exerciseName: 'Conventional Deadlift', category: 'compound', sets: 5, repsMin: 5, repsMax: 5, rirTarget: 1, restSeconds: 300, notes: 'Primary focus - track PRs' },
            { muscleGroup: 'back', exerciseName: 'Pull-Ups', category: 'compound', sets: 5, repsMin: 5, repsMax: 10, rirTarget: 1, restSeconds: 180, notes: 'Primary focus - add weight when possible' },
            { muscleGroup: 'back', exerciseName: 'Barbell Row', category: 'compound', sets: 3, repsMin: 8, repsMax: 12, rirTarget: 2, restSeconds: 120, notes: 'Supplemental pulling' },
            { muscleGroup: 'hamstrings', exerciseName: 'Lying Leg Curl', category: 'isolation', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 90 },
            { muscleGroup: 'biceps', exerciseName: 'Barbell Curl', category: 'isolation', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 60 },
          ],
        },
        {
          dayNumber: 3,
          name: 'OHP & Squat Volume',
          muscleGroups: ['shoulders', 'quadriceps', 'back'],
          exercises: [
            { muscleGroup: 'shoulders', exerciseName: 'Overhead Press', category: 'compound', sets: 5, repsMin: 5, repsMax: 5, rirTarget: 1, restSeconds: 240, notes: 'Primary focus - track PRs' },
            { muscleGroup: 'quadriceps', exerciseName: 'Barbell Back Squat', category: 'compound', sets: 3, repsMin: 8, repsMax: 10, rirTarget: 2, restSeconds: 180, notes: 'Lighter weight, technique focus' },
            { muscleGroup: 'back', exerciseName: 'Pull-Ups', category: 'compound', sets: 3, repsMin: 6, repsMax: 10, rirTarget: 2, restSeconds: 120, notes: 'Volume work' },
            { muscleGroup: 'shoulders', exerciseName: 'Lateral Raises', category: 'isolation', sets: 4, repsMin: 12, repsMax: 20, rirTarget: 1, restSeconds: 60 },
            { muscleGroup: 'shoulders', exerciseName: 'Face Pulls', category: 'isolation', sets: 3, repsMin: 15, repsMax: 20, rirTarget: 1, restSeconds: 60 },
          ],
        },
        {
          dayNumber: 4,
          name: 'Bench & Deadlift Volume',
          muscleGroups: ['chest', 'back', 'glutes', 'triceps'],
          exercises: [
            { muscleGroup: 'chest', exerciseName: 'Barbell Bench Press', category: 'compound', sets: 3, repsMin: 8, repsMax: 10, rirTarget: 2, restSeconds: 180, notes: 'Lighter weight, technique focus' },
            { muscleGroup: 'back', exerciseName: 'Conventional Deadlift', category: 'compound', sets: 3, repsMin: 6, repsMax: 8, rirTarget: 2, restSeconds: 180, notes: 'Volume work - 70-80%' },
            { muscleGroup: 'back', exerciseName: 'Pull-Ups', category: 'compound', sets: 3, repsMin: 6, repsMax: 10, rirTarget: 2, restSeconds: 120, notes: 'Volume work' },
            { muscleGroup: 'glutes', exerciseName: 'Hip Thrust', category: 'compound', sets: 3, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 90 },
            { muscleGroup: 'triceps', exerciseName: 'Close Grip Bench Press', category: 'compound', sets: 3, repsMin: 8, repsMax: 12, rirTarget: 2, restSeconds: 120 },
          ],
        },
      ],
    },
  },

  {
    id: 'tactical-barbell',
    name: 'Tactical Barbell Fighter',
    description: 'Military/LEO-inspired program balancing maximal strength and endurance. Minimalist approach: 2 strength sessions per week, leaving capacity for conditioning.',
    difficulty: 'intermediate',
    durationWeeks: 6,
    daysPerWeek: 2,
    split: 'Full Body Strength',
    goals: ['strength', 'general_fitness'],
    musclePriorities: {
      ...normalPriorities(),
      quadriceps: 'focus',
      chest: 'focus',
      back: 'focus',
    },
    weeklyFrequency: defaultFrequency(2),
    startingVolumeMultiplier: 0.8,
    volumeProgressionPerWeek: 0,
    tags: ['intermediate', 'strength', 'tactical', '2-days', 'minimalist', 'military'],
    weekTemplate: {
      days: [
        {
          dayNumber: 1,
          name: 'Strength A',
          muscleGroups: ['quadriceps', 'chest', 'back'],
          exercises: [
            { muscleGroup: 'quadriceps', exerciseName: 'Barbell Back Squat', category: 'compound', sets: 3, repsMin: 5, repsMax: 5, rirTarget: 1, restSeconds: 300, notes: 'Heavy - 80-90% of max' },
            { muscleGroup: 'chest', exerciseName: 'Barbell Bench Press', category: 'compound', sets: 3, repsMin: 5, repsMax: 5, rirTarget: 1, restSeconds: 300, notes: 'Heavy - 80-90% of max' },
            { muscleGroup: 'back', exerciseName: 'Weighted Pull-Ups', category: 'compound', sets: 3, repsMin: 5, repsMax: 5, rirTarget: 1, restSeconds: 180, notes: 'Add weight as able' },
          ],
        },
        {
          dayNumber: 2,
          name: 'Strength B',
          muscleGroups: ['back', 'shoulders', 'quadriceps'],
          exercises: [
            { muscleGroup: 'back', exerciseName: 'Conventional Deadlift', category: 'compound', sets: 3, repsMin: 5, repsMax: 5, rirTarget: 1, restSeconds: 300, notes: 'Heavy - 80-90% of max' },
            { muscleGroup: 'shoulders', exerciseName: 'Overhead Press', category: 'compound', sets: 3, repsMin: 5, repsMax: 5, rirTarget: 1, restSeconds: 300, notes: 'Heavy - 80-90% of max' },
            { muscleGroup: 'back', exerciseName: 'Pull-Ups', category: 'compound', sets: 3, repsMin: 5, repsMax: 10, rirTarget: 2, restSeconds: 180, notes: 'Bodyweight for volume' },
          ],
        },
        {
          dayNumber: 3,
          name: 'Endurance (Optional)',
          dayType: 'cardio',
          notes: 'Run, ruck, swim, or bike. Build your aerobic base.',
          cardioActivities: [
            { id: 'tb-cardio-1', type: 'running', name: 'Easy Run', durationMinutes: 30, intensity: 'moderate' },
            { id: 'tb-cardio-2', type: 'other', name: 'Rucking', durationMinutes: 45, intensity: 'moderate' },
          ],
        },
        {
          dayNumber: 4,
          name: 'HIIT (Optional)',
          dayType: 'cardio',
          notes: 'High intensity intervals for combat conditioning.',
          cardioActivities: [
            { id: 'tb-hiit-1', type: 'hiit', name: 'Sprint Intervals', durationMinutes: 20, intensity: 'high' },
            { id: 'tb-hiit-2', type: 'rowing', name: 'Row Intervals', durationMinutes: 20, intensity: 'high' },
          ],
        },
      ],
    },
  },
];

export default TRAINING_PROGRAMS;
