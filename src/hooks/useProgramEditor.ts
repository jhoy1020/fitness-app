// useProgramEditor — form state & logic for CreateProgramScreen
// Extracted from the 1454-line CreateProgramScreen to make it a thin UI shell.

import { useState, useCallback, useEffect } from 'react';
import type {
  MuscleGroup,
  TrainingProgram,
  ProgramDayTemplate,
  ProgramExerciseTemplate,
  DayType,
  CardioFinisher,
} from '../types';
import { v4 as uuid } from 'uuid';

// ── Local editor types (not persisted) ──

export interface WorkoutDay {
  id: string;
  name: string;
  dayType: DayType;
  exercises: ExerciseEntry[];
  cardioFinisher?: CardioFinisher;
  notes?: string;
}

export interface ExerciseEntry {
  id: string;
  exerciseName: string;
  muscleGroup: MuscleGroup;
  sets: number;
  repsMin: number;
  repsMax: number;
  rirTarget: number;
  restSeconds: number;
  supersetGroupId?: string;
  supersetOrder?: number;
  notes?: string;
}

interface UseProgramEditorOptions {
  /** If provided, loads this program into edit mode. */
  existingProgram?: TrainingProgram | null;
}

interface UseProgramEditorResult {
  // Form state
  programName: string;
  setProgramName: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  setDifficulty: (v: 'beginner' | 'intermediate' | 'advanced') => void;
  durationWeeks: string;
  setDurationWeeks: (v: string) => void;
  split: string;
  setSplit: (v: string) => void;

  // Week variation
  varyByWeek: boolean;
  setVaryByWeek: (v: boolean) => void;
  activeWeekIndex: number;
  setActiveWeekIndex: (v: number) => void;
  weeklyWorkoutDays: WorkoutDay[][];
  workoutDays: WorkoutDay[];

  // Day operations
  addDay: (dayType?: DayType) => void;
  removeDay: (dayId: string) => void;
  updateDayName: (dayId: string, name: string) => void;
  updateDayType: (dayId: string, dayType: DayType) => void;
  setCardioFinisher: (dayId: string, finisher?: CardioFinisher) => void;

  // Exercise operations
  addExercise: (dayId: string, exercise: Omit<ExerciseEntry, 'id'>) => void;
  updateExercise: (dayId: string, exerciseId: string, updates: Partial<ExerciseEntry>) => void;
  removeExercise: (dayId: string, exerciseId: string) => void;

  // Superset
  createSuperset: (dayId: string, ex1Id: string, ex2Id: string) => void;
  breakSuperset: (dayId: string, exerciseId: string) => void;

  // Validation
  isValid: boolean;
  validationHint: string;
  isEditing: boolean;

  // Build the TrainingProgram object from form state
  buildProgram: (existingId?: string) => TrainingProgram;
}

