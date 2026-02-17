// Cardio and Recovery Activities Library

import { CardioActivity, ActiveRecoveryActivity, CardioFinisher, CardioType, RecoveryActivityType, MuscleGroup, IntensityLevel } from '../types';

// ============================================
// CARDIO ACTIVITIES
// ============================================

export interface CardioTemplate {
  type: CardioType;
  name: string;
  durationMinutes: number;
  intensity: IntensityLevel;
  description: string;
  caloriesPerMinute: number;  // Approximate
  bestFor: string[];  // When this cardio is recommended
}

export const CARDIO_LIBRARY: CardioTemplate[] = [
  // Walking
  {
    type: 'walking',
    name: 'Easy Walk',
    durationMinutes: 20,
    intensity: 'low',
    description: 'Conversational pace, flat terrain',
    caloriesPerMinute: 4,
    bestFor: ['recovery', 'rest_day', 'post_leg_day'],
  },
  {
    type: 'walking',
    name: 'Incline Treadmill Walk',
    durationMinutes: 20,
    intensity: 'moderate',
    description: '10-15% incline, 2.5-3.5 mph',
    caloriesPerMinute: 8,
    bestFor: ['fat_loss', 'post_upper_body', 'finisher'],
  },
  {
    type: 'walking',
    name: 'Outdoor Power Walk',
    durationMinutes: 30,
    intensity: 'moderate',
    description: 'Brisk pace, arm swing, varied terrain',
    caloriesPerMinute: 6,
    bestFor: ['general_cardio', 'mental_health'],
  },
  
  // Running
  {
    type: 'running',
    name: 'Easy Jog',
    durationMinutes: 20,
    intensity: 'moderate',
    description: 'Conversational pace, can hold a conversation',
    caloriesPerMinute: 10,
    bestFor: ['cardio_base', 'active_recovery'],
  },
  {
    type: 'running',
    name: 'Tempo Run',
    durationMinutes: 25,
    intensity: 'moderate',
    description: 'Comfortably hard pace, steady effort',
    caloriesPerMinute: 12,
    bestFor: ['endurance', 'fat_loss'],
  },
  {
    type: 'running',
    name: 'Interval Sprints',
    durationMinutes: 15,
    intensity: 'high',
    description: '30s sprint / 90s walk, repeat 8x',
    caloriesPerMinute: 15,
    bestFor: ['conditioning', 'fat_loss', 'time_efficient'],
  },
  
  // Cycling
  {
    type: 'cycling',
    name: 'Easy Spin',
    durationMinutes: 20,
    intensity: 'low',
    description: 'Light resistance, 70-80 RPM',
    caloriesPerMinute: 6,
    bestFor: ['recovery', 'post_leg_day', 'warm_up'],
  },
  {
    type: 'cycling',
    name: 'Stationary Bike',
    durationMinutes: 25,
    intensity: 'moderate',
    description: 'Moderate resistance, 80-90 RPM',
    caloriesPerMinute: 9,
    bestFor: ['cardio_base', 'finisher'],
  },
  {
    type: 'cycling',
    name: 'Outdoor Cycling',
    durationMinutes: 45,
    intensity: 'moderate',
    description: 'Varied terrain, enjoyable pace',
    caloriesPerMinute: 8,
    bestFor: ['endurance', 'mental_health', 'weekend_activity'],
  },
  {
    type: 'cycling',
    name: 'Spin Class / Intervals',
    durationMinutes: 30,
    intensity: 'high',
    description: 'Hill climbs and sprints',
    caloriesPerMinute: 12,
    bestFor: ['conditioning', 'fat_loss'],
  },
  
  // Swimming
  {
    type: 'swimming',
    name: 'Easy Laps',
    durationMinutes: 20,
    intensity: 'low',
    description: 'Any stroke, relaxed pace',
    caloriesPerMinute: 7,
    bestFor: ['recovery', 'joint_friendly', 'full_body'],
  },
  {
    type: 'swimming',
    name: 'Lap Swimming',
    durationMinutes: 30,
    intensity: 'moderate',
    description: 'Continuous laps, steady effort',
    caloriesPerMinute: 10,
    bestFor: ['full_body_cardio', 'low_impact'],
  },
  {
    type: 'swimming',
    name: 'Pool HIIT',
    durationMinutes: 20,
    intensity: 'high',
    description: 'Sprint laps with rest intervals',
    caloriesPerMinute: 12,
    bestFor: ['conditioning', 'time_efficient'],
  },
  
  // Rowing
  {
    type: 'rowing',
    name: 'Easy Row',
    durationMinutes: 15,
    intensity: 'low',
    description: 'Light resistance, focus on form',
    caloriesPerMinute: 7,
    bestFor: ['warm_up', 'cool_down', 'recovery'],
  },
  {
    type: 'rowing',
    name: 'Steady State Row',
    durationMinutes: 20,
    intensity: 'moderate',
    description: '22-26 strokes per minute, consistent pace',
    caloriesPerMinute: 10,
    bestFor: ['cardio_base', 'full_body'],
  },
  {
    type: 'rowing',
    name: 'Rowing Intervals',
    durationMinutes: 15,
    intensity: 'high',
    description: '500m sprint / 1 min rest, repeat 5x',
    caloriesPerMinute: 14,
    bestFor: ['conditioning', 'time_efficient'],
  },
  
  // Elliptical
  {
    type: 'elliptical',
    name: 'Easy Elliptical',
    durationMinutes: 20,
    intensity: 'low',
    description: 'Low resistance, comfortable stride',
    caloriesPerMinute: 6,
    bestFor: ['recovery', 'joint_friendly'],
  },
  {
    type: 'elliptical',
    name: 'Elliptical Cardio',
    durationMinutes: 25,
    intensity: 'moderate',
    description: 'Moderate resistance, varied incline',
    caloriesPerMinute: 9,
    bestFor: ['cardio_base', 'low_impact'],
  },
  
  // Stair Climber
  {
    type: 'stair_climber',
    name: 'Stair Climber',
    durationMinutes: 15,
    intensity: 'moderate',
    description: 'Steady pace, no hands on rails',
    caloriesPerMinute: 10,
    bestFor: ['glute_activation', 'leg_conditioning'],
  },
  {
    type: 'stair_climber',
    name: 'Stair Intervals',
    durationMinutes: 12,
    intensity: 'high',
    description: '1 min fast / 1 min slow, repeat 6x',
    caloriesPerMinute: 13,
    bestFor: ['conditioning', 'leg_burn'],
  },
  
  // HIIT
  {
    type: 'hiit',
    name: 'Bodyweight HIIT',
    durationMinutes: 15,
    intensity: 'high',
    description: 'Burpees, jump squats, mountain climbers - 40s work / 20s rest',
    caloriesPerMinute: 14,
    bestFor: ['time_efficient', 'no_equipment', 'fat_loss'],
  },
  {
    type: 'hiit',
    name: 'HIIT Circuit',
    durationMinutes: 20,
    intensity: 'high',
    description: '5 exercises, 4 rounds, minimal rest',
    caloriesPerMinute: 13,
    bestFor: ['conditioning', 'fat_loss'],
  },
  {
    type: 'hiit',
    name: 'Tabata',
    durationMinutes: 4,
    intensity: 'high',
    description: '20s max effort / 10s rest, 8 rounds',
    caloriesPerMinute: 15,
    bestFor: ['finisher', 'time_efficient'],
  },
  
  // Jump Rope
  {
    type: 'jump_rope',
    name: 'Jump Rope Basics',
    durationMinutes: 10,
    intensity: 'moderate',
    description: 'Single jumps, steady rhythm',
    caloriesPerMinute: 11,
    bestFor: ['warm_up', 'coordination', 'conditioning'],
  },
  {
    type: 'jump_rope',
    name: 'Jump Rope Intervals',
    durationMinutes: 15,
    intensity: 'high',
    description: '1 min jump / 30s rest, varied styles',
    caloriesPerMinute: 14,
    bestFor: ['finisher', 'conditioning', 'time_efficient'],
  },
];

