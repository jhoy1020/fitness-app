// Local User Repository — backed by expo-sqlite

import type { SQLiteDatabase } from 'expo-sqlite';
import type {
  UserProfile,
  ExerciseGoal,
  BodyMeasurement,
  OneRepMaxRecord,
  ExportRecord,
} from '../../types';
import type { IUserRepository } from '../interfaces';
import * as q from '../../db/queries/userQueries';

export class LocalUserRepository implements IUserRepository {
  constructor(private db: SQLiteDatabase) {}

  getProfile(): Promise<UserProfile | null> {
    return q.getUserProfile(this.db);
  }

  saveProfile(profile: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserProfile> {
    return q.saveUserProfile(this.db, profile);
  }

  getAllGoals(): Promise<ExerciseGoal[]> {
    return q.getAllExerciseGoals(this.db);
  }

  saveGoal(goal: Omit<ExerciseGoal, 'id' | 'createdAt' | 'updatedAt'>): Promise<ExerciseGoal> {
    return q.saveExerciseGoal(this.db, goal);
  }

  deleteGoal(id: string): Promise<boolean> {
    return q.deleteExerciseGoal(this.db, id);
  }

  getAllMeasurements(): Promise<BodyMeasurement[]> {
    return q.getAllMeasurements(this.db);
  }

  createMeasurement(m: Omit<BodyMeasurement, 'id' | 'createdAt'>): Promise<BodyMeasurement> {
    return q.createMeasurement(this.db, m);
  }

  getAllOneRepMax(): Promise<OneRepMaxRecord[]> {
    return q.getAllOneRepMaxRecords(this.db);
  }

  upsertOneRepMax(record: Omit<OneRepMaxRecord, 'id'> & { id?: string }): Promise<OneRepMaxRecord> {
    return q.upsertOneRepMax(this.db, record);
  }

  deleteOneRepMax(id: string): Promise<boolean> {
    return q.deleteOneRepMax(this.db, id);
  }

  getExportHistory(): Promise<ExportRecord[]> {
    return q.getExportHistory(this.db);
  }
}
