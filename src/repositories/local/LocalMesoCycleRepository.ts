// Local MesoCycle Repository — backed by expo-sqlite

import type { SQLiteDatabase } from 'expo-sqlite';
import type {
  MesoCycle,
  WorkoutFeedback,
  MuscleFatigue,
  MuscleGroup,
} from '../../types';
import type { IMesoCycleRepository } from '../interfaces';
import * as q from '../../db/queries/mesocycleQueries';

export class LocalMesoCycleRepository implements IMesoCycleRepository {
  constructor(private db: SQLiteDatabase) {}

  getActive(): Promise<MesoCycle | null> {
    return q.getActiveMesocycle(this.db);
  }

  getById(id: string): Promise<MesoCycle | null> {
    return q.getMesocycleById(this.db, id);
  }

  getAll(): Promise<MesoCycle[]> {
    return q.getAllMesocycles(this.db);
  }

  create(meso: MesoCycle): Promise<MesoCycle> {
    return q.createMesocycle(this.db, meso);
  }

  update(id: string, updates: Partial<MesoCycle>): Promise<MesoCycle | null> {
    return q.updateMesocycle(this.db, id, updates);
  }

  delete(id: string): Promise<boolean> {
    return q.deleteMesocycle(this.db, id);
  }

  getAllFeedback(): Promise<WorkoutFeedback[]> {
    return q.getAllFeedback(this.db);
  }

  createFeedback(feedback: WorkoutFeedback): Promise<WorkoutFeedback> {
    return q.createFeedback(this.db, feedback);
  }

  getAllFatigue(): Promise<Record<MuscleGroup, MuscleFatigue>> {
    return q.getAllMuscleFatigue(this.db);
  }

  upsertFatigue(fatigue: MuscleFatigue): Promise<void> {
    return q.upsertMuscleFatigue(this.db, fatigue);
  }

  getMeta(key: string): Promise<string | null> {
    return q.getAppMeta(this.db, key);
  }

  setMeta(key: string, value: string): Promise<void> {
    return q.setAppMeta(this.db, key, value);
  }
}
