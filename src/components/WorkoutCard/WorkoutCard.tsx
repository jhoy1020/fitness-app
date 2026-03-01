// Workout History Card Component
// Displays a completed workout summary

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, useTheme, Chip } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { Workout, WorkoutSet, Exercise, CardioType } from '../../types';
import { formatDate, formatDuration } from '../../utils';
import { withAlpha, statusColors } from '../../theme';

// Cardio type display mapping
const CARDIO_DISPLAY: Record<CardioType, { label: string; icon: string }> = {
  running: { label: 'Running', icon: 'run' },
  cycling: { label: 'Cycling', icon: 'bike' },
  walking: { label: 'Walking', icon: 'walk' },
  swimming: { label: 'Swimming', icon: 'swim' },
  rowing: { label: 'Rowing', icon: 'rowing' },
  elliptical: { label: 'Elliptical', icon: 'dumbbell' },
  stair_climber: { label: 'Stair Climber', icon: 'stairs' },
  hiit: { label: 'HIIT', icon: 'lightning-bolt' },
  jump_rope: { label: 'Jump Rope', icon: 'jump-rope' },
  other: { label: 'Cardio', icon: 'heart-pulse' },
};

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

  const isCardio = workout.dayType === 'cardio' && workout.cardioType;
  const workingSets = sets.filter(s => !s.isWarmup);
  const totalVolume = workingSets.reduce((sum, s) => sum + s.weight * s.reps, 0);
  const uniqueExercises = [...new Set(sets.map(s => s.exerciseId))];
  
  const getExerciseName = (id: string) => {
    const exercise = exercises.find(e => e.id === id);
    return exercise?.name || 'Unknown Exercise';
  };

  // Format pace for display (e.g., "8:30 /mi")
  const formatPace = (paceMinPerMile: number): string => {
    const minutes = Math.floor(paceMinPerMile);
    const seconds = Math.round((paceMinPerMile - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')} /mi`;
  };

  // Render cardio workout stats
  const renderCardioStats = () => {
    const cardioInfo = CARDIO_DISPLAY[workout.cardioType!];
    return (
      <View style={[styles.stats, { borderColor: theme.colors.outlineVariant }]}>
        {workout.durationMinutes && (
          <View style={styles.stat}>
            <Text variant="titleLarge" style={{ color: theme.colors.primary }}>
              {workout.durationMinutes}
            </Text>
            <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
              Minutes
            </Text>
          </View>
        )}
        {workout.distanceMiles && (
          <View style={styles.stat}>
            <Text variant="titleLarge" style={{ color: theme.colors.primary }}>
              {workout.distanceMiles.toFixed(2)}
            </Text>
            <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
              Miles
            </Text>
          </View>
        )}
        {workout.paceMinPerMile && (
          <View style={styles.stat}>
            <Text variant="titleLarge" style={{ color: theme.colors.primary }}>
              {formatPace(workout.paceMinPerMile)}
            </Text>
            <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
              Pace
            </Text>
          </View>
        )}
        {workout.caloriesBurned && (
          <View style={styles.stat}>
            <Text variant="titleLarge" style={{ color: theme.colors.primary }}>
              {workout.caloriesBurned}
            </Text>
            <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
              Calories
            </Text>
          </View>
        )}
      </View>
    );
  };

  // Render strength workout stats
  const renderStrengthStats = () => (
    <View style={[styles.stats, { borderColor: theme.colors.outlineVariant }]}>
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
  );

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {isCardio && (
                <Chip 
                  compact 
                  style={{ backgroundColor: theme.colors.tertiaryContainer }}
                  textStyle={{ fontSize: 10 }}
                >
                  <MaterialCommunityIcons name={CARDIO_DISPLAY[workout.cardioType!].icon as any} size={14} color={theme.colors.onTertiaryContainer} />
                </Chip>
              )}
              <Text variant="titleMedium">{workout.name}</Text>
            </View>
            <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
              {formatDate(workout.date)}
              {!isCardio && workout.durationMinutes && ` • ${workout.durationMinutes} min`}
            </Text>
          </View>
          <View style={styles.actions}>
            {onEdit && (
              <TouchableOpacity onPress={onEdit} style={{ padding: 8 }} testID="edit-button">
                <MaterialCommunityIcons name="pencil" size={18} color={theme.colors.onSurfaceVariant} />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity onPress={onDelete} style={{ padding: 8 }} testID="delete-button">
                <MaterialCommunityIcons name="close" size={18} color={theme.colors.error} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {isCardio ? renderCardioStats() : renderStrengthStats()}

        {/* Show cardio details for cardio workouts */}
        {isCardio && workout.avgHeartRate && (
          <View style={styles.exerciseList}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <MaterialCommunityIcons name="heart-pulse" size={14} color={theme.colors.error} />
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Avg HR: {workout.avgHeartRate} bpm
              </Text>
            </View>
          </View>
        )}

        {/* Show exercise list for strength workouts */}
        {!isCardio && uniqueExercises.length > 0 && (
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
          <View style={[styles.notes, { borderColor: theme.colors.outlineVariant }]}>
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
  },
});

export default WorkoutCard;
