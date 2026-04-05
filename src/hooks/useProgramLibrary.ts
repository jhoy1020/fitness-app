// useProgramLibrary — all programs (local + future remote), CRUD operations

import { useState, useEffect, useCallback } from 'react';
import type { TrainingProgram } from '../types';
import { useDatabase } from '../context/DatabaseProvider';

interface UseProgramLibraryResult {
  allPrograms: TrainingProgram[];
  premadePrograms: TrainingProgram[];
  customPrograms: TrainingProgram[];
  loading: boolean;
  error: Error | null;
  refresh: () => void;
  saveProgram: (program: TrainingProgram) => Promise<TrainingProgram>;
  deleteProgram: (id: string) => Promise<boolean>;
}

export function useProgramLibrary(): UseProgramLibraryResult {
  const { repos, isReady } = useDatabase();
  const [allPrograms, setAllPrograms] = useState<TrainingProgram[]>([]);
  const [premade, setPremade] = useState<TrainingProgram[]>([]);
  const [custom, setCustom] = useState<TrainingProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (!repos) return;
    try {
      setLoading(true);
      const [all, pre, cust] = await Promise.all([
        repos.programs.getAll(),
        repos.programs.getPremade(),
        repos.programs.getCustom(),
      ]);
      setAllPrograms(all);
      setPremade(pre);
      setCustom(cust);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [repos]);

  useEffect(() => {
    if (isReady) load();
  }, [isReady, load]);

  const saveProgram = useCallback(async (program: TrainingProgram) => {
    if (!repos) throw new Error('Database not ready');
    const saved = await repos.programs.upsert(program, false);
    await load(); // refresh lists
    return saved;
  }, [repos, load]);

  const deleteProgram = useCallback(async (id: string) => {
    if (!repos) return false;
    const ok = await repos.programs.delete(id);
    if (ok) await load();
    return ok;
  }, [repos, load]);

  return {
    allPrograms,
    premadePrograms: premade,
    customPrograms: custom,
    loading,
    error,
    refresh: load,
    saveProgram,
    deleteProgram,
  };
}
