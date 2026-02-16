// Workout History Card Component
// Displays a completed workout summary

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, useTheme, Chip } from 'react-native-paper';
import type { Workout, WorkoutSet, Exercise } from '../types';
import { formatDate, formatDuration } from '../utils';

interface WorkoutCardProps {
  workout: Workout;
  sets?: WorkoutSet[];
  exercises?: Exercise[];
  onPress?: () => void;
  onRepeat?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function WorkoutCard({
  workout,
  sets = [],
  exercises = [],
  onPress,
  onRepeat,
  onEdit,
  onDelete,
}: WorkoutCardProps) {
  const theme = useTheme();

  const workingSets = sets.filter(s => !s.isWarmup);
  const totalVolume = workingSets.reduce((sum, s) => sum + s.weight * s.reps, 0);
  const uniqueExercises = [...new Set(sets.map(s => s.exerciseId))];
  
  const getExerciseName = (id: string) => {
    const exercise = exercises.find(e => e.id === id);
    return exercise?.name || 'Unknown Exercise';
  };

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text variant="titleMedium">{workout.name}</Text>
            <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
              {formatDate(workout.date)}
              {workout.durationMinutes && ` • ${workout.durationMinutes} min`}
            </Text>
          </View>
          <View style={styles.actions}>
            {onEdit && (
              <TouchableOpacity onPress={onEdit} style={{ padding: 8 }}>
                <Text style={{ fontSize: 18 }}>✏️</Text>
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity onPress={onDelete} style={{ padding: 8 }}>
                <Text style={{ fontSize: 18, color: '#FF4444', fontWeight: 'bold' }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text variant="titleLarge" style={{ color: theme.colors.primary }}>
              {workingSets.length}
            </Text>
            <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
              Sets
            </Text>
          </View>
          <View style={styles.stat}>
            <Text variant="titleLarge" style={{ color: theme.colors.primary }}>
              {uniqueExercises.length}
            </Text>
            <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
              Exercises
            </Text>
          </View>
          <View style={styles.stat}>
            <Text variant="titleLarge" style={{ color: theme.colors.primary }}>
              {totalVolume.toLocaleString()}
            </Text>
            <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
              lbs Volume
            </Text>
          </View>
        </View>

        {uniqueExercises.length > 0 && (
          <View style={styles.exerciseList}>
            {uniqueExercises.slice(0, 3).map((exerciseId) => {
              const exerciseSets = workingSets.filter(s => s.exerciseId === exerciseId);
              const maxWeight = Math.max(...exerciseSets.map(s => s.weight));
              return (
                <Text 
                  key={exerciseId} 
                  variant="bodySmall" 
                  style={{ color: theme.colors.onSurfaceVariant }}
                  numberOfLines={1}
                >
                  • {getExerciseName(exerciseId)}: {exerciseSets.length} sets @ {maxWeight} lbs
                </Text>
              );
            })}
            {uniqueExercises.length > 3 && (
              <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                +{uniqueExercises.length - 3} more exercises
              </Text>
            )}
          </View>
        )}

        {workout.notes && (
          <View style={styles.notes}>
            <Text variant="bodySmall" style={{ color: theme.colors.outline, fontStyle: 'italic' }}>
              {workout.notes}
            </Text>
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
    justifyContent: 'space-around',
    marginTop: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  stat: {
    alignItems: 'center',
  },
  exerciseList: {
    marginTop: 12,
    gap: 2,
  },
  notes: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: '#e0e0e0',
  },
});

export default WorkoutCard;
