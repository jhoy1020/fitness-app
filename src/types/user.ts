// User & Profile Types

import type { MuscleGroup } from './exercise';

export type GoalType = 'cut' | 'bulk' | 'maintain';

export type ActivityLevel =
  | 'sedentary'      // Little to no exercise
  | 'light'          // 1-3 days/week
  | 'moderate'       // 3-5 days/week
  | 'active'         // 6-7 days/week
  | 'very_active';   // 2x per day or physical job

export interface UserProfile {
  id: string;
  weight: number;
  weightUnit: 'lbs' | 'kg';
  height: number;
  heightUnit: 'in' | 'cm';
  age: number;
  gender: 'male' | 'female' | 'other';
  bodyFatPercent?: number;
  leanMass?: number;
  bmrOverride?: number;
  activityLevel: ActivityLevel;
  goalBodyFatPercent?: number;
  goalType: GoalType;
  createdAt: string;
  updatedAt: string;

  // ── Future-ready fields (Phase 8: auth & backend) ──
  email?: string;
  displayName?: string;
  remoteUserId?: string;        // Server-side user ID
  authProvider?: 'email' | 'google' | 'apple';
  avatarUrl?: string;
}

export interface ExerciseGoal {
  id: string;
  exerciseId: string;
  current1RM: number;
  target1RM: number;
  targetDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExportRecord {
  id: string;
  exportType: 'csv' | 'json';
  exportDate: string;
  filePath?: string;
  tableName?: string;
}

// Body Measurements for tracking over time
export interface BodyMeasurement {
  id: string;
  date: string;
  weight?: number;
  bodyFatPercent?: number;
  leanMass?: number;
  neck?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  bicepLeft?: number;
  bicepRight?: number;
  thighLeft?: number;
  thighRight?: number;
  calfLeft?: number;
  calfRight?: number;
  notes?: string;
  createdAt: string;
}

// Personal Records
export interface PersonalRecord {
  id: string;
  exerciseName: string;
  weight: number;
  reps: number;
  estimated1RM: number;
  date: string;
  workoutId: string;
  previousRecord?: {
    weight: number;
    reps: number;
    estimated1RM: number;
    date: string;
  };
}

export interface NutritionCalculation {
  bmr: number;
  tdee: number;
  targetCalories: number;
  protein: number;
  fat: number;
  carbs: number;
  deficit?: number;
  surplus?: number;
}

export interface ProgressiveOverloadSuggestion {
  exerciseId: string;
  exerciseName: string;
  previousWeight: number;
  previousReps: number;
  previousSets: number;
  suggestedWeight: number;
  suggestedReps: number;
  suggestedSets: number;
  reason: string;
}

export interface OneRepMaxEstimate {
  exerciseId: string;
  estimated1RM: number;
  basedOnWeight: number;
  basedOnReps: number;
  formula: 'epley' | 'brzycki';
  calculatedAt: string;
}

// 1RM (One Rep Max) Record
export interface OneRepMaxRecord {
  id: string;
  exerciseName: string;
  weight: number;
  unit: 'lbs' | 'kg';
  testedDate: string;
  method: 'tested' | 'calculated';
  notes?: string;
}

export interface UserState {
  profile: UserProfile | null;
  exerciseGoals: ExerciseGoal[];
  nutrition: NutritionCalculation | null;
  weightHistory: BodyMeasurement[];
  units: 'metric' | 'imperial';
  oneRepMaxRecords: OneRepMaxRecord[];
}

export type UserAction =
  | { type: 'SET_PROFILE'; payload: UserProfile }
  | { type: 'UPDATE_PROFILE'; payload: Partial<UserProfile> }
  | { type: 'SET_EXERCISE_GOALS'; payload: ExerciseGoal[] }
  | { type: 'ADD_EXERCISE_GOAL'; payload: ExerciseGoal }
  | { type: 'UPDATE_EXERCISE_GOAL'; payload: ExerciseGoal }
  | { type: 'SET_NUTRITION'; payload: NutritionCalculation }
  | { type: 'SET_WEIGHT_HISTORY'; payload: BodyMeasurement[] }
  | { type: 'ADD_WEIGHT_ENTRY'; payload: BodyMeasurement }
  | { type: 'SET_ONE_REP_MAX_RECORDS'; payload: OneRepMaxRecord[] }
  | { type: 'ADD_ONE_REP_MAX'; payload: OneRepMaxRecord }
  | { type: 'UPDATE_ONE_REP_MAX'; payload: OneRepMaxRecord }
  | { type: 'DELETE_ONE_REP_MAX'; payload: string };
