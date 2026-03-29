// Utility functions and formulas

import { ACTIVITY_MULTIPLIERS, MACROS, CONVERSIONS, PROGRESSION } from '../constants/constants';
import type { ActivityLevel, UserProfile, NutritionCalculation, WorkoutSet, ProgressiveOverloadSuggestion, ProgramWeekTemplate } from '../../types';
import type { PlateConfig, WarmupSet } from '../plateCalculator/plateCalculator';

/**
 * Generate a UUID v4
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Calculate BMR using Katch-McArdle formula (preferred when lean mass is known)
 * BMR = 370 + (21.6 × lean mass in kg)
 */
export function calculateBMR_KatchMcArdle(leanMassKg: number): number {
  return 370 + 21.6 * leanMassKg;
}

/**
 * Calculate BMR using Mifflin-St Jeor formula (when lean mass is unknown)
 * Men: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age) + 5
 * Women: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age) - 161
 */
export function calculateBMR_MifflinStJeor(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: 'male' | 'female' | 'other'
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'male') {
    return base + 5;
  } else if (gender === 'female') {
    return base - 161;
  }
  // For 'other', use average
  return base - 78;
}

/**
 * Calculate lean mass from total weight and body fat percentage
 */
export function calculateLeanMass(totalWeight: number, bodyFatPercent: number): number {
  return totalWeight * (1 - bodyFatPercent / 100);
}

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

/**
 * Calculate full nutrition breakdown
 */
export function calculateNutrition(profile: UserProfile): NutritionCalculation {
  // Convert to metric if needed
  let weightKg = profile.weight;
  let heightCm = profile.height;
  let weightLbs = profile.weight;

  if (profile.weightUnit === 'lbs') {
    weightKg = profile.weight * CONVERSIONS.lbsToKg;
  } else {
    weightLbs = profile.weight * CONVERSIONS.kgToLbs;
  }

  if (profile.heightUnit === 'in') {
    heightCm = profile.height * CONVERSIONS.inToCm;
  }

  // Calculate lean mass
  let leanMassKg: number;
  if (profile.leanMass) {
    leanMassKg = profile.weightUnit === 'lbs' 
      ? profile.leanMass * CONVERSIONS.lbsToKg 
      : profile.leanMass;
  } else if (profile.bodyFatPercent) {
    leanMassKg = calculateLeanMass(weightKg, profile.bodyFatPercent);
  } else {
    // Estimate lean mass (assume 20% body fat for males, 28% for females)
    const estimatedBF = profile.gender === 'male' ? 20 : profile.gender === 'female' ? 28 : 24;
    leanMassKg = calculateLeanMass(weightKg, estimatedBF);
  }

  const leanMassLbs = leanMassKg * CONVERSIONS.kgToLbs;

  // Calculate BMR
  let bmr: number;
  if (profile.bmrOverride) {
    bmr = profile.bmrOverride;
  } else if (profile.bodyFatPercent || profile.leanMass) {
    bmr = calculateBMR_KatchMcArdle(leanMassKg);
  } else {
    bmr = calculateBMR_MifflinStJeor(weightKg, heightCm, profile.age, profile.gender);
  }

  // Calculate TDEE
  const tdee = calculateTDEE(bmr, profile.activityLevel);

  // Calculate target calories based on goal
  let targetCalories = tdee;
  let deficit: number | undefined;
  let surplus: number | undefined;

  if (profile.goalType === 'cut') {
    deficit = MACROS.cutDeficit;
    targetCalories = tdee - deficit;
  } else if (profile.goalType === 'bulk') {
    surplus = MACROS.bulkSurplus;
    targetCalories = tdee + surplus;
  }

  // Calculate macros
  const protein = Math.round(leanMassLbs * MACROS.proteinPerLbLeanMass);
  const fat = Math.round(weightLbs * MACROS.fatPerLbBodyweight);
  
  const proteinCalories = protein * MACROS.caloriesPerGramProtein;
  const fatCalories = fat * MACROS.caloriesPerGramFat;
  const remainingCalories = targetCalories - proteinCalories - fatCalories;
  const carbs = Math.max(0, Math.round(remainingCalories / MACROS.caloriesPerGramCarb));

  return {
    bmr: Math.round(bmr),
    tdee,
    targetCalories: Math.round(targetCalories),
    protein,
    fat,
    carbs,
    deficit,
    surplus,
  };
}

/**
 * Calculate estimated 1RM using Epley formula
 * 1RM = weight × (1 + reps / 30)
 */
export function calculate1RM_Epley(weight: number, reps: number): number {
  if (reps === 1) return weight;
  if (reps <= 0) return 0;
  return Math.round(weight * (1 + reps / 30));
}

/**
 * Calculate estimated 1RM using Brzycki formula
 * 1RM = weight × (36 / (37 - reps))
 */
