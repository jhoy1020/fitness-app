// Recovery Engine - Smart active recovery suggestions based on trained muscle groups

import { MuscleGroup, RecoverySuggestion, RecoveryActivityType } from '../../types';

// Recovery suggestions mapped by muscle group
const RECOVERY_MAP: Record<MuscleGroup, RecoverySuggestion[]> = {
  chest: [
    { 
      activity: 'stretching', 
      name: 'Chest Door Stretch', 
      durationMinutes: 5, 
      description: 'Stand in doorway, arms at 90°, lean forward gently',
      targetMuscles: ['chest', 'shoulders'], 
      rationale: 'Opens tight pecs after pressing movements' 
    },
    { 
      activity: 'foam_rolling', 
      name: 'Thoracic Spine Roll', 
      durationMinutes: 5, 
      description: 'Roll upper back on foam roller, arms crossed',
      targetMuscles: ['back', 'chest'], 
      rationale: 'Improves posture and shoulder mobility' 
    },
    { 
      activity: 'mobility_work', 
      name: 'Shoulder Circles', 
      durationMinutes: 3, 
      description: 'Large arm circles, both directions, 10 each',
      targetMuscles: ['shoulders'], 
      rationale: 'Maintains shoulder ROM after chest work' 
    },
  ],
  
  back: [
    { 
      activity: 'stretching', 
      name: 'Lat Stretch', 
      durationMinutes: 5, 
      description: 'Hang from bar or reach overhead and lean to each side',
      targetMuscles: ['back'], 
      rationale: 'Lengthens lats after rowing/pulling movements' 
    },
    { 
      activity: 'foam_rolling', 
      name: 'Lat Foam Roll', 
      durationMinutes: 5, 
      description: 'Roll lats on foam roller while side-lying',
      targetMuscles: ['back'], 
      rationale: 'Releases lat tension and trigger points' 
    },
    { 
      activity: 'yoga', 
      name: 'Cat-Cow Stretch', 
      durationMinutes: 5, 
      description: 'Flow between arched and rounded spine, 10 reps slow',
      targetMuscles: ['back', 'core'], 
      rationale: 'Mobilizes entire spine after heavy pulling' 
    },
  ],
  
  shoulders: [
    { 
      activity: 'mobility_work', 
      name: 'Band Pull-Aparts', 
      durationMinutes: 5, 
      description: 'Light resistance band, 20 reps slow and controlled',
      targetMuscles: ['shoulders', 'back'], 
      rationale: 'Promotes rotator cuff blood flow and recovery' 
    },
    { 
      activity: 'stretching', 
      name: 'Cross-Body Shoulder Stretch', 
      durationMinutes: 3, 
      description: 'Pull arm across chest, hold 30 seconds each side',
      targetMuscles: ['shoulders'], 
      rationale: 'Stretches posterior deltoid and rotator cuff' 
    },
    { 
      activity: 'foam_rolling', 
      name: 'Upper Trap Roll', 
      durationMinutes: 5, 
      description: 'Roll area between shoulder blades with ball or roller',
      targetMuscles: ['back', 'shoulders'], 
      rationale: 'Reduces upper trap tension from overhead work' 
    },
  ],
  
  biceps: [
    { 
      activity: 'stretching', 
      name: 'Bicep Wall Stretch', 
      durationMinutes: 3, 
      description: 'Place palm on wall, rotate body away, hold 30s each',
      targetMuscles: ['biceps', 'chest'], 
      rationale: 'Lengthens biceps after curling movements' 
    },
    { 
      activity: 'foam_rolling', 
      name: 'Forearm Roll', 
      durationMinutes: 3, 
      description: 'Roll forearms on foam roller or with ball',
      targetMuscles: ['forearms', 'biceps'], 
      rationale: 'Releases tension from gripping during curls' 
    },
    { 
      activity: 'light_walking', 
      name: 'Easy Walk', 
      durationMinutes: 15, 
      description: 'Light walk to promote blood flow',
      targetMuscles: ['full_body'], 
      rationale: 'General circulation aids arm recovery' 
    },
  ],
  
  triceps: [
    { 
      activity: 'stretching', 
      name: 'Overhead Tricep Stretch', 
      durationMinutes: 3, 
      description: 'Reach behind head, pull elbow with other hand, 30s each',
      targetMuscles: ['triceps', 'shoulders'], 
      rationale: 'Stretches all three tricep heads' 
    },
    { 
      activity: 'foam_rolling', 
      name: 'Tricep Roll', 
      durationMinutes: 3, 
      description: 'Roll back of arm on foam roller',
      targetMuscles: ['triceps'], 
      rationale: 'Releases tricep tension from pressing' 
    },
    { 
      activity: 'mobility_work', 
      name: 'Arm Circles', 
      durationMinutes: 3, 
      description: 'Small to large circles, both directions',
      targetMuscles: ['shoulders', 'triceps'], 
      rationale: 'Promotes blood flow to arms' 
    },
  ],
  
  forearms: [
    { 
      activity: 'stretching', 
      name: 'Wrist Flexor Stretch', 
      durationMinutes: 3, 
      description: 'Extend arm, pull fingers back with other hand, 30s each',
      targetMuscles: ['forearms'], 
      rationale: 'Relieves forearm tension from gripping' 
    },
    { 
      activity: 'stretching', 
      name: 'Wrist Extensor Stretch', 
      durationMinutes: 3, 
      description: 'Extend arm, press back of hand down, 30s each',
      targetMuscles: ['forearms'], 
      rationale: 'Stretches top of forearm' 
    },
    { 
      activity: 'foam_rolling', 
      name: 'Forearm Roll', 
      durationMinutes: 3, 
      description: 'Roll forearms on roller or with lacrosse ball',
      targetMuscles: ['forearms'], 
      rationale: 'Releases grip fatigue and tension' 
    },
  ],
  
  quadriceps: [
    { 
      activity: 'light_walking', 
      name: 'Easy Walk', 
      durationMinutes: 20, 
      description: 'Flat terrain, conversational pace, no incline',
      targetMuscles: ['quadriceps', 'hamstrings'], 
      rationale: 'Increases blood flow without loading muscles' 
    },
    { 
      activity: 'foam_rolling', 
      name: 'Quad Roll', 
      durationMinutes: 5, 
      description: 'Roll front of thighs, pause 30s on tight spots',
      targetMuscles: ['quadriceps'], 
      rationale: 'Releases quad and IT band tension' 
    },
    { 
      activity: 'stretching', 
      name: 'Hip Flexor Stretch', 
      durationMinutes: 5, 
      description: 'Half-kneeling lunge, squeeze glute, 60s each side',
      targetMuscles: ['quadriceps', 'glutes'], 
      rationale: 'Counteracts hip flexor tightness from squats' 
    },
    { 
      activity: 'yoga', 
      name: 'Couch Stretch', 
      durationMinutes: 5, 
      description: 'Back foot on wall/couch, lunge position, 60s each',
      targetMuscles: ['quadriceps'], 
      rationale: 'Deep quad and hip flexor stretch' 
    },
  ],
  
  hamstrings: [
    { 
      activity: 'stretching', 
      name: 'Standing Hamstring Stretch', 
      durationMinutes: 5, 
      description: 'Foot elevated on bench, hinge forward at hips',
      targetMuscles: ['hamstrings'], 
      rationale: 'Gentle lengthening of posterior chain' 
    },
    { 
      activity: 'yoga', 
      name: 'Downward Dog', 
      durationMinutes: 5, 
      description: 'Hold inverted V position, pedal feet gently',
      targetMuscles: ['hamstrings', 'calves'], 
      rationale: 'Full posterior chain stretch' 
    },
    { 
      activity: 'foam_rolling', 
      name: 'Hamstring Roll', 
      durationMinutes: 5, 
      description: 'Sit on roller, roll back of thighs, cross legs for more pressure',
      targetMuscles: ['hamstrings'], 
      rationale: 'Releases hamstring tension from hip hinges' 
    },
    { 
      activity: 'light_walking', 
      name: 'Gentle Walk', 
      durationMinutes: 15, 
      description: 'Easy pace, focus on full range of motion',
      targetMuscles: ['hamstrings', 'glutes'], 
      rationale: 'Promotes blood flow without loading' 
    },
  ],
  
  glutes: [
    { 
      activity: 'foam_rolling', 
      name: 'Glute Roll', 
      durationMinutes: 5, 
      description: 'Sit on roller, cross ankle over knee, roll glute',
      targetMuscles: ['glutes'], 
      rationale: 'Releases glute and piriformis tension' 
    },
    { 
      activity: 'stretching', 
      name: 'Pigeon Pose', 
      durationMinutes: 5, 
      description: 'Yoga pigeon position, 90 seconds each side',
      targetMuscles: ['glutes', 'hamstrings'], 
      rationale: 'Deep hip opener and glute stretch' 
    },
    { 
      activity: 'mobility_work', 
      name: '90-90 Hip Stretch', 
      durationMinutes: 5, 
      description: 'Both legs at 90°, rotate between sides smoothly',
      targetMuscles: ['glutes'], 
      rationale: 'Improves hip internal and external rotation' 
    },
    { 
      activity: 'light_walking', 
      name: 'Hip-Focus Walk', 
      durationMinutes: 15, 
      description: 'Walk with focus on full hip extension each step',
      targetMuscles: ['glutes', 'hamstrings'], 
      rationale: 'Gentle glute activation promotes recovery' 
    },
  ],
  
  calves: [
    { 
      activity: 'stretching', 
      name: 'Standing Calf Stretch', 
      durationMinutes: 3, 
      description: 'Wall push, back leg straight, heel down, 30s each',
      targetMuscles: ['calves'], 
      rationale: 'Stretches gastrocnemius' 
    },
    { 
      activity: 'stretching', 
      name: 'Bent Knee Calf Stretch', 
      durationMinutes: 3, 
      description: 'Same as above but back knee bent, 30s each',
      targetMuscles: ['calves'], 
      rationale: 'Targets soleus muscle' 
    },
    { 
      activity: 'foam_rolling', 
      name: 'Calf Roll', 
      durationMinutes: 3, 
      description: 'Roll calves on foam roller, cross legs for pressure',
      targetMuscles: ['calves'], 
      rationale: 'Releases calf tension from raises and jumps' 
    },
  ],
  
  core: [
    { 
      activity: 'stretching', 
      name: 'Cobra Stretch', 
      durationMinutes: 3, 
      description: 'Lie face down, push up into back extension',
      targetMuscles: ['core'], 
      rationale: 'Stretches abs after flexion work' 
    },
    { 
      activity: 'yoga', 
      name: 'Seated Twist', 
      durationMinutes: 3, 
      description: 'Seated spinal rotation, 30s each side',
      targetMuscles: ['core', 'back'], 
      rationale: 'Releases obliques and spinal muscles' 
    },
    { 
      activity: 'stretching', 
      name: 'Child\'s Pose', 
      durationMinutes: 3, 
      description: 'Kneel, sit back on heels, reach arms forward',
      targetMuscles: ['core', 'back'], 
      rationale: 'Gentle stretch for entire torso' 
    },
  ],
  
  full_body: [
    { 
      activity: 'swimming', 
      name: 'Easy Swim', 
      durationMinutes: 20, 
      description: 'Light laps, any stroke, focus on relaxation',
      targetMuscles: ['full_body'], 
      rationale: 'Low-impact full body movement, reduces inflammation' 
    },
    { 
      activity: 'yoga', 
      name: 'Gentle Yoga Flow', 
      durationMinutes: 30, 
      description: 'Sun salutations at easy pace, hold poses longer',
      targetMuscles: ['full_body'], 
      rationale: 'Full body stretch and mobility work' 
    },
    { 
      activity: 'light_walking', 
      name: 'Nature Walk', 
      durationMinutes: 30, 
      description: 'Easy outdoor walk, flat terrain preferred',
      targetMuscles: ['full_body'], 
      rationale: 'Mental recovery and gentle movement' 
    },
    { 
      activity: 'foam_rolling', 
      name: 'Full Body Roll Session', 
      durationMinutes: 15, 
      description: 'Roll all major muscle groups: back, glutes, quads, calves',
      targetMuscles: ['full_body'], 
      rationale: 'Systematic release of full body tension' 
    },
    { 
      activity: 'meditation', 
      name: 'Recovery Meditation', 
      durationMinutes: 10, 
      description: 'Guided breathing and body scan meditation',
      targetMuscles: ['full_body'], 
      rationale: 'CNS recovery and stress reduction' 
    },
  ],
};