// ============================================
// ACTIVE RECOVERY ACTIVITIES
// ============================================

export interface RecoveryTemplate {
  type: RecoveryActivityType;
  name: string;
  durationMinutes: number;
  description: string;
  targetAreas: MuscleGroup[];
  bestAfter: MuscleGroup[];  // Best after training these muscles
  instructions?: string[];
}

export const RECOVERY_LIBRARY: RecoveryTemplate[] = [
  // Stretching
  {
    type: 'stretching',
    name: 'Full Body Stretch',
    durationMinutes: 15,
    description: 'Complete stretching routine hitting all major muscle groups',
    targetAreas: ['full_body'],
    bestAfter: ['full_body'],
    instructions: [
      'Hold each stretch 30-60 seconds',
      'Breathe deeply and relax into each stretch',
      'Never bounce or force a stretch',
    ],
  },
  {
    type: 'stretching',
    name: 'Upper Body Stretch',
    durationMinutes: 10,
    description: 'Focus on chest, shoulders, back, and arms',
    targetAreas: ['chest', 'back', 'shoulders', 'biceps', 'triceps'],
    bestAfter: ['chest', 'back', 'shoulders'],
  },
  {
    type: 'stretching',
    name: 'Lower Body Stretch',
    durationMinutes: 10,
    description: 'Focus on quads, hamstrings, glutes, and calves',
    targetAreas: ['quadriceps', 'hamstrings', 'glutes', 'calves'],
    bestAfter: ['quadriceps', 'hamstrings', 'glutes'],
  },
  {
    type: 'stretching',
    name: 'Hip Opener Routine',
    durationMinutes: 12,
    description: 'Deep hip stretches for mobility',
    targetAreas: ['glutes', 'quadriceps', 'hamstrings'],
    bestAfter: ['quadriceps', 'glutes'],
  },
  
  // Foam Rolling
  {
    type: 'foam_rolling',
    name: 'Full Body Roll',
    durationMinutes: 15,
    description: 'Roll all major muscle groups systematically',
    targetAreas: ['full_body'],
    bestAfter: ['full_body'],
    instructions: [
      'Spend 60-90 seconds per muscle group',
      'Pause on tender spots for 30 seconds',
      'Roll slowly and controlled',
    ],
  },
  {
    type: 'foam_rolling',
    name: 'Upper Body Roll',
    durationMinutes: 8,
    description: 'Focus on lats, upper back, and chest',
    targetAreas: ['back', 'chest', 'shoulders'],
    bestAfter: ['back', 'chest'],
  },
  {
    type: 'foam_rolling',
    name: 'Lower Body Roll',
    durationMinutes: 10,
    description: 'Focus on quads, hamstrings, IT band, and calves',
    targetAreas: ['quadriceps', 'hamstrings', 'glutes', 'calves'],
    bestAfter: ['quadriceps', 'hamstrings', 'glutes'],
  },
  
  // Yoga
  {
    type: 'yoga',
    name: 'Gentle Yoga Flow',
    durationMinutes: 30,
    description: 'Easy sun salutations and basic poses',
    targetAreas: ['full_body'],
    bestAfter: ['full_body'],
  },
  {
    type: 'yoga',
    name: 'Yoga for Athletes',
    durationMinutes: 45,
    description: 'Focus on flexibility and recovery for strength athletes',
    targetAreas: ['full_body'],
    bestAfter: ['full_body'],
  },
  {
    type: 'yoga',
    name: 'Yin Yoga',
    durationMinutes: 45,
    description: 'Long holds (3-5 min) targeting deep connective tissue',
    targetAreas: ['full_body'],
    bestAfter: ['full_body'],
  },
  
  // Mobility Work
  {
    type: 'mobility_work',
    name: 'Hip Mobility Routine',
    durationMinutes: 15,
    description: '90-90 stretches, hip circles, pigeon variations',
    targetAreas: ['glutes', 'quadriceps', 'hamstrings'],
    bestAfter: ['quadriceps', 'glutes', 'hamstrings'],
  },
  {
    type: 'mobility_work',
    name: 'Shoulder Mobility',
    durationMinutes: 10,
    description: 'Band work, wall slides, and rotator cuff exercises',
    targetAreas: ['shoulders', 'back', 'chest'],
    bestAfter: ['shoulders', 'chest', 'back'],
  },
  {
    type: 'mobility_work',
    name: 'Thoracic Spine Mobility',
    durationMinutes: 10,
    description: 'Foam roller work, rotations, and extensions',
    targetAreas: ['back', 'core'],
    bestAfter: ['back', 'chest'],
  },
  {
    type: 'mobility_work',
    name: 'Ankle Mobility',
    durationMinutes: 8,
    description: 'Calf stretches, ankle circles, and wall drills',
    targetAreas: ['calves'],
    bestAfter: ['quadriceps', 'calves'],
  },
  
  // Light Walking
  {
    type: 'light_walking',
    name: 'Recovery Walk',
    durationMinutes: 20,
    description: 'Easy pace, flat terrain, focus on relaxation',
    targetAreas: ['full_body'],
    bestAfter: ['full_body', 'quadriceps', 'hamstrings'],
  },
  {
    type: 'light_walking',
    name: 'Nature Walk',
    durationMinutes: 30,
    description: 'Outdoor walking for mental and physical recovery',
    targetAreas: ['full_body'],
    bestAfter: ['full_body'],
  },
  
  // Swimming
  {
    type: 'swimming',
    name: 'Easy Pool Session',
    durationMinutes: 20,
    description: 'Light laps or water walking',
    targetAreas: ['full_body'],
    bestAfter: ['full_body'],
  },
  
  // Meditation
  {
    type: 'meditation',
    name: 'Recovery Meditation',
    durationMinutes: 10,
    description: 'Guided breathing and body scan',
    targetAreas: ['full_body'],
    bestAfter: ['full_body'],
  },
  {
    type: 'meditation',
    name: 'Deep Breathing',
    durationMinutes: 5,
    description: 'Box breathing or 4-7-8 technique',
    targetAreas: ['full_body'],
    bestAfter: ['full_body'],
  },
];

