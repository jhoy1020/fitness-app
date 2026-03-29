// Tests for UserContext

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { UserProvider, useUser } from '../UserContext';
import { Storage } from '../../utils/storage';
import {
  getUserProfile,
  saveUserProfile,
  getAllExerciseGoals,
  saveExerciseGoal,
} from '../../services/db';
import { calculateNutrition } from '../../utils';

// Mock dependencies
jest.mock('../../utils/storage', () => ({
  Storage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

jest.mock('../../services/db', () => ({
  getUserProfile: jest.fn(),
  saveUserProfile: jest.fn(),
  getAllExerciseGoals: jest.fn(),
  saveExerciseGoal: jest.fn(),
}));

jest.mock('../../utils', () => ({
  calculateNutrition: jest.fn(),
}));

const mockStorage = Storage as jest.Mocked<typeof Storage>;
const mockGetUserProfile = getUserProfile as jest.MockedFunction<typeof getUserProfile>;
const mockSaveUserProfile = saveUserProfile as jest.MockedFunction<typeof saveUserProfile>;
const mockGetAllExerciseGoals = getAllExerciseGoals as jest.MockedFunction<typeof getAllExerciseGoals>;
const mockSaveExerciseGoal = saveExerciseGoal as jest.MockedFunction<typeof saveExerciseGoal>;
const mockCalculateNutrition = calculateNutrition as jest.MockedFunction<typeof calculateNutrition>;

const mockProfile = {
  id: 'user-1',
  weight: 180,
  weightUnit: 'lbs' as const,
  height: 72,
  heightUnit: 'in' as const,
  age: 30,
  gender: 'male' as const,
  activityLevel: 'moderate' as const,
  goalType: 'maintain' as const,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

const mockNutrition = {
  bmr: 1800,
  tdee: 2790,
  targetCalories: 2790,
  protein: 180,
  fat: 80,
  carbs: 310,
};

describe('UserContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUserProfile.mockResolvedValue(null);
    mockGetAllExerciseGoals.mockResolvedValue([]);
    mockStorage.getItem.mockResolvedValue(null);
    mockStorage.setItem.mockResolvedValue(undefined);
    mockCalculateNutrition.mockReturnValue(mockNutrition);
  });

  describe('UserProvider', () => {
    it('provides default state', () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      });

      expect(result.current.state.profile).toBeNull();
      expect(result.current.state.exerciseGoals).toEqual([]);
      expect(result.current.state.nutrition).toBeNull();
      expect(result.current.state.weightHistory).toEqual([]);
      expect(result.current.state.units).toBe('imperial');
      expect(result.current.state.oneRepMaxRecords).toEqual([]);
    });

    it('loads profile on mount', async () => {
      mockGetUserProfile.mockResolvedValue(mockProfile);

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      });

      await waitFor(() => {
        expect(result.current.state.profile).toEqual(mockProfile);
      });
    });

    it('calculates nutrition when profile is loaded', async () => {
      mockGetUserProfile.mockResolvedValue(mockProfile);

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      });

      await waitFor(() => {
        expect(result.current.state.nutrition).toEqual(mockNutrition);
      });

      expect(mockCalculateNutrition).toHaveBeenCalledWith(mockProfile);
    });

    it('loads exercise goals on mount', async () => {
      const mockGoals = [
        { id: 'g1', exerciseId: 'e1', current1RM: 225, target1RM: 315, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
      ];
      mockGetAllExerciseGoals.mockResolvedValue(mockGoals);

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      });

      await waitFor(() => {
        expect(result.current.state.exerciseGoals).toEqual(mockGoals);
      });
    });

    it('loads weight history from storage on mount', async () => {
      const mockHistory = [
        { id: '1', date: '2026-02-01', weight: 180, createdAt: '2026-02-01' },
        { id: '2', date: '2026-02-08', weight: 179, createdAt: '2026-02-08' },
      ];
      mockStorage.getItem.mockImplementation(async (key) => {
        if (key === 'fitness_app_weight_history') return JSON.stringify(mockHistory);
        return null;
      });

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      });

      await waitFor(() => {
        expect(result.current.state.weightHistory).toEqual(mockHistory);
      });
    });

    it('loads 1RM records from storage on mount', async () => {
      const mockRecords = [
        { id: '1', exerciseName: 'Bench Press', weight: 225, unit: 'lbs', testedDate: '2026-02-01', method: 'tested' },
      ];
      mockStorage.getItem.mockImplementation(async (key) => {
        if (key === 'fitness_app_one_rep_max') return JSON.stringify(mockRecords);
        return null;
      });

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      });

      await waitFor(() => {
        expect(result.current.state.oneRepMaxRecords).toEqual(mockRecords);
      });
    });
  });

  describe('updateProfile', () => {
    it('saves profile and updates state', async () => {
      const newProfile = { ...mockProfile, weight: 175 };
      mockSaveUserProfile.mockResolvedValue(newProfile);

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      });

      await act(async () => {
        await result.current.updateProfile({
          weight: 175,
          weightUnit: 'lbs',
          height: 72,
          heightUnit: 'in',
          age: 30,
          gender: 'male',
          activityLevel: 'moderate',
          goalType: 'maintain',
        });
      });

      expect(mockSaveUserProfile).toHaveBeenCalled();
      expect(result.current.state.profile).toEqual(newProfile);
    });
  });

  describe('addWeightEntry', () => {
    it('adds weight entry to state', async () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      });

      await act(async () => {
        result.current.addWeightEntry(178);
      });

      await waitFor(() => {
        expect(result.current.state.weightHistory.length).toBe(1);
        expect(result.current.state.weightHistory[0].weight).toBe(178);
      });
    });

    it('adds weight entry with body fat', async () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      });

      await act(async () => {
        result.current.addWeightEntry(178, 15.5);
      });

      await waitFor(() => {
        expect(result.current.state.weightHistory[0].bodyFatPercent).toBe(15.5);
      });
    });

    it('saves to storage', async () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      });

      await act(async () => {
        result.current.addWeightEntry(178);
      });

      expect(mockStorage.setItem).toHaveBeenCalledWith(
        'fitness_app_weight_history',
        expect.any(String)
      );
    });
  });

  describe('1RM operations', () => {
    it('adds one rep max record', async () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      });

      act(() => {
        result.current.addOneRepMax('Bench Press', 225, 'tested', 'New PR');
      });

      expect(result.current.state.oneRepMaxRecords.length).toBe(1);
      expect(result.current.state.oneRepMaxRecords[0].exerciseName).toBe('Bench Press');
      expect(result.current.state.oneRepMaxRecords[0].weight).toBe(225);
    });

    it('replaces existing exercise 1RM', async () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      });

      act(() => {
        result.current.addOneRepMax('Bench Press', 225, 'tested');
      });

      act(() => {
        result.current.addOneRepMax('Bench Press', 235, 'tested');
      });

      expect(result.current.state.oneRepMaxRecords.length).toBe(1);
      expect(result.current.state.oneRepMaxRecords[0].weight).toBe(235);
    });

    it('gets one rep max by exercise name', async () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      });

      act(() => {
        result.current.addOneRepMax('Bench Press', 225, 'tested');
      });

      const record = result.current.getOneRepMax('Bench Press');
      expect(record).toBeDefined();
      expect(record!.weight).toBe(225);
    });

    it('getOneRepMax is case-insensitive', async () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      });

      act(() => {
        result.current.addOneRepMax('Bench Press', 225, 'tested');
      });

      expect(result.current.getOneRepMax('bench press')).toBeDefined();
      expect(result.current.getOneRepMax('BENCH PRESS')).toBeDefined();
    });

    it('deletes one rep max record', async () => {
      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      });

      act(() => {
        result.current.addOneRepMax('Bench Press', 225, 'tested');
      });

      const id = result.current.state.oneRepMaxRecords[0].id;

      act(() => {
        result.current.deleteOneRepMax(id);
      });

      expect(result.current.state.oneRepMaxRecords.length).toBe(0);
    });
  });

  describe('useUser hook', () => {
    it('throws when used outside provider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        renderHook(() => useUser());
      }).toThrow('useUser must be used within a UserProvider');

      consoleSpy.mockRestore();
    });
  });
});
