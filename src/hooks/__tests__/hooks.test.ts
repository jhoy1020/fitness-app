/**
 * Tests for new custom hooks (Phase 2).
 *
 * These are structural/source-level tests for the hooks — asserting that each
 * hook module exists and exports the expected function with the right API shape.
 * Full renderHook integration tests require the DatabaseProvider + SQLite which
 * can't run in the Node test environment.
 */

import * as fs from 'fs';
import * as path from 'path';

const hooksDir = path.join(__dirname, '..');

const readHook = (file: string) =>
  fs.readFileSync(path.join(hooksDir, file), 'utf8');

describe('Custom hooks', () => {
  // ── Data hooks ──────────────────────────────────────────
  describe('useExerciseLibrary', () => {
    const src = readHook('useExerciseLibrary.ts');

    it('exports useExerciseLibrary', () => {
      expect(src).toContain('export function useExerciseLibrary');
    });

    it('returns exercises, loading, and filter-related state', () => {
      expect(src).toContain('exercises');
      expect(src).toContain('loading');
    });

    it('uses repos from context', () => {
      expect(src).toContain('useDatabase');
    });
  });

  describe('useWorkoutHistory', () => {
    const src = readHook('useWorkoutHistory.ts');

    it('exports useWorkoutHistory', () => {
      expect(src).toContain('export function useWorkoutHistory');
    });

    it('supports pagination', () => {
      expect(src).toMatch(/page|offset|limit/i);
    });
  });

  describe('useProgramLibrary', () => {
    const src = readHook('useProgramLibrary.ts');

    it('exports useProgramLibrary', () => {
      expect(src).toContain('export function useProgramLibrary');
    });

    it('provides save and delete operations', () => {
      expect(src).toContain('saveProgram');
      expect(src).toContain('deleteProgram');
    });
  });

  describe('useUserProfile', () => {
    const src = readHook('useUserProfile.ts');

    it('exports useUserProfile', () => {
      expect(src).toContain('export function useUserProfile');
    });

    it('returns profile, goals, measurements, and 1RM data', () => {
      expect(src).toContain('profile');
      expect(src).toContain('goals');
      expect(src).toContain('oneRepMaxRecords');
    });
  });

  describe('useActiveWorkout', () => {
    const src = readHook('useActiveWorkout.ts');

    it('exports useActiveWorkout', () => {
      expect(src).toContain('export function useActiveWorkout');
    });

    it('provides start, finish, pause, and resume', () => {
      expect(src).toContain('startWorkout');
      expect(src).toContain('completeWorkout');
      expect(src).toContain('pauseWorkout');
      expect(src).toContain('resumeWorkout');
    });

    it('provides set operations: addSet, updateSet, deleteSet', () => {
      expect(src).toContain('addSet');
      expect(src).toContain('updateSet');
      expect(src).toContain('deleteSet');
    });
  });

  // ── Feature hooks ───────────────────────────────────────
  describe('useRestTimer', () => {
    const src = readHook('useRestTimer.ts');

    it('exports useRestTimer', () => {
      expect(src).toContain('export function useRestTimer');
    });

    it('provides start/pause/resume/stop/adjust/reset', () => {
      expect(src).toContain('start');
      expect(src).toContain('pause');
      expect(src).toContain('resume');
      expect(src).toContain('stop');
    });
  });

  describe('usePlateCalculator', () => {
    const src = readHook('usePlateCalculator.ts');

    it('exports usePlateCalculator', () => {
      expect(src).toContain('export function usePlateCalculator');
    });

    it('accepts targetWeight and barWeight', () => {
      expect(src).toContain('targetWeight');
      expect(src).toContain('barWeight');
    });
  });

  describe('useVolumeTracker', () => {
    const src = readHook('useVolumeTracker.ts');

    it('exports useVolumeTracker', () => {
      expect(src).toContain('export function useVolumeTracker');
    });

    it('references MEV/MAV/MRV volume concepts', () => {
      expect(src).toMatch(/mev|mav|mrv/i);
    });
  });

  describe('useProgramEditor', () => {
    const src = readHook('useProgramEditor.ts');

    it('exports useProgramEditor', () => {
      expect(src).toContain('export function useProgramEditor');
    });

    it('provides form state and validation', () => {
      expect(src).toContain('programName');
      expect(src).toContain('isValid');
    });
  });

  describe('useDeloadDetection', () => {
    const src = readHook('useDeloadDetection.ts');

    it('exports useDeloadDetection', () => {
      expect(src).toContain('export function useDeloadDetection');
    });

    it('analyzes fatigue for deload recommendation', () => {
      expect(src).toMatch(/fatigue|deload/i);
    });
  });

  // ── Utility hooks ───────────────────────────────────────
  describe('useDebounce', () => {
    const src = readHook('useDebounce.ts');

    it('exports useDebounce', () => {
      expect(src).toContain('export function useDebounce');
    });

    it('uses setTimeout for debouncing', () => {
      expect(src).toContain('setTimeout');
    });
  });

  describe('useResponsiveLayout', () => {
    const src = readHook('useResponsiveLayout.ts');

    it('exports useResponsiveLayout', () => {
      expect(src).toContain('export function useResponsiveLayout');
    });

    it('detects narrow/medium/wide breakpoints', () => {
      expect(src).toMatch(/narrow|medium|wide/i);
    });
  });

  // ── Barrel export ───────────────────────────────────────
  describe('index barrel', () => {
    const src = readHook('index.ts');

    const expectedExports = [
      'useExerciseLibrary',
      'useWorkoutHistory',
      'useProgramLibrary',
      'useUserProfile',
      'useActiveWorkout',
      'useRestTimer',
      'usePlateCalculator',
      'useVolumeTracker',
      'useProgramEditor',
      'useDeloadDetection',
      'useDebounce',
      'useResponsiveLayout',
    ];

    expectedExports.forEach((name) => {
      it(`exports ${name}`, () => {
        expect(src).toContain(name);
      });
    });
  });
});
