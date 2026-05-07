// AddOneRepMaxDialog — fully self-contained modal for entering a new 1RM.
// Owns its own search, exercise, weight, reps, method, and dropdown state —
// none of these belong on ProfileScreen. The dialog accepts an `onSave`
// callback and a `visible` flag; the parent doesn't need to know anything
// about the form internals.
//
// Search-and-pick exercise input lives inline (with a dropdown of matches)
// because the matching is one filter call and adding a hook would be
// overkill at the current size.

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  SegmentedButtons,
  Surface,
  Searchbar,
  Portal,
  Dialog,
  useTheme,
} from 'react-native-paper';
import { spacing, borderRadius } from '../../../theme';
import { calculate1RM_Epley } from '../../../utils/formulas/formulas';

const MAX_SEARCH_RESULTS = 5;
const MIN_REPS_FOR_CALCULATION = 1;
const RADIX_DECIMAL = 10;
const DROPDOWN_MAX_HEIGHT = 120;

type Method = 'tested' | 'calculated';

interface ExerciseOption {
  name: string;
  muscleGroup: string;
}

export interface OneRepMaxDraft {
  exerciseName: string;
  weight: number;
  method: Method;
  unit: 'lbs' | 'kg';
}

interface Props {
  visible: boolean;
  onDismiss: () => void;
  onSave: (draft: OneRepMaxDraft) => void;
  exercises: ExerciseOption[];
  weightUnit: 'lbs' | 'kg';
}

export function AddOneRepMaxDialog({
  visible,
  onDismiss,
  onSave,
  exercises,
  weightUnit,
}: Props) {
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const [exerciseName, setExerciseName] = useState('');
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('1');
  const [method, setMethod] = useState<Method>('tested');
  const [showDropdown, setShowDropdown] = useState(false);

  const resetForm = () => {
    setSearch('');
    setExerciseName('');
    setWeight('');
    setReps('1');
    setShowDropdown(false);
  };

  const handleDismiss = () => {
    onDismiss();
    // Defer reset until after the dismiss animation triggers — keeps the
    // closing UI from flickering its value to empty mid-transition. In
    // practice React batches this with the prop change, which is fine.
    resetForm();
  };

  const handleSave = () => {
    if (!exerciseName || !weight) return;
    const parsedWeight = parseFloat(weight);
    const parsedReps = parseInt(reps, RADIX_DECIMAL);
    let finalWeight = parsedWeight;
    if (method === 'calculated' && parsedReps > MIN_REPS_FOR_CALCULATION) {
      finalWeight = Math.round(
        calculate1RM_Epley(parsedWeight, parsedReps),
      );
    }
    onSave({
      exerciseName,
      weight: finalWeight,
      method,
      unit: weightUnit,
    });
    resetForm();
  };

  const matches = search.length > 0
    ? exercises
        .filter((ex) =>
          ex.name.toLowerCase().includes(search.toLowerCase()),
        )
        .slice(0, MAX_SEARCH_RESULTS)
    : [];

  const showCalcEstimate =
    method === 'calculated' &&
    weight &&
    reps &&
    parseInt(reps, RADIX_DECIMAL) > MIN_REPS_FOR_CALCULATION;

  return (
    <Portal>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.kav}
        pointerEvents={visible ? 'auto' : 'none'}
      >
        <Dialog visible={visible} onDismiss={handleDismiss}>
          <Dialog.Title>Add 1RM Record</Dialog.Title>
          <Dialog.Content>
            <Searchbar
              placeholder="Search exercise..."
              value={search}
              onChangeText={(text) => {
                setSearch(text);
                setExerciseName(text);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              style={styles.searchbar}
            />

            {showDropdown && matches.length > 0 && (
              <View style={styles.dropdown}>
                <ScrollView nestedScrollEnabled>
                  {matches.map((ex, index) => (
                    <TouchableOpacity
                      key={`${ex.name}-${index}`}
                      onPress={() => {
                        setExerciseName(ex.name);
                        setSearch(ex.name);
                        setShowDropdown(false);
                      }}
                      style={[
                        styles.dropdownItem,
                        { borderBottomColor: theme.colors.outline },
                      ]}
                    >
                      <Text>{ex.name}</Text>
                      <Text
                        variant="bodySmall"
                        style={{ color: theme.colors.outline }}
                      >
                        {ex.muscleGroup}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <SegmentedButtons
              value={method}
              onValueChange={(v) => setMethod(v as Method)}
              buttons={[
                { value: 'tested', label: '✓ Tested 1RM' },
                { value: 'calculated', label: 'Calculate' },
              ]}
              style={styles.methodToggle}
            />

            {method === 'tested' ? (
              <TextInput
                mode="outlined"
                label={`1RM Weight (${weightUnit})`}
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
              />
            ) : (
              <View style={styles.calcGroup}>
                <Text
                  variant="bodySmall"
                  style={{ color: theme.colors.outline }}
                >
                  Enter a recent set in {weightUnit} and we'll calculate your
                  estimated 1RM
                </Text>
                <View style={styles.calcRow}>
                  <TextInput
                    mode="outlined"
                    label={`Weight (${weightUnit})`}
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="numeric"
                    style={styles.calcInput}
                  />
                  <TextInput
                    mode="outlined"
                    label="Reps"
                    value={reps}
                    onChangeText={setReps}
                    keyboardType="numeric"
                    style={styles.calcInput}
                  />
                </View>
                {showCalcEstimate && (
                  <Surface style={styles.estimateCard} elevation={1}>
                    <Text
                      variant="bodySmall"
                      style={{ color: theme.colors.outline }}
                    >
                      Estimated 1RM:
                    </Text>
                    <Text
                      variant="headlineSmall"
                      style={{ color: theme.colors.primary }}
                    >
                      {Math.round(
                        calculate1RM_Epley(
                          parseFloat(weight),
                          parseInt(reps, RADIX_DECIMAL),
                        ),
                      )}{' '}
                      {weightUnit}
                    </Text>
                  </Surface>
                )}
              </View>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleDismiss}>Cancel</Button>
            <Button
              mode="contained"
              onPress={handleSave}
              disabled={!exerciseName || !weight}
            >
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>
      </KeyboardAvoidingView>
    </Portal>
  );
}

const styles = StyleSheet.create({
  kav: {
    flex: 1,
  },
  searchbar: {
    marginBottom: spacing.sm,
  },
  dropdown: {
    maxHeight: DROPDOWN_MAX_HEIGHT,
    marginBottom: spacing.sm + spacing.xs,
  },
  dropdownItem: {
    padding: spacing.sm,
    borderBottomWidth: 1,
  },
  methodToggle: {
    marginBottom: spacing.sm + spacing.xs,
  },
  calcGroup: {
    gap: spacing.sm,
  },
  calcRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  calcInput: {
    flex: 1,
  },
  estimateCard: {
    padding: spacing.sm + spacing.xs,
    borderRadius: borderRadius.md,
  },
});
