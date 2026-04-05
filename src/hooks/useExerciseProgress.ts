// useExerciseProgress — sets/weight over time for a single exercise

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { WorkoutSet } from '../types';
import { useDatabase } from '../context/DatabaseProvider';

interface ProgressPoint {
  date: string;
  maxWeight: number;
  totalVolume: number;  // weight × reps summed
  avgReps: number;
  sets: WorkoutSet[];
}

interface UseExerciseProgressResult {
  history: ProgressPoint[];
  allSets: WorkoutSet[];
  loading: boolean;
  error: Error | null;
  refresh: () => void;
}

export function useExerciseProgress(exerciseId: string | null): UseExerciseProgressResult {
  const { repos, isReady } = useDatabase();
  const [allSets, setAllSets] = useState<WorkoutSet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (!repos || !exerciseId) return;
    try {
      setLoading(true);
      const sets = await repos.workouts.getSetsByExerciseId(exerciseId);
      setAllSets(sets);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [repos, exerciseId]);

  useEffect(() => {
    if (isReady && exerciseId) load();
  }, [isReady, exerciseId, load]);

  const history = useMemo(() => {
    if (allSets.length === 0) return [];

    // Group by date (from createdAt)
    const byDate = new Map<string, WorkoutSet[]>();
    for (const set of allSets) {
      const date = set.createdAt.split('T')[0]; // YYYY-MM-DD
      const arr = byDate.get(date) || [];
      arr.push(set);
      byDate.set(date, arr);
    }

    const points: ProgressPoint[] = [];
    for (const [date, sets] of byDate) {
      const weights = sets.map(s => s.weight).filter(w => w > 0);
      const totalVolume = sets.reduce((sum, s) => sum + s.weight * s.reps, 0);
      const totalReps = sets.reduce((sum, s) => sum + s.reps, 0);
      points.push({
        date,
        maxWeight: weights.length > 0 ? Math.max(...weights) : 0,
        totalVolume,
        avgReps: sets.length > 0 ? totalReps / sets.length : 0,
        sets,
      });
    }

    return points.sort((a, b) => a.date.localeCompare(b.date));
  }, [allSets]);

  return { history, allSets, loading, error, refresh: load };
}
