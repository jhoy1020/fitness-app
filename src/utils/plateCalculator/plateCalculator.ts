// Plate Calculator Utility
// Calculate plates needed for a given weight on a barbell

export interface PlateConfig {
  plates: { weight: number; count: number }[];
  totalWeight: number;
  perSide: { weight: number; count: number }[];
  achievable: boolean;
  difference: number;
}

// Standard plate weights (in lbs)
const STANDARD_PLATES_LBS = [45, 35, 25, 10, 5, 2.5];
// Standard plate weights (in kg)
const STANDARD_PLATES_KG = [25, 20, 15, 10, 5, 2.5, 1.25];

// Bar weights
export const BAR_WEIGHTS = {
  olympic: { lbs: 45, kg: 20 },
  womens: { lbs: 35, kg: 15 },
  ez_curl: { lbs: 25, kg: 10 },
  trap: { lbs: 55, kg: 25 },
};

export function calculatePlates(
  targetWeight: number,
  barWeight: number = 45,
  isMetric: boolean = false
): PlateConfig {
  const availablePlates = isMetric ? STANDARD_PLATES_KG : STANDARD_PLATES_LBS;
  
  // Weight per side (subtract bar, divide by 2)
  const weightPerSide = (targetWeight - barWeight) / 2;
  
  if (weightPerSide < 0) {
    return {
      plates: [],
      totalWeight: barWeight,
      perSide: [],
      achievable: targetWeight === barWeight,
      difference: targetWeight - barWeight,
    };
  }
  
  // Greedy algorithm to find plates
  const perSide: { weight: number; count: number }[] = [];
  let remaining = weightPerSide;
  
  for (const plateWeight of availablePlates) {
    const count = Math.floor(remaining / plateWeight);
    if (count > 0) {
      perSide.push({ weight: plateWeight, count });
      remaining -= count * plateWeight;
    }
  }
  
  // Calculate actual total
  const actualPerSide = perSide.reduce((sum, p) => sum + p.weight * p.count, 0);
  const actualTotal = barWeight + actualPerSide * 2;
  
  // Full plates list (both sides combined)
  const plates = perSide.map(p => ({ weight: p.weight, count: p.count * 2 }));
  
  return {
    plates,
    totalWeight: actualTotal,
    perSide,
    achievable: Math.abs(remaining) < 0.01,
    difference: targetWeight - actualTotal,
  };
}

export function formatPlatesDisplay(config: PlateConfig, isMetric: boolean): string {
  if (config.perSide.length === 0) {
    return 'Empty bar';
  }
  
  const unit = isMetric ? 'kg' : 'lbs';
  const parts = config.perSide.map(p => 
    p.count === 1 ? `${p.weight}${unit}` : `${p.count}×${p.weight}${unit}`
  );
  
  return parts.join(' + ');
}

// Get warm-up sets for a target weight
export interface WarmupSet {
  weight: number;
  reps: number;
  percentage: number;
  plates: PlateConfig;
  rest: number; // seconds
}

export function getWarmupSets(
  workingWeight: number,
  barWeight: number = 45,
  isMetric: boolean = false
): WarmupSet[] {
  const warmups: WarmupSet[] = [];
  
  // Empty bar (if working weight is heavy enough)
  if (workingWeight > barWeight * 1.5) {
    warmups.push({
      weight: barWeight,
      reps: 10,
      percentage: Math.round((barWeight / workingWeight) * 100),
      plates: calculatePlates(barWeight, barWeight, isMetric),
      rest: 60,
    });
  }
  
  // Progressive warm-ups at 40%, 60%, 80%
  const percentages = [0.4, 0.6, 0.8];
  const repScheme = [8, 5, 3];
  const restTimes = [60, 90, 120];
  
  percentages.forEach((pct, idx) => {
    const weight = Math.round(workingWeight * pct / 5) * 5; // Round to nearest 5
    if (weight > barWeight) {
      warmups.push({
        weight,
        reps: repScheme[idx],
        percentage: Math.round(pct * 100),
        plates: calculatePlates(weight, barWeight, isMetric),
        rest: restTimes[idx],
      });
    }
  });
  
  return warmups;
}

export default calculatePlates;
