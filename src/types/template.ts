// Workout Template Types (separated to avoid circular deps with workout.ts)

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