export function useProgramEditor(options?: UseProgramEditorOptions): UseProgramEditorResult {
  const existingProgram = options?.existingProgram ?? null;
  const isEditing = !!existingProgram;

  // Program basics
  const [programName, setProgramName] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [durationWeeks, setDurationWeeks] = useState('5');
  const [split, setSplit] = useState('Push/Pull/Legs');

  // Week variation
  const [varyByWeek, setVaryByWeek] = useState(false);
  const [activeWeekIndex, setActiveWeekIndex] = useState(0);
  const [weeklyWorkoutDays, setWeeklyWorkoutDays] = useState<WorkoutDay[][]>([[]]);

  // Derived
  const workoutDays = weeklyWorkoutDays[activeWeekIndex] || [];

  // Helper: update current week's days
  const setWorkoutDays = useCallback((updater: WorkoutDay[] | ((prev: WorkoutDay[]) => WorkoutDay[])) => {
    setWeeklyWorkoutDays(prev => {
      const copy = [...prev];
      const currentDays = copy[activeWeekIndex] || [];
      copy[activeWeekIndex] = typeof updater === 'function' ? updater(currentDays) : updater;
      return copy;
    });
  }, [activeWeekIndex]);

  // Load existing program
  useEffect(() => {
    if (!existingProgram) return;
    setProgramName(existingProgram.name);
    setDescription(existingProgram.description || '');
    setDifficulty(existingProgram.difficulty);
    setDurationWeeks(String(existingProgram.durationWeeks));
    setSplit(existingProgram.split);

    const toWorkoutDays = (days: ProgramDayTemplate[]): WorkoutDay[] =>
      days.map((day, idx) => ({
        id: `edit-${idx}-${Date.now()}`,
        name: day.name,
        dayType: day.dayType || 'workout',
        exercises: (day.exercises || []).map((ex, exIdx) => ({
          id: `edit-ex-${idx}-${exIdx}-${Date.now()}`,
          exerciseName: ex.exerciseName || '',
          muscleGroup: ex.muscleGroup,
          sets: ex.sets,
          repsMin: ex.repsMin,
          repsMax: ex.repsMax,
          rirTarget: ex.rirTarget,
          restSeconds: ex.restSeconds,
          supersetGroupId: ex.supersetGroupId,
          supersetOrder: ex.supersetOrder,
          notes: ex.notes,
        })),
        cardioFinisher: day.cardioFinisher,
        notes: day.notes,
      }));

    if (existingProgram.weekTemplates && existingProgram.weekTemplates.length > 1) {
      setVaryByWeek(true);
      setWeeklyWorkoutDays(existingProgram.weekTemplates.map(wt => toWorkoutDays(wt.days)));
    } else {
      setVaryByWeek(false);
      setWeeklyWorkoutDays([toWorkoutDays(existingProgram.weekTemplate.days)]);
    }
    setActiveWeekIndex(0);
  }, [existingProgram]);

  // ── Day Operations ──

  const addDay = useCallback((dayType: DayType = 'workout') => {
    const dayNum = workoutDays.length + 1;
    const newDay: WorkoutDay = {
      id: uuid(),
      name: dayType === 'workout' ? `Day ${dayNum}` : dayType === 'rest' ? 'Rest Day' : dayType === 'cardio' ? 'Cardio Day' : 'Recovery Day',
      dayType,
      exercises: [],
    };
    setWorkoutDays(prev => [...prev, newDay]);
  }, [workoutDays.length, setWorkoutDays]);

  const removeDay = useCallback((dayId: string) => {
    setWorkoutDays(prev => prev.filter(d => d.id !== dayId));
  }, [setWorkoutDays]);

  const updateDayName = useCallback((dayId: string, name: string) => {
    setWorkoutDays(prev => prev.map(d => d.id === dayId ? { ...d, name } : d));
  }, [setWorkoutDays]);

  const updateDayType = useCallback((dayId: string, dayType: DayType) => {
    setWorkoutDays(prev => prev.map(d => d.id === dayId ? { ...d, dayType } : d));
  }, [setWorkoutDays]);

  const setCardioFinisher = useCallback((dayId: string, finisher?: CardioFinisher) => {
    setWorkoutDays(prev => prev.map(d => d.id === dayId ? { ...d, cardioFinisher: finisher } : d));
  }, [setWorkoutDays]);

  // ── Exercise Operations ──

  const addExercise = useCallback((dayId: string, exercise: Omit<ExerciseEntry, 'id'>) => {
    const entry: ExerciseEntry = { ...exercise, id: uuid() };
    setWorkoutDays(prev => prev.map(d => {
      if (d.id !== dayId) return d;
      return { ...d, exercises: [...d.exercises, entry] };
    }));
  }, [setWorkoutDays]);

  const updateExercise = useCallback((dayId: string, exerciseId: string, updates: Partial<ExerciseEntry>) => {
    setWorkoutDays(prev => prev.map(d => {
      if (d.id !== dayId) return d;
      return {
        ...d,
        exercises: d.exercises.map(ex =>
          ex.id === exerciseId ? { ...ex, ...updates } : ex
        ),
      };
    }));
  }, [setWorkoutDays]);

  const removeExercise = useCallback((dayId: string, exerciseId: string) => {
    setWorkoutDays(prev => prev.map(d => {
      if (d.id !== dayId) return d;
      return { ...d, exercises: d.exercises.filter(ex => ex.id !== exerciseId) };
    }));
  }, [setWorkoutDays]);

  // ── Superset ──

  const createSuperset = useCallback((dayId: string, ex1Id: string, ex2Id: string) => {
    const groupId = `superset-${Date.now()}`;
    setWorkoutDays(prev => prev.map(d => {
      if (d.id !== dayId) return d;
      return {
        ...d,
        exercises: d.exercises.map(ex => {
          if (ex.id === ex1Id) return { ...ex, supersetGroupId: groupId, supersetOrder: 1 };
          if (ex.id === ex2Id) return { ...ex, supersetGroupId: groupId, supersetOrder: 2 };
          return ex;
        }),
      };
    }));
  }, [setWorkoutDays]);

  const breakSuperset = useCallback((dayId: string, exerciseId: string) => {
    setWorkoutDays(prev => prev.map(d => {
      if (d.id !== dayId) return d;
      const target = d.exercises.find(ex => ex.id === exerciseId);
      if (!target?.supersetGroupId) return d;
      const groupId = target.supersetGroupId;
      return {
        ...d,
        exercises: d.exercises.map(ex =>
          ex.supersetGroupId === groupId
            ? { ...ex, supersetGroupId: undefined, supersetOrder: undefined }
            : ex
        ),
      };
    }));
  }, [setWorkoutDays]);

  // ── Validation ──

  const validationHint = (() => {
    if (!programName.trim()) return 'Enter a program name';
    const allDays = weeklyWorkoutDays.flat();
    if (allDays.length === 0) return 'Add at least one day';
    for (const day of allDays) {
      if (day.dayType === 'workout' && day.exercises.length === 0) {
        return `"${day.name}" needs at least one exercise`;
      }
    }
    return '';
  })();

  const isValid = validationHint === '';

  // ── Build Program ──

  const buildProgram = useCallback((existingId?: string): TrainingProgram => {
    const ALL_MUSCLES: MuscleGroup[] = [
      'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
      'quadriceps', 'hamstrings', 'glutes', 'calves', 'core',
    ];

    const toDayTemplates = (days: WorkoutDay[]): ProgramDayTemplate[] =>
      days.map((day, idx) => ({
        dayNumber: idx + 1,
        name: day.name,
        dayType: day.dayType,
        muscleGroups: [...new Set(day.exercises.map(e => e.muscleGroup))],
        exercises: day.exercises.map(ex => ({
          exerciseName: ex.exerciseName,
          muscleGroup: ex.muscleGroup,
          sets: ex.sets,
          repsMin: ex.repsMin,
          repsMax: ex.repsMax,
          rirTarget: ex.rirTarget,
          restSeconds: ex.restSeconds,
          supersetGroupId: ex.supersetGroupId,
          supersetOrder: ex.supersetOrder,
          notes: ex.notes,
        })),
        cardioFinisher: day.cardioFinisher,
        notes: day.notes,
      }));

    const weekTemplate = { days: toDayTemplates(weeklyWorkoutDays[0] || []) };
    const weekTemplates = varyByWeek
      ? weeklyWorkoutDays.map((days, i) => ({
          weekNumber: i + 1,
          days: toDayTemplates(days),
        }))
      : undefined;

    return {
      id: existingId || existingProgram?.id || uuid(),
      name: programName.trim(),
      description: description.trim(),
      difficulty,
      durationWeeks: parseInt(durationWeeks) || 5,
      daysPerWeek: (weeklyWorkoutDays[0] || []).length,
      split,
      goals: ['hypertrophy'],
      musclePriorities: Object.fromEntries(ALL_MUSCLES.map(m => [m, 'normal'])) as any,
      weeklyFrequency: Object.fromEntries(ALL_MUSCLES.map(m => [m, 2])) as any,
      weekTemplate,
      weekTemplates,
      startingVolumeMultiplier: 1.0,
      volumeProgressionPerWeek: 1,
      tags: [difficulty, split.toLowerCase().replace(/\//g, '-')],
    };
  }, [programName, description, difficulty, durationWeeks, split, weeklyWorkoutDays, varyByWeek, existingProgram]);

  return {
    programName,
    setProgramName,
    description,
    setDescription,
    difficulty,
    setDifficulty,
    durationWeeks,
    setDurationWeeks,
    split,
    setSplit,
    varyByWeek,
    setVaryByWeek,
    activeWeekIndex,
    setActiveWeekIndex,
    weeklyWorkoutDays,
    workoutDays,
    addDay,
    removeDay,
    updateDayName,
    updateDayType,
    setCardioFinisher,
    addExercise,
    updateExercise,
    removeExercise,
    createSuperset,
    breakSuperset,
    isValid,
    validationHint,
    isEditing,
    buildProgram,
  };
}
