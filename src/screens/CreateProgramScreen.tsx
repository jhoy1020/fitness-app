// Create Program Screen - Build custom workout programs

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
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
  IconButton
} from 'react-native-paper';
import { useMesoCycle } from '../context/MesoCycleContext';
import { EXERCISE_LIBRARY } from '../services/db/exerciseLibrary';
import type { MuscleGroup, ProgramDayTemplate, ProgramExerciseTemplate, TrainingProgram } from '../types';
import { MUSCLE_GROUP_LABELS } from '../utils/constants';

interface CreateProgramScreenProps {
  navigation: any;
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
  exercises: ExerciseEntry[];
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
}

export function CreateProgramScreen({ navigation }: CreateProgramScreenProps) {
  const theme = useTheme();
  const { dispatch } = useMesoCycle();

  // Program basics
  const [programName, setProgramName] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [durationWeeks, setDurationWeeks] = useState('5');
  const [split, setSplit] = useState('Push/Pull/Legs');

  // Workout days
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([]);
  
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

  // Filter exercises by search and muscle
  const filteredExercises = EXERCISE_LIBRARY.filter(ex => {
    const matchesSearch = !exerciseSearch || 
      ex.name.toLowerCase().includes(exerciseSearch.toLowerCase());
    const matchesMuscle = !selectedMuscle || ex.muscleGroup === selectedMuscle;
    return matchesSearch && matchesMuscle;
  }).slice(0, 15);

  // Add a new workout day
  const handleAddDay = () => {
    const dayNumber = workoutDays.length + 1;
    const newDay: WorkoutDay = {
      id: Date.now().toString(),
      name: `Day ${dayNumber}`,
      exercises: [],
    };
    setWorkoutDays([...workoutDays, newDay]);
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

  // Open add exercise dialog
  const handleOpenAddExercise = (dayId: string) => {
    setEditingDayId(dayId);
    setShowAddExercise(true);
    setExerciseSearch('');
    setSelectedMuscle(null);
    setNewExerciseName('');
    setNewSets('3');
    setNewRepsMin('8');
    setNewRepsMax('12');
    setNewRir('2');
    setNewRest('120');
  };

  // Select an exercise from the library
  const handleSelectExercise = (exerciseName: string, muscleGroup: MuscleGroup) => {
    setNewExerciseName(exerciseName);
    setNewExerciseMuscle(muscleGroup);
  };

  // Add exercise to day
  const handleAddExercise = () => {
    if (!editingDayId || !newExerciseName) return;

    const newExercise: ExerciseEntry = {
      id: Date.now().toString(),
      exerciseName: newExerciseName,
      muscleGroup: newExerciseMuscle,
      sets: parseInt(newSets) || 3,
      repsMin: parseInt(newRepsMin) || 8,
      repsMax: parseInt(newRepsMax) || 12,
      rirTarget: parseInt(newRir) || 2,
      restSeconds: parseInt(newRest) || 120,
    };

    setWorkoutDays(workoutDays.map(d => 
      d.id === editingDayId 
        ? { ...d, exercises: [...d.exercises, newExercise] }
        : d
    ));
    setShowAddExercise(false);
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
    if (!programName.trim() || workoutDays.length === 0) return;

    // Build the program
    const program: TrainingProgram = {
      id: `custom-${Date.now()}`,
      name: programName.trim(),
      description: description.trim() || `Custom ${split} program`,
      difficulty,
      durationWeeks: parseInt(durationWeeks) || 5,
      daysPerWeek: workoutDays.length,
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
      weekTemplate: {
        days: workoutDays.map((day, index) => ({
          dayNumber: index + 1,
          name: day.name,
          muscleGroups: [...new Set(day.exercises.map(e => e.muscleGroup))],
          exercises: day.exercises.map(e => ({
            exerciseName: e.exerciseName,
            muscleGroup: e.muscleGroup,
            sets: e.sets,
            repsMin: e.repsMin,
            repsMax: e.repsMax,
            rirTarget: e.rirTarget,
            restSeconds: e.restSeconds,
          })),
        })),
      },
    };

    // Start the program
    dispatch({
      type: 'START_PROGRAM',
      payload: {
        program,
        startDate: new Date().toISOString(),
      },
    });

    navigation.navigate('Home');
  };

  const canSave = programName.trim() && workoutDays.length > 0 && 
    workoutDays.every(d => d.exercises.length > 0);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
              {SPLIT_OPTIONS.map(s => (
                <Chip
                  key={s}
                  selected={split === s}
                  onPress={() => setSplit(s)}
                  style={styles.chip}
                  showSelectedCheck={false}
                >
                  {s}
                </Chip>
              ))}
            </View>
          </ScrollView>
        </Surface>

        {/* Workout Days */}
        <Surface style={styles.card} elevation={1}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium">Workout Days</Text>
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
              <Text style={{ fontSize: 32, marginBottom: 8 }}>📅</Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.outline }}>
                No workout days yet. Add your first day!
              </Text>
            </View>
          ) : (
            workoutDays.map((day, dayIndex) => (
              <Surface key={day.id} style={styles.dayCard} elevation={0}>
                <View style={styles.dayHeader}>
                  <TextInput
                    mode="flat"
                    value={day.name}
                    onChangeText={(v) => handleUpdateDayName(day.id, v)}
                    style={styles.dayNameInput}
                    dense
                  />
                  <TouchableOpacity onPress={() => handleRemoveDay(day.id)}>
                    <Text style={{ color: theme.colors.error, fontSize: 18 }}>✕</Text>
                  </TouchableOpacity>
                </View>

                {day.exercises.length === 0 ? (
                  <Text variant="bodySmall" style={{ color: theme.colors.outline, marginVertical: 8 }}>
                    No exercises yet
                  </Text>
                ) : (
                  day.exercises.map((exercise, exIndex) => (
                    <View key={exercise.id} style={styles.exerciseRow}>
                      <View style={{ flex: 1 }}>
                        <Text variant="bodyMedium">{exercise.exerciseName}</Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                          {exercise.sets} sets × {exercise.repsMin}-{exercise.repsMax} reps @ RIR {exercise.rirTarget}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => handleRemoveExercise(day.id, exercise.id)}>
                        <Text style={{ color: theme.colors.error }}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                )}

                <Button 
                  mode="text" 
                  compact 
                  onPress={() => handleOpenAddExercise(day.id)}
                  style={{ alignSelf: 'flex-start', marginTop: 4 }}
                >
                  + Add Exercise
                </Button>
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
                {workoutDays.reduce((sum, d) => sum + d.exercises.length, 0)} total exercises
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text variant="bodyMedium">{durationWeeks} week mesocycle</Text>
              <Text variant="bodyMedium">
                {workoutDays.reduce((sum, d) => 
                  sum + d.exercises.reduce((s, e) => s + e.sets, 0), 0
                )} sets/week
              </Text>
            </View>
          </Surface>
        )}
      </ScrollView>

      {/* Save Button */}
      <View style={[styles.footer, { backgroundColor: theme.colors.surface }]}>
        <Button 
          mode="contained" 
          onPress={handleSaveProgram}
          disabled={!canSave}
          style={styles.saveButton}
        >
          Save & Start Program
        </Button>
      </View>

      {/* Add Exercise Dialog */}
      <Portal>
        <Dialog 
          visible={showAddExercise} 
          onDismiss={() => setShowAddExercise(false)}
          style={{ maxHeight: '85%' }}
        >
          <Dialog.Title>Add Exercise</Dialog.Title>
          <Dialog.ScrollArea style={{ paddingHorizontal: 0 }}>
            <ScrollView style={{ paddingHorizontal: 24 }}>
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
              <View style={[styles.exerciseList, { backgroundColor: theme.colors.surface }]}>
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
                      label="RIR Target"
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
            <Button onPress={() => setShowAddExercise(false)}>Cancel</Button>
            <Button onPress={handleAddExercise} disabled={!newExerciseName}>
              Add Exercise
            </Button>
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
    backgroundColor: 'rgba(0,212,255,0.05)',
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
    borderBottomColor: 'rgba(100,130,153,0.2)',
  },
  exerciseList: {
    maxHeight: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(100,130,153,0.2)',
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
    borderTopColor: 'rgba(100,130,153,0.2)',
  },
  saveButton: {
    paddingVertical: 8,
  },
});

export default CreateProgramScreen;