/**
 * Get recovery suggestions based on muscles trained in the previous workout
 * @param trainedMuscles - Array of muscle groups that were trained
 * @param maxSuggestions - Maximum number of suggestions to return (default 5)
 * @returns Array of recovery suggestions prioritized by relevance
 */
export function getRecoverySuggestions(
  trainedMuscles: MuscleGroup[], 
  maxSuggestions: number = 5
): RecoverySuggestion[] {
  const suggestions: RecoverySuggestion[] = [];
  
  // If no specific muscles, use full body suggestions
  if (trainedMuscles.length === 0) {
    return RECOVERY_MAP.full_body.slice(0, maxSuggestions);
  }
  
  // Gather suggestions for all trained muscles
  trainedMuscles.forEach(muscle => {
    const muscleRecovery = RECOVERY_MAP[muscle] || RECOVERY_MAP.full_body;
    suggestions.push(...muscleRecovery);
  });
  
  // Dedupe by name
  const unique = suggestions.filter((s, i, arr) => 
    arr.findIndex(x => x.name === s.name) === i
  );
  
  // Prioritize variety of activities
  const byActivity: Map<RecoveryActivityType, RecoverySuggestion[]> = new Map();
  unique.forEach(s => {
    const existing = byActivity.get(s.activity) || [];
    byActivity.set(s.activity, [...existing, s]);
  });
  
  // Take one from each activity type first, then fill remaining
  const prioritized: RecoverySuggestion[] = [];
  byActivity.forEach((actSuggestions) => {
    if (prioritized.length < maxSuggestions && actSuggestions.length > 0) {
      prioritized.push(actSuggestions[0]);
    }
  });
  
  // Fill remaining slots
  unique.forEach(s => {
    if (prioritized.length < maxSuggestions && !prioritized.includes(s)) {
      prioritized.push(s);
    }
  });
  
  return prioritized.slice(0, maxSuggestions);
}

