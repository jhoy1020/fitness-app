// Deload Detection Engine
// Analyzes workout history and feedback to determine
// if the user should take a deload week

import type { Workout, WorkoutFeedback } from '../types';

export interface DeloadSignal {
  signal: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  value: number;
  threshold: number;
}

export interface DeloadRecommendation {
  needsDeload: boolean;
  confidence: number; // 0-100
  signals: DeloadSignal[];
  summary: string;
  suggestedDuration: number; // days
  suggestedVolumeReduction: number; // percentage 0-1
  suggestedIntensityReduction: number; // percentage 0-1
  weeksSinceLastDeload: number;
}

export interface DeloadWorkoutConfig {
  volumeMultiplier: number; // e.g. 0.5 = 50% of normal sets
  intensityMultiplier: number; // e.g. 0.6 = 60% of normal weight
  removeFinishers: boolean;
  maxSetsPerExercise: number;
}

interface WeeklyFeedbackSummary {
  weekStart: Date;
  avgFatigue: number;
  avgPerformance: number;
  avgSoreness: number;
  avgPump: number;
  workoutCount: number;
  totalSets: number;
  totalVolume: number;
}

/**
 * Groups workout history and feedback into weekly summaries
 */
function getWeeklySummaries(
  workoutHistory: Workout[],
  feedbackHistory: WorkoutFeedback[],
  weeks: number = 6
): WeeklyFeedbackSummary[] {
  const now = new Date();
  const summaries: WeeklyFeedbackSummary[] = [];

  for (let w = 0; w < weeks; w++) {
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() - w * 7);
    weekEnd.setHours(23, 59, 59, 999);

    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    const weekWorkouts = workoutHistory.filter((wh) => {
      const d = new Date(wh.date);
      return d >= weekStart && d <= weekEnd;
    });

    const weekFeedback = feedbackHistory.filter((fb) => {
      const d = new Date(fb.date);
      return d >= weekStart && d <= weekEnd;
    });

    let totalSets = 0;
    let totalVolume = 0;
    weekWorkouts.forEach((wh) => {
      if (wh.exercises) {
        wh.exercises.forEach((ex) => {
          ex.sets.forEach((s) => {
            if (s.completed) {
              totalSets++;
              totalVolume += (s.weight || 0) * (s.actualReps || s.targetReps || 0);
            }
          });
        });
      } else if (wh.sets) {
        wh.sets.forEach((s) => {
          totalSets++;
          totalVolume += (s.weight || 0) * (s.reps || 0);
        });
      }
    });

    // Feedback uses 0-2 scale: pumpRating(0-2), sorenessRating(0-2), performanceRating(0-3)
    // Normalize to 1-5 for easier thresholding
    const avgFatigue =
      weekFeedback.length > 0
        ? weekFeedback.reduce((sum, fb) => {
            // totalScore is pump + performance - fatigue conceptually
            // Higher totalScore = better session. We want fatigue indicator.
            // sorenessRating 0=none, 1=mild, 2=significant → map to 1-5
            const fatigue = (fb.sorenessRating || 0) * 2 + 1; // maps 0→1, 1→3, 2→5
            return sum + fatigue;
          }, 0) / weekFeedback.length
        : 0;

    const avgPerformance =
      weekFeedback.length > 0
        ? weekFeedback.reduce((sum, fb) => {
            // performanceRating: 0=exceeded, 1=hit, 2=struggled, 3=missed
            // Invert: lower is better → make higher = better for our analysis
            const perf = 5 - (fb.performanceRating || 0); // 0→5, 1→4, 2→3, 3→2
            return sum + perf;
          }, 0) / weekFeedback.length
        : 0;

    const avgSoreness =
      weekFeedback.length > 0
        ? weekFeedback.reduce((sum, fb) => {
            const soreness = (fb.sorenessRating || 0) * 2 + 1;
            return sum + soreness;
          }, 0) / weekFeedback.length
        : 0;

    const avgPump =
      weekFeedback.length > 0
        ? weekFeedback.reduce((sum, fb) => {
            const pump = (fb.pumpRating || 0) * 2 + 1;
            return sum + pump;
          }, 0) / weekFeedback.length
        : 0;

    summaries.push({
      weekStart,
      avgFatigue,
      avgPerformance,
      avgSoreness,
      avgPump,
      workoutCount: weekWorkouts.length,
      totalSets,
      totalVolume,
    });
  }

  return summaries;
}

/**
 * Detects an increasing trend over the given values (most recent first)
 * Returns the average week-over-week change
 */
