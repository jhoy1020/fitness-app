// Tests for generate1RMTestProtocol and related 1RM test utilities

import {
  generate1RMTestProtocol,
  type OneRMTestProtocol,
  type AttemptSet,
} from '../formulas';
import { formatPlatesDisplay } from '../../plateCalculator/plateCalculator';

describe('generate1RMTestProtocol', () => {
  // ─── Basic protocol generation (lbs) ────────────────────

  describe('basic protocol generation (lbs)', () => {
    const protocol = generate1RMTestProtocol('Barbell Bench Press', 300, 315);

    it('returns the correct exercise name', () => {
      expect(protocol.exerciseName).toBe('Barbell Bench Press');
    });

    it('stores current and goal 1RM', () => {
      expect(protocol.current1RM).toBe(300);
      expect(protocol.goal1RM).toBe(315);
    });

    it('uses lbs unit by default', () => {
      expect(protocol.unit).toBe('lbs');
    });

    it('generates exactly 3 attempts', () => {
      expect(protocol.attempts).toHaveLength(3);
    });

    it('sets opener at ~90% of current 1RM', () => {
      const opener = protocol.attempts[0];
      expect(opener.label).toBe('Opener');
      // 90% of 300 = 270
      expect(opener.weight).toBe(270);
      expect(opener.percentage).toBe(90);
    });

    it('sets 2nd attempt between opener and goal', () => {
      const second = protocol.attempts[1];
      expect(second.label).toBe('2nd Attempt');
      expect(second.weight).toBeGreaterThan(protocol.attempts[0].weight);
      expect(second.weight).toBeLessThanOrEqual(protocol.attempts[2].weight);
    });

    it('calculates 2nd attempt as midpoint rounded to nearest 5', () => {
      // (270 + 315) / 2 = 292.5 → round to 5 → 295
      expect(protocol.attempts[1].weight).toBe(295);
    });

    it('sets 3rd attempt at goal weight', () => {
      const third = protocol.attempts[2];
      expect(third.label).toBe('3rd Attempt – Goal');
      expect(third.weight).toBe(315);
    });

    it('assigns ascending RPE values', () => {
      expect(protocol.attempts[0].rpe).toBe(8);
      expect(protocol.attempts[1].rpe).toBe(9);
      expect(protocol.attempts[2].rpe).toBe(10);
    });

    it('assigns 3 min rest after opener', () => {
      expect(protocol.attempts[0].restSeconds).toBe(180);
    });

    it('assigns 5 min rest after 2nd attempt', () => {
      expect(protocol.attempts[1].restSeconds).toBe(300);
    });

    it('assigns 0 rest after final attempt', () => {
      expect(protocol.attempts[2].restSeconds).toBe(0);
    });
  });

  // ─── Warmup sets ────────────────────────────────────────

  describe('warmup sets', () => {
    const protocol = generate1RMTestProtocol('Barbell Back Squat', 400, 425);

    it('generates warmup sets', () => {
      expect(protocol.warmupSets.length).toBeGreaterThan(0);
    });

    it('warmup sets build progressively', () => {
      for (let i = 1; i < protocol.warmupSets.length; i++) {
        expect(protocol.warmupSets[i].weight).toBeGreaterThanOrEqual(
          protocol.warmupSets[i - 1].weight
        );
      }
    });

    it('warmup sets are lighter than the opener', () => {
      const opener = protocol.attempts[0].weight;
      protocol.warmupSets.forEach(ws => {
        expect(ws.weight).toBeLessThan(opener);
      });
    });

    it('each warmup set has plate config', () => {
      protocol.warmupSets.forEach(ws => {
        expect(ws.plates).toBeDefined();
        expect(ws.plates.totalWeight).toBeGreaterThan(0);
      });
    });

    it('warmup sets have decreasing reps as weight increases', () => {
      const progressive = protocol.warmupSets.filter(ws => ws.weight > 45);
      for (let i = 1; i < progressive.length; i++) {
        expect(progressive[i].reps).toBeLessThanOrEqual(progressive[i - 1].reps);
      }
    });

    it('warmup sets include rest times', () => {
      protocol.warmupSets.forEach(ws => {
        expect(ws.rest).toBeGreaterThan(0);
      });
    });

    it('first warmup starts at empty bar for heavy weights', () => {
      // 90% of 400 = 360 → opener. 360 > 45 * 1.5 = 67.5, so empty bar is included
      expect(protocol.warmupSets[0].weight).toBe(45);
      expect(protocol.warmupSets[0].reps).toBe(10);
    });

    it('warmup percentages are relative to opener weight', () => {
      protocol.warmupSets.forEach(ws => {
        expect(ws.percentage).toBeLessThanOrEqual(100);
        expect(ws.percentage).toBeGreaterThan(0);
      });
    });
  });

  // ─── Plate configs ──────────────────────────────────────

  describe('plate configs', () => {
    const protocol = generate1RMTestProtocol('Barbell Deadlift', 500, 525);

    it('each attempt includes achievable plate config', () => {
      protocol.attempts.forEach(attempt => {
        expect(attempt.plates).toBeDefined();
        expect(attempt.plates.achievable).toBe(true);
      });
    });

    it('plate total matches attempt weight', () => {
      protocol.attempts.forEach(attempt => {
        expect(attempt.plates.totalWeight).toBe(attempt.weight);
      });
    });

    it('plate configs have per-side breakdown', () => {
      protocol.attempts.forEach(attempt => {
        expect(attempt.plates.perSide).toBeDefined();
        expect(Array.isArray(attempt.plates.perSide)).toBe(true);
      });
    });

    it('plate configs are displayable via formatPlatesDisplay', () => {
      protocol.attempts.forEach(attempt => {
        const display = formatPlatesDisplay(attempt.plates, false);
        expect(typeof display).toBe('string');
        expect(display.length).toBeGreaterThan(0);
      });
    });

    it('warmup plate configs are also valid', () => {
      protocol.warmupSets.forEach(ws => {
        const display = formatPlatesDisplay(ws.plates, false);
        expect(typeof display).toBe('string');
      });
    });
  });

  // ─── Weight rounding ───────────────────────────────────

  describe('weight rounding', () => {
    it('rounds attempt weights to nearest 5 lbs', () => {
      const protocol = generate1RMTestProtocol('Overhead Press', 155, 170);
      protocol.attempts.forEach(attempt => {
        expect(attempt.weight % 5).toBe(0);
      });
    });

    it('rounds attempt weights to nearest 2.5 kg in metric', () => {
      const protocol = generate1RMTestProtocol('Overhead Press', 70, 77, undefined, true);
      protocol.attempts.forEach(attempt => {
        expect(attempt.weight % 2.5).toBe(0);
      });
    });

    it('rounds opener correctly for odd current 1RM', () => {
      // 90% of 227 = 204.3 → nearest 5 = 205
      const protocol = generate1RMTestProtocol('Barbell Bench Press', 227, 245);
      expect(protocol.attempts[0].weight).toBe(205);
    });

    it('rounds goal weight to nearest increment', () => {
      // Goal 317 → nearest 5 = 315
      const protocol = generate1RMTestProtocol('Barbell Bench Press', 300, 317);
      expect(protocol.attempts[2].weight).toBe(315);
    });

    it('rounds metric weights to nearest 2.5', () => {
      // 90% of 103 = 92.7 → nearest 2.5 = 92.5
      const protocol = generate1RMTestProtocol('Barbell Bench Press', 103, 112, undefined, true);
      expect(protocol.attempts[0].weight).toBe(92.5);
    });
  });

  // ─── Metric support ────────────────────────────────────

  describe('metric support', () => {
    const protocol = generate1RMTestProtocol('Barbell Bench Press', 140, 150, undefined, true);

    it('uses kg unit', () => {
      expect(protocol.unit).toBe('kg');
    });

    it('generates valid attempt weights in kg', () => {
      expect(protocol.attempts[0].weight).toBeGreaterThan(0);
      expect(protocol.attempts[2].weight).toBe(150);
    });

    it('opener is ~90% of current', () => {
      const opener = protocol.attempts[0].weight;
      expect(opener).toBeGreaterThanOrEqual(125);
      expect(opener).toBeLessThanOrEqual(130);
    });

    it('uses 20 kg bar as default for metric', () => {
      const emptyBarWarmup = protocol.warmupSets.find(ws => ws.weight === 20);
      expect(emptyBarWarmup).toBeDefined();
    });

    it('plate display uses kg', () => {
      const display = formatPlatesDisplay(protocol.attempts[0].plates, true);
      expect(display).toContain('kg');
    });
  });

  // ─── Custom bar weight ─────────────────────────────────

  describe('custom bar weight', () => {
    it('uses specified bar weight for plate calculations', () => {
      const protocol = generate1RMTestProtocol('Barbell Bench Press', 200, 225, 35);
      const opener = protocol.attempts[0];
      expect(opener.plates.totalWeight).toBe(opener.weight);
    });

    it('warmup sets reflect custom bar weight', () => {
      const protocol = generate1RMTestProtocol('Barbell Bench Press', 200, 225, 35);
      if (protocol.warmupSets.length > 0 && protocol.warmupSets[0].weight === 35) {
        expect(protocol.warmupSets[0].plates.totalWeight).toBe(35);
      }
    });

    it('handles trap bar weight', () => {
      const protocol = generate1RMTestProtocol('Barbell Deadlift', 500, 525, 55);
      protocol.attempts.forEach(attempt => {
        expect(attempt.plates.totalWeight).toBe(attempt.weight);
      });
    });
  });

  // ─── Edge cases ────────────────────────────────────────

  describe('edge cases', () => {
    it('handles goal only slightly above current', () => {
      const protocol = generate1RMTestProtocol('Barbell Bench Press', 300, 305);
      expect(protocol.attempts).toHaveLength(3);
      protocol.attempts.forEach(attempt => {
        expect(attempt.weight).toBeGreaterThan(0);
        expect(attempt.weight % 5).toBe(0);
      });
    });

    it('handles large jump between current and goal', () => {
      const protocol = generate1RMTestProtocol('Barbell Deadlift', 400, 500);
      expect(protocol.attempts[0].weight).toBe(360);
      expect(protocol.attempts[2].weight).toBe(500);
    });

    it('second attempt is always between opener and goal', () => {
      const protocol = generate1RMTestProtocol('Barbell Back Squat', 315, 335);
      const [opener, second, goal] = protocol.attempts;
      expect(second.weight).toBeGreaterThanOrEqual(opener.weight);
      expect(second.weight).toBeLessThanOrEqual(goal.weight);
    });

    it('attempts are in ascending order of weight', () => {
      const protocol = generate1RMTestProtocol('Barbell Bench Press', 285, 315);
      for (let i = 1; i < protocol.attempts.length; i++) {
        expect(protocol.attempts[i].weight).toBeGreaterThanOrEqual(
          protocol.attempts[i - 1].weight
        );
      }
    });

    it('works with lighter weights (overhead press range)', () => {
      const protocol = generate1RMTestProtocol('Overhead Press', 135, 145);
      expect(protocol.attempts).toHaveLength(3);
      expect(protocol.attempts[0].weight).toBeLessThan(135);
      expect(protocol.attempts[2].weight).toBe(145);
    });

    it('works with very heavy weights (elite deadlift)', () => {
      const protocol = generate1RMTestProtocol('Barbell Deadlift', 700, 725);
      expect(protocol.attempts).toHaveLength(3);
      expect(protocol.attempts[0].weight).toBe(630);
      expect(protocol.attempts[2].weight).toBe(725);
      protocol.attempts.forEach(attempt => {
        expect(attempt.plates.achievable).toBe(true);
      });
    });

    it('handles goal equal to current after rounding', () => {
      const protocol = generate1RMTestProtocol('Overhead Press', 100, 105);
      expect(protocol.attempts).toHaveLength(3);
    });
  });

  // ─── Attempt percentages ───────────────────────────────

  describe('attempt percentages', () => {
    it('calculates percentages relative to current 1RM', () => {
      const protocol = generate1RMTestProtocol('Barbell Bench Press', 300, 315);
      protocol.attempts.forEach(attempt => {
        const expectedPct = Math.round((attempt.weight / 300) * 100);
        expect(attempt.percentage).toBe(expectedPct);
      });
    });

    it('goal attempt percentage exceeds 100% of current', () => {
      const protocol = generate1RMTestProtocol('Barbell Bench Press', 300, 315);
      expect(protocol.attempts[2].percentage).toBeGreaterThan(100);
    });

    it('opener percentage is ~90%', () => {
      const protocol = generate1RMTestProtocol('Barbell Bench Press', 300, 315);
      expect(protocol.attempts[0].percentage).toBe(90);
    });

    it('2nd attempt percentage is between opener and goal percentages', () => {
      const protocol = generate1RMTestProtocol('Barbell Bench Press', 300, 330);
      const pcts = protocol.attempts.map(a => a.percentage);
      expect(pcts[1]).toBeGreaterThanOrEqual(pcts[0]);
      expect(pcts[1]).toBeLessThanOrEqual(pcts[2]);
    });
  });

  // ─── Type structure ────────────────────────────────────

  describe('return type structure', () => {
    const protocol = generate1RMTestProtocol('Barbell Bench Press', 300, 315);

    it('OneRMTestProtocol has all required fields', () => {
      expect(protocol).toHaveProperty('exerciseName');
      expect(protocol).toHaveProperty('current1RM');
      expect(protocol).toHaveProperty('goal1RM');
      expect(protocol).toHaveProperty('unit');
      expect(protocol).toHaveProperty('warmupSets');
      expect(protocol).toHaveProperty('attempts');
    });

    it('each AttemptSet has all required fields', () => {
      protocol.attempts.forEach(attempt => {
        expect(attempt).toHaveProperty('label');
        expect(attempt).toHaveProperty('weight');
        expect(attempt).toHaveProperty('percentage');
        expect(attempt).toHaveProperty('rpe');
        expect(attempt).toHaveProperty('restSeconds');
        expect(attempt).toHaveProperty('plates');
      });
    });

    it('each WarmupSet has all required fields', () => {
      protocol.warmupSets.forEach(ws => {
        expect(ws).toHaveProperty('weight');
        expect(ws).toHaveProperty('reps');
        expect(ws).toHaveProperty('percentage');
        expect(ws).toHaveProperty('plates');
        expect(ws).toHaveProperty('rest');
      });
    });
  });

  // ─── Cross-exercise consistency ────────────────────────

  describe('works for all four main lifts', () => {
    const exercises = [
      { name: 'Barbell Bench Press', current: 275, goal: 295 },
      { name: 'Barbell Back Squat', current: 365, goal: 385 },
      { name: 'Barbell Deadlift', current: 455, goal: 475 },
      { name: 'Overhead Press', current: 155, goal: 170 },
    ];

    exercises.forEach(({ name, current, goal }) => {
      it(`generates valid protocol for ${name}`, () => {
        const protocol = generate1RMTestProtocol(name, current, goal);

        expect(protocol.exerciseName).toBe(name);
        expect(protocol.attempts).toHaveLength(3);
        expect(protocol.warmupSets.length).toBeGreaterThan(0);

        // All attempt weights divisible by 5
        protocol.attempts.forEach(a => expect(a.weight % 5).toBe(0));

        // Ascending order
        expect(protocol.attempts[1].weight).toBeGreaterThanOrEqual(protocol.attempts[0].weight);
        expect(protocol.attempts[2].weight).toBeGreaterThanOrEqual(protocol.attempts[1].weight);

        // Goal matches
        expect(protocol.attempts[2].weight).toBe(goal);

        // All plates achievable
        protocol.attempts.forEach(a => expect(a.plates.achievable).toBe(true));
      });
    });
  });
});
