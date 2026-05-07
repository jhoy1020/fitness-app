// useWorkoutStats — pure derivation of profile-screen header stats from
// workout history. Pulled out of ProfileScreen so the math has its own
// home and can be tested without rendering a screen.

import { useMemo } from 'react';
import type { Workout } from '../../types';

const STREAK_LOOKBACK_DAYS = 30;

// Memoized at module load — Intl.NumberFormat construction is non-trivial
// and the formatter is stateless.
const COMPACT_NUMBER_FORMATTER = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

export interface WorkoutStats {
  totalWorkouts: number;
  totalSets: number;
  totalVolume: number;
  streak: number;
  thisWeekWorkouts: number;
}

/**
 * Compute total workouts, total sets, total volume, current streak (in
 * consecutive days from today, capped at 30), and this-week's count from
 * a list of workouts.
 *
 * `Workout.sets` is an optional inline-set array (legacy / denormalised
 * view used by history screens); fall back to 0 when a workout has no
 * inline sets recorded.
 */
export function useWorkoutStats(history: Workout[] | undefined): WorkoutStats {
  return useMemo(() => {
    const safeHistory = history ?? [];
    const totalWorkouts = safeHistory.length;
    const totalSets = safeHistory.reduce(
      (sum, w) => sum + (w.sets?.length ?? 0),
      0,
    );
    const totalVolume = safeHistory.reduce((sum, w) => {
      const workoutVolume =
        w.sets?.reduce(
          (setSum, s) => setSum + (s.weight || 0) * (s.reps || 0),
          0,
        ) ?? 0;
      return sum + workoutVolume;
    }, 0);

    // Streak — count consecutive days back from today that include at
    // least one workout. We rebuild the unique date set rather than
    // relying on already-sorted history.
    const now = new Date();
    const sortedDates = safeHistory
      .map((w) =>
        new Date(w.completedAt || w.createdAt || w.date).toDateString(),
      )
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    for (let i = 0; i < STREAK_LOOKBACK_DAYS; i++) {
      const checkDate = new Date(now);
      checkDate.setDate(checkDate.getDate() - i);
      if (sortedDates.includes(checkDate.toDateString())) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    // This week = since most recent Sunday.
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const thisWeekWorkouts = safeHistory.filter(
      (w) => new Date(w.completedAt || w.createdAt || w.date) >= weekStart,
    ).length;

    return {
      totalWorkouts,
      totalSets,
      totalVolume,
      streak,
      thisWeekWorkouts,
    };
  }, [history]);
}

/** Em-dash placeholder used when the underlying value represents
 *  "no data" rather than "zero". Empty-state semantics > literal zeros. */
export const EMPTY_STAT = '—';

/**
 * Compact stat formatter — "1.2K", "12.3M", "850".
 *
 * Uses Intl.NumberFormat compact notation so the output scales smoothly
 * across orders of magnitude (no visual cliff between 999 → "999" and
 * 1000 → "1.0K"). When the value is zero or negative we render an
 * em-dash to communicate "no data" rather than a literal "0", which
 * a user may misread as "you've moved zero pounds".
 */
export function formatVolume(volume: number): string {
  if (!volume || volume <= 0) return EMPTY_STAT;
  return COMPACT_NUMBER_FORMATTER.format(volume);
}

/** General-purpose compact number formatter, exported for reuse by other
 *  stat tiles that should share the volume tile's formatting rules. */
export function formatCompactNumber(value: number): string {
  if (!Number.isFinite(value)) return EMPTY_STAT;
  return COMPACT_NUMBER_FORMATTER.format(value);
}
