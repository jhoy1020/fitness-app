// Workout & Exercise Types

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'quadriceps'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'core'
  | 'full_body';

export type Equipment =
  | 'barbell'
  | 'dumbbell'
  | 'cable'
  | 'machine'
  | 'bodyweight'
  | 'kettlebell'
  | 'bands'
  | 'other';

export type GoalType = 'cut' | 'bulk' | 'maintain';

export type ActivityLevel =
  | 'sedentary'      // Little to no exercise
  | 'light'          // 1-3 days/week
  | 'moderate'       // 3-5 days/week
  | 'active'         // 6-7 days/week
  | 'very_active';   // 2x per day or physical job

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  secondaryMuscles?: MuscleGroup[];
  equipment: Equipment;
  defaultRestSeconds: number;
  instructions?: string;
  isCustom: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateExercise {
  id: string;
  templateId: string;
  exerciseId: string;
  orderIndex: number;
  targetSets: number;
  targetRepsMin: number;
  targetRepsMax: number;
  restSeconds?: number; // Override default
  notes?: string;
}

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
  rpe?: number; // 1-10 scale
  rir?: number; // Reps In Reserve (0-4)
  isWarmup: boolean;
  restTakenSeconds?: number;
  notes?: string;
  createdAt: string;
}

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

// ============================================
// MESOCYCLE & PERIODIZATION TYPES
// ============================================

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
  pumpRating: 0 | 1 | 2;          // 0=none, 1=moderate, 2=great
  sorenessRating: 0 | 1 | 2;      // 0=none, 1=mild, 2=significant
  performanceRating: 0 | 1 | 2 | 3; // 0=exceeded, 1=hit, 2=struggled, 3=missed
  totalScore: number;              // Sum for volume adjustment calculation
  musclesFeedback?: Record<MuscleGroup, { pump: 0 | 1 | 2; soreness: 0 | 1 | 2 }>;
  notes?: string;
}

// Single week within a mesocycle
export interface MesoCycleWeek {
  weekNumber: number;
  isDeload: boolean;
  targetVolume: Record<MuscleGroup, number>;  // Sets per muscle
  completedVolume: Record<MuscleGroup, number>;
  workoutIds: string[];
  feedback?: WorkoutFeedback;
  status: 'upcoming' | 'in_progress' | 'completed' | 'skipped';
}

// Training frequency per muscle group (times per week)
export type MuscleFrequency = Record<MuscleGroup, number>;

// Muscle priority for specialization
export type MusclePriority = 'focus' | 'normal' | 'maintain';

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
  volumeProgressionPerWeek: number;  // Sets to add per week
  
  // Program reference (if using a premade program)
  programId?: string;
  programName?: string;
  
  // Week template (workout structure from program)
  weekTemplate?: ProgramWeekTemplate;
  
  // Tracking
  totalWorkouts: number;
  completedWorkouts: number;
  
  createdAt: string;
  updatedAt: string;
}

// Premade training program template
export interface TrainingProgram {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  durationWeeks: number;
  daysPerWeek: number;
  split: string;  // e.g., "Push/Pull/Legs", "Upper/Lower", "Full Body"
  
  // Target audience
  goals: ('hypertrophy' | 'strength' | 'general_fitness')[];
  
  // Muscle focus
  musclePriorities: Record<MuscleGroup, MusclePriority>;
  weeklyFrequency: MuscleFrequency;
  
  // Weekly template
  weekTemplate: ProgramWeekTemplate;
  
  // Volume progression
  startingVolumeMultiplier: number;  // 1.0 = MEV, 1.2 = 20% above MEV
  volumeProgressionPerWeek: number;
  
  // Tags for filtering
  tags: string[];
}

// Template for a program's weekly structure
export interface ProgramWeekTemplate {
  days: ProgramDayTemplate[];
}

export interface ProgramDayTemplate {
  dayNumber: number;
  name: string;  // e.g., "Push Day", "Upper Body A"
  muscleGroups: MuscleGroup[];
  exercises: ProgramExerciseTemplate[];
}

export interface ProgramExerciseTemplate {
  exerciseId?: string;
  exerciseName?: string;  // Allow flexibility - can specify exact or category
  muscleGroup: MuscleGroup;
  category?: 'compound' | 'isolation';
  sets: number;
  repsMin: number;
  repsMax: number;
  rirTarget: number;  // Reps in Reserve target
  restSeconds: number;
  notes?: string;
  alternatives?: string[];  // Alternative exercise names
  // Superset grouping - exercises with same supersetGroupId are performed back-to-back
  supersetGroupId?: string;
  supersetOrder?: number;  // Order within the superset (1, 2, 3...)
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
  performancePercent: number;  // 100% = hit target exactly
}

// Calculated/Derived Types

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

// Context State Types

export interface WorkoutState {
  activeWorkout: Workout | null;
  activeSets: WorkoutSet[];
  currentExerciseIndex: number;
  isRestTimerRunning: boolean;
  restTimeRemaining: number;
  workoutHistory: Workout[];
  templates: WorkoutTemplate[];
}

// 1RM (One Rep Max) Record
export interface OneRepMaxRecord {
  id: string;
  exerciseName: string;
  weight: number;
  unit: 'lbs' | 'kg';
  testedDate: string;
  method: 'tested' | 'calculated';  // 'tested' = actual 1RM, 'calculated' = estimated from reps
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

export interface TimerState {
  isRunning: boolean;
  timeRemaining: number;
  totalTime: number;
  exerciseId?: string;
}

// Action Types

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
  | { type: 'UPDATE_WORKOUT'; payload: { id: string; updates: Partial<any> } };

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

export type TimerAction =
  | { type: 'START'; payload: { duration: number; exerciseId?: string } }
  | { type: 'TICK' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'RESET' }
  | { type: 'STOP' }
  | { type: 'ADJUST'; payload: number };

// MesoCycle State
export interface MesoCycleState {
  activeMesoCycle: MesoCycle | null;
  mesoCycleHistory: MesoCycle[];
  weeklyVolume: Record<MuscleGroup, number>;  // Current week's volume per muscle
  muscleFatigue: Record<MuscleGroup, MuscleFatigue>;
  workoutFeedback: WorkoutFeedback[];
  availablePrograms: TrainingProgram[];
}

// MesoCycle Actions
export type MesoCycleAction =
  | { type: 'CREATE_MESOCYCLE'; payload: MesoCycle }
  | { type: 'START_MESOCYCLE'; payload: string }  // mesocycle id
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
  | { type: 'RECORD_WORKOUT_COMPLETION'; payload: { workoutId: string; volumeByMuscle: Record<string, number> } }
  | { type: 'UPDATE_MESOCYCLE'; payload: MesoCycle }
  | { type: 'LOAD_STATE'; payload: MesoCycleState };
