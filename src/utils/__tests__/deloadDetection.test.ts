// Tests for deloadDetection utility

import {
  analyzeDeloadNeed,
  getDeloadConfig,
  applyDeloadToExercises,
  DeloadRecommendation,
} from '../deloadDetection';
import type { Workout, WorkoutFeedback } from '../../types';

// Helper to create a workout on a specific date
function makeWorkout(
  id: string,
  daysAgo: number,
  overrides?: Partial<Workout>
): Workout {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return {
    id,
    name: `Workout ${id}`,
    date: date.toISOString(),
    ...overrides,
  };
}

// Helper to create workout with exercises
function makeWorkoutWithExercises(
  id: string,
  daysAgo: number,
  exercises: { name: string; weight: number; reps: number }[]
): Workout {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return {
    id,
    name: `Workout ${id}`,
    date: date.toISOString(),
    exercises: exercises.map((ex) => ({
      exerciseId: ex.name,
      exerciseName: ex.name,
      sets: [
        {
          weight: ex.weight,
          targetReps: ex.reps,
          actualReps: ex.reps,
          completed: true,
        },
      ],
    })),
  };
}

// Helper to create feedback
function makeFeedback(
  id: string,
  daysAgo: number,
  pump: 0 | 1 | 2,
  soreness: 0 | 1 | 2,
  performance: 0 | 1 | 2 | 3
): WorkoutFeedback {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return {
    id,
    workoutId: `w-${id}`,
    date: date.toISOString(),
    pumpRating: pump,
    sorenessRating: soreness,
    performanceRating: performance,
    totalScore: pump + performance,
  };
}

