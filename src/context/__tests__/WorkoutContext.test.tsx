// Tests for WorkoutContext

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { WorkoutProvider, useWorkout } from '../WorkoutContext';
import { Storage } from '../../utils/storage';
import {
  getAllWorkouts,
  getAllTemplates,
  createWorkout,
  updateWorkout,
  createWorkoutSet,
  deleteWorkoutSet,
  updateWorkoutSet,
  getSetsByWorkoutId,
} from '../../services/db';

// Mock dependencies
jest.mock('../../utils/storage', () => ({
  Storage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

jest.mock('../../services/db', () => ({
  getAllWorkouts: jest.fn(),
  getAllTemplates: jest.fn(),
  createWorkout: jest.fn(),
  updateWorkout: jest.fn(),
  createWorkoutSet: jest.fn(),
  deleteWorkoutSet: jest.fn(),
  updateWorkoutSet: jest.fn(),
  getSetsByWorkoutId: jest.fn(),
}));

jest.mock('../../utils', () => ({
  generateUUID: jest.fn(() => 'test-uuid'),
  toISODate: jest.fn(() => '2026-03-01T00:00:00.000Z'),
}));

const mockStorage = Storage as jest.Mocked<typeof Storage>;
const mockGetAllWorkouts = getAllWorkouts as jest.MockedFunction<typeof getAllWorkouts>;
const mockGetAllTemplates = getAllTemplates as jest.MockedFunction<typeof getAllTemplates>;
const mockCreateWorkout = createWorkout as jest.MockedFunction<typeof createWorkout>;
const mockCreateWorkoutSet = createWorkoutSet as jest.MockedFunction<typeof createWorkoutSet>;
const mockDeleteWorkoutSet = deleteWorkoutSet as jest.MockedFunction<typeof deleteWorkoutSet>;
const mockUpdateWorkoutSet = updateWorkoutSet as jest.MockedFunction<typeof updateWorkoutSet>;

describe('WorkoutContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStorage.getItem.mockResolvedValue(null);
    mockStorage.setItem.mockResolvedValue(undefined);
    mockStorage.removeItem.mockResolvedValue(undefined);
    mockGetAllWorkouts.mockResolvedValue([]);
    mockGetAllTemplates.mockResolvedValue([]);
    mockCreateWorkoutSet.mockResolvedValue({ id: 'set-1', createdAt: '2026-03-01' } as any);
    mockDeleteWorkoutSet.mockResolvedValue(undefined);
    mockUpdateWorkoutSet.mockResolvedValue(undefined);
  });

  describe('WorkoutProvider', () => {
    it('provides default state', () => {
      const { result } = renderHook(() => useWorkout(), {
        wrapper: WorkoutProvider,
      });

      expect(result.current.state.activeWorkout).toBeNull();
      expect(result.current.state.activeSets).toEqual([]);
      expect(result.current.state.currentExerciseIndex).toBe(0);
      expect(result.current.state.isRestTimerRunning).toBe(false);
      expect(result.current.state.restTimeRemaining).toBe(0);
      expect(result.current.state.workoutHistory).toEqual([]);
      expect(result.current.state.templates).toEqual([]);
      expect(result.current.state.pausedWorkout).toBeNull();
    });

    it('provides default deload state', () => {
      const { result } = renderHook(() => useWorkout(), {
        wrapper: WorkoutProvider,
      });

      expect(result.current.state.deloadState).toEqual({
        lastAnalysis: null,
        lastDeloadDate: null,
        isDismissed: false,
        isInDeloadWeek: false,
        deloadStartDate: null,
      });
    });

    it('loads workout history from storage on mount', async () => {
      const mockHistory = [
        { id: 'w1', name: 'Push Day', date: '2026-02-28' },
      ];
      mockStorage.getItem.mockImplementation(async (key) => {
        if (key === 'fitness_workout_history') return JSON.stringify(mockHistory);
        return null;
      });

      const { result } = renderHook(() => useWorkout(), {
        wrapper: WorkoutProvider,
      });

      await waitFor(() => {
        expect(result.current.state.workoutHistory).toEqual(mockHistory);
      });
    });

    it('loads paused workout from storage on mount', async () => {
      const mockPaused = {
        workoutName: 'Push Day',
        workoutNotes: '',
        exercises: [],
        restTarget: 90,
        timerSeconds: 0,
        isProgramWorkout: false,
        pausedAt: '2026-02-28T10:00:00.000Z',
      };
      mockStorage.getItem.mockImplementation(async (key) => {
        if (key === 'fitness_paused_workout') return JSON.stringify(mockPaused);
        return null;
      });

      const { result } = renderHook(() => useWorkout(), {
        wrapper: WorkoutProvider,
      });

      await waitFor(() => {
        expect(result.current.state.pausedWorkout).toEqual(mockPaused);
      });
    });

    it('loads deload state from storage on mount', async () => {
      const mockDeload = {
        lastAnalysis: '2026-02-28',
        lastDeloadDate: null,
        isDismissed: false,
        isInDeloadWeek: true,
        deloadStartDate: '2026-02-27',
      };
      mockStorage.getItem.mockImplementation(async (key) => {
        if (key === 'fitness_deload_state') return JSON.stringify(mockDeload);
        return null;
      });

      const { result } = renderHook(() => useWorkout(), {
        wrapper: WorkoutProvider,
      });

      await waitFor(() => {
        expect(result.current.state.deloadState).toEqual(mockDeload);
      });
    });
  });

  describe('startWorkout', () => {
    it('starts a new workout', async () => {
      const mockWorkout = {
        id: 'w1',
        name: 'Push Day',
        date: '2026-03-01',
        startedAt: '2026-03-01T00:00:00.000Z',
      };
      mockCreateWorkout.mockResolvedValue(mockWorkout as any);

      const { result } = renderHook(() => useWorkout(), {
        wrapper: WorkoutProvider,
      });

      await act(async () => {
        await result.current.startWorkout('Push Day');
      });

      expect(result.current.state.activeWorkout).toEqual(mockWorkout);
      expect(result.current.state.activeSets).toEqual([]);
      expect(result.current.state.currentExerciseIndex).toBe(0);
    });
  });

  describe('exercise navigation', () => {
    it('advances to next exercise', () => {
      const { result } = renderHook(() => useWorkout(), {
        wrapper: WorkoutProvider,
      });

      act(() => {
        result.current.nextExercise();
      });

      expect(result.current.state.currentExerciseIndex).toBe(1);
    });

    it('goes to previous exercise', () => {
      const { result } = renderHook(() => useWorkout(), {
        wrapper: WorkoutProvider,
      });

      act(() => {
        result.current.nextExercise();
        result.current.nextExercise();
      });

      act(() => {
        result.current.previousExercise();
      });

      expect(result.current.state.currentExerciseIndex).toBe(1);
    });

    it('does not go below 0', () => {
      const { result } = renderHook(() => useWorkout(), {
        wrapper: WorkoutProvider,
      });

      act(() => {
        result.current.previousExercise();
      });

      expect(result.current.state.currentExerciseIndex).toBe(0);
    });

    it('sets exercise index directly', () => {
      const { result } = renderHook(() => useWorkout(), {
        wrapper: WorkoutProvider,
      });

      act(() => {
        result.current.setExerciseIndex(5);
      });

      expect(result.current.state.currentExerciseIndex).toBe(5);
    });
  });

  describe('rest timer', () => {
    it('starts rest timer', () => {
      const { result } = renderHook(() => useWorkout(), {
        wrapper: WorkoutProvider,
      });

      act(() => {
        result.current.startRestTimer(90);
      });

      expect(result.current.state.isRestTimerRunning).toBe(true);
      expect(result.current.state.restTimeRemaining).toBe(90);
    });

    it('ticks rest timer', () => {
      const { result } = renderHook(() => useWorkout(), {
        wrapper: WorkoutProvider,
      });

      act(() => {
        result.current.startRestTimer(90);
      });

      act(() => {
        result.current.tickRestTimer();
      });

      expect(result.current.state.restTimeRemaining).toBe(89);
    });

    it('stops rest timer at 0', () => {
      const { result } = renderHook(() => useWorkout(), {
        wrapper: WorkoutProvider,
      });

      act(() => {
        result.current.startRestTimer(1);
      });

      act(() => {
        result.current.tickRestTimer();
      });

      expect(result.current.state.restTimeRemaining).toBe(0);
      expect(result.current.state.isRestTimerRunning).toBe(false);
    });

    it('stops rest timer manually', () => {
      const { result } = renderHook(() => useWorkout(), {
        wrapper: WorkoutProvider,
      });

      act(() => {
        result.current.startRestTimer(90);
      });

      act(() => {
        result.current.stopRestTimer();
      });

      expect(result.current.state.isRestTimerRunning).toBe(false);
      expect(result.current.state.restTimeRemaining).toBe(0);
    });
  });

  describe('cancelWorkout', () => {
    it('clears active workout', async () => {
      const mockWorkout = {
        id: 'w1',
        name: 'Push Day',
        date: '2026-03-01',
      };
      mockCreateWorkout.mockResolvedValue(mockWorkout as any);

      const { result } = renderHook(() => useWorkout(), {
        wrapper: WorkoutProvider,
      });

      await act(async () => {
        await result.current.startWorkout('Push Day');
      });

      act(() => {
        result.current.cancelWorkout();
      });

      expect(result.current.state.activeWorkout).toBeNull();
      expect(result.current.state.activeSets).toEqual([]);
    });
  });

  describe('pauseWorkout', () => {
    it('saves paused workout', () => {
      const { result } = renderHook(() => useWorkout(), {
        wrapper: WorkoutProvider,
      });

      const pausedData = {
        workoutName: 'Push Day',
        workoutNotes: 'Good session',
        exercises: [],
        restTarget: 90,
        timerSeconds: 45,
        isProgramWorkout: false,
        pausedAt: '2026-03-01T10:00:00.000Z',
      };

      act(() => {
        result.current.pauseWorkout(pausedData);
      });

      expect(result.current.state.pausedWorkout).toEqual(pausedData);
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        'fitness_paused_workout',
        JSON.stringify(pausedData)
      );
    });
  });

  describe('clearPausedWorkout', () => {
    it('clears paused workout', () => {
      const { result } = renderHook(() => useWorkout(), {
        wrapper: WorkoutProvider,
      });

      act(() => {
        result.current.pauseWorkout({
          workoutName: 'Push Day',
          workoutNotes: '',
          exercises: [],
          restTarget: 90,
          timerSeconds: 0,
          isProgramWorkout: false,
          pausedAt: '2026-03-01T10:00:00.000Z',
        });
      });

      act(() => {
        result.current.clearPausedWorkout();
      });

      expect(result.current.state.pausedWorkout).toBeNull();
      expect(mockStorage.removeItem).toHaveBeenCalledWith('fitness_paused_workout');
    });
  });

  describe('deload actions', () => {
    it('starts deload week', () => {
      const { result } = renderHook(() => useWorkout(), {
        wrapper: WorkoutProvider,
      });

      act(() => {
        result.current.startDeloadWeek();
      });

      expect(result.current.state.deloadState.isInDeloadWeek).toBe(true);
      expect(result.current.state.deloadState.deloadStartDate).toBeTruthy();
    });

    it('ends deload week', () => {
      const { result } = renderHook(() => useWorkout(), {
        wrapper: WorkoutProvider,
      });

      act(() => {
        result.current.startDeloadWeek();
      });

      act(() => {
        result.current.endDeloadWeek();
      });

      expect(result.current.state.deloadState.isInDeloadWeek).toBe(false);
      expect(result.current.state.deloadState.deloadStartDate).toBeNull();
      expect(result.current.state.deloadState.lastDeloadDate).toBeTruthy();
    });

    it('dismisses deload recommendation', () => {
      const { result } = renderHook(() => useWorkout(), {
        wrapper: WorkoutProvider,
      });

      act(() => {
        result.current.dismissDeload();
      });

      expect(result.current.state.deloadState.isDismissed).toBe(true);
    });
  });

  describe('complete workout', () => {
    it('saves completed workout to history', () => {
      const { result } = renderHook(() => useWorkout(), {
        wrapper: WorkoutProvider,
      });

      const completedWorkout = {
        id: 'w1',
        name: 'Push Day',
        date: '2026-03-01',
        completedAt: '2026-03-01T01:00:00.000Z',
        durationMinutes: 60,
      };

      act(() => {
        result.current.dispatch({
          type: 'COMPLETE_WORKOUT',
          payload: completedWorkout,
        });
      });

      expect(result.current.state.workoutHistory).toContainEqual(completedWorkout);
      expect(result.current.state.activeWorkout).toBeNull();
    });
  });

  describe('delete workout', () => {
    it('removes workout from history', () => {
      const { result } = renderHook(() => useWorkout(), {
        wrapper: WorkoutProvider,
      });

      // First add a workout
      act(() => {
        result.current.dispatch({
          type: 'COMPLETE_WORKOUT',
          payload: { id: 'w1', name: 'Push Day', date: '2026-03-01' },
        });
      });

      act(() => {
        result.current.dispatch({
          type: 'DELETE_WORKOUT',
          payload: 'w1',
        });
      });

      expect(result.current.state.workoutHistory.find(w => w.id === 'w1')).toBeUndefined();
    });
  });

  describe('useWorkout hook', () => {
    it('throws when used outside provider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        renderHook(() => useWorkout());
      }).toThrow('useWorkout must be used within a WorkoutProvider');

      consoleSpy.mockRestore();
    });
  });
});
