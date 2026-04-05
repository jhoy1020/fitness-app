// Local Workout Repository — backed by expo-sqlite

import type { SQLiteDatabase } from 'expo-sqlite';
import type { Workout, WorkoutSet, WorkoutTemplate, TemplateExercise } from '../../types';
import type { IWorkoutRepository } from '../interfaces';
import * as q from '../../db/queries/workoutQueries';

export class LocalWorkoutRepository implements IWorkoutRepository {
  constructor(private db: SQLiteDatabase) {}

  // ── Workouts ──
  getAll(): Promise<Workout[]> {
    return q.getAllWorkouts(this.db);
  }

  getById(id: string): Promise<Workout | null> {
    return q.getWorkoutById(this.db, id);
  }

  getRecent(limit?: number): Promise<Workout[]> {
    return q.getRecentWorkouts(this.db, limit);
  }

  create(workout: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>): Promise<Workout> {
    return q.createWorkout(this.db, workout);
  }

  update(id: string, updates: Partial<Workout>): Promise<Workout | null> {
    return q.updateWorkout(this.db, id, updates);
  }

  delete(id: string): Promise<boolean> {
    return q.deleteWorkout(this.db, id);
  }

  // ── Sets ──
  getSetsByWorkoutId(workoutId: string): Promise<WorkoutSet[]> {
    return q.getSetsByWorkoutId(this.db, workoutId);
  }

  getSetsByExerciseId(exerciseId: string, limit?: number): Promise<WorkoutSet[]> {
    return q.getSetsByExerciseId(this.db, exerciseId, limit);
  }

  createSet(set: Omit<WorkoutSet, 'id' | 'createdAt'>): Promise<WorkoutSet> {
    return q.createWorkoutSet(this.db, set);
  }

  updateSet(id: string, updates: Partial<WorkoutSet>): Promise<WorkoutSet | null> {
    return q.updateWorkoutSet(this.db, id, updates);
  }

  deleteSet(id: string): Promise<boolean> {
    return q.deleteWorkoutSet(this.db, id);
  }

  // ── Templates ──
  getAllTemplates(): Promise<WorkoutTemplate[]> {
    return q.getAllTemplates(this.db);
  }

  getTemplateById(id: string): Promise<WorkoutTemplate | null> {
    return q.getTemplateById(this.db, id);
  }

  createTemplate(template: Omit<WorkoutTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkoutTemplate> {
    return q.createTemplate(this.db, template);
  }

  updateTemplate(id: string, updates: Partial<WorkoutTemplate>): Promise<WorkoutTemplate | null> {
    return q.updateTemplate(this.db, id, updates);
  }

  deleteTemplate(id: string): Promise<boolean> {
    return q.deleteTemplate(this.db, id);
  }

  getTemplateExercises(templateId: string): Promise<TemplateExercise[]> {
    return q.getTemplateExercises(this.db, templateId);
  }

  createTemplateExercise(te: Omit<TemplateExercise, 'id'>): Promise<TemplateExercise> {
    return q.createTemplateExercise(this.db, te);
  }
}
