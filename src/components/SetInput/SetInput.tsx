// Set Input Component
// Input row for logging a single set

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { TextInput, Checkbox, Text, useTheme, Surface, Menu } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { WorkoutSet } from '../../types';
import { RPE_DESCRIPTIONS } from '../../utils/constants/constants';
import { statusColors } from '../../theme';

interface SetInputProps {
  setNumber: number;
  weight: number;
  reps: number;
  rpe?: number;
  isWarmup: boolean;
  weightUnit: 'lbs' | 'kg';
  previousWeight?: number;
  previousReps?: number;
  suggestedWeight?: number;
  suggestedReps?: number;
  onWeightChange: (weight: number) => void;
  onRepsChange: (reps: number) => void;
  onRpeChange: (rpe: number | undefined) => void;
  onWarmupChange: (isWarmup: boolean) => void;
  onDelete?: () => void;
  onComplete?: () => void;
  isCompleted?: boolean;
}

export function SetInput({
  setNumber,
  weight,
  reps,
  rpe,
  isWarmup,
  weightUnit,
  previousWeight,
  previousReps,
  suggestedWeight,
  suggestedReps,
  onWeightChange,
  onRepsChange,
  onRpeChange,
  onWarmupChange,
  onDelete,
  onComplete,
  isCompleted = false,
}: SetInputProps) {
  const theme = useTheme();
  const [rpeMenuVisible, setRpeMenuVisible] = useState(false);

  const handleWeightChange = (text: string) => {
    const value = parseFloat(text) || 0;
    onWeightChange(value);
  };

  const handleRepsChange = (text: string) => {
    const value = parseInt(text, 10) || 0;
    onRepsChange(value);
  };

  const usePreviousWeight = () => {
    if (previousWeight) onWeightChange(previousWeight);
  };

  const usePreviousReps = () => {
    if (previousReps) onRepsChange(previousReps);
  };

  const useSuggested = () => {
    if (suggestedWeight) onWeightChange(suggestedWeight);
    if (suggestedReps) onRepsChange(suggestedReps);
  };

  return (
    <Surface 
      style={[
        styles.container, 
        isWarmup && styles.warmupContainer,
        isCompleted && styles.completedContainer,
        { backgroundColor: isCompleted ? theme.colors.primaryContainer : theme.colors.surface }
      ]} 
      elevation={1}
    >
      <View style={styles.row}>
        {/* Set number */}
        <View style={styles.setNumber}>
          <Text variant="titleMedium" style={{ color: isWarmup ? theme.colors.outline : theme.colors.primary }}>
            {isWarmup ? 'W' : setNumber}
          </Text>
        </View>

        {/* Previous/Suggested */}
        {(previousWeight || suggestedWeight) && (
          <View style={styles.previousContainer}>
            <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
              {suggestedWeight ? 'Suggested' : 'Previous'}
            </Text>
            <Text 
              variant="bodySmall" 
              style={[styles.previousText, { color: theme.colors.outline }]}
              onPress={suggestedWeight ? useSuggested : undefined}
            >
              {suggestedWeight || previousWeight} × {suggestedReps || previousReps}
            </Text>
          </View>
        )}

        {/* Weight input */}
        <TextInput
          style={styles.input}
          mode="outlined"
          label={weightUnit}
          keyboardType="decimal-pad"
          value={weight > 0 ? weight.toString() : ''}
          onChangeText={handleWeightChange}
          dense
        />

        {/* Reps input */}
        <TextInput
          style={styles.input}
          mode="outlined"
          label="Reps"
          keyboardType="number-pad"
          value={reps > 0 ? reps.toString() : ''}
          onChangeText={handleRepsChange}
          dense
        />

        {/* RPE selector */}
        <Menu
          visible={rpeMenuVisible}
          onDismiss={() => setRpeMenuVisible(false)}
          anchor={
            <TouchableOpacity
              onPress={() => setRpeMenuVisible(true)}
              style={{ padding: 8, borderWidth: 1, borderColor: rpe ? theme.colors.primary : theme.colors.outline, borderRadius: 20 }}
            >
              <Text style={{ fontSize: 14 }}>{rpe ? `RPE ${rpe}` : <MaterialCommunityIcons name="chart-bar" size={14} color={theme.colors.outline} />}</Text>
            </TouchableOpacity>
          }
        >
          {[6, 7, 8, 9, 9.5, 10].map((value) => (
            <Menu.Item
              key={value}
              onPress={() => {
                onRpeChange(value);
                setRpeMenuVisible(false);
              }}
              title={`${rpe === value ? '✓ ' : ''}RPE ${value}`}
            />
          ))}
          {rpe && (
            <Menu.Item
              onPress={() => {
                onRpeChange(undefined);
                setRpeMenuVisible(false);
              }}
              title="✕ Clear RPE"
            />
          )}
        </Menu>

        {/* Warmup checkbox */}
        <Checkbox
          status={isWarmup ? 'checked' : 'unchecked'}
          onPress={() => onWarmupChange(!isWarmup)}
        />

        {/* Actions */}
        {onComplete && !isCompleted && (
          <TouchableOpacity
            onPress={onComplete}
            style={{ padding: 8, backgroundColor: theme.colors.primary, borderRadius: 20 }}
          >
            <MaterialCommunityIcons name="check" size={16} color={theme.colors.onPrimary} />
          </TouchableOpacity>
        )}
        
        {onDelete && (
          <TouchableOpacity
            onPress={onDelete}
            style={{ padding: 8 }}
          >
            <MaterialCommunityIcons name="delete" size={16} color={theme.colors.error} />
          </TouchableOpacity>
        )}
      </View>

      {/* RPE display */}
      {rpe && (
        <View style={styles.rpeDisplay}>
          <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
            RPE {rpe}: {RPE_DESCRIPTIONS[rpe]}
          </Text>
        </View>
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: 8,
    marginVertical: 4,
  },
  warmupContainer: {
    opacity: 0.8,
  },
  completedContainer: {
    borderLeftWidth: 4,
    borderLeftColor: statusColors.beginner,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  setNumber: {
    width: 28,
    alignItems: 'center',
  },
  previousContainer: {
    flex: 1,
    minWidth: 60,
  },
  previousText: {
    textDecorationLine: 'underline',
  },
  input: {
    width: 70,
  },
  rpeDisplay: {
    marginTop: 4,
    marginLeft: 36,
  },
});

export default SetInput;
