// useUserProfile — profile CRUD + nutrition calculation from repository

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { UserProfile, NutritionCalculation, ExerciseGoal, OneRepMaxRecord, BodyMeasurement } from '../types';
import { useDatabase } from '../context/DatabaseProvider';
import { calculateNutrition } from '../utils';

interface UseUserProfileResult {
  profile: UserProfile | null;
  nutrition: NutritionCalculation | null;
  exerciseGoals: ExerciseGoal[];
  oneRepMaxRecords: OneRepMaxRecord[];
  weightHistory: BodyMeasurement[];
  loading: boolean;
  error: Error | null;
  refresh: () => void;

  // Mutations
  saveProfile: (profile: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>) => Promise<UserProfile>;
  saveGoal: (goal: Omit<ExerciseGoal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ExerciseGoal>;
  addOneRepMax: (record: Omit<OneRepMaxRecord, 'id'>) => Promise<OneRepMaxRecord>;
  deleteOneRepMax: (id: string) => Promise<boolean>;
  getOneRepMax: (exerciseName: string) => OneRepMaxRecord | undefined;
  addWeightEntry: (measurement: Omit<BodyMeasurement, 'id' | 'createdAt'>) => Promise<BodyMeasurement>;
}

export function useUserProfile(): UseUserProfileResult {
  const { repos, isReady } = useDatabase();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [goals, setGoals] = useState<ExerciseGoal[]>([]);
  const [ormRecords, setOrmRecords] = useState<OneRepMaxRecord[]>([]);
  const [weightHistory, setWeightHistory] = useState<BodyMeasurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (!repos) return;
    try {
      setLoading(true);
      const [p, g, orm, wh] = await Promise.all([
        repos.users.getProfile(),
        repos.users.getAllGoals(),
        repos.users.getAllOneRepMax(),
        repos.users.getAllMeasurements(),
      ]);
      setProfile(p);
      setGoals(g);
      setOrmRecords(orm);
      setWeightHistory(wh);
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

  const nutrition = useMemo(() => {
    return profile ? calculateNutrition(profile) : null;
  }, [profile]);

  const saveProfile = useCallback(async (p: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!repos) throw new Error('Database not ready');
    const saved = await repos.users.saveProfile(p);
    setProfile(saved);
    return saved;
  }, [repos]);

  const saveGoal = useCallback(async (goal: Omit<ExerciseGoal, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!repos) throw new Error('Database not ready');
    const saved = await repos.users.saveGoal(goal);
    await load();
    return saved;
  }, [repos, load]);

  const addOneRepMax = useCallback(async (record: Omit<OneRepMaxRecord, 'id'>) => {
    if (!repos) throw new Error('Database not ready');
    const saved = await repos.users.upsertOneRepMax(record);
    setOrmRecords(prev => [
      ...prev.filter(r => r.exerciseName.toLowerCase() !== record.exerciseName.toLowerCase()),
      saved,
    ]);
    return saved;
  }, [repos]);

  const deleteOneRepMax = useCallback(async (id: string) => {
    if (!repos) return false;
    const ok = await repos.users.deleteOneRepMax(id);
    if (ok) setOrmRecords(prev => prev.filter(r => r.id !== id));
    return ok;
  }, [repos]);

  const getOneRepMax = useCallback((exerciseName: string) => {
    return ormRecords.find(r => r.exerciseName.toLowerCase() === exerciseName.toLowerCase());
  }, [ormRecords]);

  const addWeightEntry = useCallback(async (m: Omit<BodyMeasurement, 'id' | 'createdAt'>) => {
    if (!repos) throw new Error('Database not ready');
    const saved = await repos.users.createMeasurement(m);
    setWeightHistory(prev => [...prev, saved].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    ));
    return saved;
  }, [repos]);

  return {
    profile,
    nutrition,
    exerciseGoals: goals,
    oneRepMaxRecords: ormRecords,
    weightHistory,
    loading,
    error,
    refresh: load,
    saveProfile,
    saveGoal,
    addOneRepMax,
    deleteOneRepMax,
    getOneRepMax,
    addWeightEntry,
  };
}
