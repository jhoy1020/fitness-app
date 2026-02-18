// Tests for recoveryEngine.ts utility functions

import {
  getRecoverySuggestions,
  getRecoveryRoutineDescription,
  shouldTakeRestDay,
} from '../recoveryEngine';
import type { MuscleGroup } from '../../../types';

describe('recoveryEngine.ts', () => {
  describe('getRecoverySuggestions', () => {
    it('should return full body suggestions for empty muscle array', () => {
      const suggestions = getRecoverySuggestions([]);
      
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.length).toBeLessThanOrEqual(5);
    });

    it('should return suggestions for chest training', () => {
      const suggestions = getRecoverySuggestions(['chest']);
      
      expect(suggestions.length).toBeGreaterThan(0);
      suggestions.forEach(s => {
        expect(s.name).toBeDefined();
        expect(s.durationMinutes).toBeGreaterThan(0);
        expect(s.description).toBeDefined();
        expect(s.activity).toBeDefined();
      });
    });

    it('should return suggestions for back training', () => {
      const suggestions = getRecoverySuggestions(['back']);
      
      expect(suggestions.length).toBeGreaterThan(0);
      const hasLatRecovery = suggestions.some(s => 
        s.name.toLowerCase().includes('lat') || 
        s.targetMuscles?.includes('back')
      );
      expect(hasLatRecovery).toBe(true);
    });

    it('should return suggestions for multiple muscle groups', () => {
      const muscles: MuscleGroup[] = ['chest', 'shoulders', 'triceps'];
      const suggestions = getRecoverySuggestions(muscles);
      
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.length).toBeLessThanOrEqual(5);
    });

    it('should respect maxSuggestions parameter', () => {
      const suggestions = getRecoverySuggestions(['chest', 'back', 'shoulders'], 3);
      
      expect(suggestions.length).toBeLessThanOrEqual(3);
    });

    it('should return unique suggestions (no duplicates)', () => {
      const suggestions = getRecoverySuggestions(['chest', 'back', 'shoulders']);
      const names = suggestions.map(s => s.name);
      const uniqueNames = [...new Set(names)];
      
      expect(names.length).toBe(uniqueNames.length);
    });

    it('should prioritize variety of activity types', () => {
      const suggestions = getRecoverySuggestions(['chest', 'back', 'shoulders', 'quadriceps']);
      
      const activities = suggestions.map(s => s.activity);
      const uniqueActivities = [...new Set(activities)];
      
      expect(uniqueActivities.length).toBeGreaterThan(1);
    });

    it('should handle leg day muscles', () => {
      const suggestions = getRecoverySuggestions(['quadriceps', 'hamstrings', 'glutes']);
      
      expect(suggestions.length).toBeGreaterThan(0);
      const hasLowerBodyRecovery = suggestions.some(s =>
        s.targetMuscles?.some(m => ['quadriceps', 'hamstrings', 'glutes', 'calves'].includes(m))
      );
      expect(hasLowerBodyRecovery).toBe(true);
    });

    it('should include rationale for each suggestion', () => {
      const suggestions = getRecoverySuggestions(['biceps']);
      
      suggestions.forEach(s => {
        expect(s.rationale).toBeDefined();
        expect(s.rationale.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getRecoveryRoutineDescription', () => {
    it('should return formatted routine for empty muscles', () => {
      const description = getRecoveryRoutineDescription([]);
      
      // When no muscles provided, it still generates suggestions
      expect(description).toContain('min');
      expect(description).toContain('suggested');
    });

    it('should return formatted routine for specific muscles', () => {
      const description = getRecoveryRoutineDescription(['chest', 'shoulders']);
      
      expect(description).toContain('min');
      expect(description).toContain('suggested');
    });

    it('should include total duration in description', () => {
      const description = getRecoveryRoutineDescription(['back']);
      
      expect(description).toMatch(/\d+\s*min/);
    });

    it('should list activity names', () => {
      const description = getRecoveryRoutineDescription(['quadriceps']);
      
      expect(description.length).toBeGreaterThan(20);
    });
  });

  describe('shouldTakeRestDay', () => {
    it('should recommend rest after 6+ consecutive workout days', () => {
      const result = shouldTakeRestDay(6);
      
      expect(result.shouldRest).toBe(true);
      expect(result.reason).toContain('6+');
    });

    it('should recommend rest after 7 consecutive workout days', () => {
      const result = shouldTakeRestDay(7);
      
      expect(result.shouldRest).toBe(true);
    });

    it('should suggest active recovery after 4-5 consecutive days', () => {
      const result = shouldTakeRestDay(4);
      
      expect(result.shouldRest).toBe(false);
      expect(result.reason.toLowerCase()).toContain('active recovery');
    });

    it('should give green light for fewer than 4 consecutive days', () => {
      const result = shouldTakeRestDay(2);
      
      expect(result.shouldRest).toBe(false);
      expect(result.reason.toLowerCase()).toContain('good to train');
    });

    it('should handle 0 consecutive days', () => {
      const result = shouldTakeRestDay(0);
      
      expect(result.shouldRest).toBe(false);
      expect(result.reason.toLowerCase()).toContain('good to train');
    });

    it('should handle 1 consecutive day', () => {
      const result = shouldTakeRestDay(1);
      
      expect(result.shouldRest).toBe(false);
    });

    it('should always return an object with shouldRest and reason', () => {
      const testCases = [0, 1, 2, 3, 4, 5, 6, 7, 10];
      
      testCases.forEach(days => {
        const result = shouldTakeRestDay(days);
        expect(typeof result.shouldRest).toBe('boolean');
        expect(typeof result.reason).toBe('string');
        expect(result.reason.length).toBeGreaterThan(0);
      });
    });
  });
});
