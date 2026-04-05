/**
 * Centralised navigation types for the entire app.
 *
 * Import helpers:
 *   import type { RootStackParamList, AppNavigation } from '../navigation/types';
 *   const navigation = useAppNavigation();
 *   const route = useAppRoute<'ActiveWorkout'>();
 *
 * Phase 8 screens (Login, Register, ProgramStore, etc.) are pre-declared with
 * `undefined` params so deep-links and type checks work once implemented.
 */

import type {
  NavigatorScreenParams,
  CompositeScreenProps,
  RouteProp,
} from '@react-navigation/native';
import type { NativeStackScreenProps, NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useNavigation, useRoute } from '@react-navigation/native';

// ─── Template workout passed to ActiveWorkout ─────────────
export interface TemplateWorkoutParam {
  name: string;
  sets: Array<{
    exerciseName: string;
    muscleGroup?: string;
    targetSets?: number;
    repsMin?: number;
    repsMax?: number;
    rirTarget?: number;
    restSeconds?: number;
    supersetGroupId?: string;
    supersetOrder?: number;
    notes?: string;
    // Weight prescription
    weightMode?: 'auto' | 'percentage' | 'fixed';
    percentageOf1RM?: number;
    fixedWeight?: number;
  }>;
  isProgramWorkout?: boolean;
  cardioFinisher?: {
    name: string;
    type: string;
    durationMinutes: number;
    intensity: string;
    description?: string;
  };
}

// ─── Workout summary params ───────────────────────────────
export interface WorkoutSummaryParam {
  id: string;
  name: string;
  date: string;
  notes?: string;
  duration: number;
  sets: Array<{
    exerciseName: string;
    muscleGroup: string;
    weight: number;
    reps: number;
    durationSeconds?: number;
  }>;
  exercises?: Array<{
    exerciseId: string;
    exerciseName: string;
    notes?: string;
    sets: Array<{
      weight: number;
      targetReps: number;
      actualReps: number;
      completed: boolean;
    }>;
  }>;
  cardioFinisherCompleted?: boolean;
  cardioFinisherName?: string;
}

// ─── Root stack ───────────────────────────────────────────
export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList>;
  ActiveWorkout: {
    templateWorkout?: TemplateWorkoutParam;
    resuming?: boolean;
  } | undefined;
  WorkoutSummary: {
    workout: WorkoutSummaryParam;
    volumeByMuscle?: Record<string, number>;
    isProgramWorkout?: boolean;
  };
  WorkoutDetail: { workoutId: string };
  Programs: undefined;
  CreateProgram: { programId?: string } | undefined;
  VolumeTracker: undefined;
  MesoCycle: undefined;
  OneRepMaxTest: { exerciseName?: string } | undefined;

  // Phase 8 — pre-declared so typed navigate calls compile now
  Login: undefined;
  Register: undefined;
  ProgramStore: undefined;
  ProgramDetail: { programId: string; isRemote?: boolean };
  SharedProgramView: { remoteId: string };
};

// ─── Bottom tabs ──────────────────────────────────────────
export type MainTabParamList = {
  Home: undefined;
  Programs: undefined;
  History: undefined;
  Progress: undefined;
  Profile: undefined;
};

// ─── Screen prop helpers ──────────────────────────────────
// Stack screen props (used by screens rendered inside the RootStack)
export type RootScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

// Tab screen props (used by screens rendered inside MainTabs)
// CompositeScreenProps gives both tab-level and root-stack-level navigation
export type TabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >;

// ─── Typed hooks ──────────────────────────────────────────
/** Hook that returns a typed navigation object for the RootStack. */
export function useAppNavigation() {
  return useNavigation<NativeStackNavigationProp<RootStackParamList>>();
}

/** Hook that returns the typed route for a given RootStack screen. */
export function useAppRoute<T extends keyof RootStackParamList>() {
  return useRoute<RouteProp<RootStackParamList, T>>();
}

// ─── Declaration merge for React Navigation ──────────────
// Enables useNavigation() to be typed globally without generics
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
