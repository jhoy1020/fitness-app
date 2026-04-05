/**
 * Tests for centralised navigation types.
 *
 * These are compile-time structural tests — they verify that the type
 * definitions exist and the exported shapes are correct.
 */

import * as fs from 'fs';
import * as path from 'path';

const SOURCE = fs.readFileSync(
  path.join(__dirname, '..', 'types.ts'),
  'utf8',
);

describe('Navigation types', () => {
  describe('RootStackParamList', () => {
    it('declares Main screen with NavigatorScreenParams', () => {
      expect(SOURCE).toContain('Main: NavigatorScreenParams<MainTabParamList>');
    });

    it('declares ActiveWorkout with optional template params', () => {
      expect(SOURCE).toContain("ActiveWorkout:");
      expect(SOURCE).toContain('templateWorkout?: TemplateWorkoutParam');
    });

    it('declares WorkoutSummary with workout param', () => {
      expect(SOURCE).toContain("WorkoutSummary:");
      expect(SOURCE).toContain('workout: WorkoutSummaryParam');
    });

    it('declares WorkoutDetail with workoutId', () => {
      expect(SOURCE).toContain('WorkoutDetail: { workoutId: string }');
    });

    it('declares CreateProgram with optional programId', () => {
      expect(SOURCE).toContain("CreateProgram:");
      expect(SOURCE).toContain('programId?: string');
    });

    it('declares OneRepMaxTest with optional exerciseName', () => {
      expect(SOURCE).toContain("OneRepMaxTest:");
      expect(SOURCE).toContain('exerciseName?: string');
    });

    it('pre-declares Phase 8 screens', () => {
      expect(SOURCE).toContain('Login: undefined');
      expect(SOURCE).toContain('Register: undefined');
      expect(SOURCE).toContain('ProgramStore: undefined');
      expect(SOURCE).toContain('ProgramDetail:');
      expect(SOURCE).toContain('SharedProgramView:');
    });
  });

  describe('MainTabParamList', () => {
    it('declares all 5 tabs', () => {
      expect(SOURCE).toContain('Home: undefined');
      expect(SOURCE).toContain('Programs: undefined');
      expect(SOURCE).toContain('History: undefined');
      expect(SOURCE).toContain('Progress: undefined');
      expect(SOURCE).toContain('Profile: undefined');
    });
  });

  describe('TemplateWorkoutParam', () => {
    it('has name and sets fields', () => {
      expect(SOURCE).toContain('export interface TemplateWorkoutParam');
      expect(SOURCE).toContain('name: string');
      expect(SOURCE).toContain('sets: Array<');
      expect(SOURCE).toContain('exerciseName: string');
    });

    it('supports optional rirTarget', () => {
      expect(SOURCE).toContain('rirTarget?: number');
    });

    it('supports optional cardioFinisher', () => {
      expect(SOURCE).toContain('cardioFinisher?:');
    });
  });

  describe('Typed hooks', () => {
    it('exports useAppNavigation', () => {
      expect(SOURCE).toContain('export function useAppNavigation()');
    });

    it('exports useAppRoute', () => {
      expect(SOURCE).toContain('export function useAppRoute<');
    });
  });

  describe('Screen prop helpers', () => {
    it('exports RootScreenProps', () => {
      expect(SOURCE).toContain('export type RootScreenProps<');
    });

    it('exports TabScreenProps', () => {
      expect(SOURCE).toContain('export type TabScreenProps<');
    });
  });

  describe('Global RootParamList declaration', () => {
    it('merges into ReactNavigation namespace', () => {
      expect(SOURCE).toContain('namespace ReactNavigation');
      expect(SOURCE).toContain('interface RootParamList extends RootStackParamList');
    });
  });
});
