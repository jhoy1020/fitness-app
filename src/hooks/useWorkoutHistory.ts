// useWorkoutHistory — paginated workout history from the repository

import { useState, useEffect, useCallback } from 'react';
import type { Workout } from '../types';
import { useDatabase } from '../context/DatabaseProvider';

interface UseWorkoutHistoryResult {
  workouts: Workout[];
  loading: boolean;
  error: Error | null;
  refresh: () => void;
  deleteWorkout: (id: string) => Promise<boolean>;
}

export function useWorkoutHistory(limit = 50): UseWorkoutHistoryResult {
  const { repos, isReady } = useDatabase();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (!repos) return;
    try {
      setLoading(true);
      const data = await repos.workouts.getRecent(limit);
      setWorkouts(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [repos, limit]);

  useEffect(() => {
    if (isReady) load();
  }, [isReady, load]);

  const deleteWorkout = useCallback(async (id: string) => {
    if (!repos) return false;
    const ok = await repos.workouts.delete(id);
    if (ok) {
      setWorkouts(prev => prev.filter(w => w.id !== id));
    }
    return ok;
  }, [repos]);

  return { workouts, loading, error, refresh: load, deleteWorkout };
}
