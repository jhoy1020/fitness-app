// Utility constants and configuration

export const APP_NAME = 'Fitness Tracker';
export const APP_VERSION = '1.0.0';

// Activity level multipliers for TDEE calculation
export const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,      // Little to no exercise
  light: 1.375,        // 1-3 days/week
  moderate: 1.55,      // 3-5 days/week
  active: 1.725,       // 6-7 days/week
  very_active: 1.9,    // 2x per day or physical job
} as const;

// Default rest times by muscle group (in seconds)
export const DEFAULT_REST_TIMES = {
  compound: 180,       // 3 minutes for big compound lifts
  isolation: 90,       // 1.5 minutes for isolation
  bodyweight: 60,      // 1 minute for bodyweight
} as const;

// Progressive overload settings
export const PROGRESSION = {
  upperBodyWeightIncrement: 5,    // lbs
  lowerBodyWeightIncrement: 10,   // lbs
  repIncrement: 1,
  deloadPercentage: 0.1,          // 10% reduction
  maxRPE: 9.5,
  failureThreshold: 3,            // missed reps before action
  consecutiveFailuresForDeload: 2,
} as const;

// Macro calculation constants
export const MACROS = {
  proteinPerLbLeanMass: 1,        // grams per lb of lean mass
  fatPerLbBodyweight: 0.4,        // grams per lb of bodyweight
  caloriesPerGramProtein: 4,
  caloriesPerGramCarb: 4,
  caloriesPerGramFat: 9,
  cutDeficit: 500,                // calories
  bulkSurplus: 300,               // calories
} as const;

// Weight unit conversion
export const CONVERSIONS = {
  lbsToKg: 0.453592,
  kgToLbs: 2.20462,
  inToCm: 2.54,
  cmToIn: 0.393701,
} as const;

// RPE descriptions
export const RPE_DESCRIPTIONS: Record<number, string> = {
  6: 'Could do 4+ more reps',
  7: 'Could do 3 more reps',
  8: 'Could do 2 more reps',
  9: 'Could do 1 more rep',
  9.5: 'Maybe 1 more rep',
  10: 'Maximum effort',
};

// Muscle groups with display names
export const MUSCLE_GROUP_LABELS: Record<string, string> = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearms: 'Forearms',
  quadriceps: 'Quadriceps',
  hamstrings: 'Hamstrings',
  glutes: 'Glutes',
  calves: 'Calves',
  core: 'Core',
  full_body: 'Full Body',
};

// Equipment with display names
export const EQUIPMENT_LABELS: Record<string, string> = {
  barbell: 'Barbell',
  dumbbell: 'Dumbbell',
  cable: 'Cable',
  machine: 'Machine',
  bodyweight: 'Bodyweight',
  kettlebell: 'Kettlebell',
  bands: 'Resistance Bands',
  other: 'Other',
};

// Timer settings
export const TIMER = {
  alertAt: [10, 5, 0],           // seconds before completion to alert
  quickAdjustments: [-30, -15, 15, 30], // seconds
  minRest: 15,
  maxRest: 600,                  // 10 minutes
} as const;

// Strava API configuration
export const STRAVA_CONFIG = {
  authorizationEndpoint: 'https://www.strava.com/oauth/authorize',
  tokenEndpoint: 'https://www.strava.com/oauth/token',
  revokeEndpoint: 'https://www.strava.com/oauth/deauthorize',
  apiBaseUrl: 'https://www.strava.com/api/v3',
  scopes: ['read', 'activity:read_all'],
} as const;

// Export formats
export const EXPORT_VERSION = '1.0';

// ============================================
// RP HYPERTROPHY VOLUME LANDMARKS
// ============================================
// Sets per week per muscle group
// MEV = Minimum Effective Volume (start of mesocycle)
// MAV = Maximum Adaptive Volume (optimal growth range)
// MRV = Maximum Recoverable Volume (upper limit before overtraining)
// MV = Maintenance Volume (to maintain muscle during deloads)

export const VOLUME_LANDMARKS: Record<string, { MV: number; MEV: number; MAV: [number, number]; MRV: number }> = {
  chest: { MV: 6, MEV: 10, MAV: [12, 20], MRV: 22 },
  back: { MV: 6, MEV: 10, MAV: [14, 22], MRV: 25 },
  shoulders: { MV: 6, MEV: 8, MAV: [12, 18], MRV: 20 },
  biceps: { MV: 4, MEV: 8, MAV: [10, 16], MRV: 20 },
  triceps: { MV: 4, MEV: 6, MAV: [10, 14], MRV: 18 },
  forearms: { MV: 2, MEV: 4, MAV: [6, 10], MRV: 14 },
  quadriceps: { MV: 6, MEV: 8, MAV: [12, 18], MRV: 20 },
  hamstrings: { MV: 4, MEV: 6, MAV: [10, 16], MRV: 18 },
  glutes: { MV: 4, MEV: 6, MAV: [10, 16], MRV: 20 },
  calves: { MV: 4, MEV: 6, MAV: [10, 16], MRV: 20 },
  core: { MV: 4, MEV: 6, MAV: [8, 14], MRV: 18 },
  full_body: { MV: 6, MEV: 8, MAV: [12, 18], MRV: 22 },
} as const;

