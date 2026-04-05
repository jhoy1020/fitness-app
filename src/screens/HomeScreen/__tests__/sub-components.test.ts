/**
 * Tests for HomeScreen sub-components extracted during Phase 5.
 *
 * These are structural + source-level tests since the sub-components are
 * pure presentational and rendering requires the full Paper + Navigation stack.
 */

import * as fs from 'fs';
import * as path from 'path';

const dir = path.join(__dirname, '..');

const readSrc = (file: string) =>
  fs.readFileSync(path.join(dir, file), 'utf8');

describe('HomeScreen sub-components', () => {
  describe('QuickStatsRow', () => {
    const src = readSrc('QuickStatsRow.tsx');

    it('exports QuickStatsRow component', () => {
      expect(src).toContain('export function QuickStatsRow');
    });

    it('exports ActivityStats interface', () => {
      expect(src).toContain('export interface ActivityStats');
    });

    it('renders workout, rest, and recovery counts', () => {
      expect(src).toContain('stats.workoutDays');
      expect(src).toContain('stats.restDays');
      expect(src).toContain('stats.recoveryDays');
    });
  });

  describe('QuickStartTemplates', () => {
    const src = readSrc('QuickStartTemplates.tsx');

    it('exports QuickStartTemplates component', () => {
      expect(src).toContain('export function QuickStartTemplates');
    });

    it('is a single quick-start button', () => {
      expect(src).toContain('Quick Start Workout');
      expect(src).toContain('onStartWorkout()');
    });
  });

  describe('WeeklyVolumeCard', () => {
    const src = readSrc('WeeklyVolumeCard.tsx');

    it('exports WeeklyVolumeCard component', () => {
      expect(src).toContain('export function WeeklyVolumeCard');
    });

    it('returns null when volume is empty', () => {
      expect(src).toContain('if (volume.length === 0) return null');
    });
  });

  describe('RecentPRsCard', () => {
    const src = readSrc('RecentPRsCard.tsx');

    it('exports RecentPRsCard and PREntry', () => {
      expect(src).toContain('export function RecentPRsCard');
      expect(src).toContain('export interface PREntry');
    });

    it('returns null when no PRs', () => {
      expect(src).toContain('if (prs.length === 0) return null');
    });
  });

  describe('ProgramCompletionDialog', () => {
    const src = readSrc('ProgramCompletionDialog.tsx');

    it('exports ProgramCompletionDialog component', () => {
      expect(src).toContain('export function ProgramCompletionDialog');
    });

    it('exports CompletedProgramStats interface', () => {
      expect(src).toContain('export interface CompletedProgramStats');
    });

    it('shows stats: weeks, workouts, sets, total volume', () => {
      expect(src).toContain('stats.totalWeeks');
      expect(src).toContain('stats.totalWorkouts');
      expect(src).toContain('stats.totalSets');
      expect(src).toContain('stats.totalVolume');
    });

    it('has onViewHistory and onStartNewProgram callbacks', () => {
      expect(src).toContain('onViewHistory');
      expect(src).toContain('onStartNewProgram');
    });
  });

  describe('LogCardioDialog', () => {
    const src = readSrc('LogCardioDialog.tsx');

    it('exports LogCardioDialog component', () => {
      expect(src).toContain('export function LogCardioDialog');
    });

    it('exports CardioWorkoutData interface', () => {
      expect(src).toContain('export interface CardioWorkoutData');
    });

    it('lists all cardio type options', () => {
      expect(src).toContain("'running'");
      expect(src).toContain("'cycling'");
      expect(src).toContain("'swimming'");
      expect(src).toContain("'hiit'");
    });

    it('calculates and displays pace', () => {
      expect(src).toContain('formatPace');
      expect(src).toContain('Calculated Pace');
    });

    it('manages its own form state', () => {
      expect(src).toContain('useState<CardioType>');
      expect(src).toContain('resetAndDismiss');
    });
  });
});
