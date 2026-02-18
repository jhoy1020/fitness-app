// Tests for programs.ts data

import { TRAINING_PROGRAMS } from '../programs';
import type { TrainingProgram, ProgramDayTemplate, ProgramExercise } from '../../../types';

describe('programs.ts', () => {
  describe('TRAINING_PROGRAMS', () => {
    it('should export an array of training programs', () => {
      expect(Array.isArray(TRAINING_PROGRAMS)).toBe(true);
      expect(TRAINING_PROGRAMS.length).toBeGreaterThan(0);
    });

    it('each program should have required fields', () => {
      TRAINING_PROGRAMS.forEach((program: TrainingProgram) => {
        expect(program.id).toBeDefined();
        expect(typeof program.id).toBe('string');
        expect(program.id.length).toBeGreaterThan(0);

        expect(program.name).toBeDefined();
        expect(typeof program.name).toBe('string');
        expect(program.name.length).toBeGreaterThan(0);

        expect(program.description).toBeDefined();
        expect(typeof program.description).toBe('string');

        expect(['beginner', 'intermediate', 'advanced']).toContain(program.difficulty);

        expect(program.durationWeeks).toBeDefined();
        expect(typeof program.durationWeeks).toBe('number');
        expect(program.durationWeeks).toBeGreaterThan(0);

        expect(program.daysPerWeek).toBeDefined();
        expect(typeof program.daysPerWeek).toBe('number');
        expect(program.daysPerWeek).toBeGreaterThan(0);
        expect(program.daysPerWeek).toBeLessThanOrEqual(7);

        expect(program.split).toBeDefined();
        expect(typeof program.split).toBe('string');

        expect(Array.isArray(program.goals)).toBe(true);
        expect(program.goals.length).toBeGreaterThan(0);
      });
    });

    it('each program should have a valid week template', () => {
      TRAINING_PROGRAMS.forEach((program: TrainingProgram) => {
        expect(program.weekTemplate).toBeDefined();
        expect(program.weekTemplate.days).toBeDefined();
        expect(Array.isArray(program.weekTemplate.days)).toBe(true);
        expect(program.weekTemplate.days.length).toBeGreaterThan(0);
      });
    });

    it('each program day should have required fields', () => {
      TRAINING_PROGRAMS.forEach((program: TrainingProgram) => {
        program.weekTemplate.days.forEach((day: ProgramDayTemplate, index: number) => {
          expect(day.dayNumber).toBeDefined();
          expect(typeof day.dayNumber).toBe('number');
          expect(day.dayNumber).toBeGreaterThan(0);

          expect(day.name).toBeDefined();
          expect(typeof day.name).toBe('string');
          expect(day.name.length).toBeGreaterThan(0);

          if (day.dayType !== 'rest' && day.dayType !== 'cardio' && day.dayType !== 'active_recovery') {
            expect(Array.isArray(day.muscleGroups)).toBe(true);
            expect(Array.isArray(day.exercises)).toBe(true);
          }
        });
      });
    });

    it('each exercise in a program should have required fields', () => {
      TRAINING_PROGRAMS.forEach((program: TrainingProgram) => {
        program.weekTemplate.days.forEach((day: ProgramDayTemplate) => {
          if (day.exercises) {
            day.exercises.forEach((exercise: ProgramExercise) => {
              expect(exercise.muscleGroup).toBeDefined();
              expect(exercise.exerciseName).toBeDefined();
              expect(typeof exercise.exerciseName).toBe('string');
              expect(exercise.exerciseName.length).toBeGreaterThan(0);

              expect(exercise.sets).toBeDefined();
              expect(typeof exercise.sets).toBe('number');
              expect(exercise.sets).toBeGreaterThan(0);

              expect(exercise.repsMin).toBeDefined();
              expect(typeof exercise.repsMin).toBe('number');
              expect(exercise.repsMin).toBeGreaterThan(0);

              expect(exercise.repsMax).toBeDefined();
              expect(typeof exercise.repsMax).toBe('number');
              expect(exercise.repsMax).toBeGreaterThanOrEqual(exercise.repsMin);

              expect(['compound', 'isolation']).toContain(exercise.category);
            });
          }
        });
      });
    });

    it('should have unique program IDs', () => {
      const ids = TRAINING_PROGRAMS.map(p => p.id);
      const uniqueIds = [...new Set(ids)];
      expect(ids.length).toBe(uniqueIds.length);
    });

    it('should have programs for different difficulty levels', () => {
      const difficulties = TRAINING_PROGRAMS.map(p => p.difficulty);
      const uniqueDifficulties = [...new Set(difficulties)];
      
      expect(uniqueDifficulties).toContain('beginner');
      expect(uniqueDifficulties).toContain('intermediate');
    });

    it('should have programs with different splits', () => {
      const splits = TRAINING_PROGRAMS.map(p => p.split);
      const uniqueSplits = [...new Set(splits)];
      
      expect(uniqueSplits.length).toBeGreaterThan(1);
    });

    it('should have valid muscle priorities for each program', () => {
      TRAINING_PROGRAMS.forEach((program: TrainingProgram) => {
        expect(program.musclePriorities).toBeDefined();
        
        const validPriorities = ['focus', 'normal', 'maintain'];
        Object.values(program.musclePriorities).forEach(priority => {
          expect(validPriorities).toContain(priority);
        });
      });
    });

    it('should have valid RIR targets for exercises', () => {
      TRAINING_PROGRAMS.forEach((program: TrainingProgram) => {
        program.weekTemplate.days.forEach((day: ProgramDayTemplate) => {
          if (day.exercises) {
            day.exercises.forEach((exercise: ProgramExercise) => {
              if (exercise.rirTarget !== undefined) {
                expect(exercise.rirTarget).toBeGreaterThanOrEqual(0);
                expect(exercise.rirTarget).toBeLessThanOrEqual(4);
              }
            });
          }
        });
      });
    });

    it('should have valid rest times for exercises', () => {
      TRAINING_PROGRAMS.forEach((program: TrainingProgram) => {
        program.weekTemplate.days.forEach((day: ProgramDayTemplate) => {
          if (day.exercises) {
            day.exercises.forEach((exercise: ProgramExercise) => {
              if (exercise.restSeconds !== undefined) {
                expect(exercise.restSeconds).toBeGreaterThan(0);
                expect(exercise.restSeconds).toBeLessThanOrEqual(300);
              }
            });
          }
        });
      });
    });

    it('should have tags for each program', () => {
      TRAINING_PROGRAMS.forEach((program: TrainingProgram) => {
        expect(Array.isArray(program.tags)).toBe(true);
        expect(program.tags.length).toBeGreaterThan(0);
        
        program.tags.forEach(tag => {
          expect(typeof tag).toBe('string');
          expect(tag.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Program Structure Validation', () => {
    it('beginner programs should have fewer exercises per day', () => {
      const beginnerPrograms = TRAINING_PROGRAMS.filter(p => p.difficulty === 'beginner');
      
      beginnerPrograms.forEach(program => {
        program.weekTemplate.days.forEach(day => {
          if (day.exercises && day.dayType !== 'rest') {
            expect(day.exercises.length).toBeLessThanOrEqual(8);
          }
        });
      });
    });

    it('programs should have reasonable volume (sets per muscle group)', () => {
      TRAINING_PROGRAMS.forEach(program => {
        const setsPerMuscle: Record<string, number> = {};
        
        program.weekTemplate.days.forEach(day => {
          if (day.exercises) {
            day.exercises.forEach(ex => {
              const muscle = ex.muscleGroup;
              setsPerMuscle[muscle] = (setsPerMuscle[muscle] || 0) + ex.sets;
            });
          }
        });
        
        Object.values(setsPerMuscle).forEach(sets => {
          expect(sets).toBeLessThanOrEqual(30);
        });
      });
    });

    it('day numbers should be sequential starting from 1', () => {
      TRAINING_PROGRAMS.forEach(program => {
        const dayNumbers = program.weekTemplate.days.map(d => d.dayNumber).sort((a, b) => a - b);
        
        dayNumbers.forEach((num, idx) => {
          expect(num).toBe(idx + 1);
        });
      });
    });
  });
});
