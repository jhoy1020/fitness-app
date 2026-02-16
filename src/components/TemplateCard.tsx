// Template Card Component
// Displays workout template with exercise summary

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, useTheme, Chip, Button } from 'react-native-paper';
import type { WorkoutTemplate, TemplateExercise, Exercise } from '../types';
import { formatDate } from '../utils';

interface TemplateCardProps {
  template: WorkoutTemplate;
  exercises?: Array<{ templateExercise: TemplateExercise; exercise: Exercise }>;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onStart?: () => void;
}

export function TemplateCard({
  template,
  exercises = [],
  onPress,
  onEdit,
  onDelete,
  onStart,
}: TemplateCardProps) {
  const theme = useTheme();

  const muscleGroups = [...new Set(exercises.map(e => e.exercise.muscleGroup))];
  const totalSets = exercises.reduce((sum, e) => sum + e.templateExercise.targetSets, 0);

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text variant="titleMedium">{template.name}</Text>
            {template.description && (
              <Text variant="bodySmall" style={{ color: theme.colors.outline }} numberOfLines={1}>
                {template.description}
              </Text>
            )}
          </View>
          <View style={styles.actions}>
            {onEdit && (
              <TouchableOpacity onPress={onEdit} style={{ padding: 8 }}>
                <Text style={{ fontSize: 16 }}>✏️</Text>
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity onPress={onDelete} style={{ padding: 8 }}>
                <Text style={{ fontSize: 16 }}>🗑</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.stats}>
          <Chip compact style={styles.statChip}>
            {exercises.length} exercises
          </Chip>
          <Chip compact style={styles.statChip}>
            {totalSets} sets
          </Chip>
        </View>

        {muscleGroups.length > 0 && (
          <View style={styles.muscleGroups}>
            {muscleGroups.slice(0, 4).map((group) => (
              <Chip
                key={group}
                compact
                style={[styles.muscleChip, { backgroundColor: theme.colors.secondaryContainer }]}
                textStyle={{ fontSize: 10 }}
              >
                {group}
              </Chip>
            ))}
            {muscleGroups.length > 4 && (
              <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
                +{muscleGroups.length - 4} more
              </Text>
            )}
          </View>
        )}

        {onStart && (
          <View style={styles.startButton}>
            <Button
              mode="contained"
              onPress={onStart}
            >
              ▶ Start Workout
            </Button>
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
  },
  stats: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  statChip: {
    height: 24,
  },
  muscleGroups: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 4,
  },
  muscleChip: {
    height: 22,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
});

export default TemplateCard;