// RIR (Reps In Reserve) to RPE conversion
export const RIR_TO_RPE: Record<number, number> = {
  0: 10,    // 0 RIR = RPE 10 (failure)
  1: 9,     // 1 RIR = RPE 9
  2: 8,     // 2 RIR = RPE 8
  3: 7,     // 3 RIR = RPE 7
  4: 6,     // 4 RIR = RPE 6
};

export const RIR_DESCRIPTIONS: Record<number, string> = {
  0: 'Failure - no more reps possible',
  1: 'Could do 1 more rep',
  2: 'Could do 2 more reps',
  3: 'Could do 3 more reps',
  4: 'Could do 4+ more reps',
};

// Mesocycle defaults
export const MESOCYCLE = {
  defaultWeeks: 5,              // 4 training + 1 deload
  minWeeks: 3,
  maxWeeks: 8,
  deloadVolumePercent: 0.5,     // 50% of normal volume during deload
  deloadIntensityPercent: 0.9,  // 90% of normal intensity during deload
  volumeIncreasePerWeek: 2,     // Sets to add per muscle per week
} as const;

// Workout feedback scales
export const FEEDBACK_SCALES = {
  pump: {
    0: 'No pump',
    1: 'Moderate pump',
    2: 'Great pump',
  },
  soreness: {
    0: 'No soreness expected',
    1: 'Mild soreness expected',
    2: 'Significant soreness expected',
  },
  performance: {
    0: 'Exceeded targets',
    1: 'Hit targets',
    2: 'Struggled',
    3: 'Missed targets',
  },
} as const;

// Volume adjustment based on feedback scores
// Lower score = better performance = can handle more volume
export const VOLUME_ADJUSTMENTS = {
  // Sum of pump + soreness + performance (0-7 scale)
  // 0-2: Crushing it, add more volume
  // 3-4: On track, slight increase
  // 5: Maintain current volume
  // 6-7: Struggling, reduce or deload
  thresholds: {
    increaseHigh: 2,    // Add 2-3 sets if score <= 2
    increaseLow: 4,     // Add 1 set if score <= 4
    maintain: 5,        // Maintain if score == 5
    decrease: 6,        // Reduce if score >= 6
    deload: 7,          // Consider deload if score == 7
  },
  setAdjustments: {
    increaseHigh: 3,
    increaseLow: 1,
    maintain: 0,
    decrease: -1,
    deload: -3,
  },
} as const;

// Compound exercise muscle contributions
// Primary muscle gets 100% credit, secondary muscles get partial credit
export const COMPOUND_CONTRIBUTIONS: Record<string, { primary: string; secondary: Record<string, number> }> = {
  // Chest compounds
  'Bench Press': { primary: 'chest', secondary: { triceps: 0.5, shoulders: 0.3 } },
  'Incline Bench Press': { primary: 'chest', secondary: { triceps: 0.5, shoulders: 0.4 } },
  'Dumbbell Bench Press': { primary: 'chest', secondary: { triceps: 0.4, shoulders: 0.3 } },
  'Push-ups': { primary: 'chest', secondary: { triceps: 0.4, shoulders: 0.3 } },
  'Dips': { primary: 'chest', secondary: { triceps: 0.6, shoulders: 0.3 } },
  
  // Back compounds
  'Barbell Row': { primary: 'back', secondary: { biceps: 0.5, shoulders: 0.2 } },
  'Pull-ups': { primary: 'back', secondary: { biceps: 0.5 } },
  'Lat Pulldown': { primary: 'back', secondary: { biceps: 0.4 } },
  'Deadlift': { primary: 'back', secondary: { hamstrings: 0.6, glutes: 0.5, core: 0.3 } },
  'Dumbbell Row': { primary: 'back', secondary: { biceps: 0.4 } },
  
  // Shoulder compounds
  'Overhead Press': { primary: 'shoulders', secondary: { triceps: 0.4, core: 0.2 } },
  'Dumbbell Shoulder Press': { primary: 'shoulders', secondary: { triceps: 0.4 } },
  
  // Leg compounds
  'Squat': { primary: 'quadriceps', secondary: { glutes: 0.6, hamstrings: 0.3, core: 0.3 } },
  'Back Squat': { primary: 'quadriceps', secondary: { glutes: 0.6, hamstrings: 0.3, core: 0.3 } },
  'Front Squat': { primary: 'quadriceps', secondary: { glutes: 0.5, core: 0.4 } },
  'Leg Press': { primary: 'quadriceps', secondary: { glutes: 0.5, hamstrings: 0.2 } },
  'Lunges': { primary: 'quadriceps', secondary: { glutes: 0.6, hamstrings: 0.3 } },
  'Romanian Deadlift': { primary: 'hamstrings', secondary: { glutes: 0.5, back: 0.3 } },
  'Hip Thrust': { primary: 'glutes', secondary: { hamstrings: 0.4 } },
} as const;