// ============================================
// CARDIO FINISHERS
// ============================================

export const CARDIO_FINISHERS: CardioFinisher[] = [
  {
    type: 'walking',
    name: '10 min Incline Walk',
    durationMinutes: 10,
    intensity: 'low',
    notes: 'Great after any workout. 10-12% incline, 3.0 mph',
  },
  {
    type: 'walking',
    name: '5 min Cool Down Walk',
    durationMinutes: 5,
    intensity: 'low',
    notes: 'Easy pace to bring heart rate down',
  },
  {
    type: 'cycling',
    name: '10 min Easy Bike',
    durationMinutes: 10,
    intensity: 'low',
    notes: 'Perfect after upper body - minimal leg impact',
  },
  {
    type: 'rowing',
    name: '5 min Row',
    durationMinutes: 5,
    intensity: 'moderate',
    notes: 'Full body finisher, focus on form',
  },
  {
    type: 'stair_climber',
    name: '10 min Stairs',
    durationMinutes: 10,
    intensity: 'moderate',
    notes: 'Great after upper body days',
  },
  {
    type: 'hiit',
    name: '5 min HIIT Finisher',
    durationMinutes: 5,
    intensity: 'high',
    notes: 'Burpees, jump squats, mountain climbers - 30s each, 2 rounds',
  },
  {
    type: 'jump_rope',
    name: '5 min Jump Rope',
    durationMinutes: 5,
    intensity: 'moderate',
    notes: 'Quick conditioning finisher',
  },
  {
    type: 'hiit',
    name: 'Tabata Finisher',
    durationMinutes: 4,
    intensity: 'high',
    notes: '20s max effort / 10s rest × 8. Pick one exercise.',
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get cardio activities suitable for a specific purpose
 */
export function getCardioForPurpose(purpose: string): CardioTemplate[] {
  return CARDIO_LIBRARY.filter(c => c.bestFor.includes(purpose));
}

/**
 * Get recovery activities best suited for specific muscle groups
 */
export function getRecoveryForMuscles(muscles: MuscleGroup[]): RecoveryTemplate[] {
  return RECOVERY_LIBRARY.filter(r => 
    r.bestAfter.some(m => muscles.includes(m)) || 
    r.bestAfter.includes('full_body')
  );
}

/**
 * Get appropriate finisher based on workout type
 */
export function getFinisherSuggestions(workoutType: 'upper' | 'lower' | 'full'): CardioFinisher[] {
  if (workoutType === 'upper') {
    // After upper body, prefer low-leg-impact options
    return CARDIO_FINISHERS.filter(f => 
      ['walking', 'cycling', 'rowing'].includes(f.type)
    );
  } else if (workoutType === 'lower') {
    // After legs, prefer upper body or very low impact
    return CARDIO_FINISHERS.filter(f => 
      ['walking', 'rowing'].includes(f.type) && f.intensity === 'low'
    );
  }
  return CARDIO_FINISHERS;
}

export default {
  CARDIO_LIBRARY,
  RECOVERY_LIBRARY,
  CARDIO_FINISHERS,
  getCardioForPurpose,
  getRecoveryForMuscles,
  getFinisherSuggestions,
};
