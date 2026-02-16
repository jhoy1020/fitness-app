// Database service using SQLite
// This module provides an abstraction layer that can be swapped for cloud storage later

import { Platform } from 'react-native';
import type {
  Exercise,
  Workout,
  WorkoutSet,
  WorkoutTemplate,
  TemplateExercise,
  UserProfile,
  ExerciseGoal,
  ExportRecord,
} from '../../types';
import { generateUUID, toISODate } from '../../utils';

// For web, we'll use a mock in-memory store
// For native, we'll use SQLite
const isWeb = Platform.OS === 'web';

// In-memory storage for web (will be replaced with IndexedDB or cloud)
let memoryStore: {
  exercises: Exercise[];
  workouts: Workout[];
  workoutSets: WorkoutSet[];
  templates: WorkoutTemplate[];
  templateExercises: TemplateExercise[];
  userProfile: UserProfile | null;
  exerciseGoals: ExerciseGoal[];
  exportHistory: ExportRecord[];
} = {
  exercises: [],
  workouts: [],
  workoutSets: [],
  templates: [],
  templateExercises: [],
  userProfile: null,
  exerciseGoals: [],
  exportHistory: [],
};

// Database initialization
export async function initDatabase(): Promise<void> {
  if (isWeb) {
    // Load from localStorage if available
    const saved = localStorage.getItem('fitness_app_data');
    if (saved) {
      try {
        memoryStore = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved data:', e);
      }
    }
    console.log('Web database initialized (in-memory)');
  } else {
    // SQLite initialization for native
    // This would use react-native-sqlite-storage
    console.log('Native SQLite database initialized');
  }
}

// Save to localStorage for web
function persistWebData(): void {
  if (isWeb) {
    localStorage.setItem('fitness_app_data', JSON.stringify(memoryStore));
  }
}

// ============ EXERCISES ============

export async function getAllExercises(): Promise<Exercise[]> {
  return [...memoryStore.exercises];
}

export async function getExerciseById(id: string): Promise<Exercise | null> {
  return memoryStore.exercises.find(e => e.id === id) || null;
}

export async function getExercisesByMuscleGroup(muscleGroup: string): Promise<Exercise[]> {
  return memoryStore.exercises.filter(e => e.muscleGroup === muscleGroup);
}

export async function createExercise(exercise: Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>): Promise<Exercise> {
  const newExercise: Exercise = {
    ...exercise,
    id: generateUUID(),
    createdAt: toISODate(),
    updatedAt: toISODate(),
  };
  memoryStore.exercises.push(newExercise);
  persistWebData();
  return newExercise;
}

export async function updateExercise(id: string, updates: Partial<Exercise>): Promise<Exercise | null> {
  const index = memoryStore.exercises.findIndex(e => e.id === id);
  if (index === -1) return null;
  
  memoryStore.exercises[index] = {
    ...memoryStore.exercises[index],
    ...updates,
    updatedAt: toISODate(),
  };
  persistWebData();
  return memoryStore.exercises[index];
}

export async function deleteExercise(id: string): Promise<boolean> {
  const index = memoryStore.exercises.findIndex(e => e.id === id);
  if (index === -1) return false;
  
  memoryStore.exercises.splice(index, 1);
  persistWebData();
  return true;
}

