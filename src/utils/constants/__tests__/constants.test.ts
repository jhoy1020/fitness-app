// Tests for constants.ts

import {
  APP_NAME,
  APP_VERSION,
  ACTIVITY_MULTIPLIERS,
  DEFAULT_REST_TIMES,
  PROGRESSION,
  MACROS,
  CONVERSIONS,
  RPE_DESCRIPTIONS,
  MUSCLE_GROUP_LABELS,
  EQUIPMENT_LABELS,
  TIMER,
} from '../constants';

describe('constants.ts', () => {
  describe('App Constants', () => {
    it('should have app name defined', () => {
      expect(APP_NAME).toBeDefined();
      expect(typeof APP_NAME).toBe('string');
      expect(APP_NAME.length).toBeGreaterThan(0);
    });

    it('should have app version defined', () => {
      expect(APP_VERSION).toBeDefined();
      expect(typeof APP_VERSION).toBe('string');
      expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });

  describe('ACTIVITY_MULTIPLIERS', () => {
    it('should have all activity levels', () => {
      expect(ACTIVITY_MULTIPLIERS.sedentary).toBeDefined();
      expect(ACTIVITY_MULTIPLIERS.light).toBeDefined();
      expect(ACTIVITY_MULTIPLIERS.moderate).toBeDefined();
      expect(ACTIVITY_MULTIPLIERS.active).toBeDefined();
      expect(ACTIVITY_MULTIPLIERS.very_active).toBeDefined();
    });

    it('should have multipliers in ascending order', () => {
      expect(ACTIVITY_MULTIPLIERS.sedentary).toBeLessThan(ACTIVITY_MULTIPLIERS.light);
      expect(ACTIVITY_MULTIPLIERS.light).toBeLessThan(ACTIVITY_MULTIPLIERS.moderate);
      expect(ACTIVITY_MULTIPLIERS.moderate).toBeLessThan(ACTIVITY_MULTIPLIERS.active);
      expect(ACTIVITY_MULTIPLIERS.active).toBeLessThan(ACTIVITY_MULTIPLIERS.very_active);
    });

    it('should have reasonable multiplier values', () => {
      expect(ACTIVITY_MULTIPLIERS.sedentary).toBeGreaterThanOrEqual(1.0);
      expect(ACTIVITY_MULTIPLIERS.very_active).toBeLessThanOrEqual(2.5);
    });
  });

  describe('DEFAULT_REST_TIMES', () => {
    it('should have rest times for exercise types', () => {
      expect(DEFAULT_REST_TIMES.compound).toBeDefined();
      expect(DEFAULT_REST_TIMES.isolation).toBeDefined();
      expect(DEFAULT_REST_TIMES.bodyweight).toBeDefined();
    });

    it('should have compound > isolation > bodyweight rest times', () => {
      expect(DEFAULT_REST_TIMES.compound).toBeGreaterThan(DEFAULT_REST_TIMES.isolation);
      expect(DEFAULT_REST_TIMES.isolation).toBeGreaterThan(DEFAULT_REST_TIMES.bodyweight);
    });

    it('should have reasonable rest time values in seconds', () => {
      expect(DEFAULT_REST_TIMES.compound).toBeGreaterThanOrEqual(60);
      expect(DEFAULT_REST_TIMES.compound).toBeLessThanOrEqual(300);
    });
  });

  describe('PROGRESSION', () => {
    it('should have weight increments', () => {
      expect(PROGRESSION.upperBodyWeightIncrement).toBeDefined();
      expect(PROGRESSION.lowerBodyWeightIncrement).toBeDefined();
    });

    it('should have lower body increment >= upper body', () => {
      expect(PROGRESSION.lowerBodyWeightIncrement).toBeGreaterThanOrEqual(
        PROGRESSION.upperBodyWeightIncrement
      );
    });

    it('should have deload percentage as decimal', () => {
      expect(PROGRESSION.deloadPercentage).toBeGreaterThan(0);
      expect(PROGRESSION.deloadPercentage).toBeLessThan(1);
    });

    it('should have max RPE value', () => {
      expect(PROGRESSION.maxRPE).toBeGreaterThanOrEqual(8);
      expect(PROGRESSION.maxRPE).toBeLessThanOrEqual(10);
    });
  });

  describe('MACROS', () => {
    it('should have protein per lb lean mass', () => {
      expect(MACROS.proteinPerLbLeanMass).toBeDefined();
      expect(MACROS.proteinPerLbLeanMass).toBeGreaterThan(0);
    });

    it('should have fat per lb bodyweight', () => {
      expect(MACROS.fatPerLbBodyweight).toBeDefined();
      expect(MACROS.fatPerLbBodyweight).toBeGreaterThan(0);
    });

    it('should have correct calorie values', () => {
      expect(MACROS.caloriesPerGramProtein).toBe(4);
      expect(MACROS.caloriesPerGramCarb).toBe(4);
      expect(MACROS.caloriesPerGramFat).toBe(9);
    });

    it('should have deficit and surplus values', () => {
      expect(MACROS.cutDeficit).toBeGreaterThan(0);
      expect(MACROS.bulkSurplus).toBeGreaterThan(0);
      expect(MACROS.cutDeficit).toBeGreaterThan(MACROS.bulkSurplus);
    });
  });

  describe('CONVERSIONS', () => {
    it('should have weight conversions', () => {
      expect(CONVERSIONS.lbsToKg).toBeDefined();
      expect(CONVERSIONS.kgToLbs).toBeDefined();
    });

    it('should have inverse weight conversions', () => {
      const result = CONVERSIONS.lbsToKg * CONVERSIONS.kgToLbs;
      expect(result).toBeCloseTo(1, 2);
    });

    it('should have height conversions', () => {
      expect(CONVERSIONS.inToCm).toBeDefined();
      expect(CONVERSIONS.cmToIn).toBeDefined();
    });

    it('should have inverse height conversions', () => {
      const result = CONVERSIONS.inToCm * CONVERSIONS.cmToIn;
      expect(result).toBeCloseTo(1, 2);
    });

    it('should have accurate lbs to kg conversion', () => {
      expect(CONVERSIONS.lbsToKg).toBeCloseTo(0.4536, 3);
    });

    it('should have accurate inches to cm conversion', () => {
      expect(CONVERSIONS.inToCm).toBeCloseTo(2.54, 2);
    });
  });

  describe('RPE_DESCRIPTIONS', () => {
    it('should have descriptions for common RPE values', () => {
      expect(RPE_DESCRIPTIONS[6]).toBeDefined();
      expect(RPE_DESCRIPTIONS[7]).toBeDefined();
      expect(RPE_DESCRIPTIONS[8]).toBeDefined();
      expect(RPE_DESCRIPTIONS[9]).toBeDefined();
      expect(RPE_DESCRIPTIONS[10]).toBeDefined();
    });

    it('should have max effort at RPE 10', () => {
      expect(RPE_DESCRIPTIONS[10].toLowerCase()).toContain('max');
    });

    it('should have more reps available at lower RPE', () => {
      expect(RPE_DESCRIPTIONS[6]).toContain('4+');
    });
  });

  describe('MUSCLE_GROUP_LABELS', () => {
    it('should have labels for major muscle groups', () => {
      expect(MUSCLE_GROUP_LABELS.chest).toBeDefined();
      expect(MUSCLE_GROUP_LABELS.back).toBeDefined();
      expect(MUSCLE_GROUP_LABELS.shoulders).toBeDefined();
      expect(MUSCLE_GROUP_LABELS.biceps).toBeDefined();
      expect(MUSCLE_GROUP_LABELS.triceps).toBeDefined();
      expect(MUSCLE_GROUP_LABELS.quadriceps).toBeDefined();
      expect(MUSCLE_GROUP_LABELS.hamstrings).toBeDefined();
      expect(MUSCLE_GROUP_LABELS.glutes).toBeDefined();
      expect(MUSCLE_GROUP_LABELS.calves).toBeDefined();
      expect(MUSCLE_GROUP_LABELS.core).toBeDefined();
    });

    it('should have capitalized labels', () => {
      Object.values(MUSCLE_GROUP_LABELS).forEach(label => {
        expect(label[0]).toBe(label[0].toUpperCase());
      });
    });
  });

  describe('EQUIPMENT_LABELS', () => {
    it('should have labels for common equipment', () => {
      expect(EQUIPMENT_LABELS.barbell).toBeDefined();
      expect(EQUIPMENT_LABELS.dumbbell).toBeDefined();
      expect(EQUIPMENT_LABELS.cable).toBeDefined();
      expect(EQUIPMENT_LABELS.machine).toBeDefined();
      expect(EQUIPMENT_LABELS.bodyweight).toBeDefined();
    });

    it('should have capitalized labels', () => {
      Object.values(EQUIPMENT_LABELS).forEach(label => {
        expect(label[0]).toBe(label[0].toUpperCase());
      });
    });
  });

  describe('TIMER', () => {
    it('should have alert times', () => {
      expect(Array.isArray(TIMER.alertAt)).toBe(true);
      expect(TIMER.alertAt.length).toBeGreaterThan(0);
    });

    it('should have quick adjustments', () => {
      expect(Array.isArray(TIMER.quickAdjustments)).toBe(true);
      expect(TIMER.quickAdjustments.length).toBeGreaterThan(0);
    });

    it('should have min and max rest values', () => {
      expect(TIMER.minRest).toBeDefined();
      expect(TIMER.maxRest).toBeDefined();
      expect(TIMER.minRest).toBeLessThan(TIMER.maxRest);
    });

    it('should have reasonable timer limits', () => {
      expect(TIMER.minRest).toBeGreaterThanOrEqual(10);
      expect(TIMER.maxRest).toBeLessThanOrEqual(900);
    });

    it('should include 0 in alert times', () => {
      expect(TIMER.alertAt).toContain(0);
    });
  });
});
