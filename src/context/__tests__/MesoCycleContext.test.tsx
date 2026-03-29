// Tests for MesoCycleContext

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { MesoCycleProvider, useMesoCycle } from '../MesoCycleContext';
import { Storage } from '../../utils/storage';

// Mock Storage
jest.mock('../../utils/storage', () => ({
  Storage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

const mockStorage = Storage as jest.Mocked<typeof Storage>;

describe('MesoCycleContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStorage.getItem.mockResolvedValue(null);
    mockStorage.setItem.mockResolvedValue(undefined);
  });

  describe('MesoCycleProvider', () => {
    it('provides default state', () => {
      const { result } = renderHook(() => useMesoCycle(), {
        wrapper: MesoCycleProvider,
      });

      expect(result.current.state.activeMesoCycle).toBeNull();
      expect(result.current.state.mesoCycleHistory).toEqual([]);
      expect(result.current.state.workoutFeedback).toEqual([]);
      expect(result.current.state.availablePrograms).toEqual([]);
    });

    it('loads saved state from storage on mount', async () => {
      const savedState = {
        activeMesoCycle: null,
        mesoCycleHistory: [],
        workoutFeedback: [
          { id: 'fb1', workoutId: 'w1', date: '2026-02-28', pumpRating: 2, sorenessRating: 1, performanceRating: 1, totalScore: 4 },
        ],
        weeklyVolume: {},
        muscleFatigue: {},
        availablePrograms: [],
      };
      mockStorage.getItem.mockImplementation(async (key) => {
        if (key === 'mesocycleState') return JSON.stringify(savedState);
        return null;
      });

      const { result } = renderHook(() => useMesoCycle(), {
        wrapper: MesoCycleProvider,
      });

      await waitFor(() => {
        expect(result.current.state.workoutFeedback.length).toBe(1);
      });
    });
  });

  describe('mesocycle actions', () => {
    it('creates a mesocycle', () => {
      const { result } = renderHook(() => useMesoCycle(), {
        wrapper: MesoCycleProvider,
      });

      const newMeso = {
        id: 'meso-1',
        name: 'PPL Block',
        startDate: '2026-03-01',
        status: 'planned' as const,
        totalWeeks: 6,
        currentWeek: 1,
        weeks: [],
        musclePriorities: {} as any,
        weeklyFrequency: {} as any,
        startingVolume: {} as any,
        volumeProgressionPerWeek: 1,
        totalWorkouts: 0,
        completedWorkouts: 0,
        createdAt: '2026-03-01',
        updatedAt: '2026-03-01',
      };

      act(() => {
        result.current.dispatch({
          type: 'CREATE_MESOCYCLE',
          payload: newMeso,
        });
      });

      expect(result.current.state.mesoCycleHistory).toContainEqual(newMeso);
    });

    it('starts a mesocycle', () => {
      const { result } = renderHook(() => useMesoCycle(), {
        wrapper: MesoCycleProvider,
      });

      const newMeso = {
        id: 'meso-1',
        name: 'PPL Block',
        startDate: '2026-03-01',
        status: 'planned' as const,
        totalWeeks: 6,
        currentWeek: 1,
        weeks: [],
        musclePriorities: {} as any,
        weeklyFrequency: {} as any,
        startingVolume: {} as any,
        volumeProgressionPerWeek: 1,
        totalWorkouts: 0,
        completedWorkouts: 0,
        createdAt: '2026-03-01',
        updatedAt: '2026-03-01',
      };

      act(() => {
        result.current.dispatch({ type: 'CREATE_MESOCYCLE', payload: newMeso });
      });

      act(() => {
        result.current.dispatch({ type: 'START_MESOCYCLE', payload: 'meso-1' });
      });

      expect(result.current.state.activeMesoCycle).toBeTruthy();
      expect(result.current.state.activeMesoCycle?.status).toBe('active');
    });

    it('completes a mesocycle', () => {
      const { result } = renderHook(() => useMesoCycle(), {
        wrapper: MesoCycleProvider,
      });

      const newMeso = {
        id: 'meso-1',
        name: 'PPL Block',
        startDate: '2026-03-01',
        status: 'planned' as const,
        totalWeeks: 6,
        currentWeek: 1,
        weeks: [],
        musclePriorities: {} as any,
        weeklyFrequency: {} as any,
        startingVolume: {} as any,
        volumeProgressionPerWeek: 1,
        totalWorkouts: 0,
        completedWorkouts: 0,
        createdAt: '2026-03-01',
        updatedAt: '2026-03-01',
      };

      act(() => {
        result.current.dispatch({ type: 'CREATE_MESOCYCLE', payload: newMeso });
        result.current.dispatch({ type: 'START_MESOCYCLE', payload: 'meso-1' });
      });

      act(() => {
        result.current.dispatch({ type: 'COMPLETE_MESOCYCLE', payload: 'meso-1' });
      });

      expect(result.current.state.activeMesoCycle).toBeNull();
    });

    it('abandons a mesocycle', () => {
      const { result } = renderHook(() => useMesoCycle(), {
        wrapper: MesoCycleProvider,
      });

      const newMeso = {
        id: 'meso-1',
        name: 'PPL Block',
        startDate: '2026-03-01',
        status: 'planned' as const,
        totalWeeks: 6,
        currentWeek: 1,
        weeks: [],
        musclePriorities: {} as any,
        weeklyFrequency: {} as any,
        startingVolume: {} as any,
        volumeProgressionPerWeek: 1,
        totalWorkouts: 0,
        completedWorkouts: 0,
        createdAt: '2026-03-01',
        updatedAt: '2026-03-01',
      };

      act(() => {
        result.current.dispatch({ type: 'CREATE_MESOCYCLE', payload: newMeso });
        result.current.dispatch({ type: 'START_MESOCYCLE', payload: 'meso-1' });
      });

      act(() => {
        result.current.dispatch({ type: 'ABANDON_MESOCYCLE', payload: 'meso-1' });
      });

      expect(result.current.state.activeMesoCycle).toBeNull();
    });

    it('adds workout feedback', () => {
      const { result } = renderHook(() => useMesoCycle(), {
        wrapper: MesoCycleProvider,
      });

      const feedback = {
        id: 'fb-1',
        workoutId: 'w1',
        date: '2026-03-01',
        pumpRating: 2 as const,
        sorenessRating: 1 as const,
        performanceRating: 1 as const,
        totalScore: 4,
      };

      act(() => {
        result.current.dispatch({
          type: 'ADD_WORKOUT_FEEDBACK',
          payload: feedback,
        });
      });

      expect(result.current.state.workoutFeedback).toContainEqual(feedback);
    });

    it('resets weekly volume', () => {
      const { result } = renderHook(() => useMesoCycle(), {
        wrapper: MesoCycleProvider,
      });

      // Add some volume first
      act(() => {
        result.current.dispatch({
          type: 'UPDATE_WEEK_VOLUME',
          payload: { muscleGroup: 'chest', sets: 10 },
        });
      });

      act(() => {
        result.current.dispatch({ type: 'RESET_WEEKLY_VOLUME' });
      });

      expect(result.current.state.weeklyVolume.chest || 0).toBe(0);
    });

    it('loads programs', () => {
      const { result } = renderHook(() => useMesoCycle(), {
        wrapper: MesoCycleProvider,
      });

      const programs = [
        {
          id: 'prog-1',
          name: 'PPL',
          description: 'Push Pull Legs',
          difficulty: 'intermediate' as const,
          durationWeeks: 6,
          daysPerWeek: 6,
          split: 'Push/Pull/Legs',
          goals: ['hypertrophy' as const],
          musclePriorities: {} as any,
          weeklyFrequency: {} as any,
          weekTemplate: { days: [] },
          startingVolumeMultiplier: 1.0,
          volumeProgressionPerWeek: 1,
          tags: ['PPL'],
        },
      ];

      act(() => {
        result.current.dispatch({ type: 'LOAD_PROGRAMS', payload: programs });
      });

      expect(result.current.state.availablePrograms).toEqual(programs);
    });

    it('saves a custom program', () => {
      const { result } = renderHook(() => useMesoCycle(), {
        wrapper: MesoCycleProvider,
      });

      const customProgram = {
        id: 'custom-123',
        name: 'My Custom PPL',
        description: 'A custom program',
        difficulty: 'intermediate' as const,
        durationWeeks: 5,
        daysPerWeek: 3,
        split: 'Push/Pull/Legs',
        goals: ['hypertrophy' as const],
        musclePriorities: {} as any,
        weeklyFrequency: {} as any,
        weekTemplate: { days: [] },
        startingVolumeMultiplier: 1.0,
        volumeProgressionPerWeek: 1,
        tags: ['custom'],
      };

      act(() => {
        result.current.dispatch({ type: 'SAVE_CUSTOM_PROGRAM', payload: customProgram });
      });

      expect(result.current.state.availablePrograms).toContainEqual(customProgram);
    });

    it('upserts a custom program with same id', () => {
      const { result } = renderHook(() => useMesoCycle(), {
        wrapper: MesoCycleProvider,
      });

      const customProgram = {
        id: 'custom-123',
        name: 'My Custom PPL',
        description: 'A custom program',
        difficulty: 'intermediate' as const,
        durationWeeks: 5,
        daysPerWeek: 3,
        split: 'Push/Pull/Legs',
        goals: ['hypertrophy' as const],
        musclePriorities: {} as any,
        weeklyFrequency: {} as any,
        weekTemplate: { days: [] },
        startingVolumeMultiplier: 1.0,
        volumeProgressionPerWeek: 1,
        tags: ['custom'],
      };

      act(() => {
        result.current.dispatch({ type: 'SAVE_CUSTOM_PROGRAM', payload: customProgram });
      });

      const updatedProgram = { ...customProgram, name: 'Updated PPL', description: 'Edited' };

      act(() => {
        result.current.dispatch({ type: 'SAVE_CUSTOM_PROGRAM', payload: updatedProgram });
      });

      expect(result.current.state.availablePrograms.length).toBe(1);
      expect(result.current.state.availablePrograms[0].name).toBe('Updated PPL');
      expect(result.current.state.availablePrograms[0].description).toBe('Edited');
    });

    it('deletes a custom program', () => {
      const { result } = renderHook(() => useMesoCycle(), {
        wrapper: MesoCycleProvider,
      });

      const customProgram = {
        id: 'custom-456',
        name: 'To Be Deleted',
        description: 'Will be removed',
        difficulty: 'beginner' as const,
        durationWeeks: 4,
        daysPerWeek: 3,
        split: 'Full Body',
        goals: ['general_fitness' as const],
        musclePriorities: {} as any,
        weeklyFrequency: {} as any,
        weekTemplate: { days: [] },
        startingVolumeMultiplier: 1.0,
        volumeProgressionPerWeek: 1,
        tags: ['custom'],
      };

      act(() => {
        result.current.dispatch({ type: 'SAVE_CUSTOM_PROGRAM', payload: customProgram });
      });

      expect(result.current.state.availablePrograms.length).toBe(1);

      act(() => {
        result.current.dispatch({ type: 'DELETE_CUSTOM_PROGRAM', payload: 'custom-456' });
      });

      expect(result.current.state.availablePrograms.length).toBe(0);
    });

    it('updates active mesocycle from edited program', () => {
      const { result } = renderHook(() => useMesoCycle(), {
        wrapper: MesoCycleProvider,
      });

      const program = {
        id: 'custom-789',
        name: 'Original PPL',
        description: 'Original description',
        difficulty: 'intermediate' as const,
        durationWeeks: 5,
        daysPerWeek: 3,
        split: 'Push/Pull/Legs',
        goals: ['hypertrophy' as const],
        musclePriorities: {} as any,
        weeklyFrequency: {} as any,
        weekTemplate: { days: [{ dayNumber: 1, name: 'Push', exercises: [] }] },
        startingVolumeMultiplier: 1.0,
        volumeProgressionPerWeek: 1,
        tags: ['custom'],
      };

      // Start the program to create an active mesocycle
      act(() => {
        result.current.dispatch({
          type: 'START_PROGRAM',
          payload: { program, startDate: '2026-03-01' },
        });
      });

      expect(result.current.state.activeMesoCycle).toBeTruthy();
      expect(result.current.state.activeMesoCycle!.programId).toBe('custom-789');
      expect(result.current.state.activeMesoCycle!.name).toBe('Original PPL');

      // Simulate some progress
      const originalCompletedWorkouts = result.current.state.activeMesoCycle!.completedWorkouts;
      const originalCurrentWeek = result.current.state.activeMesoCycle!.currentWeek;

      // Edit the program
      const editedProgram = {
        ...program,
        name: 'Edited PPL',
        description: 'Updated description',
        weekTemplate: { days: [{ dayNumber: 1, name: 'Push Day', exercises: [] }, { dayNumber: 2, name: 'Pull Day', exercises: [] }] },
      };

      act(() => {
        result.current.dispatch({
          type: 'UPDATE_ACTIVE_MESOCYCLE_FROM_PROGRAM',
          payload: editedProgram,
        });
      });

      // Should update template/metadata
      expect(result.current.state.activeMesoCycle!.name).toBe('Edited PPL');
      expect(result.current.state.activeMesoCycle!.description).toBe('Updated description');
      expect(result.current.state.activeMesoCycle!.programName).toBe('Edited PPL');
      expect(result.current.state.activeMesoCycle!.weekTemplate!.days.length).toBe(2);

      // Should preserve progress
      expect(result.current.state.activeMesoCycle!.completedWorkouts).toBe(originalCompletedWorkouts);
      expect(result.current.state.activeMesoCycle!.currentWeek).toBe(originalCurrentWeek);
    });

    it('does not update active mesocycle when programId does not match', () => {
      const { result } = renderHook(() => useMesoCycle(), {
        wrapper: MesoCycleProvider,
      });

      const program = {
        id: 'custom-100',
        name: 'Active Program',
        description: 'Currently running',
        difficulty: 'intermediate' as const,
        durationWeeks: 5,
        daysPerWeek: 3,
        split: 'Push/Pull/Legs',
        goals: ['hypertrophy' as const],
        musclePriorities: {} as any,
        weeklyFrequency: {} as any,
        weekTemplate: { days: [] },
        startingVolumeMultiplier: 1.0,
        volumeProgressionPerWeek: 1,
        tags: ['custom'],
      };

      // Start one program
      act(() => {
        result.current.dispatch({
          type: 'START_PROGRAM',
          payload: { program, startDate: '2026-03-01' },
        });
      });

      expect(result.current.state.activeMesoCycle!.name).toBe('Active Program');

      // Edit a different program
      const differentProgram = {
        ...program,
        id: 'custom-200',
        name: 'Different Program',
      };

      act(() => {
        result.current.dispatch({
          type: 'UPDATE_ACTIVE_MESOCYCLE_FROM_PROGRAM',
          payload: differentProgram,
        });
      });

      // Active mesocycle should NOT be updated
      expect(result.current.state.activeMesoCycle!.name).toBe('Active Program');
    });

    it('does not crash when no active mesocycle and UPDATE_ACTIVE_MESOCYCLE_FROM_PROGRAM is dispatched', () => {
      const { result } = renderHook(() => useMesoCycle(), {
        wrapper: MesoCycleProvider,
      });

      expect(result.current.state.activeMesoCycle).toBeNull();

      const program = {
        id: 'custom-300',
        name: 'Some Program',
        description: 'Test',
        difficulty: 'beginner' as const,
        durationWeeks: 4,
        daysPerWeek: 3,
        split: 'Full Body',
        goals: ['general_fitness' as const],
        musclePriorities: {} as any,
        weeklyFrequency: {} as any,
        weekTemplate: { days: [] },
        startingVolumeMultiplier: 1.0,
        volumeProgressionPerWeek: 1,
        tags: ['custom'],
      };

      act(() => {
        result.current.dispatch({
          type: 'UPDATE_ACTIVE_MESOCYCLE_FROM_PROGRAM',
          payload: program,
        });
      });

      // Should remain null
      expect(result.current.state.activeMesoCycle).toBeNull();
    });
  });

  describe('useMesoCycle hook', () => {
    it('throws when used outside provider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        renderHook(() => useMesoCycle());
      }).toThrow('useMesoCycle must be used within a MesoCycleProvider');

      consoleSpy.mockRestore();
    });
  });
});
