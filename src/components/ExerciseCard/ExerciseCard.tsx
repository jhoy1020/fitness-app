// Exercise Card Component
// Displays exercise info with muscle group and equipment

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Chip, IconButton, useTheme } from 'react-native-paper';
import type { Exercise } from '../../types';
import { MUSCLE_GROUP_LABELS, EQUIPMENT_LABELS } from '../../utils/constants/constants';

interface ExerciseCardProps {
  exercise: Exercise;
  onPress?: () => void;
  onLongPress?: () => void;
  selected?: boolean;
  showDetails?: boolean;
  rightAction?: React.ReactNode;
  previousWeight?: number;
  previousReps?: number;
  suggestedWeight?: number;
  suggestedReps?: number;
}

export function ExerciseCard({
  exercise,
  onPress,
  onLongPress,
  selected = false,
  showDetails = false,
  rightAction,
  previousWeight,
  previousReps,
  suggestedWeight,
  suggestedReps,
}: ExerciseCardProps) {
  const theme = useTheme();

  const getMuscleGroupColor = (muscleGroup: string): string => {
    const colors: Record<string, string> = {
      chest: '#E91E63',
      back: '#2196F3',
      shoulders: '#9C27B0',
      biceps: '#FF5722',
      triceps: '#FF9800',
      forearms: '#795548',
      quadriceps: '#4CAF50',
      hamstrings: '#8BC34A',
      glutes: '#CDDC39',
      calves: '#009688',
      core: '#00BCD4',
      full_body: '#607D8B',
    };
    return colors[muscleGroup] || theme.colors.primary;
  };

  return (
    <Card
      style={[
        styles.card,
        selected && { borderColor: theme.colors.primary, borderWidth: 2 },
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <Card.Content style={styles.content}>
        <View style={styles.mainContent}>
          <View style={styles.header}>
            <View
              style={[
                styles.muscleIndicator,
                { backgroundColor: getMuscleGroupColor(exercise.muscleGroup) },
              ]}
            />
            <View style={styles.titleContainer}>
              <Text variant="titleMedium" numberOfLines={1}>
                {exercise.name}
              </Text>
              <View style={styles.chips}>
                <Chip
                  style={[styles.chip, { backgroundColor: getMuscleGroupColor(exercise.muscleGroup) + '20' }]}
                  textStyle={{ fontSize: 10, color: getMuscleGroupColor(exercise.muscleGroup) }}
                  compact
                >
                  {MUSCLE_GROUP_LABELS[exercise.muscleGroup]}
                </Chip>
                <Chip style={styles.chip} textStyle={{ fontSize: 10 }} compact>
                  {EQUIPMENT_LABELS[exercise.equipment]}
                </Chip>
              </View>
            </View>
          </View>

          {showDetails && exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
            <View style={styles.secondaryMuscles}>
              <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
                Also targets:{' '}
                {exercise.secondaryMuscles.map((m) => MUSCLE_GROUP_LABELS[m]).join(', ')}
              </Text>
            </View>
          )}

          {/* Previous / Suggested data */}
          {(previousWeight || suggestedWeight) && (
            <View style={styles.historyContainer}>
              {previousWeight && previousReps && (
                <View style={styles.historyItem}>
                  <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
                    Last:
                  </Text>
                  <Text variant="bodySmall">
                    {previousWeight} lbs × {previousReps}
                  </Text>
                </View>
              )}
              {suggestedWeight && suggestedReps && (
                <View style={styles.historyItem}>
                  <Text variant="labelSmall" style={{ color: theme.colors.primary }}>
                    Suggested:
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.primary, fontWeight: '600' }}>
                    {suggestedWeight} lbs × {suggestedReps}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {rightAction && <View style={styles.rightAction}>{rightAction}</View>}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 4,
    marginHorizontal: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  muscleIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  chips: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 4,
  },
  chip: {
    height: 24,
  },
  secondaryMuscles: {
    marginTop: 8,
    marginLeft: 16,
  },
  historyContainer: {
    flexDirection: 'row',
    marginTop: 8,
    marginLeft: 16,
    gap: 16,
  },
  historyItem: {
    flexDirection: 'row',
    gap: 4,
  },
  rightAction: {
    marginLeft: 8,
  },
});

export default ExerciseCard;
