/**
 * Tests for repository interface definitions.
 *
 * Structural tests verifying all expected repository interfaces and their
 * methods are defined.
 */

import * as fs from 'fs';
import * as path from 'path';

const SOURCE = fs.readFileSync(
  path.join(__dirname, '..', 'interfaces.ts'),
  'utf8',
);

describe('Repository interfaces', () => {
  describe('IExerciseRepository', () => {
    it('is exported', () => {
      expect(SOURCE).toContain('export interface IExerciseRepository');
    });

    const methods = ['getAll', 'getById', 'getByMuscleGroup', 'create', 'update', 'delete'];
    methods.forEach((method) => {
      it(`declares ${method}`, () => {
        expect(SOURCE).toContain(`${method}(`);
      });
    });
  });

  describe('IWorkoutRepository', () => {
    it('is exported', () => {
      expect(SOURCE).toContain('export interface IWorkoutRepository');
    });

    const methods = [
      'getAll', 'getById', 'getRecent', 'create', 'update', 'delete',
      'getSetsByWorkoutId', 'createSet', 'updateSet', 'deleteSet',
      'getAllTemplates', 'createTemplate', 'deleteTemplate',
    ];
    methods.forEach((method) => {
      it(`declares ${method}`, () => {
        expect(SOURCE).toContain(`${method}(`);
      });
    });
  });

  describe('IProgramRepository', () => {
    it('is exported', () => {
      expect(SOURCE).toContain('export interface IProgramRepository');
    });

    const methods = ['getAll', 'getById', 'getCustom', 'getPremade', 'create', 'update', 'delete', 'upsert'];
    methods.forEach((method) => {
      it(`declares ${method}`, () => {
        expect(SOURCE).toContain(`${method}(`);
      });
    });

    it('declares Phase 8 stubs for remote operations', () => {
      expect(SOURCE).toContain('getPublicPrograms');
      expect(SOURCE).toContain('cloneProgram');
      expect(SOURCE).toContain('rateProgram');
    });
  });

  describe('IUserRepository', () => {
    it('is exported', () => {
      expect(SOURCE).toContain('export interface IUserRepository');
    });

    const methods = ['getProfile', 'saveProfile', 'getAllGoals', 'saveGoal', 'deleteGoal'];
    methods.forEach((method) => {
      it(`declares ${method}`, () => {
        expect(SOURCE).toContain(`${method}(`);
      });
    });
  });

  describe('IMesoCycleRepository', () => {
    it('is exported', () => {
      expect(SOURCE).toContain('export interface IMesoCycleRepository');
    });

    const methods = ['getAll', 'getActive', 'create', 'update', 'delete'];
    methods.forEach((method) => {
      it(`declares ${method}`, () => {
        expect(SOURCE).toContain(`${method}(`);
      });
    });
  });

  describe('Repositories aggregate type', () => {
    it('is exported', () => {
      expect(SOURCE).toContain('export interface Repositories');
    });

    const fields = ['exercises', 'workouts', 'programs', 'users', 'mesocycles'];
    fields.forEach((field) => {
      it(`includes ${field} field`, () => {
        expect(SOURCE).toContain(`${field}:`);
      });
    });
  });
});
