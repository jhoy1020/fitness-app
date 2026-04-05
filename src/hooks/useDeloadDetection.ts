// useDeloadDetection — determines if a deload is recommended
// Extracted from deloadDetection utility into a reactive hook.

import { useMemo } from 'react';
import type { MuscleFatigue, WorkoutFeedback, MesoCycle } from '../types';

interface DeloadRecommendation {
  shouldDeload: boolean;
  reasons: string[];
  severity: 'none' | 'mild' | 'moderate' | 'severe';
  daysSinceLastDeload: number | null;
}

export function useDeloadDetection(
  muscleFatigue: Record<string, MuscleFatigue>,
  recentFeedback: WorkoutFeedback[],
  activeMesoCycle: MesoCycle | null,
  lastDeloadDate: string | null
): DeloadRecommendation {
  return useMemo(() => {
    const reasons: string[] = [];

    // Check muscle fatigue levels
    const fatigueValues = Object.values(muscleFatigue);
    const highFatigueMuscles = fatigueValues.filter(f => f.currentFatigue > 70);
    const criticalMuscles = fatigueValues.filter(f => f.needsDeload);

    if (criticalMuscles.length >= 3) {
      reasons.push(`${criticalMuscles.length} muscle groups flagged for deload`);
    } else if (highFatigueMuscles.length >= 4) {
      reasons.push(`${highFatigueMuscles.length} muscle groups with high fatigue`);
    }

    // Check recent feedback for declining performance
    const last3 = recentFeedback.slice(0, 3);
    if (last3.length >= 3) {
      const avgPerformance = last3.reduce((s, f) => s + f.performanceRating, 0) / last3.length;
      if (avgPerformance >= 2.5) {
        reasons.push('Performance declining over last 3 workouts');
      }
    }

    // Check consecutive hard sessions
    const maxConsecutive = fatigueValues.reduce(
      (max, f) => Math.max(max, f.consecutiveHardSessions),
      0
    );
    if (maxConsecutive >= 4) {
      reasons.push(`${maxConsecutive} consecutive hard sessions detected`);
    }

    // Check weeks into mesocycle
    if (activeMesoCycle && activeMesoCycle.currentWeek >= activeMesoCycle.totalWeeks - 1) {
      reasons.push('Approaching end of mesocycle — deload week recommended');
    }

    // Days since last deload
    let daysSinceLastDeload: number | null = null;
    if (lastDeloadDate) {
      const diff = Date.now() - new Date(lastDeloadDate).getTime();
      daysSinceLastDeload = Math.floor(diff / (1000 * 60 * 60 * 24));
      if (daysSinceLastDeload > 42) {
        reasons.push(`${daysSinceLastDeload} days since last deload (>6 weeks)`);
      }
    }

    // Determine severity
    let severity: DeloadRecommendation['severity'] = 'none';
    if (reasons.length >= 3) severity = 'severe';
    else if (reasons.length === 2) severity = 'moderate';
    else if (reasons.length === 1) severity = 'mild';

    return {
      shouldDeload: reasons.length > 0,
      reasons,
      severity,
      daysSinceLastDeload,
    };
  }, [muscleFatigue, recentFeedback, activeMesoCycle, lastDeloadDate]);
}
