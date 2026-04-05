// Create Program Screen - Build custom workout programs

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { 
  Text, 
  Surface, 
  useTheme, 
  TextInput, 
  Button, 
  SegmentedButtons,
  Chip,
  Portal,
  Dialog,
  Divider,
  IconButton,
  Switch
} from 'react-native-paper';
import { useMesoCycle } from '../../context/MesoCycleContext';
import { useUser } from '../../context/UserContext';
import { EXERCISE_LIBRARY } from '../../services/db/exerciseLibrary';
import type { MuscleGroup, ProgramDayTemplate, ProgramExerciseTemplate, TrainingProgram, DayType, CardioFinisher, RecoverySuggestion, WeightMode } from '../../types';
import { MUSCLE_GROUP_LABELS } from '../../utils/constants/constants';
import { CARDIO_FINISHERS, RECOVERY_LIBRARY } from '../../data/activities/activities';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { withAlpha } from '../../theme';
import { AppIcons } from '../../theme/icons';
import type { RootScreenProps } from '../../navigation';

interface CreateProgramScreenProps {
  navigation: RootScreenProps<'CreateProgram'>['navigation'];
  route?: RootScreenProps<'CreateProgram'>['route'];
}

const MUSCLE_GROUPS: MuscleGroup[] = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps', 
  'quadriceps', 'hamstrings', 'glutes', 'calves', 'core'
];

const SPLIT_OPTIONS = [
  'Full Body',
  'Upper/Lower',
  'Push/Pull/Legs',
  'Bro Split',
  'Custom',
];

interface WorkoutDay {
  id: string;
  name: string;
  dayType: DayType;
  exercises: ExerciseEntry[];
  cardioFinisher?: CardioFinisher;
  notes?: string;
}

interface ExerciseEntry {
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
  weightMode?: WeightMode;
  percentageOf1RM?: number;
  fixedWeight?: number;
}

