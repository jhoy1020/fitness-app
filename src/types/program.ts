// Program & Template Types

import type { MuscleGroup } from './exercise';
import type {
  DayType,
  CardioActivity,
  ActiveRecoveryActivity,
  RecoverySuggestion,
  CardioFinisher,
  AbFinisher,
} from './activity';

// Training frequency per muscle group (times per week)
export type MuscleFrequency = Record<MuscleGroup, number>;

// Muscle priority for specialization
export type MusclePriority = 'focus' | 'normal' | 'maintain';

// Weight prescription mode for exercises
export type WeightMode = 'auto' | 'percentage' | 'fixed';

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
  // Weight prescription
  weightMode?: WeightMode;           // 'auto' (default) | 'percentage' | 'fixed'
  percentageOf1RM?: number;          // 5-100, used when weightMode === 'percentage'
  fixedWeight?: number;              // Absolute weight, used when weightMode === 'fixed'
}

export interface ProgramDayTemplate {
  dayNumber: number;
  name: string;  // e.g., "Push Day", "Upper Body A", "Rest Day"
  dayType?: DayType;  // 'workout' | 'rest' | 'cardio' | 'active_recovery' - defaults to 'workout'
  muscleGroups?: MuscleGroup[];  // Optional for rest/cardio days
  exercises?: ProgramExerciseTemplate[];  // Optional for rest/cardio days
  cardioActivities?: CardioActivity[];  // For cardio days
  recoveryActivities?: ActiveRecoveryActivity[];  // For active recovery days
  cardioFinisher?: CardioFinisher;  // Optional cardio finisher for workout days
  abFinisher?: AbFinisher;  // Optional ab finisher for workout days
  recoverySuggestions?: RecoverySuggestion[];  // Smart suggestions for rest/recovery days
  notes?: string;  // Optional notes for the day
}

// Template for a program's weekly structure
export interface ProgramWeekTemplate {
  weekNumber?: number;  // 1-based week number (for multi-week programs)
  days: ProgramDayTemplate[];
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
  // weekTemplate: used when every week is the same
  // weekTemplates: used when weeks vary (takes precedence over weekTemplate)
  weekTemplate: ProgramWeekTemplate;
  weekTemplates?: ProgramWeekTemplate[];

  // Volume progression
  startingVolumeMultiplier: number;  // 1.0 = MEV, 1.2 = 20% above MEV
  volumeProgressionPerWeek: number;

  // Tags for filtering
  tags: string[];

  // ── Future-ready fields (Phase 8: backend & sharing) ──
  // All optional — unused until backend is wired in
  creatorId?: string;           // Backend user ID of the program author
  creatorName?: string;         // Display name of the author
  remoteId?: string;            // Server-side program ID (for synced programs)
  visibility?: 'private' | 'public' | 'unlisted';  // Publishing state
  downloads?: number;           // Times cloned by other users
  rating?: number;              // Average star rating (1-5)
  ratingCount?: number;         // Number of ratings
  source?: 'local' | 'remote'; // Where this program originated
  clonedFromId?: string;        // If cloned, what original program ID
}
