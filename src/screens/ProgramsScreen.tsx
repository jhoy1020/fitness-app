// Programs Screen - Browse and start training programs

import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Surface, useTheme, Chip, Button, Portal, Dialog, Divider } from 'react-native-paper';
import { useMesoCycle } from '../context/MesoCycleContext';
import { useUser } from '../context/UserContext';
import { TRAINING_PROGRAMS } from '../data/programs/programs';
import type { TrainingProgram, MuscleGroup } from '../types';
import { MUSCLE_GROUP_LABELS } from '../utils/constants/constants';

interface ProgramsScreenProps {
  navigation: any;
}

export function ProgramsScreen({ navigation }: ProgramsScreenProps) {
  const theme = useTheme();
  const { state: mesoState, dispatch } = useMesoCycle();
  const { getOneRepMax, state: userState } = useUser();
  const [selectedProgram, setSelectedProgram] = useState<TrainingProgram | null>(null);
  const [filterDifficulty, setFilterDifficulty] = useState<string | null>(null);
  const [filterDays, setFilterDays] = useState<number | null>(null);

  // Calculate suggested weight based on 1RM percentage for target reps
  const getWeightFrom1RM = (exerciseName: string, targetReps: number): number | null => {
    const oneRMRecord = getOneRepMax(exerciseName);
    if (!oneRMRecord) return null;
    
    // Rep to percentage mapping (approximate)
    // 1 rep = 100%, 5 reps = 87%, 8 reps = 80%, 10 reps = 75%, 12 reps = 70%
    const repPercentages: Record<number, number> = {
      1: 1.00, 2: 0.95, 3: 0.93, 4: 0.90, 5: 0.87,
      6: 0.85, 7: 0.83, 8: 0.80, 9: 0.77, 10: 0.75,
      11: 0.72, 12: 0.70, 15: 0.65, 20: 0.60
    };
    
    const percentage = repPercentages[targetReps] || (1 - (targetReps * 0.025));
    const suggestedWeight = Math.round(oneRMRecord.weight * percentage / 5) * 5; // Round to nearest 5
    return Math.max(suggestedWeight, 45); // Minimum bar weight
  };

  // Get all exercises from program with their suggested weights
  const programExercisesWithWeights = useMemo(() => {
    if (!selectedProgram) return [];
    
    const exerciseMap = new Map<string, { name: string; targetReps: number; suggestedWeight: number | null; oneRM: number | null }>();
    
    selectedProgram.weekTemplate.days.forEach(day => {
      // Only process workout days that have exercises
      if (day.exercises) {
        day.exercises.forEach(exercise => {
          const exerciseName = exercise.exerciseName;
          if (exerciseName && !exerciseMap.has(exerciseName)) {
            const avgReps = Math.floor((exercise.repsMin + exercise.repsMax) / 2);
            const suggestedWeight = getWeightFrom1RM(exerciseName, avgReps);
            const oneRMRecord = getOneRepMax(exerciseName);
            exerciseMap.set(exerciseName, {
              name: exerciseName,
              targetReps: avgReps,
              suggestedWeight,
              oneRM: oneRMRecord?.weight || null,
            });
          }
        });
      }
    });
    
    return Array.from(exerciseMap.values());
  }, [selectedProgram, userState.oneRepMaxRecords]);

  // Filter exercises that have 1RM-based suggestions
  const exercisesWithSuggestions = programExercisesWithWeights.filter(e => e.suggestedWeight !== null);

  // Filter programs
  const filteredPrograms = TRAINING_PROGRAMS.filter(program => {
    if (filterDifficulty && program.difficulty !== filterDifficulty) return false;
    if (filterDays && program.daysPerWeek !== filterDays) return false;
    return true;
  });

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#4CAF50';
      case 'intermediate': return '#FF9800';
      case 'advanced': return '#F44336';
      default: return theme.colors.primary;
    }
  };

  // Handle starting a program
  const handleStartProgram = () => {
    if (!selectedProgram) return;
    
    dispatch({
      type: 'START_PROGRAM',
      payload: {
        program: selectedProgram,
        startDate: new Date().toISOString(),
      },
    });
    
    setSelectedProgram(null);
    navigation.navigate('Home');
  };

  // Get focus muscles
  const getFocusMuscles = (program: TrainingProgram): MuscleGroup[] => {
    return Object.entries(program.musclePriorities)
      .filter(([_, priority]) => priority === 'focus')
      .map(([muscle]) => muscle as MuscleGroup);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Create Your Own */}
      <TouchableOpacity onPress={() => navigation.navigate('CreateProgram')}>
        <Surface style={[styles.createCard, { borderColor: theme.colors.primary }]} elevation={0}>
          <Text style={{ fontSize: 24, marginRight: 12 }}>✨</Text>
          <View style={{ flex: 1 }}>
            <Text variant="titleMedium" style={{ color: theme.colors.primary }}>
              Create Your Own Program
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
              Build a custom workout split with your favorite exercises
            </Text>
          </View>
          <Text style={{ fontSize: 20, color: theme.colors.primary }}>›</Text>
        </Surface>
      </TouchableOpacity>

      {/* Active Mesocycle Warning */}
      {mesoState.activeMesoCycle && (
        <Surface style={[styles.warningCard, { backgroundColor: theme.colors.errorContainer }]} elevation={1}>
          <Text variant="bodyMedium" style={{ color: theme.colors.onErrorContainer }}>
            ⚠️ You have an active mesocycle: "{mesoState.activeMesoCycle.name}". 
            Starting a new program will replace it.
          </Text>
        </Surface>
      )}

      {/* Filters */}
      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Chip
            selected={!filterDifficulty}
            onPress={() => setFilterDifficulty(null)}
            style={styles.filterChip}
            showSelectedCheck={false}
          >
            All Levels
          </Chip>
          {['beginner', 'intermediate', 'advanced'].map(level => (
            <Chip
              key={level}
              selected={filterDifficulty === level}
              onPress={() => setFilterDifficulty(filterDifficulty === level ? null : level)}
              style={styles.filterChip}
              showSelectedCheck={false}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </Chip>
          ))}
          <View style={styles.filterSpacer} />
          {[3, 4, 5, 6].map(days => (
            <Chip
              key={days}
              selected={filterDays === days}
              onPress={() => setFilterDays(filterDays === days ? null : days)}
              style={styles.filterChip}
              showSelectedCheck={false}
            >
              {days}x/week
            </Chip>
          ))}
        </ScrollView>
      </View>

      {/* Programs List */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {filteredPrograms.length === 0 ? (
          <Surface style={styles.emptyCard} elevation={1}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🔍</Text>
            <Text variant="titleMedium">No programs match your filters</Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.outline }}>
              Try adjusting your filter criteria
            </Text>
          </Surface>
        ) : (
          filteredPrograms.map(program => {
            const focusMuscles = getFocusMuscles(program);
            
            return (
              <TouchableOpacity
                key={program.id}
                onPress={() => setSelectedProgram(program)}
              >
                <Surface style={styles.programCard} elevation={1}>
                  <View style={styles.programHeader}>
                    <View style={{ flex: 1 }}>
                      <Text variant="titleMedium" style={styles.programName}>
                        {program.name}
                      </Text>
                      <View style={styles.programMeta}>
                        <Chip 
                          compact 
                          textStyle={{ fontSize: 10, color: getDifficultyColor(program.difficulty) }}
                          style={{ backgroundColor: getDifficultyColor(program.difficulty) + '20' }}
                        >
                          {program.difficulty}
                        </Chip>
                        <Text variant="bodySmall" style={{ color: theme.colors.outline, marginLeft: 8 }}>
                          {program.daysPerWeek}x/week • {program.durationWeeks} weeks
                        </Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: 24 }}>›</Text>
                  </View>

                  <Text 
                    variant="bodySmall" 
                    style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}
                    numberOfLines={2}
                  >
                    {program.description}
                  </Text>

                  <View style={styles.programInfo}>
                    <View style={styles.infoItem}>
                      <Text variant="labelSmall" style={{ color: theme.colors.outline }}>Split</Text>
                      <Text variant="bodySmall">{program.split}</Text>
                    </View>
                    {focusMuscles.length > 0 && (
                      <View style={styles.infoItem}>
                        <Text variant="labelSmall" style={{ color: theme.colors.outline }}>Focus</Text>
                        <Text variant="bodySmall">
                          {focusMuscles.map(m => MUSCLE_GROUP_LABELS[m]).join(', ')}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.tags}>
                    {program.tags.slice(0, 3).map(tag => (
                      <Chip 
                        key={tag} 
                        compact 
                        mode="flat"
                        style={styles.tag} 
                        textStyle={styles.tagText}
                      >
                        {tag}
                      </Chip>
                    ))}
                  </View>
                </Surface>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Program Detail Dialog */}
      <Portal>
        <Dialog 
          visible={!!selectedProgram} 
          onDismiss={() => setSelectedProgram(null)}
          style={{ maxHeight: '80%' }}
        >
          {selectedProgram && (
            <React.Fragment>
              <Dialog.Title>{selectedProgram.name}</Dialog.Title>
              <Dialog.ScrollArea>
                <ScrollView style={{ paddingHorizontal: 24 }}>
                  <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
                    {selectedProgram.description}
                  </Text>

                  <Divider style={{ marginVertical: 12 }} />

                  {/* Program Stats */}
                  <View style={styles.detailStats}>
                    <View style={styles.detailStat}>
                      <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
                        {selectedProgram.daysPerWeek}
                      </Text>
                      <Text variant="labelSmall">Days/Week</Text>
                    </View>
                    <View style={styles.detailStat}>
                      <Text variant="headlineSmall" style={{ color: theme.colors.secondary }}>
                        {selectedProgram.durationWeeks}
                      </Text>
                      <Text variant="labelSmall">Weeks</Text>
                    </View>
                    <View style={styles.detailStat}>
                      <Text 
                        variant="headlineSmall" 
                        style={{ color: getDifficultyColor(selectedProgram.difficulty) }}
                      >
                        {selectedProgram.difficulty.charAt(0).toUpperCase()}
                      </Text>
                      <Text variant="labelSmall">Difficulty</Text>
                    </View>
                  </View>

                  <Divider style={{ marginVertical: 12 }} />

                  {/* Weekly Schedule */}
                  <Text variant="titleSmall" style={{ marginBottom: 8 }}>Weekly Schedule</Text>
                  {selectedProgram.weekTemplate.days.map((day, idx) => {
                    const dayType = day.dayType || 'workout';
                    const getDayIcon = () => {
                      switch (dayType) {
                        case 'rest': return '😴';
                        case 'cardio': return '🏃';
                        case 'active_recovery': return '🧘';
                        default: return '💪';
                      }
                    };
                    const getDayColor = () => {
                      switch (dayType) {
                        case 'rest': return theme.colors.outline;
                        case 'cardio': return theme.colors.secondary;
                        case 'active_recovery': return theme.colors.tertiary;
                        default: return theme.colors.primary;
                      }
                    };
                    
                    return (
                      <View key={idx} style={styles.dayPreview}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Text style={{ fontSize: 16 }}>{getDayIcon()}</Text>
                          <Text variant="bodyMedium" style={{ fontWeight: '600' }}>
                            Day {day.dayNumber}: {day.name}
                          </Text>
                        </View>
                        {dayType === 'workout' && day.muscleGroups && (
                          <>
                            <Text variant="bodySmall" style={{ color: theme.colors.outline, marginLeft: 24 }}>
                              {day.muscleGroups.map(m => MUSCLE_GROUP_LABELS[m]).join(', ')}
                            </Text>
                            <Text variant="bodySmall" style={{ color: getDayColor(), marginLeft: 24 }}>
                              {day.exercises?.length || 0} exercises
                              {day.cardioFinisher && ' + cardio finisher'}
                            </Text>
                          </>
                        )}
                        {dayType === 'cardio' && (
                          <Text variant="bodySmall" style={{ color: getDayColor(), marginLeft: 24 }}>
                            {day.cardioActivities?.length || 0} cardio options
                          </Text>
                        )}
                        {dayType === 'active_recovery' && (
                          <Text variant="bodySmall" style={{ color: getDayColor(), marginLeft: 24 }}>
                            {day.recoverySuggestions?.length || 0} recovery activities suggested
                          </Text>
                        )}
                        {dayType === 'rest' && (
                          <Text variant="bodySmall" style={{ color: getDayColor(), marginLeft: 24 }}>
                            Complete rest day
                          </Text>
                        )}
                        {day.notes && (
                          <Text variant="bodySmall" style={{ color: theme.colors.outline, marginLeft: 24, fontStyle: 'italic' }}>
                            {day.notes}
                          </Text>
                        )}
                      </View>
                    );
                  })}

                  <Divider style={{ marginVertical: 12 }} />

                  {/* Progression Info */}
                  <Text variant="titleSmall" style={{ marginBottom: 8 }}>Volume Progression</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                    • Starts at {Math.round(selectedProgram.startingVolumeMultiplier * 100)}% of MEV
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                    • Adds {selectedProgram.volumeProgressionPerWeek} sets per muscle per week
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                    • Final week is a deload at MV (50% volume)
                  </Text>

                  {/* Suggested Starting Weights from 1RM */}
                  {exercisesWithSuggestions.length > 0 && (
                    <React.Fragment>
                      <Divider style={{ marginVertical: 12 }} />
                      <Text variant="titleSmall" style={{ marginBottom: 8 }}>🎯 Suggested Starting Weights</Text>
                      <Text variant="bodySmall" style={{ color: theme.colors.outline, marginBottom: 8 }}>
                        Based on your 1RM records:
                      </Text>
                      {exercisesWithSuggestions.map((exercise, idx) => (
                        <View key={idx} style={styles.weightSuggestion}>
                          <Text variant="bodyMedium" style={{ flex: 1 }}>
                            {exercise.name}
                          </Text>
                          <View style={{ alignItems: 'flex-end' }}>
                            <Text variant="bodyMedium" style={{ fontWeight: '600', color: theme.colors.primary }}>
                              {exercise.suggestedWeight} {userState.units === 'metric' ? 'kg' : 'lbs'}
                            </Text>
                            <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
                              ~{exercise.targetReps} reps @ {exercise.oneRM} 1RM
                            </Text>
                          </View>
                        </View>
                      ))}
                      {programExercisesWithWeights.length > exercisesWithSuggestions.length && (
                        <Text variant="bodySmall" style={{ color: theme.colors.outline, marginTop: 8, fontStyle: 'italic' }}>
                          💡 Add more 1RM records in Profile to get suggestions for {programExercisesWithWeights.length - exercisesWithSuggestions.length} more exercises
                        </Text>
                      )}
                    </React.Fragment>
                  )}

                  {exercisesWithSuggestions.length === 0 && (
                    <React.Fragment>
                      <Divider style={{ marginVertical: 12 }} />
                      <View style={styles.noWeightHint}>
                        <Text style={{ fontSize: 20, marginRight: 8 }}>💡</Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.outline, flex: 1 }}>
                          Add 1RM records in your Profile to get personalized starting weight suggestions for this program!
                        </Text>
                      </View>
                    </React.Fragment>
                  )}
                </ScrollView>
              </Dialog.ScrollArea>
              <Dialog.Actions>
                <Button onPress={() => setSelectedProgram(null)}>Cancel</Button>
                <Button mode="contained" onPress={handleStartProgram}>
                  Start Program
                </Button>
              </Dialog.Actions>
            </React.Fragment>
          )}
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  createCard: {
    margin: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  warningCard: {
    margin: 16,
    marginBottom: 0,
    padding: 12,
    borderRadius: 8,
  },
  filters: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  filterChip: {
    marginRight: 8,
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterSpacer: {
    width: 16,
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
  programCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  programHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  programName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  programMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  programInfo: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 24,
  },
  infoItem: {
    gap: 2,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 4,
  },
  tag: {
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagText: {
    fontSize: 10,
    lineHeight: 12,
    marginVertical: 0,
    marginHorizontal: 0,
  },
  detailStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  detailStat: {
    alignItems: 'center',
  },
  dayPreview: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(100,130,153,0.2)',
  },
  weightSuggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(100,130,153,0.15)',
  },
  noWeightHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(100,130,153,0.1)',
    padding: 12,
    borderRadius: 8,
  },
});

export default ProgramsScreen;
