// useWarmupSets — generates warm-up set recommendations
// Extracted from ActiveWorkoutScreen warm-up logic.

import { useMemo } from 'react';

interface WarmupSet {
  setNumber: number;
  weight: number;
  reps: number;
  percentOfWorking: number;
  label: string;  // e.g., "Empty Bar", "50%", "70%"
}

interface UseWarmupSetsOptions {
  workingWeight: number;
  workingSets?: number;
  unit?: 'lbs' | 'kg';
  barWeight?: number;
}

/**
 * Generates progressive warm-up sets based on working weight.
 * Uses a standard warm-up protocol:
 *   - Empty bar × 10-15
 *   - ~50% × 8
 *   - ~70% × 5
 *   - ~85% × 3
 *   - ~95% × 1 (if heavy enough)
 */
export function useWarmupSets(options: UseWarmupSetsOptions): WarmupSet[] {
  const { workingWeight, unit = 'lbs', barWeight } = options;

  return useMemo(() => {
    const bar = barWeight ?? (unit === 'lbs' ? 45 : 20);

    if (workingWeight <= bar) {
      return []; // No warm-up needed for empty bar
    }

    const sets: WarmupSet[] = [];
    let setNum = 1;

    // Always start with empty bar
    sets.push({
      setNumber: setNum++,
      weight: bar,
      reps: 15,
      percentOfWorking: Math.round((bar / workingWeight) * 100),
      label: 'Empty Bar',
    });

    // Progressive warm-up percentages
    const percentages = workingWeight >= bar * 3
      ? [0.5, 0.7, 0.85, 0.95]  // Heavy — 4 warm-up steps
      : workingWeight >= bar * 2
        ? [0.5, 0.7, 0.85]       // Moderate — 3 steps
        : [0.6, 0.8];            // Light — 2 steps

    const repMap: Record<number, number> = {
      0.5: 8,
      0.6: 8,
      0.7: 5,
      0.8: 3,
      0.85: 3,
      0.95: 1,
    };

    for (const pct of percentages) {
      // Round to nearest plate-friendly weight
      let weight = Math.round(workingWeight * pct);
      // Round to nearest 5 (lbs) or 2.5 (kg)
      const roundTo = unit === 'lbs' ? 5 : 2.5;
      weight = Math.round(weight / roundTo) * roundTo;

      if (weight <= bar) continue; // Skip if it rounds down to bar

      sets.push({
        setNumber: setNum++,
        weight,
        reps: repMap[pct] ?? 5,
        percentOfWorking: Math.round(pct * 100),
        label: `${Math.round(pct * 100)}%`,
      });
    }

    return sets;
  }, [workingWeight, unit, barWeight]);
}