/**
 * Get a quick recovery routine description
 * @param trainedMuscles - Muscles trained in previous workout
 * @returns A formatted string describing the recommended recovery
 */
export function getRecoveryRoutineDescription(trainedMuscles: MuscleGroup[]): string {
  const suggestions = getRecoverySuggestions(trainedMuscles, 3);
  
  if (suggestions.length === 0) {
    return 'Take it easy today. Light walking or gentle stretching recommended.';
  }
  
  const totalMinutes = suggestions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const activities = suggestions.map(s => s.name).join(', ');
  
  return `${totalMinutes} min suggested: ${activities}`;
}

/**
 * Determine if user should take a rest day based on recent training
 * @param consecutiveWorkoutDays - Number of workout days in a row
 * @param totalWeeklyVolume - Volume load this week
 * @returns Object with recommendation and reasoning
 */
export function shouldTakeRestDay(
  consecutiveWorkoutDays: number,
  totalWeeklyVolume?: number
): { shouldRest: boolean; reason: string } {
  if (consecutiveWorkoutDays >= 6) {
    return { 
      shouldRest: true, 
      reason: 'You\'ve trained 6+ days in a row. Rest is essential for recovery and growth.' 
    };
  }
  
  if (consecutiveWorkoutDays >= 4) {
    return { 
      shouldRest: false, 
      reason: 'Consider active recovery today. You\'ve been training consistently.' 
    };
  }
  
  return { 
    shouldRest: false, 
    reason: 'You\'re well-recovered. Good to train!' 
  };
}

export default {
  getRecoverySuggestions,
  getRecoveryRoutineDescription,
  shouldTakeRestDay,
};
