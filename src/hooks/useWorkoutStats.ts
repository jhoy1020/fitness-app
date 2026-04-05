// useWorkoutStats — aggregated statistics (streak, volume, etc.)

import { useMemo } from 'react';
import type { Workout } from '../types';

interface WorkoutStats {
  totalWorkouts: number;
  totalSets: number;
  totalVolume: number;
  streak: number;
  thisWeekWorkouts: number;
}

/**
 * Pure computation hook — accepts workout history array
 * and returns aggregated stats. No data fetching.
 */
export function useWorkoutStats(workoutHistory: Workout[]): WorkoutStats {
  return useMemo(() => {
    const history = workoutHistory || [];
    const totalWorkouts = history.length;

    const totalSets = history.reduce((sum, w) => {
      return sum + ((w as any).sets?.length || 0);
    }, 0);

    const totalVolume = history.reduce((sum, w) => {
      return sum + ((w as any).sets?.reduce(
        (setSum: number, s: any) => setSum + (s.weight || 0) * (s.reps || 0),
        0
      ) || 0);
    }, 0);

    // Calculate streak
    let streak = 0;
    const now = new Date();
    const sortedDates = history
      .map(w => new Date(w.completedAt || w.createdAt || w.date).toDateString())
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(now);
      checkDate.setDate(checkDate.getDate() - i);
      if (sortedDates.includes(checkDate.toDateString())) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    // This week's workouts
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const thisWeekWorkouts = history.filter(w =>
      new Date(w.completedAt || w.createdAt || w.date) >= weekStart
    ).length;

    return { totalWorkouts, totalSets, totalVolume, streak, thisWeekWorkouts };
  }, [workoutHistory]);
}
