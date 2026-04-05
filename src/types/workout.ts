// Workout & Set Types

import type { DayType, CardioType } from './activity';
import type { WorkoutTemplate } from './template';

// Workout recorded data
export interface Workout {
  id: string;
  templateId?: string;
  name: string;
  date: string;
  startedAt?: string;
  completedAt?: string;
  durationMinutes?: number;
  duration?: number;
  notes?: string;
  stravaActivityId?: string;
  createdAt?: string;
  updatedAt?: string;
  // Day type tracking
  dayType?: DayType;
  // Cardio-specific data
  cardioType?: CardioType;
  distanceMiles?: number;
  distanceKm?: number;
  paceMinPerMile?: number;
  paceMinPerKm?: number;
  caloriesBurned?: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  elevationGainFt?: number;
  // Sets logged during workout
  sets?: Array<{
    exerciseName: string;
    muscleGroup: string;
    weight: number;
    reps: number;
    rir?: number;
    timestamp?: Date;
  }>;
  // Exercise summary
  exercises?: Array<{
    exerciseId: string;
    exerciseName: string;
    notes?: string;
    sets: Array<{
      weight: number;
      targetReps: number;
      actualReps: number;
      rir?: number;
      completed: boolean;
    }>;
  }>;
}

export interface WorkoutSet {
  id: string;
  workoutId: string;
  exerciseId: string;
  setNumber: number;
  weight: number;
  weightUnit: 'lbs' | 'kg';
  reps: number;
  durationSeconds?: number; // For duration-based exercises (planks, holds, carries)
  rpe?: number; // 1-10 scale
  rir?: number; // Reps In Reserve (0-4)
  isWarmup: boolean;
  restTakenSeconds?: number;
  notes?: string;
  createdAt: string;
}

// Paused Workout - saved when user navigates away from active workout
export interface PausedWorkout {
  workoutName: string;
  workoutNotes: string;
  exercises: any[]; // WorkoutExercise[] from ActiveWorkoutScreen
  restTarget: number;
  timerSeconds: number;
  isProgramWorkout: boolean;
  pausedAt: string; // ISO date string
  cardioFinisher?: any;
}

// Deload detection state
export interface DeloadState {
  lastAnalysis: string | null;
  lastDeloadDate: string | null;
  isDismissed: boolean;
  isInDeloadWeek: boolean;
  deloadStartDate: string | null;
}

export interface WorkoutState {
  activeWorkout: Workout | null;
  activeSets: WorkoutSet[];
  currentExerciseIndex: number;
  isRestTimerRunning: boolean;
  restTimeRemaining: number;
  workoutHistory: Workout[];
  templates: WorkoutTemplate[];
  pausedWorkout: PausedWorkout | null;
  deloadState: DeloadState;
}

export type WorkoutAction =
  | { type: 'START_WORKOUT'; payload: { workout: Workout; fromTemplate?: WorkoutTemplate } }
  | { type: 'END_WORKOUT' }
  | { type: 'CANCEL_WORKOUT' }
  | { type: 'ADD_SET'; payload: WorkoutSet }
  | { type: 'UPDATE_SET'; payload: WorkoutSet }
  | { type: 'DELETE_SET'; payload: string }
  | { type: 'NEXT_EXERCISE' }
  | { type: 'PREVIOUS_EXERCISE' }
  | { type: 'SET_EXERCISE_INDEX'; payload: number }
  | { type: 'LOAD_HISTORY'; payload: Workout[] }
  | { type: 'LOAD_TEMPLATES'; payload: WorkoutTemplate[] }
  | { type: 'START_REST_TIMER'; payload: number }
  | { type: 'TICK_REST_TIMER' }
  | { type: 'STOP_REST_TIMER' }
  | { type: 'COMPLETE_WORKOUT'; payload: any }
  | { type: 'DELETE_WORKOUT'; payload: string }
  | { type: 'UPDATE_WORKOUT'; payload: { id: string; updates: Partial<any> } }
  | { type: 'PAUSE_WORKOUT'; payload: PausedWorkout }
  | { type: 'CLEAR_PAUSED_WORKOUT' }
  | { type: 'SET_DELOAD_STATE'; payload: DeloadState }
  | { type: 'START_DELOAD_WEEK' }
  | { type: 'END_DELOAD_WEEK' }
  | { type: 'DISMISS_DELOAD' };
