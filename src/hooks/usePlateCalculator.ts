// usePlateCalculator — extracted from ActiveWorkoutScreen
// Calculates plates needed for a given weight on each side of the bar.

import { useMemo } from 'react';

// Standard plate weights in lbs
const STANDARD_PLATES_LBS = [45, 35, 25, 10, 5, 2.5];
// Standard plates in kg
const STANDARD_PLATES_KG = [25, 20, 15, 10, 5, 2.5, 1.25];

interface PlateResult {
  plates: Array<{ weight: number; count: number }>;
  remainder: number;  // Weight that can't be made up with available plates
  barWeight: number;
  totalPerSide: number;
}

export function usePlateCalculator(
  targetWeight: number,
  unit: 'lbs' | 'kg' = 'lbs',
  barWeight?: number
): PlateResult {
  return useMemo(() => {
    const bar = barWeight ?? (unit === 'lbs' ? 45 : 20);
    const availablePlates = unit === 'lbs' ? STANDARD_PLATES_LBS : STANDARD_PLATES_KG;

    if (targetWeight <= bar) {
      return { plates: [], remainder: 0, barWeight: bar, totalPerSide: 0 };
    }

    let remaining = (targetWeight - bar) / 2; // per side
    const totalPerSide = remaining;
    const plates: Array<{ weight: number; count: number }> = [];

    for (const plate of availablePlates) {
      if (remaining >= plate) {
        const count = Math.floor(remaining / plate);
        plates.push({ weight: plate, count });
        remaining -= count * plate;
        remaining = Math.round(remaining * 100) / 100; // fix floating point
      }
    }

    return {
      plates,
      remainder: remaining,
      barWeight: bar,
      totalPerSide,
    };
  }, [targetWeight, unit, barWeight]);
}
