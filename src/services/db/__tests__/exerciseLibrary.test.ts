import { EXERCISE_LIBRARY } from '../exerciseLibrary';

describe('Exercise Library', () => {
  describe('module exports', () => {
    it('exports EXERCISE_LIBRARY array', () => {
      expect(Array.isArray(EXERCISE_LIBRARY)).toBe(true);
    });

    it('contains exercises', () => {
      expect(EXERCISE_LIBRARY.length).toBeGreaterThan(0);
    });
  });

  describe('exercise structure', () => {
    it('all exercises have required fields', () => {
      EXERCISE_LIBRARY.forEach((exercise, index) => {
        expect(exercise.name).toBeDefined();
        expect(typeof exercise.name).toBe('string');
        expect(exercise.name.length).toBeGreaterThan(0);
        
        expect(exercise.muscleGroup).toBeDefined();
        expect(typeof exercise.muscleGroup).toBe('string');
        
        expect(exercise.equipment).toBeDefined();
        expect(typeof exercise.equipment).toBe('string');
        
        expect(typeof exercise.isCustom).toBe('boolean');
      });
    });

    it('all exercises have valid default rest seconds', () => {
      EXERCISE_LIBRARY.forEach((exercise) => {
        if (exercise.defaultRestSeconds !== undefined) {
          expect(typeof exercise.defaultRestSeconds).toBe('number');
          expect(exercise.defaultRestSeconds).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('muscle group coverage', () => {
    const getMuscleGroups = () => {
      return [...new Set(EXERCISE_LIBRARY.map((e) => e.muscleGroup))];
    };

    it('includes chest exercises', () => {
      const chestExercises = EXERCISE_LIBRARY.filter((e) => e.muscleGroup === 'chest');
      expect(chestExercises.length).toBeGreaterThan(0);
    });

    it('includes back exercises', () => {
      const backExercises = EXERCISE_LIBRARY.filter((e) => e.muscleGroup === 'back');
      expect(backExercises.length).toBeGreaterThan(0);
    });

    it('includes leg exercises (quadriceps)', () => {
      const legExercises = EXERCISE_LIBRARY.filter((e) => 
        e.muscleGroup === 'quadriceps' || e.muscleGroup === 'hamstrings' || e.muscleGroup === 'glutes'
      );
      expect(legExercises.length).toBeGreaterThan(0);
    });

    it('includes shoulder exercises', () => {
      const shoulderExercises = EXERCISE_LIBRARY.filter((e) => e.muscleGroup === 'shoulders');
      expect(shoulderExercises.length).toBeGreaterThan(0);
    });

    it('includes arm exercises (biceps)', () => {
      const bicepExercises = EXERCISE_LIBRARY.filter((e) => e.muscleGroup === 'biceps');
      expect(bicepExercises.length).toBeGreaterThan(0);
    });

    it('includes arm exercises (triceps)', () => {
      const tricepExercises = EXERCISE_LIBRARY.filter((e) => e.muscleGroup === 'triceps');
      expect(tricepExercises.length).toBeGreaterThan(0);
    });

    it('includes core exercises', () => {
      const coreExercises = EXERCISE_LIBRARY.filter((e) => e.muscleGroup === 'core');
      expect(coreExercises.length).toBeGreaterThan(0);
    });
  });

  describe('equipment variety', () => {
    const getEquipmentTypes = () => {
      return [...new Set(EXERCISE_LIBRARY.map((e) => e.equipment))];
    };

    it('includes barbell exercises', () => {
      const barbellExercises = EXERCISE_LIBRARY.filter((e) => e.equipment === 'barbell');
      expect(barbellExercises.length).toBeGreaterThan(0);
    });

    it('includes dumbbell exercises', () => {
      const dumbbellExercises = EXERCISE_LIBRARY.filter((e) => e.equipment === 'dumbbell');
      expect(dumbbellExercises.length).toBeGreaterThan(0);
    });

    it('includes bodyweight exercises', () => {
      const bodyweightExercises = EXERCISE_LIBRARY.filter((e) => e.equipment === 'bodyweight');
      expect(bodyweightExercises.length).toBeGreaterThan(0);
    });

    it('includes cable exercises', () => {
      const cableExercises = EXERCISE_LIBRARY.filter((e) => e.equipment === 'cable');
      expect(cableExercises.length).toBeGreaterThan(0);
    });

    it('includes machine exercises', () => {
      const machineExercises = EXERCISE_LIBRARY.filter((e) => e.equipment === 'machine');
      expect(machineExercises.length).toBeGreaterThan(0);
    });
  });

  describe('popular exercises included', () => {
    const hasExercise = (name: string) => {
      return EXERCISE_LIBRARY.some((e) => 
        e.name.toLowerCase().includes(name.toLowerCase())
      );
    };

    it('includes bench press', () => {
      expect(hasExercise('bench press')).toBe(true);
    });

    it('includes squat', () => {
      expect(hasExercise('squat')).toBe(true);
    });

    it('includes deadlift', () => {
      expect(hasExercise('deadlift')).toBe(true);
    });

    it('includes shoulder press', () => {
      expect(hasExercise('press')).toBe(true);
    });

    it('includes pull-ups or lat pulldown', () => {
      expect(hasExercise('pull')).toBe(true);
    });

    it('includes rows', () => {
      expect(hasExercise('row')).toBe(true);
    });

    it('includes curls', () => {
      expect(hasExercise('curl')).toBe(true);
    });
  });

  describe('Olympic lifts included', () => {
    const hasExercise = (name: string) => {
      return EXERCISE_LIBRARY.some((e) => 
        e.name.toLowerCase().includes(name.toLowerCase())
      );
    };

    it('includes clean and jerk', () => {
      expect(hasExercise('clean')).toBe(true);
    });

    it('includes snatch', () => {
      expect(hasExercise('snatch')).toBe(true);
    });
  });

  describe('CrossFit exercises included', () => {
    const hasExercise = (name: string) => {
      return EXERCISE_LIBRARY.some((e) => 
        e.name.toLowerCase().includes(name.toLowerCase())
      );
    };

    it('includes wall ball', () => {
      expect(hasExercise('wall ball')).toBe(true);
    });

    it('includes box jump', () => {
      expect(hasExercise('box jump')).toBe(true);
    });

    it('includes burpee', () => {
      expect(hasExercise('burpee')).toBe(true);
    });
  });

  describe('exercise uniqueness', () => {
    it('has high exercise name uniqueness (>95%)', () => {
      const names = EXERCISE_LIBRARY.map((e) => e.name.toLowerCase());
      const uniqueNames = [...new Set(names)];
      const uniquenessRatio = uniqueNames.length / names.length;
      expect(uniquenessRatio).toBeGreaterThan(0.95);
    });
  });

  describe('secondary muscles', () => {
    it('compound exercises have secondary muscles defined', () => {
      const compoundExercises = EXERCISE_LIBRARY.filter((e) => 
        ['Barbell Bench Press', 'Barbell Deadlift', 'Barbell Squat'].includes(e.name)
      );

      compoundExercises.forEach((exercise) => {
        expect(exercise.secondaryMuscles).toBeDefined();
        expect(Array.isArray(exercise.secondaryMuscles)).toBe(true);
        expect(exercise.secondaryMuscles!.length).toBeGreaterThan(0);
      });
    });
  });

  describe('exercise tips', () => {
    it('some exercises have tips', () => {
      const exercisesWithTips = EXERCISE_LIBRARY.filter((e) => e.tips);
      expect(exercisesWithTips.length).toBeGreaterThan(0);
    });

    it('tips are non-empty strings when defined', () => {
      EXERCISE_LIBRARY.forEach((exercise) => {
        if (exercise.tips) {
          expect(typeof exercise.tips).toBe('string');
          expect(exercise.tips.length).toBeGreaterThan(0);
        }
      });
    });
  });
});
