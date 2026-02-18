// Tests for formulas.ts utility functions

import {
  generateUUID,
  calculateBMR_KatchMcArdle,
  calculateBMR_MifflinStJeor,
  calculateLeanMass,
  calculateTDEE,
  calculateNutrition,
  calculate1RM_Epley,
  calculate1RM_Brzycki,
  getBest1RMFromSets,
  calculateProgressiveOverload,
  formatDuration,
  formatDate,
  toISODate,
  convertWeight,
  convertHeight,
  calculateWeeksToGoal,
} from '../formulas';
import type { WorkoutSet, UserProfile } from '../../../types';

describe('formulas.ts', () => {
  describe('generateUUID', () => {
    it('should generate a valid UUID v4 format', () => {
      const uuid = generateUUID();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(uuid).toMatch(uuidRegex);
    });

    it('should generate unique UUIDs', () => {
      const uuid1 = generateUUID();
      const uuid2 = generateUUID();
      expect(uuid1).not.toBe(uuid2);
    });
  });

  describe('calculateBMR_KatchMcArdle', () => {
    it('should calculate BMR correctly for given lean mass', () => {
      const leanMassKg = 70;
      const expected = 370 + 21.6 * 70;
      expect(calculateBMR_KatchMcArdle(leanMassKg)).toBe(expected);
    });

    it('should return 370 for zero lean mass', () => {
      expect(calculateBMR_KatchMcArdle(0)).toBe(370);
    });

    it('should handle decimal lean mass values', () => {
      const leanMassKg = 65.5;
      const expected = 370 + 21.6 * 65.5;
      expect(calculateBMR_KatchMcArdle(leanMassKg)).toBe(expected);
    });
  });

  describe('calculateBMR_MifflinStJeor', () => {
    it('should calculate BMR correctly for males', () => {
      const bmr = calculateBMR_MifflinStJeor(80, 180, 30, 'male');
      const expected = 10 * 80 + 6.25 * 180 - 5 * 30 + 5;
      expect(bmr).toBe(expected);
    });

    it('should calculate BMR correctly for females', () => {
      const bmr = calculateBMR_MifflinStJeor(60, 165, 25, 'female');
      const expected = 10 * 60 + 6.25 * 165 - 5 * 25 - 161;
      expect(bmr).toBe(expected);
    });

    it('should use average for other gender', () => {
      const bmr = calculateBMR_MifflinStJeor(70, 170, 28, 'other');
      const base = 10 * 70 + 6.25 * 170 - 5 * 28;
      const expected = base - 78;
      expect(bmr).toBe(expected);
    });
  });

  describe('calculateLeanMass', () => {
    it('should calculate lean mass correctly', () => {
      const result = calculateLeanMass(100, 20);
      expect(result).toBe(80);
    });

    it('should return total weight for 0% body fat', () => {
      expect(calculateLeanMass(100, 0)).toBe(100);
    });

    it('should return 0 for 100% body fat', () => {
      expect(calculateLeanMass(100, 100)).toBe(0);
    });

    it('should handle decimal percentages', () => {
      const result = calculateLeanMass(180, 15.5);
      const expected = 180 * (1 - 15.5 / 100);
      expect(result).toBeCloseTo(expected);
    });
  });

  describe('calculateTDEE', () => {
    it('should apply sedentary multiplier correctly', () => {
      const bmr = 2000;
      const tdee = calculateTDEE(bmr, 'sedentary');
      expect(tdee).toBe(Math.round(2000 * 1.2));
    });

    it('should apply active multiplier correctly', () => {
      const bmr = 2000;
      const tdee = calculateTDEE(bmr, 'active');
      expect(tdee).toBe(Math.round(2000 * 1.725));
    });

    it('should apply very_active multiplier correctly', () => {
      const bmr = 2000;
      const tdee = calculateTDEE(bmr, 'very_active');
      expect(tdee).toBe(Math.round(2000 * 1.9));
    });
  });

  describe('calculateNutrition', () => {
    it('should calculate nutrition for a male bulking', () => {
      const profile: UserProfile = {
        age: 30,
        weight: 180,
        weightUnit: 'lbs',
        height: 70,
        heightUnit: 'in',
        gender: 'male',
        activityLevel: 'moderate',
        goalType: 'bulk',
      };
      const result = calculateNutrition(profile);
      
      expect(result.bmr).toBeGreaterThan(0);
      expect(result.tdee).toBeGreaterThan(result.bmr);
      expect(result.targetCalories).toBeGreaterThan(result.tdee);
      expect(result.surplus).toBe(300);
      expect(result.protein).toBeGreaterThan(0);
      expect(result.fat).toBeGreaterThan(0);
      expect(result.carbs).toBeGreaterThan(0);
    });

    it('should calculate nutrition for a female cutting', () => {
      const profile: UserProfile = {
        age: 28,
        weight: 140,
        weightUnit: 'lbs',
        height: 65,
        heightUnit: 'in',
        gender: 'female',
        activityLevel: 'active',
        goalType: 'cut',
      };
      const result = calculateNutrition(profile);
      
      expect(result.targetCalories).toBeLessThan(result.tdee);
      expect(result.deficit).toBe(500);
    });

    it('should handle metric units', () => {
      const profile: UserProfile = {
        age: 25,
        weight: 75,
        weightUnit: 'kg',
        height: 180,
        heightUnit: 'cm',
        gender: 'male',
        activityLevel: 'light',
        goalType: 'maintain',
      };
      const result = calculateNutrition(profile);
      
      expect(result.bmr).toBeGreaterThan(0);
      expect(result.tdee).toBeGreaterThan(0);
      expect(result.targetCalories).toBe(result.tdee);
    });

    it('should use body fat percentage when provided', () => {
      const profile: UserProfile = {
        age: 30,
        weight: 200,
        weightUnit: 'lbs',
        height: 72,
        heightUnit: 'in',
        gender: 'male',
        activityLevel: 'moderate',
        goalType: 'maintain',
        bodyFatPercent: 18,
      };
      const result = calculateNutrition(profile);
      
      expect(result.bmr).toBeGreaterThan(0);
    });

    it('should use BMR override when provided', () => {
      const profile: UserProfile = {
        age: 30,
        weight: 180,
        weightUnit: 'lbs',
        height: 70,
        heightUnit: 'in',
        gender: 'male',
        activityLevel: 'moderate',
        goalType: 'maintain',
        bmrOverride: 2000,
      };
      const result = calculateNutrition(profile);
      
      expect(result.bmr).toBe(2000);
    });
  });

  describe('calculate1RM_Epley', () => {
    it('should return the weight for 1 rep', () => {
      expect(calculate1RM_Epley(100, 1)).toBe(100);
    });

    it('should calculate 1RM correctly for multiple reps', () => {
      const result = calculate1RM_Epley(100, 10);
      const expected = Math.round(100 * (1 + 10 / 30));
      expect(result).toBe(expected);
    });

    it('should return 0 for 0 or negative reps', () => {
      expect(calculate1RM_Epley(100, 0)).toBe(0);
      expect(calculate1RM_Epley(100, -5)).toBe(0);
    });
  });

  describe('calculate1RM_Brzycki', () => {
    it('should return the weight for 1 rep', () => {
      expect(calculate1RM_Brzycki(100, 1)).toBe(100);
    });

    it('should calculate 1RM correctly for multiple reps', () => {
      const result = calculate1RM_Brzycki(100, 10);
      const expected = Math.round(100 * (36 / (37 - 10)));
      expect(result).toBe(expected);
    });

    it('should return 0 for invalid reps', () => {
      expect(calculate1RM_Brzycki(100, 0)).toBe(0);
      expect(calculate1RM_Brzycki(100, -5)).toBe(0);
      expect(calculate1RM_Brzycki(100, 37)).toBe(0);
      expect(calculate1RM_Brzycki(100, 40)).toBe(0);
    });
  });

  describe('getBest1RMFromSets', () => {
    it('should return 0 for empty sets', () => {
      expect(getBest1RMFromSets([])).toBe(0);
    });

    it('should return the best 1RM estimate from sets', () => {
      const sets: WorkoutSet[] = [
        { id: '1', workoutId: 'w1', exerciseId: 'e1', setNumber: 1, weight: 100, reps: 10, completed: true },
        { id: '2', workoutId: 'w1', exerciseId: 'e1', setNumber: 2, weight: 110, reps: 8, completed: true },
        { id: '3', workoutId: 'w1', exerciseId: 'e1', setNumber: 3, weight: 120, reps: 5, completed: true },
      ];
      
      const result = getBest1RMFromSets(sets);
      expect(result).toBeGreaterThan(0);
    });

    it('should exclude warmup sets', () => {
      const sets: WorkoutSet[] = [
        { id: '1', workoutId: 'w1', exerciseId: 'e1', setNumber: 1, weight: 50, reps: 15, completed: true, isWarmup: true },
        { id: '2', workoutId: 'w1', exerciseId: 'e1', setNumber: 2, weight: 100, reps: 10, completed: true },
      ];
      
      const result = getBest1RMFromSets(sets);
      const working1RM = calculate1RM_Epley(100, 10);
      expect(result).toBe(working1RM);
    });

    it('should exclude sets with 0 weight or reps', () => {
      const sets: WorkoutSet[] = [
        { id: '1', workoutId: 'w1', exerciseId: 'e1', setNumber: 1, weight: 0, reps: 10, completed: true },
        { id: '2', workoutId: 'w1', exerciseId: 'e1', setNumber: 2, weight: 100, reps: 0, completed: true },
        { id: '3', workoutId: 'w1', exerciseId: 'e1', setNumber: 3, weight: 100, reps: 10, completed: true },
      ];
      
      const result = getBest1RMFromSets(sets);
      const expected = calculate1RM_Epley(100, 10);
      expect(result).toBe(expected);
    });
  });

  describe('calculateProgressiveOverload', () => {
    it('should suggest starting weight for no previous data', () => {
      const result = calculateProgressiveOverload('Bench Press', 'bp1', [], 8, 12, false);
      
      expect(result.exerciseName).toBe('Bench Press');
      expect(result.previousSets).toBe(0);
      expect(result.reason).toContain('No previous data');
    });

    it('should suggest weight increase when hitting max reps', () => {
      const previousSets: WorkoutSet[] = [
        { id: '1', workoutId: 'w1', exerciseId: 'e1', setNumber: 1, weight: 100, reps: 12, completed: true },
        { id: '2', workoutId: 'w1', exerciseId: 'e1', setNumber: 2, weight: 100, reps: 12, completed: true },
        { id: '3', workoutId: 'w1', exerciseId: 'e1', setNumber: 3, weight: 100, reps: 12, completed: true },
      ];
      
      const result = calculateProgressiveOverload('Bench Press', 'bp1', previousSets, 8, 12, false);
      
      expect(result.suggestedWeight).toBeGreaterThan(100);
      expect(result.reason).toContain('increase weight');
    });

    it('should suggest more reps when close to target', () => {
      const previousSets: WorkoutSet[] = [
        { id: '1', workoutId: 'w1', exerciseId: 'e1', setNumber: 1, weight: 100, reps: 10, completed: true },
        { id: '2', workoutId: 'w1', exerciseId: 'e1', setNumber: 2, weight: 100, reps: 11, completed: true },
        { id: '3', workoutId: 'w1', exerciseId: 'e1', setNumber: 3, weight: 100, reps: 11, completed: true },
      ];
      
      const result = calculateProgressiveOverload('Bench Press', 'bp1', previousSets, 8, 12, false);
      
      expect(result.suggestedWeight).toBe(100);
      expect(result.suggestedReps).toBeGreaterThanOrEqual(11);
    });

    it('should use lower body weight increment for lower body exercises', () => {
      const previousSets: WorkoutSet[] = [
        { id: '1', workoutId: 'w1', exerciseId: 'e1', setNumber: 1, weight: 200, reps: 12, completed: true },
        { id: '2', workoutId: 'w1', exerciseId: 'e1', setNumber: 2, weight: 200, reps: 12, completed: true },
      ];
      
      const result = calculateProgressiveOverload('Squat', 'sq1', previousSets, 8, 12, true);
      
      expect(result.suggestedWeight).toBe(210);
    });
  });

  describe('formatDuration', () => {
    it('should format seconds correctly', () => {
      expect(formatDuration(90)).toBe('1:30');
      expect(formatDuration(0)).toBe('0:00');
      expect(formatDuration(60)).toBe('1:00');
      expect(formatDuration(125)).toBe('2:05');
    });

    it('should pad single digit seconds', () => {
      expect(formatDuration(65)).toBe('1:05');
      expect(formatDuration(3)).toBe('0:03');
    });
  });

  describe('formatDate', () => {
    it('should format date string to readable format', () => {
      const date = '2024-03-15T10:30:00.000Z';
      const result = formatDate(date);
      
      expect(result).toContain('Mar');
      expect(result).toContain('15');
    });
  });

  describe('toISODate', () => {
    it('should convert date to ISO string', () => {
      const date = new Date('2024-03-15T10:30:00.000Z');
      const result = toISODate(date);
      
      expect(result).toBe('2024-03-15T10:30:00.000Z');
    });

    it('should use current date if none provided', () => {
      const before = new Date().toISOString();
      const result = toISODate();
      const after = new Date().toISOString();
      
      expect(result >= before).toBe(true);
      expect(result <= after).toBe(true);
    });
  });

  describe('convertWeight', () => {
    it('should return same value for same units', () => {
      expect(convertWeight(100, 'lbs', 'lbs')).toBe(100);
      expect(convertWeight(50, 'kg', 'kg')).toBe(50);
    });

    it('should convert lbs to kg', () => {
      const result = convertWeight(220, 'lbs', 'kg');
      expect(result).toBeCloseTo(99.79, 1);
    });

    it('should convert kg to lbs', () => {
      const result = convertWeight(100, 'kg', 'lbs');
      expect(result).toBeCloseTo(220.46, 1);
    });
  });

  describe('convertHeight', () => {
    it('should return same value for same units', () => {
      expect(convertHeight(70, 'in', 'in')).toBe(70);
      expect(convertHeight(180, 'cm', 'cm')).toBe(180);
    });

    it('should convert inches to cm', () => {
      const result = convertHeight(70, 'in', 'cm');
      expect(result).toBeCloseTo(177.8, 1);
    });

    it('should convert cm to inches', () => {
      const result = convertHeight(180, 'cm', 'in');
      expect(result).toBeCloseTo(70.87, 1);
    });
  });

  describe('calculateWeeksToGoal', () => {
    it('should return 0 if already at or above goal', () => {
      expect(calculateWeeksToGoal(300, 250)).toBe(0);
      expect(calculateWeeksToGoal(300, 300)).toBe(0);
    });

    it('should calculate weeks correctly with default increment', () => {
      const result = calculateWeeksToGoal(200, 225, 2.5);
      expect(result).toBe(10);
    });

    it('should round up to next whole week', () => {
      const result = calculateWeeksToGoal(200, 207, 2.5);
      expect(result).toBe(3);
    });
  });
});
