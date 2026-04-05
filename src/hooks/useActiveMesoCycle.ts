// useActiveMesoCycle — current mesocycle state + volume tracking from repository

import { useState, useEffect, useCallback } from 'react';
import type { MesoCycle, MuscleGroup, MuscleFatigue, WorkoutFeedback } from '../types';
import { useDatabase } from '../context/DatabaseProvider';

interface UseActiveMesoCycleResult {
  activeMesoCycle: MesoCycle | null;
  mesoCycleHistory: MesoCycle[];
  muscleFatigue: Record<string, MuscleFatigue>;
  workoutFeedback: WorkoutFeedback[];
  loading: boolean;
  error: Error | null;
  refresh: () => void;

  // Mutations
  createMesoCycle: (meso: MesoCycle) => Promise<MesoCycle>;
  updateMesoCycle: (id: string, updates: Partial<MesoCycle>) => Promise<MesoCycle | null>;
  completeMesoCycle: (id: string) => Promise<void>;
  abandonMesoCycle: (id: string) => Promise<void>;
  recordFeedback: (feedback: WorkoutFeedback) => Promise<void>;
  updateFatigue: (fatigue: MuscleFatigue) => Promise<void>;
}

export function useActiveMesoCycle(): UseActiveMesoCycleResult {
  const { repos, isReady } = useDatabase();
  const [active, setActive] = useState<MesoCycle | null>(null);
  const [history, setHistory] = useState<MesoCycle[]>([]);
  const [fatigue, setFatigue] = useState<Record<string, MuscleFatigue>>({});
  const [feedback, setFeedback] = useState<WorkoutFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (!repos) return;
    try {
      setLoading(true);
      const [activeMeso, all, fat, fb] = await Promise.all([
        repos.mesocycles.getActive(),
        repos.mesocycles.getAll(),
        repos.mesocycles.getAllFatigue(),
        repos.mesocycles.getAllFeedback(),
      ]);
      setActive(activeMeso);
      setHistory(all);
      setFatigue(fat);
      setFeedback(fb);
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

  const createMesoCycle = useCallback(async (meso: MesoCycle) => {
    if (!repos) throw new Error('Database not ready');
    const created = await repos.mesocycles.create(meso);
    await load();
    return created;
  }, [repos, load]);

  const updateMesoCycle = useCallback(async (id: string, updates: Partial<MesoCycle>) => {
    if (!repos) throw new Error('Database not ready');
    const updated = await repos.mesocycles.update(id, updates);
    await load();
    return updated;
  }, [repos, load]);

  const completeMesoCycle = useCallback(async (id: string) => {
    if (!repos) return;
    await repos.mesocycles.update(id, { status: 'completed', endDate: new Date().toISOString() });
    await load();
  }, [repos, load]);

  const abandonMesoCycle = useCallback(async (id: string) => {
    if (!repos) return;
    await repos.mesocycles.update(id, { status: 'abandoned', endDate: new Date().toISOString() });
    await load();
  }, [repos, load]);

  const recordFeedback = useCallback(async (fb: WorkoutFeedback) => {
    if (!repos) return;
    await repos.mesocycles.createFeedback(fb);
    await load();
  }, [repos, load]);

  const updateFatigue = useCallback(async (f: MuscleFatigue) => {
    if (!repos) return;
    await repos.mesocycles.upsertFatigue(f);
    setFatigue(prev => ({ ...prev, [f.muscleGroup]: f }));
  }, [repos]);

  return {
    activeMesoCycle: active,
    mesoCycleHistory: history,
    muscleFatigue: fatigue,
    workoutFeedback: feedback,
    loading,
    error,
    refresh: load,
    createMesoCycle,
    updateMesoCycle,
    completeMesoCycle,
    abandonMesoCycle,
    recordFeedback,
    updateFatigue,
  };
}
