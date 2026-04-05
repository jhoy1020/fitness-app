// Mesocycle & Periodization Types

import type { MuscleGroup } from './exercise';
import type { MusclePriority, MuscleFrequency, ProgramWeekTemplate, TrainingProgram } from './program';
import type { WorkoutTemplate } from './template';

// Volume landmarks for a muscle group
export interface VolumeLandmarks {
  MV: number;   // Maintenance Volume
  MEV: number;  // Minimum Effective Volume
  MAV: [number, number];  // Maximum Adaptive Volume range
  MRV: number;  // Maximum Recoverable Volume
}

// Weekly volume tracking per muscle group
export interface MuscleVolumeTracker {
  muscleGroup: MuscleGroup;
  setsCompleted: number;
  targetSets: number;
  percentOfMRV: number;
  status: 'below_mev' | 'at_mev' | 'in_mav' | 'near_mrv' | 'at_mrv';
}

// Post-workout feedback for auto-regulation
export interface WorkoutFeedback {
  id: string;
  workoutId: string;
  date: string;
  pumpRating: 0 | 1 | 2;
  sorenessRating: 0 | 1 | 2;
  performanceRating: 0 | 1 | 2 | 3;
  totalScore: number;
  musclesFeedback?: Record<MuscleGroup, { pump: 0 | 1 | 2; soreness: 0 | 1 | 2 }>;
  notes?: string;
}

// Single week within a mesocycle
export interface MesoCycleWeek {
  weekNumber: number;
  isDeload: boolean;
  targetVolume: Record<MuscleGroup, number>;
  completedVolume: Record<MuscleGroup, number>;
  workoutIds: string[];
  feedback?: WorkoutFeedback;
  status: 'upcoming' | 'in_progress' | 'completed' | 'skipped';
}

// Full mesocycle structure
export interface MesoCycle {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  status: 'planned' | 'active' | 'completed' | 'abandoned';

  // Structure
  totalWeeks: number;
  currentWeek: number;
  weeks: MesoCycleWeek[];

  // Muscle group configuration
  musclePriorities: Record<MuscleGroup, MusclePriority>;
  weeklyFrequency: MuscleFrequency;

  // Starting volumes (MEV for each muscle)
  startingVolume: Record<MuscleGroup, number>;

  // Progression settings
  volumeProgressionPerWeek: number;

  // Program reference
  programId?: string;
  programName?: string;

  // Week template (workout structure from program)
  weekTemplate?: ProgramWeekTemplate;
  weekTemplates?: ProgramWeekTemplate[];

  // Tracking
  totalWorkouts: number;
  completedWorkouts: number;

  createdAt: string;
  updatedAt: string;
}

// Fatigue tracking for auto-regulation
export interface MuscleFatigue {
  muscleGroup: MuscleGroup;
  currentFatigue: number;       // 0-100 scale
  lastTrainedDate?: string;
  recoveryRate: number;         // Points recovered per day
  consecutiveHardSessions: number;
  needsDeload: boolean;
}

// Session-level performance tracking
export interface SessionPerformance {
  workoutId: string;
  date: string;
  exercisePerformances: ExercisePerformance[];
  overallRating: 'excellent' | 'good' | 'average' | 'poor';
}

export interface ExercisePerformance {
  exerciseName: string;
  muscleGroup: MuscleGroup;
  targetReps: number;
  actualReps: number;
  targetWeight: number;
  actualWeight: number;
  targetRIR: number;
  actualRIR?: number;
  performancePercent: number;
}

// MesoCycle State
export interface MesoCycleState {
  activeMesoCycle: MesoCycle | null;
  mesoCycleHistory: MesoCycle[];
  weeklyVolume: Record<MuscleGroup, number>;
  muscleFatigue: Record<MuscleGroup, MuscleFatigue>;
  workoutFeedback: WorkoutFeedback[];
  availablePrograms: TrainingProgram[];
}

// MesoCycle Actions
export type MesoCycleAction =
  | { type: 'CREATE_MESOCYCLE'; payload: MesoCycle }
  | { type: 'START_MESOCYCLE'; payload: string }
  | { type: 'COMPLETE_MESOCYCLE'; payload: string }
  | { type: 'ABANDON_MESOCYCLE'; payload: string }
  | { type: 'ADVANCE_WEEK' }
  | { type: 'UPDATE_WEEK_VOLUME'; payload: { muscleGroup: MuscleGroup; sets: number } }
  | { type: 'RESET_WEEKLY_VOLUME' }
  | { type: 'ADD_WORKOUT_FEEDBACK'; payload: WorkoutFeedback }
  | { type: 'UPDATE_FATIGUE'; payload: { muscleGroup: MuscleGroup; fatigue: MuscleFatigue } }
  | { type: 'TRIGGER_DELOAD' }
  | { type: 'LOAD_MESOCYCLE_HISTORY'; payload: MesoCycle[] }
  | { type: 'LOAD_PROGRAMS'; payload: TrainingProgram[] }
  | { type: 'START_PROGRAM'; payload: { program: TrainingProgram; startDate: string } }
  | { type: 'SAVE_CUSTOM_PROGRAM'; payload: TrainingProgram }
  | { type: 'DELETE_CUSTOM_PROGRAM'; payload: string }
  | { type: 'UPDATE_ACTIVE_MESOCYCLE_FROM_PROGRAM'; payload: TrainingProgram }
  | { type: 'RECORD_WORKOUT_COMPLETION'; payload: { workoutId: string; volumeByMuscle: Record<string, number> } }
  | { type: 'ADVANCE_DAY' }
  | { type: 'UPDATE_MESOCYCLE'; payload: MesoCycle }
  | { type: 'LOAD_STATE'; payload: MesoCycleState };
