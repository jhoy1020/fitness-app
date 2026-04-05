/**
 * EditWorkoutDialog — Shared dialog for editing workout name and sets.
 * Used by HomeScreen and HistoryScreen.
 */

import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button, Surface, useTheme, Portal, Dialog, TextInput } from 'react-native-paper';
import { TouchableOpacity } from 'react-native';
import { withAlpha } from '../../theme';
import { EXERCISE_LIBRARY } from '../../services/db/exerciseLibrary';

// ─── Types ────────────────────────────────────────────────
export interface EditableSet {
  id: string;
  exerciseName: string;
  muscleGroup: string;
  weight: string;
  reps: string;
  isNew?: boolean;
}

export interface EditWorkoutDialogProps {
  visible: boolean;
  onDismiss: () => void;
  workoutName: string;
  onNameChange: (name: string) => void;
  sets: EditableSet[];
  onSetsChange: (sets: EditableSet[]) => void;
  onSave: () => void;
  /** Label for the "add set" button. Default: "+ Add Set" */
  addSetLabel?: string;
  /** Whether Save is disabled. Default: false */
  saveDisabled?: boolean;
}

// ─── Component ────────────────────────────────────────────
export function EditWorkoutDialog({
  visible,
  onDismiss,
  workoutName,
  onNameChange,
  sets,
  onSetsChange,
  onSave,
  addSetLabel = '+ Add Set',
  saveDisabled = false,
}: EditWorkoutDialogProps) {
  const theme = useTheme();

  // Local state for add-set form
  const [showAddSet, setShowAddSet] = useState(false);
  const [newSetExercise, setNewSetExercise] = useState('');
  const [newSetWeight, setNewSetWeight] = useState('');
  const [newSetReps, setNewSetReps] = useState('');
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [showExerciseDropdown, setShowExerciseDropdown] = useState(false);

  const filteredExercises = useMemo(() => {
    const search = exerciseSearch.toLowerCase().trim();
    if (!search) return EXERCISE_LIBRARY.slice(0, 10);
    return EXERCISE_LIBRARY.filter(ex =>
      ex.name.toLowerCase().includes(search) ||
      ex.muscleGroup.toLowerCase().includes(search)
    ).slice(0, 10);
  }, [exerciseSearch]);

  const handleUpdateSet = (setId: string, field: 'weight' | 'reps', value: string) => {
    onSetsChange(sets.map(s => s.id === setId ? { ...s, [field]: value } : s));
  };

  const handleDeleteSet = (setId: string) => {
    onSetsChange(sets.filter(s => s.id !== setId));
  };

  const handleAddNewSet = () => {
    if (!newSetExercise || !newSetWeight || !newSetReps) return;
    const lib = EXERCISE_LIBRARY.find(e => e.name === newSetExercise);
    const newSet: EditableSet = {
      id: `new-${Date.now()}`,
      exerciseName: newSetExercise,
      muscleGroup: lib?.muscleGroup || 'other',
      weight: newSetWeight,
      reps: newSetReps,
      isNew: true,
    };
    onSetsChange([...sets, newSet]);
    setNewSetExercise('');
    setNewSetWeight('');
    setNewSetReps('');
    setShowAddSet(false);
    setExerciseSearch('');
    setShowExerciseDropdown(false);
  };

  const resetAddForm = () => {
    setShowAddSet(false);
    setNewSetExercise('');
    setNewSetWeight('');
    setNewSetReps('');
    setExerciseSearch('');
    setShowExerciseDropdown(false);
  };

  return (
    <Portal>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <Dialog
          visible={visible}
          onDismiss={() => { resetAddForm(); onDismiss(); }}
          style={{ maxHeight: '85%' }}
        >
          <Dialog.Title>Edit Workout</Dialog.Title>
          <Dialog.ScrollArea style={{ paddingHorizontal: 0 }}>
            <ScrollView style={{ paddingHorizontal: 24 }} keyboardShouldPersistTaps="handled">
              <TextInput
                label="Workout Name"
                value={workoutName}
                onChangeText={onNameChange}
                mode="outlined"
                style={{ marginBottom: 16 }}
              />

              <Text variant="titleSmall" style={{ marginBottom: 8 }}>Sets</Text>

              {sets.length === 0 ? (
                <Text variant="bodySmall" style={{ color: theme.colors.outline, marginBottom: 12 }}>
                  No sets recorded
                </Text>
              ) : (
                sets.map((set) => (
                  <View key={set.id} style={styles.editSetRow}>
                    <Text variant="bodySmall" style={{ flex: 1 }} numberOfLines={1}>
                      {set.exerciseName}
                    </Text>
                    <TextInput
                      value={set.weight}
                      onChangeText={(v) => handleUpdateSet(set.id, 'weight', v)}
                      keyboardType="numeric"
                      mode="outlined"
                      dense
                      style={styles.editSetInput}
                      placeholder="lbs"
                    />
                    <Text style={{ marginHorizontal: 4 }}>×</Text>
                    <TextInput
                      value={set.reps}
                      onChangeText={(v) => handleUpdateSet(set.id, 'reps', v)}
                      keyboardType="numeric"
                      mode="outlined"
                      dense
                      style={styles.editSetInput}
                      placeholder="reps"
                    />
                    <TouchableOpacity
                      onPress={() => handleDeleteSet(set.id)}
                      style={{ padding: 12, minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}
                      accessibilityLabel="Delete set"
                      accessibilityRole="button"
                    >
                      <Text style={{ color: theme.colors.error }}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}

              {/* Add New Set */}
              {showAddSet ? (
                <View style={[styles.addSetForm, { backgroundColor: withAlpha(theme.colors.primary, 0.05) }]}>
                  <View style={{ position: 'relative', zIndex: 1 }}>
                    <TextInput
                      label="Exercise"
                      value={newSetExercise || exerciseSearch}
                      onChangeText={(text) => {
                        setExerciseSearch(text);
                        setNewSetExercise('');
                        setShowExerciseDropdown(true);
                      }}
                      onFocus={() => setShowExerciseDropdown(true)}
                      mode="outlined"
                      dense
                      placeholder="Search exercises..."
                      style={{ marginBottom: showExerciseDropdown ? 0 : 8 }}
                    />
                    {showExerciseDropdown && (
                      <Surface style={styles.exerciseDropdown} elevation={3}>
                        <ScrollView style={{ maxHeight: 150 }} nestedScrollEnabled>
                          {filteredExercises.map((ex) => (
                            <TouchableOpacity
                              key={ex.name}
                              style={[styles.exerciseOption, { borderBottomColor: withAlpha(theme.colors.outline, 0.15) }]}
                              onPress={() => {
                                setNewSetExercise(ex.name);
                                setExerciseSearch('');
                                setShowExerciseDropdown(false);
                              }}
                            >
                              <Text variant="bodyMedium">{ex.name}</Text>
                              <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                                {ex.muscleGroup}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </Surface>
                    )}
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                    <TextInput
                      label="Weight"
                      value={newSetWeight}
                      onChangeText={setNewSetWeight}
                      keyboardType="numeric"
                      mode="outlined"
                      dense
                      style={{ flex: 1 }}
                    />
                    <TextInput
                      label="Reps"
                      value={newSetReps}
                      onChangeText={setNewSetReps}
                      keyboardType="numeric"
                      mode="outlined"
                      dense
                      style={{ flex: 1 }}
                    />
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Button mode="outlined" onPress={resetAddForm} style={{ flex: 1 }}>
                      Cancel
                    </Button>
                    <Button mode="contained" onPress={handleAddNewSet} style={{ flex: 1 }}>
                      Add Set
                    </Button>
                  </View>
                </View>
              ) : (
                <Button
                  mode="outlined"
                  onPress={() => {
                    setShowAddSet(true);
                    setExerciseSearch('');
                    setShowExerciseDropdown(false);
                  }}
                  style={{ marginTop: 8 }}
                >
                  {addSetLabel}
                </Button>
              )}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => { resetAddForm(); onDismiss(); }}>Cancel</Button>
            <Button onPress={() => { resetAddForm(); onSave(); }} disabled={saveDisabled}>Save Changes</Button>
          </Dialog.Actions>
        </Dialog>
      </KeyboardAvoidingView>
    </Portal>
  );
}

// ─── Styles ───────────────────────────────────────────────
const styles = StyleSheet.create({
  editSetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  editSetInput: {
    width: 60,
    textAlign: 'center',
  },
  addSetForm: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'transparent',
    borderRadius: 8,
  },
  exerciseDropdown: {
    marginTop: 4,
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  exerciseOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
});

export default EditWorkoutDialog;
