import {
  initDatabase,
  getAllExercises,
  getExerciseById,
  getExercisesByMuscleGroup,
  createExercise,
  updateExercise,
  deleteExercise,
  seedExercises,
  getAllWorkouts,
  getWorkoutById,
  getRecentWorkouts,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  getSetsByWorkoutId,
  getSetsByExerciseId,
  createWorkoutSet,
  updateWorkoutSet,
  deleteWorkoutSet,
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getTemplateExercises,
  createTemplateExercise,
  updateTemplateExercise,
  deleteTemplateExercise,
  getUserProfile,
  saveUserProfile,
  getAllExerciseGoals,
  getExerciseGoal,
  saveExerciseGoal,
  deleteExerciseGoal,
  getAllData,
  importData,
  clearAllData,
} from '../database';

// Mock dependencies
jest.mock('react-native', () => ({
  Platform: { OS: 'web' },
}));

jest.mock('../../../utils/storage', () => ({
  Storage: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../../../utils', () => ({
  generateUUID: jest.fn(() => `uuid-${Date.now()}-${Math.random()}`),
  toISODate: jest.fn(() => new Date().toISOString()),
}));

// Helper to create valid exercise data
const makeExercise = (overrides: Partial<{ name: string; muscleGroup: string; equipment: string }> = {}) => ({
  name: overrides.name || 'Test Exercise',
  muscleGroup: (overrides.muscleGroup || 'chest') as any,
  equipment: (overrides.equipment || 'barbell') as any,
  defaultRestSeconds: 90,
  isCustom: false,
});

// Helper to create valid workout data
const makeWorkout = (overrides: Partial<{ name: string; date: string; duration: number }> = {}) => ({
  name: overrides.name || 'Test Workout',
  date: overrides.date || '2024-01-15',
  durationMinutes: overrides.duration || 60,
});

// Helper to create valid workout set data
const makeWorkoutSet = (workoutId: string, overrides: Partial<{ exerciseId: string; setNumber: number; weight: number; reps: number; rpe: number }> = {}) => ({
  workoutId,
  exerciseId: overrides.exerciseId || 'ex1',
  setNumber: overrides.setNumber || 1,
  weight: overrides.weight || 100,
  weightUnit: 'lbs' as const,
  reps: overrides.reps || 10,
  rpe: overrides.rpe,
  isWarmup: false,
});

// Helper to create valid user profile
const makeUserProfile = (overrides: Partial<{ weight: number }> = {}) => ({
  weight: overrides.weight || 80,
  weightUnit: 'kg' as const,
  height: 180,
  heightUnit: 'cm' as const,
  age: 30,
  gender: 'male' as const,
  activityLevel: 'moderate' as const,
  goalType: 'maintain' as const,
});

// Helper to create valid exercise goal
const makeExerciseGoal = (exerciseId: string, overrides: Partial<{ current1RM: number; target1RM: number }> = {}) => ({
  exerciseId,
  current1RM: overrides.current1RM || 100,
  target1RM: overrides.target1RM || 120,
});

