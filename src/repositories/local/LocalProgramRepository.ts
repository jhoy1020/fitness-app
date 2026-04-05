// Local Program Repository — backed by expo-sqlite

import type { SQLiteDatabase } from 'expo-sqlite';
import type { TrainingProgram } from '../../types';
import type { IProgramRepository } from '../interfaces';
import * as q from '../../db/queries/programQueries';

export class LocalProgramRepository implements IProgramRepository {
  constructor(private db: SQLiteDatabase) {}

  getAll(): Promise<TrainingProgram[]> {
    return q.getAllPrograms(this.db);
  }

  getById(id: string): Promise<TrainingProgram | null> {
    return q.getProgramById(this.db, id);
  }

  getCustom(): Promise<TrainingProgram[]> {
    return q.getCustomPrograms(this.db);
  }

  getPremade(): Promise<TrainingProgram[]> {
    return q.getPremadePrograms(this.db);
  }

  create(program: TrainingProgram, isPremade?: boolean): Promise<TrainingProgram> {
    return q.createProgram(this.db, program, isPremade);
  }

  update(id: string, updates: Partial<TrainingProgram>): Promise<TrainingProgram | null> {
    return q.updateProgram(this.db, id, updates);
  }

  upsert(program: TrainingProgram, isPremade?: boolean): Promise<TrainingProgram> {
    return q.upsertProgram(this.db, program, isPremade);
  }

  delete(id: string): Promise<boolean> {
    return q.deleteProgram(this.db, id);
  }

  // Phase 8 stubs — not implemented for local repository
  // getPublicPrograms, cloneProgram, rateProgram are optionally
  // defined on the interface and will be on RemoteProgramRepository.
}
