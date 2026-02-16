// History Screen - View past workouts

import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Surface, useTheme, Chip, Divider, Portal, Dialog, TextInput, Button, SegmentedButtons } from 'react-native-paper';
import { useWorkout } from '../context/WorkoutContext';
import MonthCalendar from '../components/MonthCalendar';

// Define the shape of workout data in history
interface HistoryWorkout {
  id: string;
  name: string;
  date: string;
  duration?: number;
  notes?: string;
  exercises?: {
    exerciseId: string;
    exerciseName: string;
    sets: { weight: number; targetReps: number; actualReps: number; completed: boolean }[];
  }[];
}

export function HistoryScreen({ navigation }: { navigation: any }) {
  const theme = useTheme();
  const { state: workoutState, dispatch } = useWorkout();
  const [search, setSearch] = useState('');
  const [filterMuscle, setFilterMuscle] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  
  // Edit dialog state
  const [editingWorkout, setEditingWorkout] = useState<HistoryWorkout | null>(null);
  const [editName, setEditName] = useState('');

  // Cast workout history to our expected shape
  const workoutHistory = workoutState.workoutHistory as unknown as HistoryWorkout[];

  // Get all unique exercise names from workouts for filtering
  const exerciseNames = useMemo(() => {
    const names = new Set<string>();
    workoutHistory.forEach(workout => {
      workout.exercises?.forEach((ex) => {
        if (ex.exerciseName) {
          names.add(ex.exerciseName);
        }
      });
    });
    return Array.from(names);
  }, [workoutHistory]);

  // Filter workouts
  const filteredWorkouts = useMemo(() => {
    return workoutHistory.filter(workout => {
      const matchesSearch = workout.name.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    });
  }, [workoutHistory, search]);

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ${mins % 60}m`;
  };

  // Calculate workout stats
  const getWorkoutStats = (workout: HistoryWorkout) => {
    const exercises = workout.exercises || [];
    const totalSets = exercises.reduce((sum, ex) => sum + (ex.sets?.length || 0), 0);
    const totalVolume = exercises.reduce((sum, ex) => 
      sum + ex.sets.reduce((sSum, s) => sSum + ((s.weight || 0) * (s.actualReps || s.targetReps || 0)), 0), 0);
    return { setCount: totalSets, volume: totalVolume, exerciseCount: exercises.length };
  };

  // Handle edit workout
  const handleEdit = (workout: HistoryWorkout) => {
    setEditingWorkout(workout);
    setEditName(workout.name);
  };

  const handleSaveEdit = () => {
    if (editingWorkout && editName.trim()) {
      dispatch({
        type: 'UPDATE_WORKOUT',
        payload: { id: editingWorkout.id, updates: { name: editName.trim() } }
      });
      setEditingWorkout(null);
      setEditName('');
    }
  };

  // Handle delete workout
  const handleDelete = (workout: HistoryWorkout) => {
    // For web, use window.confirm instead of Alert
    if (typeof window !== 'undefined' && window.confirm) {
      if (window.confirm(`Delete "${workout.name}"? This cannot be undone.`)) {
        dispatch({ type: 'DELETE_WORKOUT', payload: workout.id });
      }
    } else {
      dispatch({ type: 'DELETE_WORKOUT', payload: workout.id });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Edit Dialog */}
      <Portal>
        <Dialog visible={!!editingWorkout} onDismiss={() => setEditingWorkout(null)}>
          <Dialog.Title>Edit Workout</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Workout Name"
              value={editName}
              onChangeText={setEditName}
              mode="outlined"
              autoFocus
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditingWorkout(null)}>Cancel</Button>
            <Button onPress={handleSaveEdit} disabled={!editName.trim()}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Surface style={styles.searchbar} elevation={1}>
          <View style={styles.searchInner}>
            <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
            <TextInput
              placeholder="Search workouts..."
              onChangeText={setSearch}
              value={search}
              style={styles.searchInput}
              mode="flat"
              underlineColor="transparent"
              activeUnderlineColor="transparent"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Text style={{ fontSize: 16 }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </Surface>
      </View>

      {/* View Mode Toggle */}
      <View style={styles.viewToggleContainer}>
        <TouchableOpacity
          style={[
            styles.viewToggleBtn,
            viewMode === 'list' && { backgroundColor: theme.colors.primaryContainer }
          ]}
          onPress={() => setViewMode('list')}
        >
          <Text style={{ fontSize: 16 }}>📋</Text>
          <Text 
            variant="labelMedium" 
            style={{ 
              color: viewMode === 'list' ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant,
              marginLeft: 4 
            }}
          >
            List
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.viewToggleBtn,
            viewMode === 'calendar' && { backgroundColor: theme.colors.primaryContainer }
          ]}
          onPress={() => setViewMode('calendar')}
        >
          <Text style={{ fontSize: 16 }}>📅</Text>
          <Text 
            variant="labelMedium" 
            style={{ 
              color: viewMode === 'calendar' ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant,
              marginLeft: 4 
            }}
          >
            Calendar
          </Text>
        </TouchableOpacity>
      </View>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <MonthCalendar 
            workouts={workoutHistory as any}
            onDayPress={(date, workouts) => {
              if (workouts.length === 1) {
                navigation.navigate('WorkoutDetail', { workoutId: workouts[0].id });
              }
            }}
          />
        </ScrollView>
      )}

      {/* Workout List */}
      {viewMode === 'list' && (
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {filteredWorkouts.length === 0 ? (
          <Surface style={styles.emptyCard} elevation={1}>
            <Text variant="titleMedium" style={{ marginBottom: 8 }}>
              {workoutHistory.length === 0 
                ? 'No workouts yet' 
                : 'No matching workouts'}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
              {workoutHistory.length === 0 
                ? 'Complete your first workout to see it here!'
                : 'Try adjusting your search or filters'}
            </Text>
          </Surface>
        ) : (
          filteredWorkouts.map((workout) => {
            const stats = getWorkoutStats(workout);
            return (
              <Surface key={workout.id} style={styles.workoutCard} elevation={1}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('WorkoutDetail', { workoutId: workout.id })}
                  style={{ flex: 1 }}
                >
                  <View style={styles.workoutHeader}>
                    <View style={styles.workoutInfo}>
                      <Text variant="titleMedium" style={styles.workoutName}>
                        {workout.name}
                      </Text>
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        {formatDate(workout.date)}
                        {workout.duration ? ` • ${formatDuration(workout.duration)}` : ''}
                      </Text>
                    </View>
                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          handleEdit(workout);
                        }}
                        style={styles.actionButton}
                      >
                        <Text style={{ fontSize: 18 }}>✏️</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          handleDelete(workout);
                        }}
                        style={styles.actionButton}
                      >
                        <Text style={{ fontSize: 18 }}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Divider style={{ marginVertical: 12 }} />

                  <View style={styles.statsRow}>
                    <View style={styles.stat}>
                      <Text variant="titleLarge" style={{ color: theme.colors.primary }}>
                        {stats.exerciseCount}
                      </Text>
                      <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        Exercises
                      </Text>
                    </View>
                    <View style={styles.stat}>
                      <Text variant="titleLarge" style={{ color: theme.colors.primary }}>
                        {stats.setCount}
                      </Text>
                      <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        Sets
                      </Text>
                    </View>
                    <View style={styles.stat}>
                      <Text variant="titleLarge" style={{ color: theme.colors.primary }}>
                        {stats.volume.toLocaleString()}
                      </Text>
                      <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        Volume (lbs)
                      </Text>
                    </View>
                  </View>

                  {/* Exercise preview */}
                  {workout.exercises && workout.exercises.length > 0 && (
                    <View style={styles.exercisePreview}>
                      {workout.exercises.slice(0, 3).map((ex, i) => (
                        <Text 
                          key={i} 
                          variant="bodySmall" 
                          style={{ color: theme.colors.onSurfaceVariant }}
                          numberOfLines={1}
                        >
                          • {ex.exerciseName}
                        </Text>
                      ))}
                      {workout.exercises.length > 3 && (
                        <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                          +{workout.exercises.length - 3} more
                        </Text>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              </Surface>
            );
          })
        )}
      </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchbar: {
    borderRadius: 28,
    padding: 4,
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'transparent',
    height: 40,
  },
  filterScroll: {
    maxHeight: 50,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChip: {
    marginRight: 8,
    height: 32,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingTop: 8,
  },
  emptyCard: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  viewToggleContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  viewToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(100,130,153,0.1)',
  },
  workoutCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  exercisePreview: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(100,130,153,0.2)',
  },
});

export default HistoryScreen;