export async function seedExercises(exercises: Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<void> {
  const existingNames = new Set(memoryStore.exercises.map(e => e.name.toLowerCase()));
  
  for (const exercise of exercises) {
    if (!existingNames.has(exercise.name.toLowerCase())) {
      await createExercise(exercise);
    }
  }
}

// ============ WORKOUTS ============

export async function getAllWorkouts(): Promise<Workout[]> {
  return [...memoryStore.workouts].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getWorkoutById(id: string): Promise<Workout | null> {
  return memoryStore.workouts.find(w => w.id === id) || null;
}

export async function getRecentWorkouts(limit: number = 10): Promise<Workout[]> {
  return (await getAllWorkouts()).slice(0, limit);
}

export async function createWorkout(workout: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>): Promise<Workout> {
  const newWorkout: Workout = {
    ...workout,
    id: generateUUID(),
    createdAt: toISODate(),
    updatedAt: toISODate(),
  };
  memoryStore.workouts.push(newWorkout);
  persistWebData();
  return newWorkout;
}

export async function updateWorkout(id: string, updates: Partial<Workout>): Promise<Workout | null> {
  const index = memoryStore.workouts.findIndex(w => w.id === id);
  if (index === -1) return null;
  
  memoryStore.workouts[index] = {
    ...memoryStore.workouts[index],
    ...updates,
    updatedAt: toISODate(),
  };
  persistWebData();
  return memoryStore.workouts[index];
}

export async function deleteWorkout(id: string): Promise<boolean> {
  const index = memoryStore.workouts.findIndex(w => w.id === id);
  if (index === -1) return false;
  
  // Also delete associated sets
  memoryStore.workoutSets = memoryStore.workoutSets.filter(s => s.workoutId !== id);
  memoryStore.workouts.splice(index, 1);
  persistWebData();
  return true;
}

// ============ WORKOUT SETS ============

export async function getSetsByWorkoutId(workoutId: string): Promise<WorkoutSet[]> {
  return memoryStore.workoutSets
    .filter(s => s.workoutId === workoutId)
    .sort((a, b) => a.setNumber - b.setNumber);
}

export async function getSetsByExerciseId(exerciseId: string, limit?: number): Promise<WorkoutSet[]> {
  const sets = memoryStore.workoutSets
    .filter(s => s.exerciseId === exerciseId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  return limit ? sets.slice(0, limit) : sets;
}

export async function createWorkoutSet(set: Omit<WorkoutSet, 'id' | 'createdAt'>): Promise<WorkoutSet> {
  const newSet: WorkoutSet = {
    ...set,
    id: generateUUID(),
    createdAt: toISODate(),
  };
  memoryStore.workoutSets.push(newSet);
  persistWebData();
  return newSet;
}

export async function updateWorkoutSet(id: string, updates: Partial<WorkoutSet>): Promise<WorkoutSet | null> {
  const index = memoryStore.workoutSets.findIndex(s => s.id === id);
  if (index === -1) return null;
  
  memoryStore.workoutSets[index] = {
    ...memoryStore.workoutSets[index],
    ...updates,
  };
  persistWebData();
  return memoryStore.workoutSets[index];
}

export async function deleteWorkoutSet(id: string): Promise<boolean> {
  const index = memoryStore.workoutSets.findIndex(s => s.id === id);
  if (index === -1) return false;
  
  memoryStore.workoutSets.splice(index, 1);
  persistWebData();
  return true;
}

// ============ TEMPLATES ============

export async function getAllTemplates(): Promise<WorkoutTemplate[]> {
  return [...memoryStore.templates];
}

export async function getTemplateById(id: string): Promise<WorkoutTemplate | null> {
  return memoryStore.templates.find(t => t.id === id) || null;
}

export async function createTemplate(template: Omit<WorkoutTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkoutTemplate> {
  const newTemplate: WorkoutTemplate = {
    ...template,
    id: generateUUID(),
    createdAt: toISODate(),
    updatedAt: toISODate(),
  };
  memoryStore.templates.push(newTemplate);
  persistWebData();
  return newTemplate;
}

export async function updateTemplate(id: string, updates: Partial<WorkoutTemplate>): Promise<WorkoutTemplate | null> {
  const index = memoryStore.templates.findIndex(t => t.id === id);
  if (index === -1) return null;
  
  memoryStore.templates[index] = {
    ...memoryStore.templates[index],
    ...updates,
    updatedAt: toISODate(),
  };
  persistWebData();
  return memoryStore.templates[index];
}

export async function deleteTemplate(id: string): Promise<boolean> {
  const index = memoryStore.templates.findIndex(t => t.id === id);
  if (index === -1) return false;
  
  // Also delete associated template exercises
  memoryStore.templateExercises = memoryStore.templateExercises.filter(te => te.templateId !== id);
  memoryStore.templates.splice(index, 1);
  persistWebData();
  return true;
}

// ============ TEMPLATE EXERCISES ============

export async function getTemplateExercises(templateId: string): Promise<TemplateExercise[]> {
  return memoryStore.templateExercises
    .filter(te => te.templateId === templateId)
    .sort((a, b) => a.orderIndex - b.orderIndex);
}

export async function createTemplateExercise(te: Omit<TemplateExercise, 'id'>): Promise<TemplateExercise> {
  const newTE: TemplateExercise = {
    ...te,
    id: generateUUID(),
  };
  memoryStore.templateExercises.push(newTE);
  persistWebData();
  return newTE;
}

export async function updateTemplateExercise(id: string, updates: Partial<TemplateExercise>): Promise<TemplateExercise | null> {
  const index = memoryStore.templateExercises.findIndex(te => te.id === id);
  if (index === -1) return null;
  
  memoryStore.templateExercises[index] = {
    ...memoryStore.templateExercises[index],
    ...updates,
  };
  persistWebData();
  return memoryStore.templateExercises[index];
}

export async function deleteTemplateExercise(id: string): Promise<boolean> {
  const index = memoryStore.templateExercises.findIndex(te => te.id === id);
  if (index === -1) return false;
  
  memoryStore.templateExercises.splice(index, 1);
  persistWebData();
  return true;
}

// ============ USER PROFILE ============

export async function getUserProfile(): Promise<UserProfile | null> {
  return memoryStore.userProfile;
}

export async function saveUserProfile(profile: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserProfile> {
  const newProfile: UserProfile = {
    ...profile,
    id: memoryStore.userProfile?.id || generateUUID(),
    createdAt: memoryStore.userProfile?.createdAt || toISODate(),
    updatedAt: toISODate(),
  };
  memoryStore.userProfile = newProfile;
  persistWebData();
  return newProfile;
}

// ============ EXERCISE GOALS ============

export async function getAllExerciseGoals(): Promise<ExerciseGoal[]> {
  return [...memoryStore.exerciseGoals];
}

export async function getExerciseGoal(exerciseId: string): Promise<ExerciseGoal | null> {
  return memoryStore.exerciseGoals.find(g => g.exerciseId === exerciseId) || null;
}

export async function saveExerciseGoal(goal: Omit<ExerciseGoal, 'id' | 'createdAt' | 'updatedAt'>): Promise<ExerciseGoal> {
  const existingIndex = memoryStore.exerciseGoals.findIndex(g => g.exerciseId === goal.exerciseId);
  
  const newGoal: ExerciseGoal = {
    ...goal,
    id: existingIndex >= 0 ? memoryStore.exerciseGoals[existingIndex].id : generateUUID(),
    createdAt: existingIndex >= 0 ? memoryStore.exerciseGoals[existingIndex].createdAt : toISODate(),
    updatedAt: toISODate(),
  };
  
  if (existingIndex >= 0) {
    memoryStore.exerciseGoals[existingIndex] = newGoal;
  } else {
    memoryStore.exerciseGoals.push(newGoal);
  }
  
  persistWebData();
  return newGoal;
}

export async function deleteExerciseGoal(id: string): Promise<boolean> {
  const index = memoryStore.exerciseGoals.findIndex(g => g.id === id);
  if (index === -1) return false;
  
  memoryStore.exerciseGoals.splice(index, 1);
  persistWebData();
  return true;
}

// ============ EXPORT ============

export async function getAllData(): Promise<typeof memoryStore> {
  return { ...memoryStore };
}

export async function importData(data: typeof memoryStore): Promise<void> {
  memoryStore = { ...data };
  persistWebData();
}

export async function clearAllData(): Promise<void> {
  memoryStore = {
    exercises: [],
    workouts: [],
    workoutSets: [],
    templates: [],
    templateExercises: [],
    userProfile: null,
    exerciseGoals: [],
    exportHistory: [],
  };
  persistWebData();
}
