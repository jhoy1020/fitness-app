// Activity, Cardio & Recovery Types

import type { MuscleGroup } from './exercise';

// Day types for programs
export type DayType = 'workout' | 'rest' | 'cardio' | 'active_recovery';

// Cardio activity types
export type CardioType =
  | 'walking'
  | 'running'
  | 'cycling'
  | 'swimming'
  | 'rowing'
  | 'elliptical'
  | 'stair_climber'
  | 'hiit'
  | 'jump_rope'
  | 'other';

// Active recovery activity types
export type RecoveryActivityType =
  | 'stretching'
  | 'foam_rolling'
  | 'yoga'
  | 'mobility_work'
  | 'light_walking'
  | 'swimming'
  | 'massage'
  | 'meditation'
  | 'other';

// Intensity levels
export type IntensityLevel = 'low' | 'moderate' | 'high';

// Cardio activity definition
export interface CardioActivity {
  id: string;
  type: CardioType;
  name: string;
  durationMinutes: number;
  intensity: IntensityLevel;
  distanceKm?: number;
  caloriesBurned?: number;
  heartRateAvg?: number;
  heartRateMax?: number;
  notes?: string;
}

// Active recovery activity definition
export interface ActiveRecoveryActivity {
  id: string;
  type: RecoveryActivityType;
  name: string;
  durationMinutes: number;
  targetAreas?: MuscleGroup[];
  notes?: string;
}

// Recovery suggestion based on previous workout
export interface RecoverySuggestion {
  activity: RecoveryActivityType;
  name: string;
  durationMinutes: number;
  description: string;
  targetMuscles: MuscleGroup[];
  rationale: string;
}

// Cardio finisher for workout days
export interface CardioFinisher {
  type: CardioType;
  name: string;
  durationMinutes: number;
  intensity: IntensityLevel;
  notes?: string;
  description?: string;  // UI-friendly description
  caloriesBurned?: number;  // Estimated calories
}

// Ab finisher for workout days
export type AbFinisherType = 'circuits' | 'emom' | 'amrap' | 'straight_sets';

export interface AbFinisherExercise {
  name: string;
  reps?: number;  // Number of reps
  duration?: number;  // Seconds (for planks, etc.)
}

export interface AbFinisher {
  name: string;
  type: AbFinisherType;
  exercises: AbFinisherExercise[];
  rounds?: number;  // For circuits
  durationMinutes?: number;  // Total time for EMOM/AMRAP
  restBetweenExercises?: number;  // Seconds
  restBetweenRounds?: number;  // Seconds
  description?: string;
}