function detectTrend(values: number[]): number {
  if (values.length < 2) return 0;
  let totalChange = 0;
  let comparisons = 0;
  // values[0] is most recent
  for (let i = 0; i < values.length - 1; i++) {
    totalChange += values[i] - values[i + 1];
    comparisons++;
  }
  return comparisons > 0 ? totalChange / comparisons : 0;
}

/**
 * Finds the number of weeks since the user last had a low-volume week (proxy for deload)
 */
function weeksSinceLastDeload(summaries: WeeklyFeedbackSummary[]): number {
  const activeSummaries = summaries.filter((s) => s.workoutCount > 0);
  if (activeSummaries.length === 0) return 0;

  const avgSets =
    activeSummaries.reduce((sum, s) => sum + s.totalSets, 0) / activeSummaries.length;
  const deloadThreshold = avgSets * 0.6;

  for (let i = 0; i < summaries.length; i++) {
    if (summaries[i].totalSets > 0 && summaries[i].totalSets <= deloadThreshold) {
      return i;
    }
  }
  return summaries.length;
}

/**
 * Checks for consecutive training days without rest
 */
function getConsecutiveTrainingDays(workoutHistory: Workout[]): number {
  if (workoutHistory.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const workoutDates = new Set(
    workoutHistory.map((wh) => {
      const d = new Date(wh.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  );

  let consecutive = 0;
  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    if (workoutDates.has(checkDate.getTime())) {
      consecutive++;
    } else if (i > 0) {
      break;
    }
  }
  return consecutive;
}

/**
 * Detects stalled or declining weight on primary lifts
 */
function detectStalledLifts(
  workoutHistory: Workout[],
  weeksToCheck: number = 3
): { stalledCount: number; totalTracked: number; stalledExercises: string[] } {
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - weeksToCheck * 7);

  const recentWorkouts = workoutHistory.filter((wh) => new Date(wh.date) >= cutoff);

  // Group by exercise name, find max weight per workout
  const exerciseWeights: Record<string, { date: Date; maxWeight: number }[]> = {};

  recentWorkouts.forEach((wh) => {
    if (wh.exercises) {
      wh.exercises.forEach((ex) => {
        const name = ex.exerciseName;
        if (!exerciseWeights[name]) exerciseWeights[name] = [];
        const maxWeight = Math.max(
          ...ex.sets.filter((s) => s.completed).map((s) => s.weight || 0),
          0
        );
        if (maxWeight > 0) {
          exerciseWeights[name].push({ date: new Date(wh.date), maxWeight });
        }
      });
    } else if (wh.sets) {
      wh.sets.forEach((s) => {
        const name = s.exerciseName;
        if (!exerciseWeights[name]) exerciseWeights[name] = [];
        if ((s.weight || 0) > 0) {
          exerciseWeights[name].push({ date: new Date(wh.date), maxWeight: s.weight });
        }
      });
    }
  });

  let stalledCount = 0;
  let totalTracked = 0;
  const stalledExercises: string[] = [];

  Object.entries(exerciseWeights).forEach(([name, entries]) => {
    if (entries.length < 2) return;
    totalTracked++;

    entries.sort((a, b) => b.date.getTime() - a.date.getTime());
    const recentMax = entries[0].maxWeight;
    const olderMax = Math.max(...entries.slice(1).map((e) => e.maxWeight));

    if (recentMax <= olderMax) {
      stalledCount++;
      stalledExercises.push(name);
    }
  });

  return { stalledCount, totalTracked, stalledExercises };
}

/**
 * Main deload detection function
 * Analyzes workout history and feedback to determine if a deload is needed
 */
export function analyzeDeloadNeed(
  workoutHistory: Workout[],
  feedbackHistory: WorkoutFeedback[]
): DeloadRecommendation {
  const signals: DeloadSignal[] = [];
  let totalScore = 0;
  let maxPossibleScore = 0;

  // Need at least 4 workouts (roughly 2 weeks) of data
  if (workoutHistory.length < 4) {
    return {
      needsDeload: false,
      confidence: 0,
      signals: [],
      summary: 'Not enough workout history to analyze. Keep training and logging workouts!',
      suggestedDuration: 7,
      suggestedVolumeReduction: 0.5,
      suggestedIntensityReduction: 0.4,
      weeksSinceLastDeload: 0,
    };
  }

  const summaries = getWeeklySummaries(workoutHistory, feedbackHistory, 6);
  const activeSummaries = summaries.filter((s) => s.workoutCount > 0);

  // --- Signal 1: Fatigue Trend (increasing fatigue over recent weeks) ---
  maxPossibleScore += 25;
  if (activeSummaries.length >= 2 && feedbackHistory.length > 0) {
    const fatigueValues = activeSummaries.slice(0, 4).map((s) => s.avgFatigue);
    const fatigueTrend = detectTrend(fatigueValues);
    const currentFatigue = activeSummaries[0]?.avgFatigue || 0;

    if (fatigueTrend > 0.3 || currentFatigue >= 4) {
      const severity: 'low' | 'medium' | 'high' =
        currentFatigue >= 4.5 || fatigueTrend > 0.7
          ? 'high'
          : currentFatigue >= 3.5
          ? 'medium'
          : 'low';
      const score = severity === 'high' ? 25 : severity === 'medium' ? 17 : 10;
      totalScore += score;

      signals.push({
        signal: 'Rising Fatigue',
        description:
          currentFatigue >= 4
            ? `Your fatigue level is high (${currentFatigue.toFixed(1)}/5) and has been increasing`
            : `Your fatigue has been trending upward over recent weeks (+${fatigueTrend.toFixed(1)}/week)`,
        severity,
        value: currentFatigue,
        threshold: 3.5,
      });
    }
  }

  // --- Signal 2: Declining Performance ---
  maxPossibleScore += 25;
  if (activeSummaries.length >= 2 && feedbackHistory.length > 0) {
    const perfValues = activeSummaries.slice(0, 4).map((s) => s.avgPerformance);
    const perfTrend = detectTrend(perfValues);
    const currentPerf = activeSummaries[0]?.avgPerformance || 3;

    if (perfTrend < -0.2 || currentPerf <= 2.5) {
      const severity: 'low' | 'medium' | 'high' =
        currentPerf <= 2 || perfTrend < -0.6
          ? 'high'
          : currentPerf <= 2.5
          ? 'medium'
          : 'low';
      const score = severity === 'high' ? 25 : severity === 'medium' ? 17 : 10;
      totalScore += score;

      signals.push({
        signal: 'Declining Performance',
        description:
          currentPerf <= 2.5
            ? `Your self-rated performance is low (${currentPerf.toFixed(1)}/5)`
            : `Your performance ratings have been declining (${perfTrend.toFixed(1)}/week)`,
        severity,
        value: currentPerf,
        threshold: 3.0,
      });
    }
  }

  // --- Signal 3: Elevated Soreness ---
  maxPossibleScore += 20;
  if (activeSummaries.length >= 2 && feedbackHistory.length > 0) {
    const sorenessValues = activeSummaries.slice(0, 3).map((s) => s.avgSoreness);
    const avgSoreness = sorenessValues.reduce((a, b) => a + b, 0) / sorenessValues.length;
    const currentSoreness = activeSummaries[0]?.avgSoreness || 0;

    if (avgSoreness >= 3.5 || currentSoreness >= 4) {
      const severity: 'low' | 'medium' | 'high' =
        currentSoreness >= 4.5 ? 'high' : avgSoreness >= 4 ? 'medium' : 'low';
      const score = severity === 'high' ? 20 : severity === 'medium' ? 14 : 8;
      totalScore += score;

      signals.push({
        signal: 'Elevated Soreness',
        description: `Your average soreness is ${avgSoreness.toFixed(1)}/5 over recent weeks`,
        severity,
        value: avgSoreness,
        threshold: 3.5,
      });
    }
  }

  // --- Signal 4: Consecutive Training Days ---
  maxPossibleScore += 10;
  const consecutiveDays = getConsecutiveTrainingDays(workoutHistory);
  if (consecutiveDays >= 8) {
    const severity: 'low' | 'medium' | 'high' =
      consecutiveDays >= 14 ? 'high' : consecutiveDays >= 10 ? 'medium' : 'low';
    const score = severity === 'high' ? 10 : severity === 'medium' ? 7 : 4;
    totalScore += score;

    signals.push({
      signal: 'No Rest Days',
      description: `You've trained ${consecutiveDays} consecutive days without a rest day`,
      severity,
      value: consecutiveDays,
      threshold: 8,
    });
  }

  // --- Signal 5: Stalled/Declining Weights ---
  maxPossibleScore += 15;
  const { stalledCount, totalTracked, stalledExercises } = detectStalledLifts(workoutHistory);
  if (totalTracked > 0) {
    const stalledRatio = stalledCount / totalTracked;
    if (stalledRatio >= 0.4) {
      const severity: 'low' | 'medium' | 'high' =
        stalledRatio >= 0.75 ? 'high' : stalledRatio >= 0.5 ? 'medium' : 'low';
      const score = severity === 'high' ? 15 : severity === 'medium' ? 10 : 6;
      totalScore += score;

      const exampleExercises = stalledExercises.slice(0, 3).join(', ');
      signals.push({
        signal: 'Stalled Progress',
        description: `${stalledCount}/${totalTracked} exercises have stalled or declined (${exampleExercises})`,
        severity,
        value: stalledRatio * 100,
        threshold: 40,
      });
    }
  }

  // --- Signal 6: Weeks Since Last Deload ---
  maxPossibleScore += 5;
  const weeksSinceDeload = weeksSinceLastDeload(summaries);
  if (weeksSinceDeload >= 4) {
    const severity: 'low' | 'medium' | 'high' =
      weeksSinceDeload >= 6 ? 'high' : weeksSinceDeload >= 5 ? 'medium' : 'low';
    const score = severity === 'high' ? 5 : severity === 'medium' ? 3 : 2;
    totalScore += score;

    signals.push({
      signal: 'Extended Training Block',
      description: `It's been ~${weeksSinceDeload} weeks since your last reduced-volume week`,
      severity,
      value: weeksSinceDeload,
      threshold: 4,
    });
  }

  // Calculate confidence and recommendation
  const confidence = maxPossibleScore > 0
    ? Math.min(100, Math.round((totalScore / maxPossibleScore) * 100))
    : 0;
  const needsDeload = confidence >= 40;

  // Determine reduction amounts based on severity
  let volumeReduction = 0.5;
  let intensityReduction = 0.35;
  if (confidence >= 70) {
    volumeReduction = 0.6;
    intensityReduction = 0.4;
  } else if (confidence >= 55) {
    volumeReduction = 0.5;
    intensityReduction = 0.35;
  } else if (confidence >= 40) {
    volumeReduction = 0.4;
    intensityReduction = 0.3;
  }

  // Build summary
  let summary = '';
  if (!needsDeload) {
    if (signals.length === 0) {
      summary = "You're recovering well. Keep pushing!";
    } else {
      summary =
        'Some minor fatigue signals detected, but nothing concerning yet. Keep monitoring.';
    }
  } else if (confidence >= 70) {
    summary =
      'Strong signs of accumulated fatigue. A deload week is highly recommended to prevent overtraining and maximize long-term gains.';
  } else if (confidence >= 55) {
    summary =
      'Your body is showing signs of fatigue accumulation. Consider a deload week to recover and come back stronger.';
  } else {
    summary =
      'Some early signs of fatigue building up. A light deload could be beneficial, or keep training but monitor closely.';
  }

  return {
    needsDeload,
    confidence,
    signals,
    summary,
    suggestedDuration: 7,
    suggestedVolumeReduction: volumeReduction,
    suggestedIntensityReduction: intensityReduction,
    weeksSinceLastDeload: weeksSinceDeload,
  };
}

/**
 * Generates a deload workout configuration based on the recommendation
 */
export function getDeloadConfig(recommendation: DeloadRecommendation): DeloadWorkoutConfig {
  return {
    volumeMultiplier: 1 - recommendation.suggestedVolumeReduction,
    intensityMultiplier: 1 - recommendation.suggestedIntensityReduction,
    removeFinishers: recommendation.confidence >= 55,
    maxSetsPerExercise: recommendation.confidence >= 70 ? 2 : 3,
  };
}

/**
 * Transforms exercises for a deload workout
 * Reduces sets and weight according to the deload config
 */
export function applyDeloadToExercises(
  exercises: any[],
  config: DeloadWorkoutConfig
): any[] {
  return exercises.map((exercise) => {
    const originalSets = exercise.sets || [];
    const targetSetCount = Math.max(
      1,
      Math.min(
        config.maxSetsPerExercise,
        Math.ceil(originalSets.length * config.volumeMultiplier)
      )
    );
    const deloadSets = originalSets.slice(0, targetSetCount).map((set: any, index: number) => ({
      ...set,
      id: set.id || `deload-set-${index}`,
      weight: set.weight
        ? Math.round((set.weight * config.intensityMultiplier) / 2.5) * 2.5
        : set.weight,
      completed: false,
      isWarmup: set.isWarmup || false,
    }));

    return {
      ...exercise,
      sets: deloadSets,
      isDeloaded: true,
    };
  });
}
