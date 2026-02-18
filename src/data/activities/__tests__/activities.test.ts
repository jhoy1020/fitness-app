// Tests for activities.ts data

import { 
  CARDIO_LIBRARY, 
  RECOVERY_LIBRARY, 
  CARDIO_FINISHERS,
  CardioTemplate,
  RecoveryTemplate,
  getCardioForPurpose,
  getRecoveryForMuscles,
  getFinisherSuggestions,
} from '../activities';

describe('activities.ts', () => {
  describe('CARDIO_LIBRARY', () => {
    it('should export an array of cardio activities', () => {
      expect(Array.isArray(CARDIO_LIBRARY)).toBe(true);
      expect(CARDIO_LIBRARY.length).toBeGreaterThan(0);
    });

    it('each cardio activity should have required fields', () => {
      CARDIO_LIBRARY.forEach((activity: CardioTemplate) => {
        expect(activity.type).toBeDefined();
        expect(typeof activity.type).toBe('string');

        expect(activity.name).toBeDefined();
        expect(typeof activity.name).toBe('string');
        expect(activity.name.length).toBeGreaterThan(0);

        expect(activity.durationMinutes).toBeDefined();
        expect(typeof activity.durationMinutes).toBe('number');
        expect(activity.durationMinutes).toBeGreaterThan(0);

        expect(activity.intensity).toBeDefined();
        expect(['low', 'moderate', 'high']).toContain(activity.intensity);

        expect(activity.description).toBeDefined();
        expect(typeof activity.description).toBe('string');
        expect(activity.description.length).toBeGreaterThan(0);

        expect(activity.caloriesPerMinute).toBeDefined();
        expect(typeof activity.caloriesPerMinute).toBe('number');
        expect(activity.caloriesPerMinute).toBeGreaterThan(0);

        expect(Array.isArray(activity.bestFor)).toBe(true);
        expect(activity.bestFor.length).toBeGreaterThan(0);
      });
    });

    it('should have variety of cardio types', () => {
      const types = CARDIO_LIBRARY.map(a => a.type);
      const uniqueTypes = [...new Set(types)];
      
      expect(uniqueTypes.length).toBeGreaterThan(3);
      expect(uniqueTypes).toContain('walking');
      expect(uniqueTypes).toContain('running');
    });

    it('should have activities for different intensity levels', () => {
      const intensities = CARDIO_LIBRARY.map(a => a.intensity);
      const uniqueIntensities = [...new Set(intensities)];
      
      expect(uniqueIntensities).toContain('low');
      expect(uniqueIntensities).toContain('moderate');
      expect(uniqueIntensities).toContain('high');
    });

    it('should have reasonable calorie estimates', () => {
      CARDIO_LIBRARY.forEach(activity => {
        expect(activity.caloriesPerMinute).toBeGreaterThanOrEqual(3);
        expect(activity.caloriesPerMinute).toBeLessThanOrEqual(20);
      });
    });

    it('should have reasonable duration recommendations', () => {
      CARDIO_LIBRARY.forEach(activity => {
        expect(activity.durationMinutes).toBeGreaterThanOrEqual(4);
        expect(activity.durationMinutes).toBeLessThanOrEqual(60);
      });
    });
  });

  describe('RECOVERY_LIBRARY', () => {
    it('should export an array of recovery activities', () => {
      expect(Array.isArray(RECOVERY_LIBRARY)).toBe(true);
      expect(RECOVERY_LIBRARY.length).toBeGreaterThan(0);
    });

    it('each recovery activity should have required fields', () => {
      RECOVERY_LIBRARY.forEach((activity: RecoveryTemplate) => {
        expect(activity.type).toBeDefined();
        expect(typeof activity.type).toBe('string');

        expect(activity.name).toBeDefined();
        expect(typeof activity.name).toBe('string');
        expect(activity.name.length).toBeGreaterThan(0);

        expect(activity.durationMinutes).toBeDefined();
        expect(typeof activity.durationMinutes).toBe('number');
        expect(activity.durationMinutes).toBeGreaterThan(0);

        expect(activity.description).toBeDefined();
        expect(typeof activity.description).toBe('string');
        expect(activity.description.length).toBeGreaterThan(0);

        expect(Array.isArray(activity.targetAreas)).toBe(true);
        expect(activity.targetAreas.length).toBeGreaterThan(0);

        expect(Array.isArray(activity.bestAfter)).toBe(true);
        expect(activity.bestAfter.length).toBeGreaterThan(0);
      });
    });

    it('should have variety of recovery types', () => {
      const types = RECOVERY_LIBRARY.map(a => a.type);
      const uniqueTypes = [...new Set(types)];
      
      expect(uniqueTypes.length).toBeGreaterThan(3);
      expect(uniqueTypes).toContain('stretching');
      expect(uniqueTypes).toContain('foam_rolling');
    });

    it('should have reasonable duration recommendations', () => {
      RECOVERY_LIBRARY.forEach(activity => {
        expect(activity.durationMinutes).toBeGreaterThanOrEqual(5);
        expect(activity.durationMinutes).toBeLessThanOrEqual(60);
      });
    });

    it('should have valid target areas', () => {
      const validMuscles = [
        'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
        'quadriceps', 'hamstrings', 'glutes', 'calves', 'core', 'full_body'
      ];
      
      RECOVERY_LIBRARY.forEach(activity => {
        activity.targetAreas.forEach(area => {
          expect(validMuscles).toContain(area);
        });
      });
    });

    it('should have activities targeting different body parts', () => {
      const allTargetAreas = RECOVERY_LIBRARY.flatMap(a => a.targetAreas);
      const uniqueAreas = [...new Set(allTargetAreas)];
      
      expect(uniqueAreas.length).toBeGreaterThan(3);
    });
  });

  describe('CARDIO_FINISHERS', () => {
    it('should export an array of cardio finishers', () => {
      expect(Array.isArray(CARDIO_FINISHERS)).toBe(true);
      expect(CARDIO_FINISHERS.length).toBeGreaterThan(0);
    });

    it('each finisher should have required fields', () => {
      CARDIO_FINISHERS.forEach(finisher => {
        expect(finisher.name).toBeDefined();
        expect(typeof finisher.name).toBe('string');
        expect(finisher.name.length).toBeGreaterThan(0);

        expect(finisher.type).toBeDefined();

        expect(finisher.durationMinutes).toBeDefined();
        expect(typeof finisher.durationMinutes).toBe('number');
        expect(finisher.durationMinutes).toBeGreaterThan(0);

        expect(finisher.intensity).toBeDefined();
        expect(['low', 'moderate', 'high']).toContain(finisher.intensity);

        // Finishers have notes, not description
        if (finisher.notes) {
          expect(typeof finisher.notes).toBe('string');
        }
      });
    });

    it('finishers should be relatively short', () => {
      CARDIO_FINISHERS.forEach(finisher => {
        expect(finisher.durationMinutes).toBeLessThanOrEqual(20);
      });
    });

    it('should have unique finisher names', () => {
      const names = CARDIO_FINISHERS.map(f => f.name);
      const uniqueNames = [...new Set(names)];
      expect(names.length).toBe(uniqueNames.length);
    });

    it('should have mostly moderate to high intensity finishers', () => {
      const highIntensityCount = CARDIO_FINISHERS.filter(
        f => f.intensity === 'moderate' || f.intensity === 'high'
      ).length;
      
      expect(highIntensityCount).toBeGreaterThan(CARDIO_FINISHERS.length / 2);
    });
  });

  describe('Data Consistency', () => {
    it('cardio and recovery activities should have unique names within their categories', () => {
      const cardioNames = CARDIO_LIBRARY.map(a => a.name);
      const uniqueCardioNames = [...new Set(cardioNames)];
      expect(cardioNames.length).toBe(uniqueCardioNames.length);

      const recoveryNames = RECOVERY_LIBRARY.map(a => a.name);
      const uniqueRecoveryNames = [...new Set(recoveryNames)];
      expect(recoveryNames.length).toBe(uniqueRecoveryNames.length);
    });

    it('all activity types should be valid strings', () => {
      const allActivities = [...CARDIO_LIBRARY, ...RECOVERY_LIBRARY];
      
      allActivities.forEach(activity => {
        expect(activity.type).not.toBe('');
        expect(activity.type).not.toContain(' ');
      });
    });

    it('descriptions should be informative', () => {
      const allActivities = [...CARDIO_LIBRARY, ...RECOVERY_LIBRARY];
      
      allActivities.forEach(activity => {
        expect(activity.description.length).toBeGreaterThan(10);
      });
    });
  });

  describe('Helper Functions', () => {
    describe('getCardioForPurpose', () => {
      it('returns cardio activities for recovery purpose', () => {
        const result = getCardioForPurpose('recovery');
        expect(result.length).toBeGreaterThan(0);
        result.forEach(activity => {
          expect(activity.bestFor).toContain('recovery');
        });
      });

      it('returns cardio activities for fat_loss purpose', () => {
        const result = getCardioForPurpose('fat_loss');
        expect(result.length).toBeGreaterThan(0);
        result.forEach(activity => {
          expect(activity.bestFor).toContain('fat_loss');
        });
      });

      it('returns empty array for unknown purpose', () => {
        const result = getCardioForPurpose('unknown_purpose_xyz');
        expect(result.length).toBe(0);
      });

      it('returns activities for finisher purpose', () => {
        const result = getCardioForPurpose('finisher');
        expect(result.length).toBeGreaterThan(0);
      });
    });

    describe('getRecoveryForMuscles', () => {
      it('returns recovery activities for chest muscles', () => {
        const result = getRecoveryForMuscles(['chest']);
        expect(result.length).toBeGreaterThan(0);
      });

      it('returns recovery activities for leg muscles', () => {
        const result = getRecoveryForMuscles(['quadriceps', 'hamstrings']);
        expect(result.length).toBeGreaterThan(0);
      });

      it('returns activities that target full_body as fallback', () => {
        const result = getRecoveryForMuscles(['forearms']);
        // Should still get results because full_body activities exist
        expect(result.length).toBeGreaterThan(0);
      });

      it('handles empty muscle array', () => {
        const result = getRecoveryForMuscles([]);
        // Full body activities should still be returned
        expect(Array.isArray(result)).toBe(true);
      });
    });

    describe('getFinisherSuggestions', () => {
      it('returns low-leg-impact finishers for upper body workouts', () => {
        const result = getFinisherSuggestions('upper');
        expect(result.length).toBeGreaterThan(0);
        result.forEach(finisher => {
          expect(['walking', 'cycling', 'rowing']).toContain(finisher.type);
        });
      });

      it('returns low impact finishers for lower body workouts', () => {
        const result = getFinisherSuggestions('lower');
        // May return fewer options for lower body
        expect(Array.isArray(result)).toBe(true);
        result.forEach(finisher => {
          expect(['walking', 'rowing']).toContain(finisher.type);
          expect(finisher.intensity).toBe('low');
        });
      });

      it('returns all finishers for full body workouts', () => {
        const result = getFinisherSuggestions('full');
        expect(result.length).toBe(CARDIO_FINISHERS.length);
      });
    });
  });
});