export function calculate1RM_Brzycki(weight: number, reps: number): number {
  if (reps === 1) return weight;
  if (reps <= 0 || reps >= 37) return 0;
  return Math.round(weight * (36 / (37 - reps)));
}

/**
 * Get best 1RM estimate from a set of workout sets for an exercise
 */
export function getBest1RMFromSets(sets: WorkoutSet[]): number {
  if (sets.length === 0) return 0;
  
  const estimates = sets
    .filter(s => !s.isWarmup && s.reps > 0 && s.weight > 0)
    .map(s => calculate1RM_Epley(s.weight, s.reps));
  
  return Math.max(...estimates, 0);
}

/**
 * Calculate progressive overload suggestion based on previous performance
 */
export function calculateProgressiveOverload(
  exerciseName: string,
  exerciseId: string,
  previousSets: WorkoutSet[],
  targetRepsMin: number,
  targetRepsMax: number,
  isLowerBody: boolean = false
): ProgressiveOverloadSuggestion {
  const workingSets = previousSets.filter(s => !s.isWarmup);
  
  if (workingSets.length === 0) {
    return {
      exerciseId,
      exerciseName,
      previousWeight: 0,
      previousReps: 0,
      previousSets: 0,
      suggestedWeight: 0,
      suggestedReps: targetRepsMin,
      suggestedSets: 3,
      reason: 'No previous data - start with comfortable weight',
    };
  }

  const avgWeight = workingSets.reduce((sum, s) => sum + s.weight, 0) / workingSets.length;
  const avgReps = workingSets.reduce((sum, s) => sum + s.reps, 0) / workingSets.length;
  const totalReps = workingSets.reduce((sum, s) => sum + s.reps, 0);
  const targetTotalReps = workingSets.length * targetRepsMax;
  const avgRPE = workingSets.filter(s => s.rpe).reduce((sum, s) => sum + (s.rpe || 0), 0) / 
                 workingSets.filter(s => s.rpe).length || 0;

  const weightIncrement = isLowerBody 
    ? PROGRESSION.lowerBodyWeightIncrement 
    : PROGRESSION.upperBodyWeightIncrement;

  let suggestedWeight = avgWeight;
  let suggestedReps = Math.round(avgReps);
  let suggestedSets = workingSets.length;
  let reason = '';

  // All sets hit max reps - increase weight
  if (avgReps >= targetRepsMax) {
    suggestedWeight = avgWeight + weightIncrement;
    suggestedReps = targetRepsMin;
    reason = `Hit ${targetRepsMax} reps on all sets - increase weight by ${weightIncrement} lbs`;
  }
  // Missed only 1-2 reps total - keep weight, aim for more reps
  else if (targetTotalReps - totalReps <= 2) {
    suggestedReps = Math.min(Math.round(avgReps) + 1, targetRepsMax);
    reason = `Close to target - aim for +1 rep per set`;
  }
  // High RPE or missed 3+ reps - keep everything the same or reduce
  else if (avgRPE > PROGRESSION.maxRPE || targetTotalReps - totalReps >= PROGRESSION.failureThreshold) {
    if (avgRPE > PROGRESSION.maxRPE) {
      suggestedSets = Math.max(workingSets.length - 1, 2);
      reason = `High RPE (${avgRPE.toFixed(1)}) - reduce to ${suggestedSets} sets for recovery`;
    } else {
      reason = `Missed ${targetTotalReps - totalReps} reps - repeat same weight/reps`;
    }
  }
  // Normal progress
  else {
    suggestedReps = Math.min(Math.round(avgReps) + 1, targetRepsMax);
    reason = `Good progress - aim for ${suggestedReps} reps`;
  }

  return {
    exerciseId,
    exerciseName,
    previousWeight: Math.round(avgWeight),
    previousReps: Math.round(avgReps),
    previousSets: workingSets.length,
    suggestedWeight: Math.round(suggestedWeight),
    suggestedReps,
    suggestedSets,
    reason,
  };
}

/**
 * Format duration in seconds to mm:ss
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format date to readable string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date to ISO string (for storage)
 */
export function toISODate(date: Date = new Date()): string {
  return date.toISOString();
}

/**
 * Convert weight between units
 */
export function convertWeight(value: number, from: 'lbs' | 'kg', to: 'lbs' | 'kg'): number {
  if (from === to) return value;
  if (from === 'lbs' && to === 'kg') return value * CONVERSIONS.lbsToKg;
  return value * CONVERSIONS.kgToLbs;
}

/**
 * Convert height between units
 */
export function convertHeight(value: number, from: 'in' | 'cm', to: 'in' | 'cm'): number {
  if (from === to) return value;
  if (from === 'in' && to === 'cm') return value * CONVERSIONS.inToCm;
  return value * CONVERSIONS.cmToIn;
}

