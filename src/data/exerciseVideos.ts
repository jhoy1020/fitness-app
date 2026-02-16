// Exercise Video Mapping
// Links to demonstration videos for exercises

// Using ExRx.net and similar resources for exercise demo images/descriptions
// In a production app, you'd host your own videos or use a fitness video API

export const EXERCISE_VIDEOS: Record<string, { 
  videoUrl?: string; 
  gifUrl?: string;
  description: string;
  cues: string[];
}> = {
  'Barbell Bench Press': {
    description: 'Lie on a flat bench, grip the bar slightly wider than shoulder width. Lower to chest and press up.',
    cues: ['Retract shoulder blades', 'Arch back slightly', 'Feet flat on floor', 'Lower to mid-chest', 'Press up and slightly back'],
  },
  'Squat': {
    description: 'Stand with feet shoulder-width apart, bar across upper back. Descend by bending hips and knees.',
    cues: ['Brace your core', 'Push knees out', 'Keep chest up', 'Depth to parallel or below', 'Drive through heels'],
  },
  'Deadlift': {
    description: 'Stand with feet hip-width, grip bar just outside legs. Lift by extending hips and knees together.',
    cues: ['Flat back position', 'Bar close to body', 'Push floor away', 'Lock out hips at top', 'Control descent'],
  },
  'Barbell Row': {
    description: 'Hinge at hips, grip bar shoulder width. Pull bar to lower chest/upper abdomen.',
    cues: ['Slight knee bend', 'Torso at 45-60 degrees', 'Lead with elbows', 'Squeeze shoulder blades', 'Control the negative'],
  },
  'Overhead Press': {
    description: 'Stand with bar at shoulders, press straight overhead while moving head back then forward.',
    cues: ['Tight core and glutes', 'Elbows slightly forward', 'Move head back for bar path', 'Lock out overhead', 'Control descent'],
  },
  'Lat Pulldown': {
    description: 'Grip bar wider than shoulders, pull to upper chest while keeping chest up.',
    cues: ['Lean back slightly', 'Pull elbows down and back', 'Squeeze lats at bottom', 'Full stretch at top', 'Control the negative'],
  },
  'Romanian Deadlift': {
    description: 'Hold bar at hips, push hips back while keeping legs mostly straight. Feel hamstring stretch.',
    cues: ['Soft knee bend', 'Push hips back', 'Bar slides down thighs', 'Feel hamstring stretch', 'Hip drive to stand'],
  },
  'Dumbbell Curl': {
    description: 'Hold dumbbells at sides, curl up by flexing elbows while keeping upper arms stationary.',
    cues: ['Elbows pinned to sides', 'Supinate as you curl', 'Squeeze at top', 'Control the descent', 'No swinging'],
  },
  'Tricep Pushdown': {
    description: 'Face cable machine, push bar down by extending elbows while keeping upper arms still.',
    cues: ['Elbows at sides', 'Full extension', 'Squeeze triceps', 'Control the return', 'Stay upright'],
  },
  'Leg Press': {
    description: 'Sit in machine, feet shoulder-width on platform. Lower by bending knees, then press up.',
    cues: ['Lower back pressed to pad', 'Dont let hips roll up', 'Push through whole foot', 'Dont lock knees at top', 'Full range of motion'],
  },
  'Hip Thrust': {
    description: 'Upper back on bench, barbell on hips. Drive hips up until body is straight.',
    cues: ['Chin tucked', 'Drive through heels', 'Squeeze glutes hard at top', 'Ribs down', 'Control descent'],
  },
  'Lateral Raise': {
    description: 'Hold dumbbells at sides, raise arms out to sides until parallel with ground.',
    cues: ['Slight elbow bend', 'Lead with elbows', 'Thumbs slightly down', 'Raise to shoulder height', 'Control the descent'],
  },
  'Face Pulls': {
    description: 'Set cable high, pull rope to face while externally rotating shoulders.',
    cues: ['Pull to forehead level', 'Rotate hands outward', 'Squeeze rear delts', 'Elbows high', 'Hold the contraction'],
  },
  'Plank': {
    description: 'Hold a straight body position supported on forearms and toes.',
    cues: ['Flat back', 'Tight core', 'Glutes squeezed', 'Dont let hips sag', 'Breathe steadily'],
  },
};

// Get exercise info including video/demo
export function getExerciseDemo(exerciseName: string) {
  return EXERCISE_VIDEOS[exerciseName] || {
    description: 'No demo available for this exercise.',
    cues: ['Maintain proper form', 'Control the movement', 'Use full range of motion'],
  };
}

export default EXERCISE_VIDEOS;