describe('Database Service', () => {
  beforeEach(async () => {
    await clearAllData();
  });

  describe('module exports', () => {
    it('exports initDatabase', () => {
      expect(typeof initDatabase).toBe('function');
    });

    it('exports exercise functions', () => {
      expect(typeof getAllExercises).toBe('function');
      expect(typeof getExerciseById).toBe('function');
      expect(typeof getExercisesByMuscleGroup).toBe('function');
      expect(typeof createExercise).toBe('function');
      expect(typeof updateExercise).toBe('function');
      expect(typeof deleteExercise).toBe('function');
      expect(typeof seedExercises).toBe('function');
    });

    it('exports workout functions', () => {
      expect(typeof getAllWorkouts).toBe('function');
      expect(typeof getWorkoutById).toBe('function');
      expect(typeof getRecentWorkouts).toBe('function');
      expect(typeof createWorkout).toBe('function');
      expect(typeof updateWorkout).toBe('function');
      expect(typeof deleteWorkout).toBe('function');
    });

    it('exports workout set functions', () => {
      expect(typeof getSetsByWorkoutId).toBe('function');
      expect(typeof getSetsByExerciseId).toBe('function');
      expect(typeof createWorkoutSet).toBe('function');
      expect(typeof updateWorkoutSet).toBe('function');
      expect(typeof deleteWorkoutSet).toBe('function');
    });

    it('exports template functions', () => {
      expect(typeof getAllTemplates).toBe('function');
      expect(typeof getTemplateById).toBe('function');
      expect(typeof createTemplate).toBe('function');
      expect(typeof updateTemplate).toBe('function');
      expect(typeof deleteTemplate).toBe('function');
    });

    it('exports template exercise functions', () => {
      expect(typeof getTemplateExercises).toBe('function');
      expect(typeof createTemplateExercise).toBe('function');
      expect(typeof updateTemplateExercise).toBe('function');
      expect(typeof deleteTemplateExercise).toBe('function');
    });

    it('exports user profile functions', () => {
      expect(typeof getUserProfile).toBe('function');
      expect(typeof saveUserProfile).toBe('function');
    });

    it('exports exercise goal functions', () => {
      expect(typeof getAllExerciseGoals).toBe('function');
      expect(typeof getExerciseGoal).toBe('function');
      expect(typeof saveExerciseGoal).toBe('function');
      expect(typeof deleteExerciseGoal).toBe('function');
    });

    it('exports data management functions', () => {
      expect(typeof getAllData).toBe('function');
      expect(typeof importData).toBe('function');
      expect(typeof clearAllData).toBe('function');
    });
  });

  describe('Exercise CRUD', () => {
    it('creates and retrieves an exercise', async () => {
      const exercise = await createExercise(makeExercise({ name: 'Bench Press' }));

      expect(exercise.id).toBeDefined();
      expect(exercise.name).toBe('Bench Press');
      expect(exercise.muscleGroup).toBe('chest');

      const retrieved = await getExerciseById(exercise.id);
      expect(retrieved).toEqual(exercise);
    });

    it('gets all exercises', async () => {
      await createExercise(makeExercise({ name: 'Ex1' }));
      await createExercise(makeExercise({ name: 'Ex2', muscleGroup: 'back' }));

      const exercises = await getAllExercises();
      expect(exercises.length).toBe(2);
    });

    it('gets exercises by muscle group', async () => {
      await createExercise(makeExercise({ name: 'Ex1', muscleGroup: 'chest' }));
      await createExercise(makeExercise({ name: 'Ex2', muscleGroup: 'chest' }));
      await createExercise(makeExercise({ name: 'Ex3', muscleGroup: 'back' }));

      const chestExercises = await getExercisesByMuscleGroup('chest');
      expect(chestExercises.length).toBe(2);
    });

    it('updates an exercise', async () => {
      const exercise = await createExercise(makeExercise({ name: 'Old Name' }));

      const updated = await updateExercise(exercise.id, { name: 'New Name' });
      expect(updated?.name).toBe('New Name');
    });

    it('returns null when updating non-existent exercise', async () => {
      const result = await updateExercise('nonexistent', { name: 'Test' });
      expect(result).toBeNull();
    });

    it('deletes an exercise', async () => {
      const exercise = await createExercise(makeExercise({ name: 'To Delete' }));

      const deleted = await deleteExercise(exercise.id);
      expect(deleted).toBe(true);

      const retrieved = await getExerciseById(exercise.id);
      expect(retrieved).toBeNull();
    });

    it('returns false when deleting non-existent exercise', async () => {
      const result = await deleteExercise('nonexistent');
      expect(result).toBe(false);
    });

    it('seeds exercises without duplicates', async () => {
      await seedExercises([
        makeExercise({ name: 'Squat', muscleGroup: 'quadriceps' }),
      ]);
      await seedExercises([
        makeExercise({ name: 'Squat', muscleGroup: 'quadriceps' }),
        makeExercise({ name: 'Deadlift', muscleGroup: 'back' }),
      ]);

      const exercises = await getAllExercises();
      expect(exercises.length).toBe(2);
    });
  });

  describe('Workout CRUD', () => {
    it('creates and retrieves a workout', async () => {
      const workout = await createWorkout(makeWorkout({ name: 'Push Day' }));

      expect(workout.id).toBeDefined();
      expect(workout.name).toBe('Push Day');

      const retrieved = await getWorkoutById(workout.id);
      expect(retrieved).toEqual(workout);
    });

    it('gets recent workouts', async () => {
      for (let i = 0; i < 15; i++) {
        await createWorkout(makeWorkout({
          name: `Workout ${i}`,
          date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        }));
      }

      const recent = await getRecentWorkouts(5);
      expect(recent.length).toBe(5);
    });

    it('deletes workout and associated sets', async () => {
      const workout = await createWorkout(makeWorkout({ name: 'Test Workout' }));

      await createWorkoutSet(makeWorkoutSet(workout.id));

      await deleteWorkout(workout.id);

      const sets = await getSetsByWorkoutId(workout.id);
      expect(sets.length).toBe(0);
    });
  });

  describe('Workout Sets', () => {
    it('creates and retrieves sets', async () => {
      const workout = await createWorkout(makeWorkout({ name: 'Test' }));

      await createWorkoutSet(makeWorkoutSet(workout.id, { setNumber: 1, weight: 100, reps: 10 }));
      await createWorkoutSet(makeWorkoutSet(workout.id, { setNumber: 2, weight: 105, reps: 8 }));

      const sets = await getSetsByWorkoutId(workout.id);
      expect(sets.length).toBe(2);
      expect(sets[0].setNumber).toBe(1);
      expect(sets[1].setNumber).toBe(2);
    });

    it('gets sets by exercise', async () => {
      const workout = await createWorkout(makeWorkout({ name: 'Test' }));

      await createWorkoutSet(makeWorkoutSet(workout.id, { exerciseId: 'bench' }));

      const sets = await getSetsByExerciseId('bench');
      expect(sets.length).toBe(1);
    });

    it('updates and deletes sets', async () => {
      const workout = await createWorkout(makeWorkout({ name: 'Test' }));

      const set = await createWorkoutSet(makeWorkoutSet(workout.id));

      const updated = await updateWorkoutSet(set.id, { weight: 110 });
      expect(updated?.weight).toBe(110);

      const deleted = await deleteWorkoutSet(set.id);
      expect(deleted).toBe(true);
    });
  });

  describe('Templates', () => {
    it('creates and retrieves templates', async () => {
      const template = await createTemplate({
        name: 'Push Day Template',
        description: 'Chest, shoulders, triceps',
      });

      expect(template.id).toBeDefined();

      const all = await getAllTemplates();
      expect(all.length).toBe(1);

      const retrieved = await getTemplateById(template.id);
      expect(retrieved).toEqual(template);
    });

    it('deletes template and associated exercises', async () => {
      const template = await createTemplate({
        name: 'Test',
        description: 'Test template',
      });

      await createTemplateExercise({
        templateId: template.id,
        exerciseId: 'ex1',
        orderIndex: 0,
        targetSets: 3,
        targetRepsMin: 8,
        targetRepsMax: 12,
      });

      await deleteTemplate(template.id);

      const exercises = await getTemplateExercises(template.id);
      expect(exercises.length).toBe(0);
    });
  });

  describe('User Profile', () => {
    it('saves and retrieves user profile', async () => {
      await saveUserProfile(makeUserProfile({ weight: 80 }));

      const profile = await getUserProfile();
      expect(profile?.weight).toBe(80);
    });

    it('updates existing profile', async () => {
      await saveUserProfile(makeUserProfile({ weight: 80 }));
      await saveUserProfile(makeUserProfile({ weight: 82 }));

      const profile = await getUserProfile();
      expect(profile?.weight).toBe(82);
    });
  });

  describe('Exercise Goals', () => {
    it('saves and retrieves exercise goals', async () => {
      const goal = await saveExerciseGoal(makeExerciseGoal('bench', { current1RM: 100, target1RM: 120 }));

      expect(goal.id).toBeDefined();

      const retrieved = await getExerciseGoal('bench');
      expect(retrieved?.target1RM).toBe(120);

      const allGoals = await getAllExerciseGoals();
      expect(allGoals.length).toBe(1);
    });

    it('updates existing goal for same exercise', async () => {
      await saveExerciseGoal(makeExerciseGoal('bench', { target1RM: 100 }));
      await saveExerciseGoal(makeExerciseGoal('bench', { target1RM: 110 }));

      const goals = await getAllExerciseGoals();
      expect(goals.length).toBe(1);
      expect(goals[0].target1RM).toBe(110);
    });

    it('deletes exercise goal', async () => {
      const goal = await saveExerciseGoal(makeExerciseGoal('bench'));

      const deleted = await deleteExerciseGoal(goal.id);
      expect(deleted).toBe(true);

      const goals = await getAllExerciseGoals();
      expect(goals.length).toBe(0);
    });
  });

  describe('Data Management', () => {
    it('gets all data', async () => {
      await createExercise(makeExercise({ name: 'Test' }));

      const data = await getAllData();
      expect(data.exercises.length).toBe(1);
    });

    it('imports data', async () => {
      const data = {
        exercises: [] as any[],
        workouts: [] as any[],
        workoutSets: [] as any[],
        templates: [] as any[],
        templateExercises: [] as any[],
        userProfile: {
          id: '1',
          weight: 75,
          weightUnit: 'kg' as const,
          height: 175,
          heightUnit: 'cm' as const,
          age: 25,
          gender: 'male' as const,
          activityLevel: 'active' as const,
          goalType: 'bulk' as const,
          createdAt: '',
          updatedAt: '',
        },
        exerciseGoals: [] as any[],
        exportHistory: [] as any[],
      };

      await importData(data);

      const profile = await getUserProfile();
      expect(profile?.weight).toBe(75);
    });

    it('clears all data', async () => {
      await createExercise(makeExercise({ name: 'Test' }));
      await clearAllData();

      const exercises = await getAllExercises();
      expect(exercises.length).toBe(0);
    });
  });
});