/**
 * Calculate weeks to reach goal 1RM with linear progression
 */
export function calculateWeeksToGoal(
  current1RM: number,
  target1RM: number,
  weeklyIncrement: number = 2.5
): number {
  if (current1RM >= target1RM) return 0;
  return Math.ceil((target1RM - current1RM) / weeklyIncrement);
}

/**
 * Resolve the correct week template for a given week index.
 * Supports both single-week programs (weekTemplate) and multi-week programs (weekTemplates).
 * When weekTemplates is set, it takes precedence over weekTemplate.
 * Weeks beyond the defined templates cycle back (e.g., week 4 with 3 templates uses template 1).
 * 
 * @param weekTemplate - Single week template (same every week)
 * @param weekTemplates - Array of per-week templates (vary by week)
 * @param weekIndex - 0-based week index
 * @returns The resolved ProgramWeekTemplate, or null if no template available
 */
export function getWeekTemplate(
  weekTemplate?: ProgramWeekTemplate,
  weekTemplates?: ProgramWeekTemplate[],
  weekIndex: number = 0
): ProgramWeekTemplate | null {
  // weekTemplates takes precedence when available
  if (weekTemplates && weekTemplates.length > 0) {
    return weekTemplates[weekIndex % weekTemplates.length];
  }
  // Fall back to single weekTemplate
  if (weekTemplate) {
    return weekTemplate;
  }
  return null;
}

// ─── 1RM Test Day Protocol ──────────────────────────────

export interface AttemptSet {
  label: string;
  weight: number;
  percentage: number; // % of current 1RM
  rpe: number;
  restSeconds: number;
  plates: PlateConfig;
  result?: 'hit' | 'miss';
}

export interface OneRMTestProtocol {
  exerciseName: string;
  current1RM: number;
  goal1RM: number;
  unit: 'lbs' | 'kg';
  warmupSets: WarmupSet[];
  attempts: AttemptSet[];
}

/**
 * Round a weight to the nearest increment (5 lbs or 2.5 kg)
 */
function roundWeight(weight: number, isMetric: boolean): number {
  const increment = isMetric ? 2.5 : 5;
  return Math.round(weight / increment) * increment;
}

/**
 * Generate a 1RM test-day protocol.
 *
 * Protocol (powerlifting-style 3-attempt system):
 *   Warmup  → progressive sets building to ~80 % of opener
 *   Attempt 1 (Opener)  → ~90 % of current 1RM  (RPE ~8)
 *   Attempt 2           → midpoint between opener and goal (~95-100 %)  (RPE ~9)
 *   Attempt 3 (Goal)    → goal 1RM  (RPE 10)
 *
 * @param exerciseName  Display name of the exercise
 * @param current1RM    Athlete's current / most-recent tested or estimated 1RM
 * @param goal1RM       Target weight for the test session
 * @param barWeight     Bar weight in the same unit (default: 45 lbs / 20 kg)
 * @param isMetric      Whether weights are in kg
 */
export function generate1RMTestProtocol(
  exerciseName: string,
  current1RM: number,
  goal1RM: number,
  barWeight?: number,
  isMetric: boolean = false,
): OneRMTestProtocol {
  const { getWarmupSets, calculatePlates } = require('../plateCalculator/plateCalculator');

  const defaultBar = isMetric ? 20 : 45;
  const bar = barWeight ?? defaultBar;

  // Attempt weights
  const openerWeight = roundWeight(current1RM * 0.9, isMetric);
  const secondWeight = roundWeight((openerWeight + goal1RM) / 2, isMetric);
  const thirdWeight = roundWeight(goal1RM, isMetric);

  // Warm-up sets target the opener as the "working weight"
  const warmupSets = getWarmupSets(openerWeight, bar, isMetric);

  const attempts: AttemptSet[] = [
    {
      label: 'Opener',
      weight: openerWeight,
      percentage: Math.round((openerWeight / current1RM) * 100),
      rpe: 8,
      restSeconds: 180, // 3 min
      plates: calculatePlates(openerWeight, bar, isMetric),
    },
    {
      label: '2nd Attempt',
      weight: secondWeight,
      percentage: Math.round((secondWeight / current1RM) * 100),
      rpe: 9,
      restSeconds: 300, // 5 min
      plates: calculatePlates(secondWeight, bar, isMetric),
    },
    {
      label: '3rd Attempt – Goal',
      weight: thirdWeight,
      percentage: Math.round((thirdWeight / current1RM) * 100),
      rpe: 10,
      restSeconds: 0, // last attempt, no rest needed after
      plates: calculatePlates(thirdWeight, bar, isMetric),
    },
  ];

  return {
    exerciseName,
    current1RM,
    goal1RM,
    unit: isMetric ? 'kg' : 'lbs',
    warmupSets,
    attempts,
  };
}
