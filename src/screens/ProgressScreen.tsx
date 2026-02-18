// Progress Screen - Track strength gains and 1RM estimates

import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Surface, useTheme, SegmentedButtons, Divider, Button, TextInput, Portal, Dialog } from 'react-native-paper';
import { useWorkout } from '../context/WorkoutContext';
import { useUser } from '../context/UserContext';
import { calculate1RM_Epley } from '../utils/formulas/formulas';
import { EXERCISE_LIBRARY } from '../services/db/exerciseLibrary';
import WeightGraph from '../components/WeightGraph/WeightGraph';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ProgressScreenProps {
  navigation: any;
}

export function ProgressScreen({ navigation }: ProgressScreenProps) {
  const theme = useTheme();
  const { state: workoutState } = useWorkout();
  const { state: userState, addWeightEntry } = useUser();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month');
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  
  // 1RM Calculator state
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcWeight, setCalcWeight] = useState('');
  const [calcReps, setCalcReps] = useState('');
  
  // Weight entry state
  const [showWeightEntry, setShowWeightEntry] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [newBodyFat, setNewBodyFat] = useState('');

  // Get date range filter
  const getDateFilter = () => {
    const now = new Date();
    switch (timeRange) {
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(0);
    }
  };

  // Calculate stats from workout history
  const stats = useMemo(() => {
    const dateFilter = getDateFilter();
    const filteredWorkouts = workoutState.workoutHistory.filter(
      w => new Date(w.date) >= dateFilter
    );

    // Total workouts
    const totalWorkouts = filteredWorkouts.length;

    // Total volume
    const totalVolume = filteredWorkouts.reduce((sum, workout) => {
      const workoutVolume = (workout.sets || []).reduce(
        (s: number, set: any) => s + (set.weight * set.reps), 0
      );
      return sum + workoutVolume;
    }, 0);

    // Total sets
    const totalSets = filteredWorkouts.reduce(
      (sum, w) => sum + (w.sets?.length || 0), 0
    );

    // Exercise frequency
    const exerciseFreq: Record<string, number> = {};
    filteredWorkouts.forEach(workout => {
      (workout.sets || []).forEach((set: any) => {
        const name = set.exerciseName;
        exerciseFreq[name] = (exerciseFreq[name] || 0) + 1;
      });
    });

    // Top exercises
    const topExercises = Object.entries(exerciseFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return { totalWorkouts, totalVolume, totalSets, topExercises };
  }, [workoutState.workoutHistory, timeRange]);

  // Calculate 1RM estimates for all exercises
  const exerciseProgress = useMemo(() => {
    const progress: Record<string, { 
      name: string; 
      current1RM: number; 
      previous1RM: number;
      bestWeight: number;
      bestReps: number;
      history: { date: string; e1rm: number }[];
    }> = {};

    // Sort workouts by date (oldest first)
    const sortedWorkouts = [...workoutState.workoutHistory].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    sortedWorkouts.forEach(workout => {
      (workout.sets || []).forEach((set: any) => {
        const name = set.exerciseName;
        const e1rm = calculate1RM_Epley(set.weight, set.reps);

        if (!progress[name]) {
          progress[name] = {
            name,
            current1RM: 0,
            previous1RM: 0,
            bestWeight: 0,
            bestReps: 0,
            history: [],
          };
        }

        // Update 1RM if better
        if (e1rm > progress[name].current1RM) {
          progress[name].previous1RM = progress[name].current1RM;
          progress[name].current1RM = e1rm;
          progress[name].bestWeight = set.weight;
          progress[name].bestReps = set.reps;
        }

        progress[name].history.push({
          date: workout.date,
          e1rm,
        });
      });
    });

    // Sort by current 1RM descending
    return Object.values(progress).sort((a, b) => b.current1RM - a.current1RM);
  }, [workoutState.workoutHistory]);

  // Calculate body composition progress
  const bodyStats = useMemo(() => {
    if (!userState.profile) return null;

    const weight = userState.profile.weight;
    const bodyFat = userState.profile.bodyFatPercent;
    const leanMass = userState.profile.leanMass || 
      (bodyFat ? weight * (1 - bodyFat / 100) : null);
    const goalBodyFat = userState.profile.goalBodyFatPercent;

    return {
      weight,
      bodyFat,
      leanMass,
      fatMass: leanMass ? weight - leanMass : null,
      goalBodyFat,
      fatToLose: bodyFat && goalBodyFat ? 
        weight * (bodyFat - goalBodyFat) / 100 : null,
    };
  }, [userState.profile]);

  // Simple bar chart component
  const SimpleBar = ({ value, maxValue, color }: { value: number; maxValue: number; color: string }) => {
    const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
    return (
      <View style={[styles.barContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
        <View 
          style={[
            styles.barFill, 
            { width: `${Math.min(percentage, 100)}%`, backgroundColor: color }
          ]} 
        />
      </View>
    );
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Time Range Selector */}
      <SegmentedButtons
        value={timeRange}
        onValueChange={(v) => setTimeRange(v as 'week' | 'month' | 'all')}
        buttons={[
          { value: 'week', label: 'Week' },
          { value: 'month', label: 'Month' },
          { value: 'all', label: 'All Time' },
        ]}
        style={styles.segmented}
      />

      {/* Overview Stats */}
      <Surface style={styles.card} elevation={1}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text variant="displaySmall" style={{ color: theme.colors.primary }}>
              {stats.totalWorkouts}
            </Text>
            <Text variant="labelMedium">Workouts</Text>
          </View>
          <View style={styles.statBox}>
            <Text variant="displaySmall" style={{ color: theme.colors.secondary }}>
              {stats.totalSets}
            </Text>
            <Text variant="labelMedium">Total Sets</Text>
          </View>
          <View style={styles.statBox}>
            <Text variant="displaySmall" style={{ color: theme.colors.tertiary }}>
              {(stats.totalVolume / 1000).toFixed(1)}k
            </Text>
            <Text variant="labelMedium">Volume (lbs)</Text>
          </View>
        </View>
      </Surface>

      {/* Body Composition */}
      {bodyStats && (
        <Surface style={styles.card} elevation={1}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Body Composition</Text>
          <View style={styles.bodyStatsGrid}>
            <View style={styles.bodyStat}>
              <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
                {bodyStats.weight}
              </Text>
              <Text variant="labelSmall">Weight (lbs)</Text>
            </View>
            {bodyStats.leanMass && (
              <View style={styles.bodyStat}>
                <Text variant="headlineMedium" style={{ color: theme.colors.secondary }}>
                  {bodyStats.leanMass.toFixed(1)}
                </Text>
                <Text variant="labelSmall">Lean Mass</Text>
              </View>
            )}
            {bodyStats.bodyFat && (
              <View style={styles.bodyStat}>
                <Text variant="headlineMedium" style={{ color: theme.colors.tertiary }}>
                  {bodyStats.bodyFat}%
                </Text>
                <Text variant="labelSmall">Body Fat</Text>
              </View>
            )}
          </View>
          {bodyStats.fatToLose && bodyStats.fatToLose > 0 && (
            <View style={styles.goalInfo}>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                🎯 {bodyStats.fatToLose.toFixed(1)} lbs to reach {bodyStats.goalBodyFat}% body fat goal
              </Text>
            </View>
          )}
        </Surface>
      )}

      {/* Weight Tracking */}
      <View style={styles.sectionHeader}>
        <Text variant="titleMedium" style={styles.sectionTitle}>📊 Weight History</Text>
        <Button 
          mode="contained-tonal" 
          onPress={() => setShowWeightEntry(true)}
          compact
        >
          + Log Weight
        </Button>
      </View>
      <WeightGraph 
        data={userState.weightHistory} 
        height={200}
        showBodyFat={true}
      />

      {/* Top Exercises */}
      {stats.topExercises.length > 0 && (
        <Surface style={styles.card} elevation={1}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Most Frequent Exercises</Text>
          {stats.topExercises.map(([name, count], index) => (
            <View key={name} style={styles.exerciseRow}>
              <Text variant="bodyMedium" style={styles.exerciseName} numberOfLines={1}>
                {index + 1}. {name}
              </Text>
              <View style={styles.exerciseBarContainer}>
                <SimpleBar 
                  value={count as number} 
                  maxValue={stats.topExercises[0][1] as number}
                  color={theme.colors.primary}
                />
              </View>
              <Text variant="labelMedium" style={styles.exerciseCount}>
                {count} sets
              </Text>
            </View>
          ))}
        </Surface>
      )}

      {/* 1RM Progress */}
      <Surface style={styles.card} elevation={1}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Estimated 1RM Progress</Text>
        
        {exerciseProgress.length === 0 ? (
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', padding: 16 }}>
            Complete workouts to track your strength progress
          </Text>
        ) : (
          exerciseProgress.slice(0, 10).map((exercise) => {
            const improvement = exercise.previous1RM > 0 
              ? ((exercise.current1RM - exercise.previous1RM) / exercise.previous1RM * 100).toFixed(0)
              : null;
            
            return (
              <TouchableOpacity
                key={exercise.name}
                style={styles.e1rmRow}
                onPress={() => setSelectedExercise(
                  selectedExercise === exercise.name ? null : exercise.name
                )}
              >
                <View style={styles.e1rmInfo}>
                  <Text variant="bodyLarge" style={styles.e1rmName} numberOfLines={1}>
                    {exercise.name}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Best: {exercise.bestWeight} × {exercise.bestReps}
                  </Text>
                </View>
                <View style={styles.e1rmValue}>
                  <Text variant="titleLarge" style={{ color: theme.colors.primary }}>
                    {exercise.current1RM}
                  </Text>
                  {improvement && parseInt(improvement) > 0 && (
                    <Text variant="labelSmall" style={{ color: theme.colors.tertiary }}>
                      ↑ {improvement}%
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </Surface>

      {/* Nutrition Summary */}
      {userState.nutrition && (
        <Surface style={styles.card} elevation={1}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Daily Nutrition Targets</Text>
          <View style={styles.nutritionGrid}>
            <View style={styles.nutritionItem}>
              <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
                {userState.nutrition.targetCalories}
              </Text>
              <Text variant="labelSmall">Calories</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text variant="headlineSmall" style={{ color: theme.colors.error }}>
                {userState.nutrition.protein}g
              </Text>
              <Text variant="labelSmall">Protein</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text variant="headlineSmall" style={{ color: theme.colors.tertiary }}>
                {userState.nutrition.carbs}g
              </Text>
              <Text variant="labelSmall">Carbs</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text variant="headlineSmall" style={{ color: theme.colors.secondary }}>
                {userState.nutrition.fat}g
              </Text>
              <Text variant="labelSmall">Fat</Text>
            </View>
          </View>
        </Surface>
      )}

      {/* 1RM Calculator Card */}
      <Surface style={styles.card} elevation={1}>
        <Text variant="titleMedium" style={styles.sectionTitle}>🧮 1RM Calculator</Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 16 }}>
          Estimate your one-rep max using the Epley formula
        </Text>
        <View style={styles.calcInputRow}>
          <View style={styles.calcInput}>
            <TextInput
              label="Weight"
              mode="outlined"
              keyboardType="numeric"
              value={calcWeight}
              onChangeText={setCalcWeight}
              style={{ flex: 1 }}
              dense
            />
          </View>
          <Text style={styles.calcX}>×</Text>
          <View style={styles.calcInput}>
            <TextInput
              label="Reps"
              mode="outlined"
              keyboardType="numeric"
              value={calcReps}
              onChangeText={setCalcReps}
              style={{ flex: 1 }}
              dense
            />
          </View>
        </View>
        {calcWeight && calcReps && parseInt(calcReps) > 0 && parseInt(calcReps) <= 15 && (
          <Surface style={[styles.calcResult, { backgroundColor: 'rgba(0,212,255,0.1)' }]} elevation={0}>
            <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Estimated 1RM
            </Text>
            <Text variant="displaySmall" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
              {Math.round(parseFloat(calcWeight) * (1 + parseFloat(calcReps) / 30))} {userState.units === 'metric' ? 'kg' : 'lbs'}
            </Text>
            <View style={styles.repMaxTable}>
              {[1, 3, 5, 8, 10, 12].map(reps => {
                const weight = parseFloat(calcWeight);
                const inputReps = parseFloat(calcReps);
                const oneRM = weight * (1 + inputReps / 30);
                const repMax = reps === 1 ? oneRM : oneRM / (1 + reps / 30);
                return (
                  <View key={reps} style={styles.repMaxItem}>
                    <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>{reps}RM</Text>
                    <Text variant="bodyMedium" style={{ fontWeight: '600' }}>{Math.round(repMax)}</Text>
                  </View>
                );
              })}
            </View>
          </Surface>
        )}
        {calcReps && parseInt(calcReps) > 15 && (
          <Text variant="bodySmall" style={{ color: theme.colors.error, marginTop: 8 }}>
            For accurate estimates, use 15 reps or less
          </Text>
        )}
      </Surface>

      {/* Weight Entry Dialog */}
      <Portal>
        <Dialog visible={showWeightEntry} onDismiss={() => setShowWeightEntry(false)}>
          <Dialog.Title>📊 Log Weight</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Weight (lbs)"
              value={newWeight}
              onChangeText={setNewWeight}
              keyboardType="numeric"
              mode="outlined"
              style={{ marginBottom: 12 }}
              left={<TextInput.Icon icon={() => <Text>⚖️</Text>} />}
            />
            <TextInput
              label="Body Fat % (optional)"
              value={newBodyFat}
              onChangeText={setNewBodyFat}
              keyboardType="numeric"
              mode="outlined"
              left={<TextInput.Icon icon={() => <Text>📏</Text>} />}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => {
              setShowWeightEntry(false);
              setNewWeight('');
              setNewBodyFat('');
            }}>
              Cancel
            </Button>
            <Button 
              mode="contained"
              onPress={() => {
                if (newWeight) {
                  addWeightEntry(
                    parseFloat(newWeight),
                    newBodyFat ? parseFloat(newBodyFat) : undefined
                  );
                  setShowWeightEntry(false);
                  setNewWeight('');
                  setNewBodyFat('');
                }
              }}
              disabled={!newWeight}
            >
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  segmented: {
    marginBottom: 16,
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
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  bodyStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  bodyStat: {
    alignItems: 'center',
  },
  goalInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(100,130,153,0.15)',
    borderRadius: 8,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseName: {
    width: 120,
  },
  exerciseBarContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  barContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  exerciseCount: {
    width: 50,
    textAlign: 'right',
  },
  e1rmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(100,130,153,0.2)',
  },
  e1rmInfo: {
    flex: 1,
  },
  e1rmName: {
    fontWeight: '500',
    marginBottom: 2,
  },
  e1rmValue: {
    alignItems: 'flex-end',
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  calcInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  calcInput: {
    flex: 1,
  },
  calcX: {
    fontSize: 20,
    marginHorizontal: 12,
    color: '#648299',
  },
  calcResult: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  repMaxTable: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 16,
    width: '100%',
  },
  repMaxItem: {
    alignItems: 'center',
    minWidth: 50,
    marginVertical: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
});

export default ProgressScreen;
