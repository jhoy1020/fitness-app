// Workout Summary Screen - Shows after completing a workout

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Button, Surface, useTheme, Divider, Portal, Dialog, SegmentedButtons } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { calculate1RM_Epley } from '../utils/formulas';
import { useMesoCycle } from '../context/MesoCycleContext';

interface WorkoutSummaryScreenProps {
  navigation: any;
  route: {
    params: {
      workout: {
        id: string;
        name: string;
        date: string;
        duration: number;
        sets: Array<{
          exerciseName: string;
          muscleGroup: string;
          weight: number;
          reps: number;
        }>;
      };
    };
  };
}

export function WorkoutSummaryScreen({ navigation, route }: WorkoutSummaryScreenProps) {
  const theme = useTheme();
  const { workout } = route.params;
  const { state: mesoState, dispatch: mesoDispatch, addSetsToVolume } = useMesoCycle();
  const insets = useSafeAreaInsets();

  // Feedback dialog state
  const [showFeedback, setShowFeedback] = useState(false);
  const [pumpRating, setPumpRating] = useState<string>('3');
  const [sorenessRating, setSorenessRating] = useState<string>('3');
  const [fatigueRating, setFatigueRating] = useState<string>('3');
  const [performanceRating, setPerformanceRating] = useState<string>('3');

  // Calculate stats
  const totalSets = workout.sets.length;
  const totalVolume = workout.sets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
  const uniqueExercises = [...new Set(workout.sets.map(s => s.exerciseName))];
  const totalReps = workout.sets.reduce((sum, set) => sum + set.reps, 0);

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins} minutes`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
  };

  // Group sets by exercise with best e1RM
  const exerciseSummary = uniqueExercises.map(name => {
    const exerciseSets = workout.sets.filter(s => s.exerciseName === name);
    const best1RM = Math.max(...exerciseSets.map(s => calculate1RM_Epley(s.weight, s.reps)));
    const totalSets = exerciseSets.length;
    const maxWeight = Math.max(...exerciseSets.map(s => s.weight));
    const totalReps = exerciseSets.reduce((sum, s) => sum + s.reps, 0);
    
    return {
      name,
      totalSets,
      maxWeight,
      totalReps,
      best1RM,
      muscleGroup: exerciseSets[0]?.muscleGroup || 'other',
    };
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>💪</Text>
          <Text variant="headlineMedium" style={styles.title}>
            Workout Complete!
          </Text>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {workout.name}
          </Text>
        </View>

        {/* Main Stats */}
        <Surface style={styles.statsCard} elevation={2}>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text variant="displaySmall" style={{ color: theme.colors.primary }}>
                {formatDuration(workout.duration)}
              </Text>
              <Text variant="labelMedium">Duration</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="displaySmall" style={{ color: theme.colors.secondary }}>
                {totalSets}
              </Text>
              <Text variant="labelMedium">Total Sets</Text>
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={{ color: theme.colors.tertiary }}>
                {totalVolume.toLocaleString()}
              </Text>
              <Text variant="labelMedium">Volume (lbs)</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
                {totalReps}
              </Text>
              <Text variant="labelMedium">Total Reps</Text>
            </View>
          </View>
        </Surface>

        {/* Exercise Breakdown */}
        <Surface style={styles.card} elevation={1}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Exercise Summary
          </Text>
          
          {exerciseSummary.map((exercise, index) => (
            <View key={exercise.name}>
              {index > 0 && <Divider style={{ marginVertical: 12 }} />}
              <View style={styles.exerciseRow}>
                <View style={styles.exerciseInfo}>
                  <Text variant="bodyLarge" style={styles.exerciseName}>
                    {exercise.name}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {exercise.totalSets} sets • {exercise.totalReps} reps • Max: {exercise.maxWeight} lbs
                  </Text>
                </View>
                <View style={styles.e1rmBox}>
                  <Text variant="titleMedium" style={{ color: theme.colors.primary }}>
                    {exercise.best1RM}
                  </Text>
                  <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    e1RM
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </Surface>

        {/* Motivational message */}
        <Surface style={[styles.card, { backgroundColor: theme.colors.primaryContainer }]} elevation={0}>
          <Text variant="bodyLarge" style={{ color: theme.colors.onPrimaryContainer, textAlign: 'center' }}>
            🔥 Great job! Every workout brings you closer to your goals.
          </Text>
        </Surface>

        {/* Feedback Prompt */}
        {mesoState.activeMesoCycle && (
          <TouchableOpacity onPress={() => setShowFeedback(true)}>
            <Surface style={[styles.card, { borderWidth: 2, borderColor: theme.colors.primary }]} elevation={1}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Text style={{ fontSize: 32 }}>📝</Text>
                <View style={{ flex: 1 }}>
                  <Text variant="titleMedium">Rate This Workout</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Help optimize your training volume
                  </Text>
                </View>
                <Text style={{ fontSize: 20 }}>›</Text>
              </View>
            </Surface>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Feedback Dialog */}
      <Portal>
        <Dialog visible={showFeedback} onDismiss={() => setShowFeedback(false)}>
          <Dialog.Title>Rate Your Workout</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView style={{ paddingHorizontal: 24 }}>
              {/* Pump Rating */}
              <View style={styles.feedbackSection}>
                <Text variant="labelLarge" style={styles.feedbackLabel}>
                  💪 Pump Quality
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.outline, marginBottom: 8 }}>
                  How good was your muscle pump?
                </Text>
                <SegmentedButtons
                  value={pumpRating}
                  onValueChange={setPumpRating}
                  buttons={[
                    { value: '1', label: '😞' },
                    { value: '2', label: '😐' },
                    { value: '3', label: '🙂' },
                    { value: '4', label: '😊' },
                    { value: '5', label: '🤩' },
                  ]}
                />
              </View>

              {/* Performance Rating */}
              <View style={styles.feedbackSection}>
                <Text variant="labelLarge" style={styles.feedbackLabel}>
                  📈 Performance
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.outline, marginBottom: 8 }}>
                  Did you hit your targets / make progress?
                </Text>
                <SegmentedButtons
                  value={performanceRating}
                  onValueChange={setPerformanceRating}
                  buttons={[
                    { value: '1', label: 'Bad' },
                    { value: '2', label: 'OK' },
                    { value: '3', label: 'Good' },
                    { value: '4', label: 'Great' },
                    { value: '5', label: 'PR!' },
                  ]}
                />
              </View>

              {/* Fatigue Rating */}
              <View style={styles.feedbackSection}>
                <Text variant="labelLarge" style={styles.feedbackLabel}>
                  😴 Current Fatigue
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.outline, marginBottom: 8 }}>
                  How tired do you feel right now?
                </Text>
                <SegmentedButtons
                  value={fatigueRating}
                  onValueChange={setFatigueRating}
                  buttons={[
                    { value: '1', label: 'Fresh' },
                    { value: '2', label: 'Light' },
                    { value: '3', label: 'Mod' },
                    { value: '4', label: 'High' },
                    { value: '5', label: 'Exhausted' },
                  ]}
                />
              </View>

              {/* Soreness Prediction */}
              <View style={styles.feedbackSection}>
                <Text variant="labelLarge" style={styles.feedbackLabel}>
                  🔥 Expected Soreness
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.outline, marginBottom: 8 }}>
                  How sore do you expect to be tomorrow?
                </Text>
                <SegmentedButtons
                  value={sorenessRating}
                  onValueChange={setSorenessRating}
                  buttons={[
                    { value: '1', label: 'None' },
                    { value: '2', label: 'Light' },
                    { value: '3', label: 'Mod' },
                    { value: '4', label: 'High' },
                    { value: '5', label: 'Extreme' },
                  ]}
                />
              </View>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setShowFeedback(false)}>Skip</Button>
            <Button 
              mode="contained"
              onPress={() => {
                // Submit feedback using the correct WorkoutFeedback interface
                const feedback = {
                  id: Date.now().toString(),
                  workoutId: workout.id,
                  date: new Date().toISOString(),
                  pumpRating: Math.min(parseInt(pumpRating) - 1, 2) as 0 | 1 | 2,
                  sorenessRating: Math.min(parseInt(sorenessRating) - 1, 2) as 0 | 1 | 2,
                  performanceRating: Math.min(parseInt(performanceRating) - 1, 3) as 0 | 1 | 2 | 3,
                  totalScore: parseInt(pumpRating) + parseInt(performanceRating) - parseInt(fatigueRating),
                };
                mesoDispatch({ type: 'ADD_WORKOUT_FEEDBACK', payload: feedback });
                
                // Update volume tracking
                const musclesSets: Record<string, number> = {};
                workout.sets.forEach((set: any) => {
                  const muscle = set.muscleGroup?.toLowerCase() || 'other';
                  musclesSets[muscle] = (musclesSets[muscle] || 0) + 1;
                });
                Object.entries(musclesSets).forEach(([muscle, count]) => {
                  addSetsToVolume(muscle as any, count);
                });

                setShowFeedback(false);
              }}
            >
              Submit
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Actions - with safe area insets */}
      <Surface style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]} elevation={3}>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('ActiveWorkout')}
          style={styles.bottomButton}
        >
          Start Another
        </Button>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Home')}
          style={styles.bottomButton}
        >
          Done
        </Button>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 16,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statsCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  divider: {
    marginVertical: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontWeight: '500',
    marginBottom: 4,
  },
  e1rmBox: {
    alignItems: 'center',
    paddingLeft: 16,
  },
  bottomBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomButton: {
    flex: 1,
    minHeight: 48,
  },
  feedbackSection: {
    marginBottom: 20,
  },
  feedbackLabel: {
    fontWeight: '600',
    marginBottom: 4,
  },
});

export default WorkoutSummaryScreen;
