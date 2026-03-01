// Workout Detail Screen - Read-only view of a completed workout

import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Surface, useTheme, Divider, Chip } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWorkout } from '../../context/WorkoutContext';
import { calculate1RM_Epley } from '../../utils/formulas/formulas';
import { withAlpha } from '../../theme';

interface WorkoutDetailScreenProps {
  navigation: any;
  route: {
    params: {
      workoutId: string;
    };
  };
}

export function WorkoutDetailScreen({ navigation, route }: WorkoutDetailScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { state: workoutState } = useWorkout();
  const { workoutId } = route.params;

  const workout = useMemo(() => {
    return workoutState.workoutHistory.find(w => w.id === workoutId);
  }, [workoutState.workoutHistory, workoutId]);

  if (!workout) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.emptyState}>
          <Text variant="titleMedium" style={{ color: theme.colors.outline, marginTop: 12 }}>
            No data
          </Text>
          <Text variant="titleMedium" style={{ color: theme.colors.outline, marginTop: 12 }}>
            Workout not found
          </Text>
        </View>
      </View>
    );
  }

  const sets = (workout as any).sets || [];
  const exercises = (workout as any).exercises || [];

  // Group sets by exercise name
  const uniqueExercises = [...new Set(sets.map((s: any) => s.exerciseName))];

  const totalSets = sets.length;
  const totalVolume = sets.reduce((sum: number, s: any) => sum + (s.weight * s.reps), 0);
  const totalReps = sets.reduce((sum: number, s: any) => sum + s.reps, 0);

  // Get muscle groups
  const muscleGroups = [...new Set(sets.map((s: any) => s.muscleGroup).filter(Boolean))] as string[];

  // Format duration
  const formatDuration = (seconds: number) => {
    if (!seconds) return '—';
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins} min`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true,
    });
  };

  // Exercise breakdown
  const exerciseSummary = uniqueExercises.map((name: any) => {
    const exerciseSets = sets.filter((s: any) => s.exerciseName === name);
    const best1RM = Math.max(...exerciseSets.map((s: any) => calculate1RM_Epley(s.weight, s.reps)));
    const maxWeight = Math.max(...exerciseSets.map((s: any) => s.weight));

    return {
      name,
      sets: exerciseSets,
      best1RM: isFinite(best1RM) ? best1RM : 0,
      maxWeight,
      muscleGroup: exerciseSets[0]?.muscleGroup || 'other',
    };
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineSmall" style={{ fontWeight: 'bold' }}>
            {workout.name}
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
            {formatDate(workout.date)}
          </Text>
          {workout.notes ? (
            <Text variant="bodySmall" style={{ color: theme.colors.outline, marginTop: 4, fontStyle: 'italic' }}>
              {workout.notes}
            </Text>
          ) : null}
        </View>

        {/* Muscle Groups */}
        {muscleGroups.length > 0 && (
          <View style={styles.chipRow}>
            {muscleGroups.map(mg => (
              <Chip key={mg} compact style={{ marginRight: 6, marginBottom: 6 }}>
                {mg.charAt(0).toUpperCase() + mg.slice(1)}
              </Chip>
            ))}
          </View>
        )}

        {/* Stats Card */}
        <Surface style={styles.statsCard} elevation={1}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
                {formatDuration((workout as any).duration || 0)}
              </Text>
              <Text variant="labelSmall" style={{ color: theme.colors.outline }}>Duration</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={{ color: theme.colors.secondary }}>
                {totalSets}
              </Text>
              <Text variant="labelSmall" style={{ color: theme.colors.outline }}>Sets</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={{ color: theme.colors.tertiary }}>
                {totalReps}
              </Text>
              <Text variant="labelSmall" style={{ color: theme.colors.outline }}>Reps</Text>
            </View>
          </View>
          <Divider style={{ marginVertical: 12 }} />
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text variant="titleLarge" style={{ color: theme.colors.primary }}>
                {totalVolume.toLocaleString()}
              </Text>
              <Text variant="labelSmall" style={{ color: theme.colors.outline }}>Volume (lbs)</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="titleLarge" style={{ color: theme.colors.secondary }}>
                {uniqueExercises.length}
              </Text>
              <Text variant="labelSmall" style={{ color: theme.colors.outline }}>Exercises</Text>
            </View>
          </View>
        </Surface>

        {/* Exercise Breakdown */}
        {exerciseSummary.map((exercise, idx) => (
          <Surface key={exercise.name} style={styles.exerciseCard} elevation={1}>
            <View style={styles.exerciseHeader}>
              <View style={{ flex: 1 }}>
                <Text variant="titleMedium" style={{ fontWeight: '600' }}>
                  {exercise.name}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.outline, textTransform: 'capitalize' }}>
                  {exercise.muscleGroup}
                </Text>
              </View>
              {exercise.best1RM > 0 && (
                <View style={{ alignItems: 'flex-end' }}>
                  <Text variant="labelSmall" style={{ color: theme.colors.outline }}>Est. 1RM</Text>
                  <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                    {Math.round(exercise.best1RM)} lbs
                  </Text>
                </View>
              )}
            </View>

            {/* Sets Table */}
            <View style={styles.setsTable}>
              <View style={[styles.setsHeader, { borderBottomColor: withAlpha(theme.colors.outline, 0.25) }]}>
                <Text style={[styles.setCell, styles.setNumCell, { color: theme.colors.outline }]}>Set</Text>
                <Text style={[styles.setCell, styles.weightCell, { color: theme.colors.outline }]}>Weight</Text>
                <Text style={[styles.setCell, styles.repsCell, { color: theme.colors.outline }]}>Reps</Text>
                <Text style={[styles.setCell, styles.volumeCell, { color: theme.colors.outline }]}>Volume</Text>
              </View>
              {exercise.sets.map((set: any, setIdx: number) => (
                <View key={setIdx} style={[styles.setRow, setIdx % 2 === 0 && { backgroundColor: theme.colors.surfaceVariant + '30' }]}>
                  <Text style={[styles.setCell, styles.setNumCell]}>{setIdx + 1}</Text>
                  <Text style={[styles.setCell, styles.weightCell]}>{set.weight} lbs</Text>
                  <Text style={[styles.setCell, styles.repsCell]}>{set.reps}</Text>
                  <Text style={[styles.setCell, styles.volumeCell, { color: theme.colors.outline }]}>
                    {(set.weight * set.reps).toLocaleString()}
                  </Text>
                </View>
              ))}
            </View>
          </Surface>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  statsCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  exerciseCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  setsTable: {
    marginTop: 4,
  },
  setsHeader: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  setRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderRadius: 4,
  },
  setCell: {
    textAlign: 'center',
  },
  setNumCell: {
    width: 40,
  },
  weightCell: {
    flex: 1,
  },
  repsCell: {
    flex: 1,
  },
  volumeCell: {
    flex: 1,
  },
});

export default WorkoutDetailScreen;