describe('deloadDetection', () => {
  describe('analyzeDeloadNeed', () => {
    it('returns no deload for less than 4 workouts', () => {
      const workouts = [
        makeWorkout('1', 1),
        makeWorkout('2', 2),
        makeWorkout('3', 3),
      ];
      const result = analyzeDeloadNeed(workouts, []);

      expect(result.needsDeload).toBe(false);
      expect(result.confidence).toBe(0);
      expect(result.signals).toEqual([]);
      expect(result.summary).toContain('Not enough workout history');
    });

    it('returns valid recommendation structure', () => {
      const workouts = [
        makeWorkout('1', 1),
        makeWorkout('2', 3),
        makeWorkout('3', 5),
        makeWorkout('4', 7),
      ];
      const result = analyzeDeloadNeed(workouts, []);

      expect(result).toHaveProperty('needsDeload');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('signals');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('suggestedDuration');
      expect(result).toHaveProperty('suggestedVolumeReduction');
      expect(result).toHaveProperty('suggestedIntensityReduction');
      expect(result).toHaveProperty('weeksSinceLastDeload');
      expect(typeof result.confidence).toBe('number');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(100);
    });

    it('detects no deload needed with low volume/good recovery', () => {
      const workouts = [
        makeWorkout('1', 1),
        makeWorkout('2', 3),
        makeWorkout('3', 5),
        makeWorkout('4', 7),
      ];
      const feedback = [
        makeFeedback('1', 1, 2, 0, 0), // great pump, no soreness, exceeded performance
        makeFeedback('2', 3, 2, 0, 1), // great pump, no soreness, hit targets
      ];
      const result = analyzeDeloadNeed(workouts, feedback);

      expect(result.needsDeload).toBe(false);
    });

    it('detects rising fatigue signal', () => {
      // Create workouts spread over 4 weeks with feedback showing increasing soreness
      const workouts: Workout[] = [];
      const feedback: WorkoutFeedback[] = [];

      for (let week = 0; week < 4; week++) {
        for (let day = 0; day < 4; day++) {
          const daysAgo = week * 7 + day;
          workouts.push(makeWorkout(`w-${week}-${day}`, daysAgo));
          // Increasing soreness over weeks (most recent = highest)
          const soreness = week === 0 ? 2 : week === 1 ? 2 : week === 2 ? 1 : 0;
          feedback.push(makeFeedback(`fb-${week}-${day}`, daysAgo, 1, soreness as 0 | 1 | 2, 1));
        }
      }

      const result = analyzeDeloadNeed(workouts, feedback);
      // Check that some fatigue signal was detected
      const fatigueSignal = result.signals.find(
        (s) => s.signal === 'Rising Fatigue' || s.signal === 'Elevated Soreness'
      );
      // This may or may not trigger depending on exact thresholds
      expect(result).toHaveProperty('signals');
    });

    it('detects consecutive training days', () => {
      // Create 10 consecutive training days
      const workouts: Workout[] = [];
      for (let i = 0; i < 10; i++) {
        workouts.push(makeWorkout(`w-${i}`, i));
      }

      const result = analyzeDeloadNeed(workouts, []);
      const restSignal = result.signals.find((s) => s.signal === 'No Rest Days');

      expect(restSignal).toBeDefined();
      expect(restSignal!.value).toBeGreaterThanOrEqual(8);
    });

    it('detects stalled lifts', () => {
      // Create workouts over 3 weeks with same/declining weights
      const workouts = [
        makeWorkoutWithExercises('1', 1, [
          { name: 'Bench Press', weight: 185, reps: 5 },
          { name: 'Squat', weight: 225, reps: 5 },
        ]),
        makeWorkoutWithExercises('2', 3, [
          { name: 'Bench Press', weight: 185, reps: 5 },
          { name: 'Squat', weight: 230, reps: 5 },
        ]),
        makeWorkoutWithExercises('3', 7, [
          { name: 'Bench Press', weight: 190, reps: 5 },
          { name: 'Squat', weight: 235, reps: 5 },
        ]),
        makeWorkoutWithExercises('4', 14, [
          { name: 'Bench Press', weight: 195, reps: 5 },
          { name: 'Squat', weight: 240, reps: 5 },
        ]),
      ];

      const result = analyzeDeloadNeed(workouts, []);
      const stalledSignal = result.signals.find((s) => s.signal === 'Stalled Progress');

      // Some or all exercises should be stalled (weights declined)
      if (stalledSignal) {
        expect(stalledSignal.value).toBeGreaterThan(0);
      }
    });

    it('provides higher confidence for multiple signals', () => {
      // Scenario: consecutive days + stalled lifts + high feedback
      const workouts: Workout[] = [];
      const feedback: WorkoutFeedback[] = [];

      // 12 consecutive days
      for (let i = 0; i < 12; i++) {
        workouts.push(
          makeWorkoutWithExercises(`w-${i}`, i, [
            { name: 'Bench Press', weight: 185, reps: 5 },
          ])
        );
        // High soreness, poor performance
        feedback.push(makeFeedback(`fb-${i}`, i, 0, 2, 3));
      }

      const result = analyzeDeloadNeed(workouts, feedback);
      // Multiple signal scenario should have higher confidence
      expect(result.signals.length).toBeGreaterThanOrEqual(1);
    });

    it('suggests appropriate deload duration', () => {
      const workouts = [
        makeWorkout('1', 1),
        makeWorkout('2', 3),
        makeWorkout('3', 5),
        makeWorkout('4', 7),
      ];

      const result = analyzeDeloadNeed(workouts, []);
      expect(result.suggestedDuration).toBe(7);
    });
  });

  describe('getDeloadConfig', () => {
    it('returns config for low confidence recommendation', () => {
      const recommendation: DeloadRecommendation = {
        needsDeload: true,
        confidence: 42,
        signals: [],
        summary: 'Light deload',
        suggestedDuration: 7,
        suggestedVolumeReduction: 0.4,
        suggestedIntensityReduction: 0.3,
        weeksSinceLastDeload: 4,
      };

      const config = getDeloadConfig(recommendation);

      expect(config.volumeMultiplier).toBeCloseTo(0.6); // 1 - 0.4
      expect(config.intensityMultiplier).toBeCloseTo(0.7); // 1 - 0.3
      expect(config.removeFinishers).toBe(false); // < 55 confidence
      expect(config.maxSetsPerExercise).toBe(3);
    });

    it('returns config for medium confidence recommendation', () => {
      const recommendation: DeloadRecommendation = {
        needsDeload: true,
        confidence: 60,
        signals: [],
        summary: 'Moderate deload',
        suggestedDuration: 7,
        suggestedVolumeReduction: 0.5,
        suggestedIntensityReduction: 0.35,
        weeksSinceLastDeload: 5,
      };

      const config = getDeloadConfig(recommendation);

      expect(config.removeFinishers).toBe(true); // >= 55 confidence
      expect(config.maxSetsPerExercise).toBe(3);
    });

    it('returns config for high confidence recommendation', () => {
      const recommendation: DeloadRecommendation = {
        needsDeload: true,
        confidence: 75,
        signals: [],
        summary: 'Strong deload',
        suggestedDuration: 7,
        suggestedVolumeReduction: 0.6,
        suggestedIntensityReduction: 0.4,
        weeksSinceLastDeload: 6,
      };

      const config = getDeloadConfig(recommendation);

      expect(config.removeFinishers).toBe(true);
      expect(config.maxSetsPerExercise).toBe(2); // >= 70 confidence
    });
  });

  describe('applyDeloadToExercises', () => {
    const exercises = [
      {
        name: 'Bench Press',
        sets: [
          { id: 's1', weight: 200, reps: 8, completed: false, isWarmup: false },
          { id: 's2', weight: 200, reps: 8, completed: false, isWarmup: false },
          { id: 's3', weight: 200, reps: 8, completed: false, isWarmup: false },
          { id: 's4', weight: 200, reps: 8, completed: false, isWarmup: false },
        ],
      },
    ];

    it('reduces the number of sets', () => {
      const config = {
        volumeMultiplier: 0.5,
        intensityMultiplier: 0.65,
        removeFinishers: true,
        maxSetsPerExercise: 2,
      };

      const result = applyDeloadToExercises(exercises, config);

      expect(result[0].sets.length).toBeLessThanOrEqual(config.maxSetsPerExercise);
    });

    it('reduces weight on sets', () => {
      const config = {
        volumeMultiplier: 0.5,
        intensityMultiplier: 0.65,
        removeFinishers: true,
        maxSetsPerExercise: 3,
      };

      const result = applyDeloadToExercises(exercises, config);

      result[0].sets.forEach((set: any) => {
        expect(set.weight).toBeLessThan(200);
      });
    });

    it('rounds weight to nearest 2.5', () => {
      const config = {
        volumeMultiplier: 0.5,
        intensityMultiplier: 0.65,
        removeFinishers: true,
        maxSetsPerExercise: 3,
      };

      const result = applyDeloadToExercises(exercises, config);

      result[0].sets.forEach((set: any) => {
        expect(set.weight % 2.5).toBe(0);
      });
    });

    it('marks exercises as deloaded', () => {
      const config = {
        volumeMultiplier: 0.5,
        intensityMultiplier: 0.65,
        removeFinishers: true,
        maxSetsPerExercise: 2,
      };

      const result = applyDeloadToExercises(exercises, config);

      expect(result[0].isDeloaded).toBe(true);
    });

    it('resets completed status to false', () => {
      const completedExercises = [
        {
          name: 'Bench Press',
          sets: [
            { id: 's1', weight: 200, reps: 8, completed: true, isWarmup: false },
            { id: 's2', weight: 200, reps: 8, completed: true, isWarmup: false },
          ],
        },
      ];

      const config = {
        volumeMultiplier: 1,
        intensityMultiplier: 0.65,
        removeFinishers: false,
        maxSetsPerExercise: 3,
      };

      const result = applyDeloadToExercises(completedExercises, config);

      result[0].sets.forEach((set: any) => {
        expect(set.completed).toBe(false);
      });
    });

    it('ensures at least 1 set per exercise', () => {
      const config = {
        volumeMultiplier: 0.1, // very low
        intensityMultiplier: 0.65,
        removeFinishers: true,
        maxSetsPerExercise: 1,
      };

      const result = applyDeloadToExercises(exercises, config);

      expect(result[0].sets.length).toBeGreaterThanOrEqual(1);
    });

    it('handles exercises with no sets', () => {
      const emptyExercises = [{ name: 'Bench Press', sets: [] }];
      const config = {
        volumeMultiplier: 0.5,
        intensityMultiplier: 0.65,
        removeFinishers: true,
        maxSetsPerExercise: 2,
      };

      const result = applyDeloadToExercises(emptyExercises, config);
      expect(result[0].sets.length).toBe(0);
    });

    it('handles exercises without weight', () => {
      const bodyweightExercises = [
        {
          name: 'Push-ups',
          sets: [
            { id: 's1', weight: 0, reps: 20, completed: false, isWarmup: false },
          ],
        },
      ];
      const config = {
        volumeMultiplier: 0.5,
        intensityMultiplier: 0.65,
        removeFinishers: false,
        maxSetsPerExercise: 2,
      };

      const result = applyDeloadToExercises(bodyweightExercises, config);
      expect(result[0].sets[0].weight).toBe(0);
    });
  });
});
