// MesoCycle Screen - Manage current training program/mesocycle

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Surface, useTheme, Button, ProgressBar, Portal, Dialog, Divider } from 'react-native-paper';
import { useMesoCycle } from '../context/MesoCycleContext';
import { VOLUME_LANDMARKS, MUSCLE_GROUP_LABELS } from '../utils/constants';
import type { MuscleGroup } from '../types';

interface MesoCycleScreenProps {
  navigation: any;
}

export function MesoCycleScreen({ navigation }: MesoCycleScreenProps) {
  const theme = useTheme();
  const { state: mesoState, dispatch, shouldTriggerDeload } = useMesoCycle();
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [showDeloadDialog, setShowDeloadDialog] = useState(false);

  const meso = mesoState.activeMesoCycle;

  // No active mesocycle
  if (!meso) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.emptyState}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>📖</Text>
          <Text variant="headlineSmall" style={{ textAlign: 'center', marginBottom: 8 }}>
            No Active Program
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.outline, textAlign: 'center', marginBottom: 24 }}>
            Start a training program to track your mesocycle progress, volume, and auto-regulation.
          </Text>
          <Button mode="contained" onPress={() => navigation.navigate('Programs')}>
            Browse Programs
          </Button>
        </View>
      </View>
    );
  }

  // Calculate week progress
  const weekProgress = meso.currentWeek / meso.totalWeeks;
  const isDeloadWeek = meso.currentWeek === meso.totalWeeks;
  const completedWorkouts = meso.completedWorkouts || 0;
  const targetWorkouts = meso.totalWorkouts || (meso.totalWeeks * 4); // Estimate if not set

  // Get recent feedback summary
  const recentFeedback = mesoState.workoutFeedback.slice(-5);
  const avgPerformance = recentFeedback.length > 0
    ? (recentFeedback.reduce((sum, f) => sum + f.performanceRating, 0) / recentFeedback.length).toFixed(1)
    : 'N/A';
  const avgSoreness = recentFeedback.length > 0
    ? (recentFeedback.reduce((sum, f) => sum + f.sorenessRating, 0) / recentFeedback.length).toFixed(1)
    : 'N/A';

  // Handle advancing to next week
  const handleAdvanceWeek = () => {
    if (meso.currentWeek < meso.totalWeeks) {
      dispatch({ type: 'ADVANCE_WEEK' });
    }
  };

  // Handle triggering deload
  const handleTriggerDeload = () => {
    dispatch({ type: 'TRIGGER_DELOAD' });
    setShowDeloadDialog(false);
  };

  // Handle ending mesocycle
  const handleEndMesocycle = () => {
    dispatch({ type: 'ABANDON_MESOCYCLE', payload: meso.id });
    setShowEndDialog(false);
    navigation.navigate('Home');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Program Header */}
        <Surface style={styles.headerCard} elevation={2}>
          <View style={styles.headerTop}>
            <View style={{ flex: 1 }}>
              <Text variant="headlineSmall" style={{ fontWeight: '600' }}>{meso.name}</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                {meso.programId ? 'From Program' : 'Custom Mesocycle'}
              </Text>
            </View>
            {isDeloadWeek && (
              <Surface style={[styles.badge, { backgroundColor: theme.colors.tertiaryContainer }]} elevation={0}>
                <Text variant="labelMedium" style={{ color: theme.colors.onTertiaryContainer }}>
                  DELOAD WEEK
                </Text>
              </Surface>
            )}
          </View>

          {/* Week Progress */}
          <View style={styles.weekProgress}>
            <View style={styles.weekHeader}>
              <Text variant="titleMedium">Week {meso.currentWeek} of {meso.totalWeeks}</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                {completedWorkouts} workouts completed
              </Text>
            </View>
            <ProgressBar 
              progress={weekProgress} 
              color={isDeloadWeek ? theme.colors.tertiary : theme.colors.primary}
              style={styles.progressBar}
            />
            <View style={styles.weekDots}>
              {Array.from({ length: meso.totalWeeks }).map((_, i) => (
                <View 
                  key={i}
                  style={[
                    styles.weekDot,
                    {
                      backgroundColor: i < meso.currentWeek 
                        ? (i === meso.totalWeeks - 1 ? theme.colors.tertiary : theme.colors.primary)
                        : theme.colors.surfaceVariant,
                    }
                  ]}
                />
              ))}
            </View>
          </View>
        </Surface>

        {/* Deload Warning */}
        {shouldTriggerDeload() && !isDeloadWeek && (
          <TouchableOpacity onPress={() => setShowDeloadDialog(true)}>
            <Surface style={[styles.warningCard, { backgroundColor: theme.colors.errorContainer }]} elevation={1}>
              <Text style={{ fontSize: 24, marginRight: 12 }}>⚠️</Text>
              <View style={{ flex: 1 }}>
                <Text variant="titleSmall" style={{ color: theme.colors.onErrorContainer }}>
                  High Fatigue Detected
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onErrorContainer }}>
                  Consider moving to deload week early. Tap for options.
                </Text>
              </View>
            </Surface>
          </TouchableOpacity>
        )}

        {/* Feedback Summary */}
        <Surface style={styles.card} elevation={1}>
          <Text variant="titleMedium" style={styles.cardTitle}>📊 Recent Performance</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
                {avgPerformance}
              </Text>
              <Text variant="labelSmall">Avg Performance</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={{ color: parseFloat(avgSoreness as string) > 1.5 ? theme.colors.error : '#00E676' }}>
                {avgSoreness}
              </Text>
              <Text variant="labelSmall">Avg Soreness</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={{ color: theme.colors.secondary }}>
                {recentFeedback.length}
              </Text>
              <Text variant="labelSmall">Workouts Logged</Text>
            </View>
          </View>
        </Surface>

        {/* Volume Overview */}
        <Surface style={styles.card} elevation={1}>
          <View style={styles.cardHeader}>
            <Text variant="titleMedium" style={styles.cardTitle}>💪 Volume Status</Text>
            <Button mode="text" compact onPress={() => navigation.navigate('VolumeTracker')}>
              See All
            </Button>
          </View>
          
          {/* Top 5 muscles by volume */}
          {Object.entries(mesoState.weeklyVolume)
            .sort(([, a], [, b]) => (b as number) - (a as number))
            .slice(0, 5)
            .map(([muscle, sets]) => {
              const landmarks = VOLUME_LANDMARKS[muscle as MuscleGroup];
              const progress = landmarks ? (sets as number) / landmarks.MRV : 0;
              const label = MUSCLE_GROUP_LABELS[muscle as MuscleGroup] || muscle;
              
              return (
                <View key={muscle} style={styles.volumeRow}>
                  <Text variant="bodyMedium" style={{ width: 80 }}>{label}</Text>
                  <View style={styles.volumeBarContainer}>
                    <View style={[styles.volumeBar, { backgroundColor: theme.colors.surfaceVariant }]}>
                      <View 
                        style={[
                          styles.volumeFill,
                          {
                            width: `${Math.min(progress * 100, 100)}%`,
                            backgroundColor: progress > 1 ? theme.colors.error : 
                              progress > 0.8 ? theme.colors.tertiary : theme.colors.primary,
                          }
                        ]}
                      />
                    </View>
                  </View>
                  <Text variant="labelMedium" style={{ width: 30, textAlign: 'right' }}>
                    {sets as number}
                  </Text>
                </View>
              );
            })}
        </Surface>

        {/* Actions */}
        <Surface style={styles.card} elevation={1}>
          <Text variant="titleMedium" style={styles.cardTitle}>⚙️ Actions</Text>
          
          <TouchableOpacity 
            style={styles.actionRow}
            onPress={handleAdvanceWeek}
            disabled={meso.currentWeek >= meso.totalWeeks}
          >
            <Text style={{ fontSize: 20 }}>⏭️</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text variant="bodyLarge">Advance to Next Week</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                Move to week {Math.min(meso.currentWeek + 1, meso.totalWeeks)}
              </Text>
            </View>
          </TouchableOpacity>

          <Divider style={{ marginVertical: 8 }} />

          <TouchableOpacity 
            style={styles.actionRow}
            onPress={() => setShowDeloadDialog(true)}
            disabled={isDeloadWeek}
          >
            <Text style={{ fontSize: 20 }}>🛌</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text variant="bodyLarge">Trigger Deload</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                Skip to deload week if fatigued
              </Text>
            </View>
          </TouchableOpacity>

          <Divider style={{ marginVertical: 8 }} />

          <TouchableOpacity 
            style={styles.actionRow}
            onPress={() => setShowEndDialog(true)}
          >
            <Text style={{ fontSize: 20 }}>🏁</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text variant="bodyLarge" style={{ color: theme.colors.error }}>End Mesocycle</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                Finish early and start fresh
              </Text>
            </View>
          </TouchableOpacity>
        </Surface>
      </ScrollView>

      {/* Deload Dialog */}
      <Portal>
        <Dialog visible={showDeloadDialog} onDismiss={() => setShowDeloadDialog(false)}>
          <Dialog.Title>Trigger Deload Week?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Moving to deload week will reduce your volume to allow recovery. This is recommended when:
            </Text>
            <View style={{ marginTop: 12 }}>
              <Text variant="bodySmall">• Performance is declining</Text>
              <Text variant="bodySmall">• Fatigue ratings are high (4-5)</Text>
              <Text variant="bodySmall">• Soreness isn't recovering between sessions</Text>
              <Text variant="bodySmall">• Sleep or motivation is suffering</Text>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDeloadDialog(false)}>Cancel</Button>
            <Button mode="contained" onPress={handleTriggerDeload}>Start Deload</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* End Dialog */}
      <Portal>
        <Dialog visible={showEndDialog} onDismiss={() => setShowEndDialog(false)}>
          <Dialog.Title>End Mesocycle?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to end this mesocycle? Your progress will be saved to history.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowEndDialog(false)}>Cancel</Button>
            <Button mode="contained" buttonColor={theme.colors.error} onPress={handleEndMesocycle}>
              End Mesocycle
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
    padding: 32,
  },
  headerCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  weekProgress: {
    gap: 8,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  weekDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  weekDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  warningCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  volumeBarContainer: {
    flex: 1,
    marginHorizontal: 8,
  },
  volumeBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  volumeFill: {
    height: '100%',
    borderRadius: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
});

export default MesoCycleScreen;
