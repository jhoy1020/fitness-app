// useActiveWorkout — current workout state + mutations
// Extracted from WorkoutContext reducer logic into a self-contained hook.

import { useState, useCallback, useRef } from 'react';
import type { Workout, WorkoutSet, WorkoutTemplate, PausedWorkout, DeloadState } from '../types';
import { useDatabase } from '../context/DatabaseProvider';
import { v4 as uuid } from 'uuid';

interface UseActiveWorkoutResult {
  // State
  activeWorkout: Workout | null;
  activeSets: WorkoutSet[];
  currentExerciseIndex: number;
  pausedWorkout: PausedWorkout | null;
  deloadState: DeloadState;

  // Workout lifecycle
  startWorkout: (workout: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Workout>;
  completeWorkout: (summary: any) => Promise<void>;
  cancelWorkout: () => void;
  pauseWorkout: (pauseData: PausedWorkout) => void;
  resumeWorkout: () => PausedWorkout | null;

  // Set operations
  addSet: (set: Omit<WorkoutSet, 'id' | 'createdAt'>) => Promise<WorkoutSet>;
  updateSet: (id: string, updates: Partial<WorkoutSet>) => void;
  deleteSet: (id: string) => void;

  // Navigation
  nextExercise: () => void;
  previousExercise: () => void;
  setExerciseIndex: (index: number) => void;

  // Deload
  setDeloadState: (state: DeloadState) => void;
}

const DEFAULT_DELOAD: DeloadState = {
  lastAnalysis: null,
  lastDeloadDate: null,
  isDismissed: false,
  isInDeloadWeek: false,
  deloadStartDate: null,
};

export function useActiveWorkout(): UseActiveWorkoutResult {
  const { repos } = useDatabase();
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [activeSets, setActiveSets] = useState<WorkoutSet[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [pausedWorkout, setPausedWorkout] = useState<PausedWorkout | null>(null);
  const [deloadState, setDeloadState] = useState<DeloadState>(DEFAULT_DELOAD);

  const startWorkout = useCallback(async (
    workout: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!repos) throw new Error('Database not ready');
    const created = await repos.workouts.create({
      ...workout,
      startedAt: new Date().toISOString(),
    });
    setActiveWorkout(created);
    setActiveSets([]);
    setCurrentExerciseIndex(0);
    return created;
  }, [repos]);

  const completeWorkout = useCallback(async (summary: any) => {
    if (!repos || !activeWorkout) return;
    await repos.workouts.update(activeWorkout.id, {
      completedAt: new Date().toISOString(),
      ...summary,
    });
    setActiveWorkout(null);
    setActiveSets([]);
    setCurrentExerciseIndex(0);
  }, [repos, activeWorkout]);

  const cancelWorkout = useCallback(() => {
    setActiveWorkout(null);
    setActiveSets([]);
    setCurrentExerciseIndex(0);
  }, []);

  const pauseWorkout = useCallback((data: PausedWorkout) => {
    setPausedWorkout(data);
    setActiveWorkout(null);
    setActiveSets([]);
    setCurrentExerciseIndex(0);
  }, []);

  const resumeWorkout = useCallback(() => {
    const paused = pausedWorkout;
    setPausedWorkout(null);
    return paused;
  }, [pausedWorkout]);

  const addSet = useCallback(async (set: Omit<WorkoutSet, 'id' | 'createdAt'>) => {
    if (!repos) throw new Error('Database not ready');
    const created = await repos.workouts.createSet(set);
    setActiveSets(prev => [...prev, created]);
    return created;
  }, [repos]);

  const updateSet = useCallback((id: string, updates: Partial<WorkoutSet>) => {
    setActiveSets(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    // Persist in background
    repos?.workouts.updateSet(id, updates);
  }, [repos]);

  const deleteSet = useCallback((id: string) => {
    setActiveSets(prev => prev.filter(s => s.id !== id));
    repos?.workouts.deleteSet(id);
  }, [repos]);

  const nextExercise = useCallback(() => {
    setCurrentExerciseIndex(prev => prev + 1);
  }, []);

  const previousExercise = useCallback(() => {
    setCurrentExerciseIndex(prev => Math.max(0, prev - 1));
  }, []);

  return {
    activeWorkout,
    activeSets,
    currentExerciseIndex,
    pausedWorkout,
    deloadState,
    startWorkout,
    completeWorkout,
    cancelWorkout,
    pauseWorkout,
    resumeWorkout,
    addSet,
    updateSet,
    deleteSet,
    nextExercise,
    previousExercise,
    setExerciseIndex: setCurrentExerciseIndex,
    setDeloadState,
  };
}
