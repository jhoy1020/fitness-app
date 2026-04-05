// Local Exercise Repository — backed by expo-sqlite

import type { SQLiteDatabase } from 'expo-sqlite';
import type { Exercise, MuscleGroup } from '../../types';
import type { IExerciseRepository } from '../interfaces';
import * as q from '../../db/queries/exerciseQueries';

export class LocalExerciseRepository implements IExerciseRepository {
  constructor(private db: SQLiteDatabase) {}

  getAll(): Promise<Exercise[]> {
    return q.getAllExercises(this.db);
  }

  getById(id: string): Promise<Exercise | null> {
    return q.getExerciseById(this.db, id);
  }

  getByMuscleGroup(muscleGroup: MuscleGroup): Promise<Exercise[]> {
    return q.getExercisesByMuscleGroup(this.db, muscleGroup);
  }

  create(exercise: Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>): Promise<Exercise> {
    return q.createExercise(this.db, exercise);
  }

  update(id: string, updates: Partial<Exercise>): Promise<Exercise | null> {
    return q.updateExercise(this.db, id, updates);
  }

  delete(id: string): Promise<boolean> {
    return q.deleteExercise(this.db, id);
  }
}
