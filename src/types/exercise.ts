// Exercise & Muscle Group Types

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

// How an exercise is tracked/logged
// weight_reps: standard weight × reps (default)
// duration: sets × seconds (planks, holds)
// weight_duration: weight × seconds (carries, weighted holds)
export type ExerciseTrackingType = 'weight_reps' | 'duration' | 'weight_duration';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  secondaryMuscles?: MuscleGroup[];
  equipment: Equipment;
  trackingType?: ExerciseTrackingType; // defaults to 'weight_reps'
  defaultRestSeconds: number;
  instructions?: string;
  isCustom: boolean;
  createdAt: string;
  updatedAt: string;
}
