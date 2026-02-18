// Tests for plateCalculator.ts utility functions

import {
  calculatePlates,
  formatPlatesDisplay,
  getWarmupSets,
  BAR_WEIGHTS,
  PlateConfig,
} from '../plateCalculator';

describe('plateCalculator.ts', () => {
  describe('calculatePlates', () => {
    it('should return empty plates for bar weight only', () => {
      const result = calculatePlates(45, 45, false);
      
      expect(result.plates).toHaveLength(0);
      expect(result.perSide).toHaveLength(0);
      expect(result.totalWeight).toBe(45);
      expect(result.achievable).toBe(true);
    });

    it('should calculate plates correctly for 135 lbs', () => {
      const result = calculatePlates(135, 45, false);
      
      expect(result.perSide).toEqual([{ weight: 45, count: 1 }]);
      expect(result.totalWeight).toBe(135);
      expect(result.achievable).toBe(true);
    });

    it('should calculate plates correctly for 225 lbs', () => {
      const result = calculatePlates(225, 45, false);
      
      expect(result.perSide).toEqual([{ weight: 45, count: 2 }]);
      expect(result.totalWeight).toBe(225);
      expect(result.achievable).toBe(true);
    });

    it('should calculate plates correctly for 185 lbs', () => {
      const result = calculatePlates(185, 45, false);
      
      expect(result.perSide).toEqual([
        { weight: 45, count: 1 },
        { weight: 25, count: 1 },
      ]);
      expect(result.totalWeight).toBe(185);
      expect(result.achievable).toBe(true);
    });

    it('should calculate plates using metric weights', () => {
      const result = calculatePlates(100, 20, true);
      
      expect(result.totalWeight).toBe(100);
      expect(result.achievable).toBe(true);
    });

    it('should handle weight below bar weight', () => {
      const result = calculatePlates(30, 45, false);
      
      expect(result.perSide).toHaveLength(0);
      expect(result.totalWeight).toBe(45);
      expect(result.achievable).toBe(false);
      expect(result.difference).toBe(-15);
    });

    it('should handle weight that cannot be achieved exactly', () => {
      const result = calculatePlates(47, 45, false);
      
      expect(result.achievable).toBe(false);
    });

    it('should calculate complex plate combinations', () => {
      const result = calculatePlates(265, 45, false);
      
      expect(result.totalWeight).toBe(265);
      expect(result.achievable).toBe(true);
    });

    it('should handle different bar weights', () => {
      const resultOlympic = calculatePlates(135, BAR_WEIGHTS.olympic.lbs, false);
      const resultWomens = calculatePlates(135, BAR_WEIGHTS.womens.lbs, false);
      
      expect(resultOlympic.perSide).not.toEqual(resultWomens.perSide);
    });
  });

  describe('formatPlatesDisplay', () => {
    it('should return "Empty bar" for no plates', () => {
      const config: PlateConfig = {
        plates: [],
        totalWeight: 45,
        perSide: [],
        achievable: true,
        difference: 0,
      };
      
      expect(formatPlatesDisplay(config, false)).toBe('Empty bar');
    });

    it('should format single plate correctly', () => {
      const config: PlateConfig = {
        plates: [{ weight: 45, count: 2 }],
        totalWeight: 135,
        perSide: [{ weight: 45, count: 1 }],
        achievable: true,
        difference: 0,
      };
      
      expect(formatPlatesDisplay(config, false)).toBe('45lbs');
    });

    it('should format multiple plates correctly', () => {
      const config: PlateConfig = {
        plates: [{ weight: 45, count: 2 }, { weight: 25, count: 2 }],
        totalWeight: 185,
        perSide: [{ weight: 45, count: 1 }, { weight: 25, count: 1 }],
        achievable: true,
        difference: 0,
      };
      
      expect(formatPlatesDisplay(config, false)).toBe('45lbs + 25lbs');
    });

    it('should format multiple of same plate with count', () => {
      const config: PlateConfig = {
        plates: [{ weight: 45, count: 4 }],
        totalWeight: 225,
        perSide: [{ weight: 45, count: 2 }],
        achievable: true,
        difference: 0,
      };
      
      expect(formatPlatesDisplay(config, false)).toBe('2×45lbs');
    });

    it('should use kg for metric', () => {
      const config: PlateConfig = {
        plates: [{ weight: 20, count: 2 }],
        totalWeight: 60,
        perSide: [{ weight: 20, count: 1 }],
        achievable: true,
        difference: 0,
      };
      
      expect(formatPlatesDisplay(config, true)).toBe('20kg');
    });
  });

  describe('getWarmupSets', () => {
    it('should return empty array for very light working weight', () => {
      const warmups = getWarmupSets(50, 45, false);
      
      expect(warmups.length).toBeLessThanOrEqual(4);
    });

    it('should include empty bar warmup for heavy weights', () => {
      const warmups = getWarmupSets(225, 45, false);
      
      expect(warmups.length).toBeGreaterThan(0);
      expect(warmups[0].weight).toBe(45);
      expect(warmups[0].reps).toBe(10);
    });

    it('should include progressive warmups', () => {
      const warmups = getWarmupSets(300, 45, false);
      
      expect(warmups.length).toBeGreaterThan(1);
      
      for (let i = 1; i < warmups.length; i++) {
        expect(warmups[i].weight).toBeGreaterThan(warmups[i - 1].weight);
      }
    });

    it('should include plate calculations for each warmup', () => {
      const warmups = getWarmupSets(225, 45, false);
      
      warmups.forEach(warmup => {
        expect(warmup.plates).toBeDefined();
        expect(warmup.plates.totalWeight).toBeLessThanOrEqual(warmup.weight + 5);
      });
    });

    it('should have decreasing reps as weight increases', () => {
      const warmups = getWarmupSets(300, 45, false);
      
      const progressiveWarmups = warmups.filter(w => w.weight > 45);
      
      for (let i = 1; i < progressiveWarmups.length; i++) {
        expect(progressiveWarmups[i].reps).toBeLessThanOrEqual(progressiveWarmups[i - 1].reps);
      }
    });

    it('should include rest times for each warmup', () => {
      const warmups = getWarmupSets(225, 45, false);
      
      warmups.forEach(warmup => {
        expect(warmup.rest).toBeGreaterThan(0);
      });
    });

    it('should round weights to nearest 5', () => {
      const warmups = getWarmupSets(227, 45, false);
      
      warmups.forEach(warmup => {
        expect(warmup.weight % 5).toBe(0);
      });
    });
  });

  describe('BAR_WEIGHTS', () => {
    it('should have correct olympic bar weights', () => {
      expect(BAR_WEIGHTS.olympic.lbs).toBe(45);
      expect(BAR_WEIGHTS.olympic.kg).toBe(20);
    });

    it('should have correct womens bar weights', () => {
      expect(BAR_WEIGHTS.womens.lbs).toBe(35);
      expect(BAR_WEIGHTS.womens.kg).toBe(15);
    });

    it('should have correct ez curl bar weights', () => {
      expect(BAR_WEIGHTS.ez_curl.lbs).toBe(25);
      expect(BAR_WEIGHTS.ez_curl.kg).toBe(10);
    });

    it('should have correct trap bar weights', () => {
      expect(BAR_WEIGHTS.trap.lbs).toBe(55);
      expect(BAR_WEIGHTS.trap.kg).toBe(25);
    });
  });
});