export function CreateProgramScreen({ navigation, route }: CreateProgramScreenProps) {
  const theme = useTheme();
  const { dispatch, state: mesoState } = useMesoCycle();
  const { getOneRepMax, state: userState } = useUser();

  // Edit mode: check for programId in route params
  const editingProgramId = route?.params?.programId as string | undefined;
  const isEditing = !!editingProgramId;

  // Program basics
  const [programName, setProgramName] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [durationWeeks, setDurationWeeks] = useState('5');
  const [split, setSplit] = useState('Push/Pull/Legs');

  // Workout days — supports per-week variation
  const [varyByWeek, setVaryByWeek] = useState(false);
  const [activeWeekIndex, setActiveWeekIndex] = useState(0);
  const [weeklyWorkoutDays, setWeeklyWorkoutDays] = useState<WorkoutDay[][]>([[]]);

  // Derived: current week's workout days (convenience accessor)
  const workoutDays = weeklyWorkoutDays[activeWeekIndex] || [];
  
  // Helper: update the current week's days in the multi-week array
  const setWorkoutDays = (updater: WorkoutDay[] | ((prev: WorkoutDay[]) => WorkoutDay[])) => {
    setWeeklyWorkoutDays(prev => {
      const copy = [...prev];
      const currentDays = copy[activeWeekIndex] || [];
      copy[activeWeekIndex] = typeof updater === 'function' ? updater(currentDays) : updater;
      return copy;
    });
  };
  
  // Add exercise dialog
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [editingDayId, setEditingDayId] = useState<string | null>(null);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(null);
  
  // Exercise form
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseMuscle, setNewExerciseMuscle] = useState<MuscleGroup>('chest');
  const [newSets, setNewSets] = useState('3');
  const [newRepsMin, setNewRepsMin] = useState('8');
  const [newRepsMax, setNewRepsMax] = useState('12');
  const [newRir, setNewRir] = useState('2');
  const [newRest, setNewRest] = useState('120');
  const [newExerciseNotes, setNewExerciseNotes] = useState('');
  const [newWeightMode, setNewWeightMode] = useState<WeightMode>('auto');
  const [newPercentage, setNewPercentage] = useState('');
  const [newFixedWeight, setNewFixedWeight] = useState('');

  // Edit exercise state — when set, the dialog is in edit mode
  const [editingExerciseRef, setEditingExerciseRef] = useState<{ dayId: string; exerciseId: string } | null>(null);
  const isEditingExercise = !!editingExerciseRef;

  // Load existing program data when editing
  useEffect(() => {
    if (!editingProgramId) return;
    const program = (mesoState.availablePrograms || []).find(p => p.id === editingProgramId);
    if (!program) return;

    setProgramName(program.name);
    setDescription(program.description || '');
    setDifficulty(program.difficulty);
    setDurationWeeks(String(program.durationWeeks));
    setSplit(program.split);

    // Convert ProgramDayTemplate[] → WorkoutDay[]
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
          weightMode: ex.weightMode,
          percentageOf1RM: ex.percentageOf1RM,
          fixedWeight: ex.fixedWeight,
        })),
        cardioFinisher: day.cardioFinisher,
        notes: day.notes,
      }));

    if (program.weekTemplates && program.weekTemplates.length > 1) {
      setVaryByWeek(true);
      setWeeklyWorkoutDays(program.weekTemplates.map(wt => toWorkoutDays(wt.days)));
    } else {
      setVaryByWeek(false);
      setWeeklyWorkoutDays([toWorkoutDays(program.weekTemplate.days)]);
    }
    setActiveWeekIndex(0);
  }, [editingProgramId]);

  // Delete confirmation state
  const [deleteConfirmDay, setDeleteConfirmDay] = useState<string | null>(null);
  const [deleteConfirmExercise, setDeleteConfirmExercise] = useState<{ dayId: string; exerciseId: string } | null>(null);

  // Superset state
  const [supersetMode, setSupersetMode] = useState<{ dayId: string; exerciseId: string } | null>(null);

  // Day type picker state
  const [showDayTypePicker, setShowDayTypePicker] = useState(false);
  const [showCardioFinisherPicker, setShowCardioFinisherPicker] = useState(false);
  const [editingDayForFinisher, setEditingDayForFinisher] = useState<string | null>(null);

  // Create a superset between two exercises
  const handleCreateSuperset = (dayId: string, exercise1Id: string, exercise2Id: string) => {
    const groupId = `superset-${Date.now()}`;
    setWorkoutDays(days => days.map(day => {
      if (day.id !== dayId) return day;
      return {
        ...day,
        exercises: day.exercises.map(ex => {
          if (ex.id === exercise1Id) {
            return { ...ex, supersetGroupId: groupId, supersetOrder: 1 };
          }
          if (ex.id === exercise2Id) {
            return { ...ex, supersetGroupId: groupId, supersetOrder: 2 };
          }
          return ex;
        }),
      };
    }));
    setSupersetMode(null);
  };

  // Add exercise to existing superset
  const handleAddToSuperset = (dayId: string, exerciseId: string, groupId: string) => {
    setWorkoutDays(days => days.map(day => {
      if (day.id !== dayId) return day;
      const existingInGroup = day.exercises.filter(ex => ex.supersetGroupId === groupId);
      const maxOrder = Math.max(...existingInGroup.map(ex => ex.supersetOrder || 0), 0);
      return {
        ...day,
        exercises: day.exercises.map(ex => {
          if (ex.id === exerciseId) {
            return { ...ex, supersetGroupId: groupId, supersetOrder: maxOrder + 1 };
          }
          return ex;
        }),
      };
    }));
    setSupersetMode(null);
  };

  // Remove exercise from superset
  const handleRemoveFromSuperset = (dayId: string, exerciseId: string) => {
    setWorkoutDays(days => days.map(day => {
      if (day.id !== dayId) return day;
      return {
        ...day,
        exercises: day.exercises.map(ex => {
          if (ex.id === exerciseId) {
            const { supersetGroupId, supersetOrder, ...rest } = ex;
            return rest as ExerciseEntry;
          }
          return ex;
        }),
      };
    }));
  };

  // Get superset groups for a day
  const getSupersetGroups = (day: WorkoutDay): Map<string, ExerciseEntry[]> => {
    const groups = new Map<string, ExerciseEntry[]>();
    day.exercises.forEach(ex => {
      if (ex.supersetGroupId) {
        const existing = groups.get(ex.supersetGroupId) || [];
        groups.set(ex.supersetGroupId, [...existing, ex].sort((a, b) => (a.supersetOrder || 0) - (b.supersetOrder || 0)));
      }
    });
    return groups;
  };

  // Filter exercises by search and muscle
  const filteredExercises = EXERCISE_LIBRARY.filter(ex => {
    const matchesSearch = !exerciseSearch || 
      ex.name.toLowerCase().includes(exerciseSearch.toLowerCase());
    const matchesMuscle = !selectedMuscle || ex.muscleGroup === selectedMuscle;
    return matchesSearch && matchesMuscle;
  }).slice(0, 15);

  // Add a new workout day with specific type
  const handleAddDayWithType = (dayType: DayType) => {
    const dayNumber = workoutDays.length + 1;
    const typeNames: Record<DayType, string> = {
      workout: `Day ${dayNumber}`,
      rest: `Rest Day`,
      cardio: `Cardio Day`,
      active_recovery: `Active Recovery`,
    };
    const newDay: WorkoutDay = {
      id: Date.now().toString(),
      name: typeNames[dayType],
      dayType,
      exercises: [],
    };
    setWorkoutDays([...workoutDays, newDay]);
    setShowDayTypePicker(false);
  };

  // Legacy function - opens day type picker
  const handleAddDay = () => {
    setShowDayTypePicker(true);
  };

  // Remove a workout day
  const handleRemoveDay = (dayId: string) => {
    setWorkoutDays(workoutDays.filter(d => d.id !== dayId));
  };

  // Update day name
  const handleUpdateDayName = (dayId: string, name: string) => {
    setWorkoutDays(workoutDays.map(d => 
      d.id === dayId ? { ...d, name } : d
    ));
  };

  // Add cardio finisher to a workout day
  const handleAddCardioFinisher = (dayId: string, finisher: CardioFinisher) => {
    setWorkoutDays(workoutDays.map(d =>
      d.id === dayId ? { ...d, cardioFinisher: finisher } : d
    ));
    setShowCardioFinisherPicker(false);
    setEditingDayForFinisher(null);
  };

  // Remove cardio finisher from a day
  const handleRemoveCardioFinisher = (dayId: string) => {
    setWorkoutDays(workoutDays.map(d =>
      d.id === dayId ? { ...d, cardioFinisher: undefined } : d
    ));
  };

  // Open add exercise dialog
  const handleOpenAddExercise = (dayId: string) => {
    setEditingDayId(dayId);
    setEditingExerciseRef(null);
    setShowAddExercise(true);
    setExerciseSearch('');
    setSelectedMuscle(null);
    setNewExerciseName('');
    setNewSets('3');
    setNewRepsMin('8');
    setNewRepsMax('12');
    setNewRir('2');
    setNewRest('120');
    setNewExerciseNotes('');
    setNewWeightMode('auto');
    setNewPercentage('');
    setNewFixedWeight('');
  };

  // Open edit exercise dialog (pre-populated)
  const handleOpenEditExercise = (dayId: string, exercise: ExerciseEntry) => {
    setEditingDayId(dayId);
    setEditingExerciseRef({ dayId, exerciseId: exercise.id });
    setShowAddExercise(true);
    setExerciseSearch('');
    setSelectedMuscle(null);
    setNewExerciseName(exercise.exerciseName);
    setNewExerciseMuscle(exercise.muscleGroup);
    setNewSets(String(exercise.sets));
    setNewRepsMin(String(exercise.repsMin));
    setNewRepsMax(String(exercise.repsMax));
    setNewRir(String(exercise.rirTarget));
    setNewRest(String(exercise.restSeconds));
    setNewExerciseNotes(exercise.notes || '');
    setNewWeightMode(exercise.weightMode || 'auto');
    setNewPercentage(exercise.percentageOf1RM ? String(exercise.percentageOf1RM) : '');
    setNewFixedWeight(exercise.fixedWeight ? String(exercise.fixedWeight) : '');
  };

  // Select an exercise from the library
  const handleSelectExercise = (exerciseName: string, muscleGroup: MuscleGroup) => {
    setNewExerciseName(exerciseName);
    setNewExerciseMuscle(muscleGroup);
  };

  // Add exercise to day
  const handleAddExercise = () => {
    if (!editingDayId || !newExerciseName) return;

    const exerciseData: ExerciseEntry = {
      id: editingExerciseRef?.exerciseId || Date.now().toString(),
      exerciseName: newExerciseName,
      muscleGroup: newExerciseMuscle,
      sets: parseInt(newSets) || 3,
      repsMin: parseInt(newRepsMin) || 8,
      repsMax: parseInt(newRepsMax) || 12,
      rirTarget: parseInt(newRir) || 2,
      restSeconds: parseInt(newRest) || 120,
      notes: newExerciseNotes.trim() || undefined,
      weightMode: newWeightMode !== 'auto' ? newWeightMode : undefined,
      percentageOf1RM: newWeightMode === 'percentage' && newPercentage ? parseFloat(newPercentage) : undefined,
      fixedWeight: newWeightMode === 'fixed' && newFixedWeight ? parseFloat(newFixedWeight) : undefined,
    };

    if (editingExerciseRef) {
      // Update existing exercise in place
      setWorkoutDays(workoutDays.map(d =>
        d.id === editingDayId
          ? {
              ...d,
              exercises: d.exercises.map(ex =>
                ex.id === editingExerciseRef.exerciseId
                  ? { ...exerciseData, supersetGroupId: ex.supersetGroupId, supersetOrder: ex.supersetOrder }
                  : ex
              ),
            }
          : d
      ));
    } else {
      // Add new exercise
      setWorkoutDays(workoutDays.map(d =>
        d.id === editingDayId
          ? { ...d, exercises: [...d.exercises, exerciseData] }
          : d
      ));
    }
    setShowAddExercise(false);
    setEditingExerciseRef(null);
  };

  // Remove exercise from day
  const handleRemoveExercise = (dayId: string, exerciseId: string) => {
    setWorkoutDays(workoutDays.map(d => 
      d.id === dayId 
        ? { ...d, exercises: d.exercises.filter(e => e.id !== exerciseId) }
        : d
    ));
  };

  // Save program
  const handleSaveProgram = () => {
    // All weeks must have at least one day
    const allWeeks = varyByWeek ? weeklyWorkoutDays : [workoutDays];
    if (!programName.trim() || allWeeks.some(w => w.length === 0)) return;

    // Helper: convert WorkoutDay[] → ProgramDayTemplate[]
    const toDayTemplates = (days: WorkoutDay[]) => days.map((day, index) => ({
      dayNumber: index + 1,
      name: day.name,
      dayType: day.dayType,
      muscleGroups: day.dayType === 'workout' ? [...new Set(day.exercises.map(e => e.muscleGroup))] : undefined,
      exercises: day.dayType === 'workout' ? day.exercises.map(e => ({
        exerciseName: e.exerciseName,
        muscleGroup: e.muscleGroup,
        sets: e.sets,
        repsMin: e.repsMin,
        repsMax: e.repsMax,
        rirTarget: e.rirTarget,
        restSeconds: e.restSeconds,
        notes: e.notes,
        supersetGroupId: e.supersetGroupId,
        supersetOrder: e.supersetOrder,
        weightMode: e.weightMode,
        percentageOf1RM: e.percentageOf1RM,
        fixedWeight: e.fixedWeight,
      })) : undefined,
      cardioFinisher: day.cardioFinisher,
      notes: day.notes,
    }));

    // Build the program
    const program: TrainingProgram = {
      id: isEditing ? editingProgramId! : `custom-${Date.now()}`,
      name: programName.trim(),
      description: description.trim() || `Custom ${split} program`,
      difficulty,
      durationWeeks: parseInt(durationWeeks) || 5,
      daysPerWeek: Math.max(...allWeeks.map(w => w.length)),
      split,
      goals: ['hypertrophy'],
      musclePriorities: Object.fromEntries(
        MUSCLE_GROUPS.map(m => [m, 'normal'])
      ) as Record<MuscleGroup, 'focus' | 'normal' | 'maintain'>,
      weeklyFrequency: Object.fromEntries(
        MUSCLE_GROUPS.map(m => [m, 2])
      ) as Record<MuscleGroup, number>,
      startingVolumeMultiplier: 1.0,
      volumeProgressionPerWeek: 1,
      tags: ['custom', split.toLowerCase().replace(/\//g, '-')],
      // Single week template (always set for backward compatibility)
      weekTemplate: { days: toDayTemplates(allWeeks[0]) },
      // Multi-week templates (only set when varying by week)
      weekTemplates: varyByWeek ? allWeeks.map((days, wIdx) => ({
        weekNumber: wIdx + 1,
        days: toDayTemplates(days),
      })) : undefined,
    };

    // Save the custom program so it persists in the programs list
    dispatch({ type: 'SAVE_CUSTOM_PROGRAM', payload: program });

    if (isEditing) {
      // In edit mode: update active mesocycle if it uses this program, then go back
      if (mesoState.activeMesoCycle?.programId === editingProgramId) {
        dispatch({ type: 'UPDATE_ACTIVE_MESOCYCLE_FROM_PROGRAM', payload: program });
      }
      navigation.goBack();
    } else {
      // In create mode: start the program immediately
      dispatch({
        type: 'START_PROGRAM',
        payload: {
          program,
          startDate: new Date().toISOString(),
        },
      });
      navigation.navigate('Main', { screen: 'Home' });
    }
  };

  // Helper: format weight prescription for exercise row display
  const formatWeightLabel = (ex: ExerciseEntry): string | null => {
    if (ex.weightMode === 'percentage' && ex.percentageOf1RM) {
      const record = getOneRepMax(ex.exerciseName);
      if (record) {
        const resolved = Math.round((record.weight * ex.percentageOf1RM / 100) / 5) * 5;
        return `${ex.percentageOf1RM}% 1RM (${resolved} ${record.unit})`;
      }
      return `${ex.percentageOf1RM}% 1RM`;
    }
    if (ex.weightMode === 'fixed' && ex.fixedWeight) {
      return `${ex.fixedWeight} ${userState.units === 'metric' ? 'kg' : 'lbs'}`;
    }
    return null;
  };

  // All weeks must have days, and workout days need exercises
  const allWeeksForValidation = varyByWeek ? weeklyWorkoutDays : [workoutDays];
  const canSave = programName.trim() && allWeeksForValidation.every(week => 
    week.length > 0 && week.every(d => d.dayType !== 'workout' || d.exercises.length > 0)
  );

  // Build a human-readable validation hint when save is disabled
  const getValidationHint = (): string | null => {
    if (!programName.trim()) return 'Enter a program name';
    for (let wIdx = 0; wIdx < allWeeksForValidation.length; wIdx++) {
      const week = allWeeksForValidation[wIdx];
      const weekLabel = varyByWeek ? `Week ${wIdx + 1}: ` : '';
      if (week.length === 0) return `${weekLabel}Add at least one day`;
      for (const day of week) {
        if (day.dayType === 'workout' && day.exercises.length === 0) {
          return `${weekLabel}"${day.name}" needs at least one exercise`;
        }
      }
    }
    return null;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Program Details */}
        <Surface style={styles.card} elevation={1}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Program Details</Text>
          
          <TextInput
            mode="outlined"
            label="Program Name"
            value={programName}
            onChangeText={setProgramName}
            placeholder="e.g., My PPL Program"
            style={styles.input}
          />

          <TextInput
            mode="outlined"
            label="Description (optional)"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={2}
            style={styles.input}
          />

          <TextInput
            mode="outlined"
            label="Duration (weeks)"
            value={durationWeeks}
            onChangeText={setDurationWeeks}
            keyboardType="number-pad"
            style={styles.input}
          />

          <Text variant="labelLarge" style={styles.label}>Difficulty</Text>
          <SegmentedButtons
            value={difficulty}
            onValueChange={(v) => setDifficulty(v as any)}
            buttons={[
              { value: 'beginner', label: 'Beginner' },
              { value: 'intermediate', label: 'Intermediate' },
              { value: 'advanced', label: 'Advanced' },
            ]}
            style={{ marginBottom: 12 }}
          />

          <Text variant="labelLarge" style={[styles.label, { marginTop: 16 }]}>Split Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipRow}>
              {SPLIT_OPTIONS.map(s => {
                const isSelected = split === s;
                return (
                  <Chip
                    key={s}
                    selected={isSelected}
                    onPress={() => setSplit(s)}
                    showSelectedCheck={false}
                    style={[
                      styles.chip,
                      isSelected && {
                        backgroundColor: theme.colors.primaryContainer,
                        borderColor: theme.colors.primary,
                        borderWidth: 1.5,
                      },
                      !isSelected && {
                        borderColor: theme.colors.outlineVariant,
                        borderWidth: 1,
                      },
                    ]}
                    textStyle={isSelected ? {
                      color: theme.colors.onPrimaryContainer,
                      fontWeight: '600',
                    } : {
                      color: theme.colors.onSurfaceVariant,
                    }}
                  >
                    {s}
                  </Chip>
                );
              })}
            </View>
          </ScrollView>
        </Surface>

        {/* Workout Days */}
        <Surface style={styles.card} elevation={1}>
          {/* Week variation toggle */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <View style={{ flex: 1 }}>
              <Text variant="labelLarge">Vary by week</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                {varyByWeek ? 'Each week has different workouts' : 'Same workouts every week'}
              </Text>
            </View>
            <Switch
              value={varyByWeek}
              onValueChange={(val) => {
                setVaryByWeek(val);
                if (val && weeklyWorkoutDays.length === 1) {
                  // Start with 2 weeks when enabling variation
                  setWeeklyWorkoutDays(prev => [...prev, []]);
                }
                setActiveWeekIndex(0);
              }}
            />
          </View>

          {/* Week tabs (only when varying by week) */}
          {varyByWeek && (
            <View style={{ marginBottom: 12 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {weeklyWorkoutDays.map((_, wIdx) => (
                  <Chip
                    key={wIdx}
                    selected={activeWeekIndex === wIdx}
                    onPress={() => setActiveWeekIndex(wIdx)}
                    compact
                    style={{ marginRight: 4 }}
                    showSelectedCheck={false}
                    onLongPress={() => {
                      if (weeklyWorkoutDays.length > 1) {
                        setWeeklyWorkoutDays(prev => prev.filter((_, i) => i !== wIdx));
                        setActiveWeekIndex(Math.min(activeWeekIndex, weeklyWorkoutDays.length - 2));
                      }
                    }}
                  >
                    Week {wIdx + 1}
                  </Chip>
                ))}
                <Chip
                  compact
                  style={{ marginRight: 4 }}
                  onPress={() => {
                    setWeeklyWorkoutDays(prev => [...prev, []]);
                    setActiveWeekIndex(weeklyWorkoutDays.length);
                  }}
                >
                  + Week
                </Chip>
                <Chip
                  compact
                  style={{ marginRight: 4 }}
                  onPress={() => {
                    // Copy current week's days to a new week
                    const currentDays = weeklyWorkoutDays[activeWeekIndex] || [];
                    const copiedDays = currentDays.map(day => ({
                      ...day,
                      id: Date.now().toString() + Math.random(),
                      exercises: day.exercises.map(ex => ({ ...ex, id: Date.now().toString() + Math.random() })),
                    }));
                    setWeeklyWorkoutDays(prev => [...prev, copiedDays]);
                    setActiveWeekIndex(weeklyWorkoutDays.length);
                  }}
                >
                  Copy Week {activeWeekIndex + 1}
                </Chip>
              </ScrollView>
            </View>
          )}

          <View style={styles.sectionHeader}>
            <Text variant="titleMedium">{varyByWeek ? `Week ${activeWeekIndex + 1} Days` : 'Workout Days'}</Text>
            <Button 
              mode="contained-tonal" 
              compact 
              onPress={handleAddDay}
            >
              + Add Day
            </Button>
          </View>

          {workoutDays.length === 0 ? (
            <View style={styles.emptyDays}>
              <Text style={{ fontSize: 32, marginBottom: 8 }}>
                <MaterialCommunityIcons name={AppIcons.calendar} size={32} color={theme.colors.outline} />
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.outline }}>
                No workout days yet. Add your first day!
              </Text>
            </View>
          ) : (
            workoutDays.map((day, dayIndex) => (
              <Surface key={day.id} style={[styles.dayCard, { backgroundColor: withAlpha(theme.colors.primary, 0.05),
                borderLeftWidth: 4,
                borderLeftColor: day.dayType === 'rest' ? theme.colors.surfaceVariant :
                                 day.dayType === 'cardio' ? theme.colors.secondary :
                                 day.dayType === 'active_recovery' ? theme.colors.tertiary :
                                 theme.colors.primary,
              }]} elevation={0}>
                <View style={styles.dayHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                    <MaterialCommunityIcons 
                      name={day.dayType === 'rest' ? AppIcons.rest : day.dayType === 'cardio' ? AppIcons.cardio : day.dayType === 'active_recovery' ? AppIcons.recovery : AppIcons.workout} 
                      size={20} 
                      color={day.dayType === 'rest' ? theme.colors.surfaceVariant : day.dayType === 'cardio' ? theme.colors.secondary : day.dayType === 'active_recovery' ? theme.colors.tertiary : theme.colors.primary}
                    />
                    <TextInput
                      mode="outlined"
                      value={day.name}
                      onChangeText={(v) => handleUpdateDayName(day.id, v)}
                      style={styles.dayNameInput}
                      dense
                    />
                  </View>
                  <TouchableOpacity onPress={() => setDeleteConfirmDay(day.id)}>
                    <MaterialCommunityIcons name={AppIcons.close} size={18} color={theme.colors.error} />
                  </TouchableOpacity>
                </View>

                {/* Rest Day Content */}
                {day.dayType === 'rest' && (
                  <View style={{ paddingVertical: 12 }}>
                    <Text variant="bodyMedium" style={{ color: theme.colors.outline, fontStyle: 'italic' }}>
                      Rest day - muscles recover and grow stronger
                    </Text>
                  </View>
                )}

                {/* Cardio Day Content */}
                {day.dayType === 'cardio' && (
                  <View style={{ paddingVertical: 12 }}>
                    <Text variant="bodyMedium" style={{ color: theme.colors.outline }}>
                      Cardio focus day - improve conditioning
                    </Text>
                    <TextInput
                      mode="outlined"
                      label="Cardio notes (optional)"
                      value={day.notes || ''}
                      onChangeText={(v) => setWorkoutDays(workoutDays.map(d => 
                        d.id === day.id ? { ...d, notes: v } : d
                      ))}
                      style={{ marginTop: 8 }}
                      dense
                      multiline
                      placeholder="e.g., 30 min steady state, HIIT intervals..."
                    />
                  </View>
                )}

                {/* Active Recovery Day Content */}
                {day.dayType === 'active_recovery' && (
                  <View style={{ paddingVertical: 12 }}>
                    <Text variant="bodyMedium" style={{ color: theme.colors.outline }}>
                      Light movement to aid recovery
                    </Text>
                    <TextInput
                      mode="outlined"
                      label="Recovery notes (optional)"
                      value={day.notes || ''}
                      onChangeText={(v) => setWorkoutDays(workoutDays.map(d => 
                        d.id === day.id ? { ...d, notes: v } : d
                      ))}
                      style={{ marginTop: 8 }}
                      dense
                      multiline
                      placeholder="e.g., foam rolling, stretching, yoga..."
                    />
                  </View>
                )}

                {/* Workout Day Content */}
                {day.dayType === 'workout' && (
                  <>
                    {day.exercises.length === 0 ? (
                      <Text variant="bodySmall" style={{ color: theme.colors.outline, marginVertical: 8 }}>
                        No exercises yet
                      </Text>
                    ) : (
                      (() => {
                        const supersetGroups = getSupersetGroups(day);
                        const renderedGroupIds = new Set<string>();
                        
                        return day.exercises.map((exercise, exIndex) => {
                          // If this exercise is in a superset and we haven't rendered that group yet
                          if (exercise.supersetGroupId && !renderedGroupIds.has(exercise.supersetGroupId)) {
                            renderedGroupIds.add(exercise.supersetGroupId);
                            const groupExercises = supersetGroups.get(exercise.supersetGroupId) || [];
                            
                            return (
                              <Surface 
                                key={exercise.supersetGroupId} 
                                style={[styles.supersetGroup, { borderColor: theme.colors.primary }]} 
                                elevation={0}
                              >
                                <View style={[styles.supersetHeader, { borderBottomColor: withAlpha(theme.colors.outline, 0.2) }]}>
                                  <Text variant="labelMedium" style={{ color: theme.colors.primary }}>
                                  <MaterialCommunityIcons name={AppIcons.superSet} size={12} color={theme.colors.primary} /> SUPERSET ({groupExercises.length} exercises)
                                  </Text>
                                  <TouchableOpacity onPress={() => {
                                    // Unlink all exercises in this superset
                                    groupExercises.forEach(ex => handleRemoveFromSuperset(day.id, ex.id));
                                  }}>
                                    <Text variant="labelSmall" style={{ color: theme.colors.error }}>Unlink All</Text>
                                  </TouchableOpacity>
                                </View>
                                {groupExercises.map((groupEx, gIdx) => (
                                  <TouchableOpacity key={groupEx.id} onPress={() => handleOpenEditExercise(day.id, groupEx)}>
                                  <View style={[styles.exerciseRow, { marginLeft: 8, borderBottomColor: withAlpha(theme.colors.outline, 0.2) }]}>
                                    <View style={{ flex: 1 }}>
                                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <Text style={{ 
                                          backgroundColor: theme.colors.primary, 
                                          color: theme.colors.onPrimary,
                                          width: 20, height: 20, 
                                          borderRadius: 10, 
                                          textAlign: 'center', 
                                          lineHeight: 20,
                                          fontSize: 12,
                                        }}>
                                          {gIdx + 1}
                                        </Text>
                                        <Text variant="bodyMedium">{groupEx.exerciseName}</Text>
                                      </View>
                                      <Text variant="bodySmall" style={{ color: theme.colors.outline, marginLeft: 28 }}>
                                        {groupEx.sets} sets × {groupEx.repsMin}-{groupEx.repsMax} reps • RIR {groupEx.rirTarget} • {groupEx.restSeconds}s rest
                                      </Text>
                                      {formatWeightLabel(groupEx) && (
                                        <Text variant="bodySmall" style={{ color: theme.colors.primary, marginLeft: 28, fontWeight: '600' }}>
                                          {formatWeightLabel(groupEx)}
                                        </Text>
                                      )}
                                      {groupEx.notes ? (
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 28, marginTop: 2 }}>
                                          <MaterialCommunityIcons name={AppIcons.notes} size={12} color={theme.colors.outline} style={{ marginRight: 4 }} />
                                          <Text variant="bodySmall" style={{ color: theme.colors.outline, fontStyle: 'italic', flex: 1 }}>
                                            {groupEx.notes}
                                          </Text>
                                        </View>
                                      ) : null}
                                    </View>
                                    <TouchableOpacity onPress={() => setDeleteConfirmExercise({ dayId: day.id, exerciseId: groupEx.id })}>
                                      <MaterialCommunityIcons name={AppIcons.close} size={16} color={theme.colors.error} />
                                    </TouchableOpacity>
                                  </View>
                                  </TouchableOpacity>
                                ))}
                              </Surface>
                            );
                          }
                          
                          // Skip exercises that are part of a superset we already rendered
                          if (exercise.supersetGroupId) return null;
                          
                          // Regular exercise (not in superset)
                          const isLinkingMode = supersetMode?.dayId === day.id;
                          const isSourceExercise = supersetMode?.exerciseId === exercise.id;
                          
                          return (
                            <TouchableOpacity key={exercise.id} onPress={() => handleOpenEditExercise(day.id, exercise)}>
                            <View style={[
                              styles.exerciseRow, { borderBottomColor: withAlpha(theme.colors.outline, 0.2) },
                              isLinkingMode && !isSourceExercise && { borderColor: theme.colors.primary, borderWidth: 2, borderStyle: 'dashed' }
                            ]}>
                              <View style={{ flex: 1 }}>
                                <Text variant="bodyMedium">{exercise.exerciseName}</Text>
                                <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                                  {exercise.sets} sets × {exercise.repsMin}-{exercise.repsMax} reps • RIR {exercise.rirTarget} • {exercise.restSeconds}s rest
                                </Text>
                                {formatWeightLabel(exercise) && (
                                  <Text variant="bodySmall" style={{ color: theme.colors.primary, fontWeight: '600' }}>
                                    {formatWeightLabel(exercise)}
                                  </Text>
                                )}
                                {exercise.notes ? (
                                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                                    <MaterialCommunityIcons name={AppIcons.notes} size={12} color={theme.colors.outline} style={{ marginRight: 4 }} />
                                    <Text variant="bodySmall" style={{ color: theme.colors.outline, fontStyle: 'italic', flex: 1 }}>
                                      {exercise.notes}
                                    </Text>
                                  </View>
                                ) : null}
                              </View>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                {/* Superset link button */}
                                {!isLinkingMode ? (
                                  <TouchableOpacity 
                                    onPress={() => setSupersetMode({ dayId: day.id, exerciseId: exercise.id })}
                                    style={{ padding: 4 }}
                                  >
                                <MaterialCommunityIcons name={AppIcons.superSet} size={16} color={theme.colors.tertiary} />
                              </TouchableOpacity>
                            ) : isSourceExercise ? (
                              <TouchableOpacity 
                                onPress={() => setSupersetMode(null)}
                                style={{ padding: 4 }}
                              >
                                <Text style={{ color: theme.colors.error, fontSize: 12 }}>Cancel</Text>
                              </TouchableOpacity>
                            ) : (
                              <TouchableOpacity 
                                onPress={() => handleCreateSuperset(day.id, supersetMode.exerciseId, exercise.id)}
                                style={{ padding: 4, backgroundColor: theme.colors.primaryContainer, borderRadius: 4 }}
                              >
                                <Text style={{ color: theme.colors.primary, fontSize: 12 }}>Link</Text>
                              </TouchableOpacity>
                            )}
                            <TouchableOpacity onPress={() => setDeleteConfirmExercise({ dayId: day.id, exerciseId: exercise.id })}>
                              <MaterialCommunityIcons name={AppIcons.close} size={16} color={theme.colors.error} />
                            </TouchableOpacity>
                          </View>
                        </View>
                        </TouchableOpacity>
                      );
                    });
                  })()
                )}

                    {/* Add Exercise Button - only for workout days */}
                    <Button 
                      mode="text" 
                      compact 
                      onPress={() => handleOpenAddExercise(day.id)}
                      style={{ alignSelf: 'flex-start', marginTop: 4 }}
                    >
                      + Add Exercise
                    </Button>

                    {/* Cardio Finisher Section */}
                    {day.cardioFinisher ? (
                      <Surface style={{ marginTop: 12, padding: 12, borderRadius: 8, backgroundColor: theme.colors.secondaryContainer }} elevation={0}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <View style={{ flex: 1 }}>
                            <Text variant="labelMedium" style={{ color: theme.colors.secondary }}>Cardio Finisher</Text>
                            <Text variant="bodyMedium">{day.cardioFinisher.name}</Text>
                            <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                              {day.cardioFinisher.durationMinutes} min • {day.cardioFinisher.intensity}
                            </Text>
                          </View>
                          <TouchableOpacity onPress={() => handleRemoveCardioFinisher(day.id)}>
                            <MaterialCommunityIcons name={AppIcons.close} size={16} color={theme.colors.error} />
                          </TouchableOpacity>
                        </View>
                      </Surface>
                    ) : (
                      <Button 
                        mode="text" 
                        compact 
                        onPress={() => {
                          setEditingDayForFinisher(day.id);
                          setShowCardioFinisherPicker(true);
                        }}
                        style={{ alignSelf: 'flex-start' }}
                        textColor={theme.colors.secondary}
                      >
                        Add Cardio Finisher
                      </Button>
                    )}
                  </>
                )}
              </Surface>
            ))
          )}
        </Surface>

        {/* Summary */}
        {workoutDays.length > 0 && (
          <Surface style={styles.card} elevation={1}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Summary</Text>
            <View style={styles.summaryRow}>
              <Text variant="bodyMedium">{workoutDays.length} days per week</Text>
              <Text variant="bodyMedium">
                {workoutDays.filter(d => d.dayType === 'workout').length} workout {workoutDays.filter(d => d.dayType === 'rest').length} rest {workoutDays.filter(d => d.dayType === 'cardio').length} cardio {workoutDays.filter(d => d.dayType === 'active_recovery').length} recovery
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text variant="bodyMedium">{durationWeeks} week mesocycle</Text>
              <Text variant="bodyMedium">
                {workoutDays.filter(d => d.dayType === 'workout').reduce((sum, d) => 
                  sum + d.exercises.reduce((s, e) => s + e.sets, 0), 0
                )} sets/week
              </Text>
            </View>
            {workoutDays.some(d => d.cardioFinisher) && (
              <View style={styles.summaryRow}>
                <Text variant="bodyMedium">Cardio finishers</Text>
                <Text variant="bodyMedium">
                  {workoutDays.filter(d => d.cardioFinisher).length} days
                </Text>
              </View>
            )}
          </Surface>
        )}
      </ScrollView>

      {/* Save Button */}
      <View style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: withAlpha(theme.colors.outline, 0.2) }]}>
        {!canSave && getValidationHint() && (
          <Text variant="bodySmall" style={{ color: theme.colors.error, textAlign: 'center', marginBottom: 8 }}>
            {getValidationHint()}
          </Text>
        )}
        <Button 
          mode="contained" 
          onPress={handleSaveProgram}
          disabled={!canSave}
          style={styles.saveButton}
        >
          {isEditing ? 'Save Program' : 'Save & Start Program'}
        </Button>
      </View>

      {/* Add Exercise Dialog */}
      <Portal>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }} pointerEvents={showAddExercise ? 'auto' : 'none'}>
        <Dialog 
          visible={showAddExercise} 
          onDismiss={() => setShowAddExercise(false)}
          style={{ maxHeight: '85%' }}
        >
          <Dialog.Title>{isEditingExercise ? 'Edit Exercise' : 'Add Exercise'}</Dialog.Title>
          <Dialog.ScrollArea style={{ paddingHorizontal: 0 }}>
            <ScrollView style={{ paddingHorizontal: 24 }} keyboardShouldPersistTaps="handled">
              {/* Exercise Search */}
              <TextInput
                mode="outlined"
                label="Search exercises"
                value={exerciseSearch}
                onChangeText={setExerciseSearch}
                dense
                style={{ marginBottom: 8 }}
              />

              {/* Muscle Filter */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                <Chip
                  selected={!selectedMuscle}
                  onPress={() => setSelectedMuscle(null)}
                  compact
                  style={{ marginRight: 4 }}
                  showSelectedCheck={false}
                >
                  All
                </Chip>
                {MUSCLE_GROUPS.map(m => (
                  <Chip
                    key={m}
                    selected={selectedMuscle === m}
                    onPress={() => setSelectedMuscle(m)}
                    compact
                    style={{ marginRight: 4 }}
                    showSelectedCheck={false}
                  >
                    {MUSCLE_GROUP_LABELS[m] || m}
                  </Chip>
                ))}
              </ScrollView>

              {/* Exercise List */}
              <View style={[styles.exerciseList, { backgroundColor: theme.colors.surface, borderColor: withAlpha(theme.colors.outline, 0.2) }]}>
                <ScrollView nestedScrollEnabled showsVerticalScrollIndicator>
                  {filteredExercises.map(ex => (
                    <TouchableOpacity
                      key={ex.name}
                      style={[
                        styles.exerciseOption,
                        newExerciseName === ex.name && { backgroundColor: theme.colors.primaryContainer }
                      ]}
                      onPress={() => handleSelectExercise(ex.name, ex.muscleGroup)}
                    >
                      <Text variant="bodyMedium">{ex.name}</Text>
                      <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                        {MUSCLE_GROUP_LABELS[ex.muscleGroup] || ex.muscleGroup}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <Divider style={{ marginVertical: 16 }} />

              {/* Selected Exercise Details */}
              <View style={{ backgroundColor: theme.colors.surface, zIndex: 10 }}>
              {newExerciseName ? (
                <>
                  <Text variant="titleSmall" style={{ marginBottom: 8 }}>
                    {newExerciseName}
                  </Text>
                  
                  <View style={styles.row}>
                    <TextInput
                      mode="outlined"
                      label="Sets"
                      value={newSets}
                      onChangeText={setNewSets}
                      keyboardType="number-pad"
                      dense
                      style={{ flex: 1, marginRight: 8 }}
                    />
                    <TextInput
                      mode="outlined"
                      label="Min Reps"
                      value={newRepsMin}
                      onChangeText={setNewRepsMin}
                      keyboardType="number-pad"
                      dense
                      style={{ flex: 1, marginRight: 8 }}
                    />
                    <TextInput
                      mode="outlined"
                      label="Max Reps"
                      value={newRepsMax}
                      onChangeText={setNewRepsMax}
                      keyboardType="number-pad"
                      dense
                      style={{ flex: 1 }}
                    />
                  </View>

                  <View style={[styles.row, { marginTop: 8 }]}>
                    <TextInput
                      mode="outlined"
                      label="RIR"
                      value={newRir}
                      onChangeText={setNewRir}
                      keyboardType="number-pad"
                      dense
                      style={{ flex: 1, marginRight: 8 }}
                    />
                    <TextInput
                      mode="outlined"
                      label="Rest (sec)"
                      value={newRest}
                      onChangeText={setNewRest}
                      keyboardType="number-pad"
                      dense
                      style={{ flex: 1 }}
                    />
                  </View>

                  <TextInput
                    mode="outlined"
                    label="Notes (optional)"
                    value={newExerciseNotes}
                    onChangeText={setNewExerciseNotes}
                    dense
                    multiline
                    numberOfLines={2}
                    placeholder="e.g., 1s pause at bottom, controlled negative"
                    style={{ marginTop: 8 }}
                  />

                  {/* Weight Prescription */}
                  <Text variant="labelLarge" style={{ marginTop: 16, marginBottom: 8 }}>Weight</Text>
                  <SegmentedButtons
                    value={newWeightMode}
                    onValueChange={(v) => setNewWeightMode(v as WeightMode)}
                    buttons={[
                      { value: 'auto', label: 'Auto' },
                      { value: 'percentage', label: '% of 1RM' },
                      { value: 'fixed', label: 'Fixed' },
                    ]}
                    style={{ marginBottom: 12 }}
                  />

                  {newWeightMode === 'percentage' && (
                    <View>
                      <View style={styles.row}>
                        <TextInput
                          mode="outlined"
                          label="% of 1RM"
                          value={newPercentage}
                          onChangeText={setNewPercentage}
                          keyboardType="number-pad"
                          dense
                          style={{ flex: 1, marginRight: 8 }}
                          placeholder="e.g., 75"
                        />
                        <View style={{ flex: 1, justifyContent: 'center' }}>
                          {(() => {
                            const record = getOneRepMax(newExerciseName);
                            const pct = parseFloat(newPercentage);
                            if (record && pct > 0) {
                              const resolved = Math.round((record.weight * pct / 100) / 5) * 5;
                              return (
                                <Surface style={{ padding: 8, borderRadius: 8, backgroundColor: theme.colors.primaryContainer }} elevation={0}>
                                  <Text variant="labelSmall" style={{ color: theme.colors.onPrimaryContainer }}>
                                    = {resolved} {record.unit}
                                  </Text>
                                  <Text variant="labelSmall" style={{ color: theme.colors.onPrimaryContainer, opacity: 0.7 }}>
                                    1RM: {record.weight} {record.unit}
                                  </Text>
                                </Surface>
                              );
                            }
                            if (pct > 0 && !record) {
                              return (
                                <Text variant="bodySmall" style={{ color: theme.colors.outline, fontStyle: 'italic' }}>
                                  No 1RM for this exercise — add in Profile
                                </Text>
                              );
                            }
                            return null;
                          })()}
                        </View>
                      </View>
                    </View>
                  )}

                  {newWeightMode === 'fixed' && (
                    <TextInput
                      mode="outlined"
                      label={`Weight (${userState.units === 'metric' ? 'kg' : 'lbs'})`}
                      value={newFixedWeight}
                      onChangeText={setNewFixedWeight}
                      keyboardType="number-pad"
                      dense
                      placeholder="e.g., 185"
                    />
                  )}
                </>
              ) : (
                <Text variant="bodySmall" style={{ color: theme.colors.outline, textAlign: 'center' }}>
                  Select an exercise from the list above
                </Text>
              )}
              </View>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => { setShowAddExercise(false); setEditingExerciseRef(null); }}>Cancel</Button>
            <Button onPress={handleAddExercise} disabled={!newExerciseName}>
              {isEditingExercise ? 'Save' : 'Add Exercise'}
            </Button>
          </Dialog.Actions>
        </Dialog>
        </KeyboardAvoidingView>

        {/* Delete Day Confirmation Dialog */}
        <Dialog visible={!!deleteConfirmDay} onDismiss={() => setDeleteConfirmDay(null)}>
          <Dialog.Title>Delete Workout Day?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to delete this workout day? All exercises in this day will be removed.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteConfirmDay(null)}>Cancel</Button>
            <Button 
              textColor={theme.colors.error}
              onPress={() => {
                if (deleteConfirmDay) {
                  handleRemoveDay(deleteConfirmDay);
                  setDeleteConfirmDay(null);
                }
              }}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Delete Exercise Confirmation Dialog */}
        <Dialog visible={!!deleteConfirmExercise} onDismiss={() => setDeleteConfirmExercise(null)}>
          <Dialog.Title>Remove Exercise?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to remove this exercise from the workout day?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteConfirmExercise(null)}>Cancel</Button>
            <Button 
              textColor={theme.colors.error}
              onPress={() => {
                if (deleteConfirmExercise) {
                  handleRemoveExercise(deleteConfirmExercise.dayId, deleteConfirmExercise.exerciseId);
                  setDeleteConfirmExercise(null);
                }
              }}
            >
              Remove
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Day Type Picker Dialog */}
      <Portal>
        <Dialog visible={showDayTypePicker} onDismiss={() => setShowDayTypePicker(false)}>
          <Dialog.Title>Add Day</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ marginBottom: 16, color: theme.colors.outline }}>
              What type of day would you like to add?
            </Text>
            <View style={{ gap: 8 }}>
              <TouchableOpacity 
                onPress={() => handleAddDayWithType('workout')}
                style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  padding: 16, 
                  borderRadius: 12,
                  backgroundColor: theme.colors.primaryContainer,
                }}
              >
                <MaterialCommunityIcons name={AppIcons.workout} size={24} color={theme.colors.primary} style={{ marginRight: 12 }} />
                <View>
                  <Text variant="titleMedium">Workout Day</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                    Add exercises for strength training
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => handleAddDayWithType('rest')}
                style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  padding: 16, 
                  borderRadius: 12,
                  backgroundColor: theme.colors.surfaceVariant,
                }}
              >
                <MaterialCommunityIcons name={AppIcons.rest} size={24} color={theme.colors.onSurfaceVariant} style={{ marginRight: 12 }} />
                <View>
                  <Text variant="titleMedium">Rest Day</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                    Complete rest for recovery
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => handleAddDayWithType('cardio')}
                style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  padding: 16, 
                  borderRadius: 12,
                  backgroundColor: theme.colors.secondaryContainer,
                }}
              >
                <MaterialCommunityIcons name={AppIcons.cardio} size={24} color={theme.colors.secondary} style={{ marginRight: 12 }} />
                <View>
                  <Text variant="titleMedium">Cardio Day</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                    Focus on cardiovascular training
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => handleAddDayWithType('active_recovery')}
                style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  padding: 16, 
                  borderRadius: 12,
                  backgroundColor: theme.colors.tertiaryContainer,
                }}
              >
                <MaterialCommunityIcons name={AppIcons.recovery} size={24} color={theme.colors.tertiary} style={{ marginRight: 12 }} />
                <View>
                  <Text variant="titleMedium">Active Recovery</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                    Light movement, stretching, mobility
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDayTypePicker(false)}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Cardio Finisher Picker Dialog */}
      <Portal>
        <Dialog 
          visible={showCardioFinisherPicker} 
          onDismiss={() => {
            setShowCardioFinisherPicker(false);
            setEditingDayForFinisher(null);
          }}
          style={{ maxHeight: '80%' }}
        >
          <Dialog.Title>Choose Cardio Finisher</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView style={{ paddingHorizontal: 24 }}>
              <Text variant="bodySmall" style={{ color: theme.colors.outline, marginBottom: 12 }}>
                A quick cardio burst at the end of your workout
              </Text>
              {CARDIO_FINISHERS.map((finisher, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => editingDayForFinisher && handleAddCardioFinisher(editingDayForFinisher, finisher)}
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 8,
                    backgroundColor: theme.colors.surfaceVariant,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <Text variant="titleSmall">{finisher.name}</Text>
                      {finisher.notes && (
                        <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                          {finisher.notes}
                        </Text>
                      )}
                      <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                        <Text variant="labelSmall" style={{ color: theme.colors.secondary }}>
                          {finisher.durationMinutes} min
                        </Text>
                        <Text variant="labelSmall" style={{ color: theme.colors.primary }}>
                          {finisher.intensity}
                        </Text>
                        {finisher.caloriesBurned && (
                          <Text variant="labelSmall" style={{ color: theme.colors.secondary }}>
                            ~{finisher.caloriesBurned} cal
                          </Text>
                        )}
                      </View>
                    </View>
                    <MaterialCommunityIcons name={AppIcons.chevronRight} size={20} color={theme.colors.onSurfaceVariant} />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => {
              setShowCardioFinisherPicker(false);
              setEditingDayForFinisher(null);
            }}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  input: {
    marginBottom: 12,
  },
  label: {
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    marginRight: 4,
    marginBottom: 4,
  },
  emptyDays: {
    alignItems: 'center',
    padding: 24,
  },
  dayCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayNameInput: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: 16,
    fontWeight: '600',
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
    borderRadius: 4,
  },
  supersetGroup: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 8,
    marginVertical: 4,
  },
  supersetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  exerciseList: {
    maxHeight: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  exerciseOption: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'transparent',
  },
  saveButton: {
    paddingVertical: 8,
  },
});

export default CreateProgramScreen;
