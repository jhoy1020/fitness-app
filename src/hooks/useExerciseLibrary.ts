// useExerciseLibrary — filtered exercise search from the repository

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Exercise, MuscleGroup, Equipment } from '../types';
import { useDatabase } from '../context/DatabaseProvider';

interface Filters {
  muscleGroup?: MuscleGroup;
  equipment?: Equipment;
  search?: string;
  customOnly?: boolean;
}

interface UseExerciseLibraryResult {
  exercises: Exercise[];
  loading: boolean;
  error: Error | null;
  refresh: () => void;
  search: (filters: Filters) => void;
}

export function useExerciseLibrary(initialFilters?: Filters): UseExerciseLibraryResult {
  const { repos, isReady } = useDatabase();
  const [all, setAll] = useState<Exercise[]>([]);
  const [filters, setFilters] = useState<Filters>(initialFilters ?? {});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (!repos) return;
    try {
      setLoading(true);
      const data = filters.muscleGroup
        ? await repos.exercises.getByMuscleGroup(filters.muscleGroup)
        : await repos.exercises.getAll();
      setAll(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [repos, filters.muscleGroup]);

  useEffect(() => {
    if (isReady) load();
  }, [isReady, load]);

  const filtered = useMemo(() => {
    let result = all;
    if (filters.equipment) {
      result = result.filter(e => e.equipment === filters.equipment);
    }
    if (filters.customOnly) {
      result = result.filter(e => e.isCustom);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(e => e.name.toLowerCase().includes(q));
    }
    return result;
  }, [all, filters]);

  return {
    exercises: filtered,
    loading,
    error,
    refresh: load,
    search: setFilters,
  };
}
