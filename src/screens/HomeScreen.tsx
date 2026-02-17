// Home Screen
// Dashboard with quick actions and recent workouts

import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Surface, useTheme, Divider, Portal, Dialog, TextInput, ProgressBar, IconButton } from 'react-native-paper';
import { TouchableOpacity } from 'react-native';
import { useWorkout, useUser, useMesoCycle } from '../context';
import { WorkoutCard } from '../components';
import { getAllExercises, getSetsByWorkoutId } from '../services/db';
import { calculate1RM_Epley } from '../utils/formulas';
import { EXERCISE_LIBRARY } from '../services/db/exerciseLibrary';
import { TRAINING_PROGRAMS } from '../data/programs';
import type { Exercise, WorkoutSet, Workout } from '../types';

interface EditableSet {
  id: string;
  exerciseName: string;
  muscleGroup: string;
  weight: string;
  reps: string;
  isNew?: boolean;
}

interface HomeScreenProps {
  navigation: any;
}

export function HomeScreen({ navigation }: HomeScreenProps) {
  const theme = useTheme();
  const { state: workoutState, dispatch, repeatWorkout } = useWorkout();
  const { state: userState } = useUser();
  const { state: mesoState, dispatch: mesoDispatch, shouldTriggerDeload } = useMesoCycle();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workoutSets, setWorkoutSets] = useState<Record<string, WorkoutSet[]>>({});
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [editName, setEditName] = useState('');
  const [editSets, setEditSets] = useState<EditableSet[]>([]);
  const [showAddSet, setShowAddSet] = useState(false);
  const [newSetExercise, setNewSetExercise] = useState('');
  const [newSetWeight, setNewSetWeight] = useState('');
  const [newSetReps, setNewSetReps] = useState('');
  
  // Add past workout state
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [newWorkoutName, setNewWorkoutName] = useState('');
  const [newWorkoutDate, setNewWorkoutDate] = useState('');
  const [newWorkoutSets, setNewWorkoutSets] = useState<EditableSet[]>([]);
  const [addingSetToNew, setAddingSetToNew] = useState(false);
  const [newWkSetExercise, setNewWkSetExercise] = useState('');
  const [newWkSetWeight, setNewWkSetWeight] = useState('');
  const [newWkSetReps, setNewWkSetReps] = useState('');
  
  // Exercise search state
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [showExerciseDropdown, setShowExerciseDropdown] = useState(false);
  const [newWkExerciseSearch, setNewWkExerciseSearch] = useState('');
  const [showNewWkExerciseDropdown, setShowNewWkExerciseDropdown] = useState(false);
  
  // Delete confirmation state
  const [deletingWorkout, setDeletingWorkout] = useState<Workout | null>(null);
  const [deleteConfirmSet, setDeleteConfirmSet] = useState<string | null>(null);
  const [deleteConfirmNewSet, setDeleteConfirmNewSet] = useState<string | null>(null);
  
  // Rest/Cardio/Recovery day dialogs
  const [showRestDayDialog, setShowRestDayDialog] = useState(false);
  const [showCardioDialog, setShowCardioDialog] = useState(false);
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [restDayInfo, setRestDayInfo] = useState<any>(null);
  const [cardioInfo, setCardioInfo] = useState<any>(null);
  const [recoveryInfo, setRecoveryInfo] = useState<any>(null);
  
  // Program completion modal state
  const [showProgramComplete, setShowProgramComplete] = useState(false);
  const [completedProgramStats, setCompletedProgramStats] = useState<{
    name: string;
    totalWorkouts: number;
    totalWeeks: number;
    startDate: string;
    endDate: string;
    totalSets: number;
    totalVolume: number;
  } | null>(null);
  
  // Filtered exercises for search
  const filteredExercises = useMemo(() => {
    const search = exerciseSearch.toLowerCase().trim();
    if (!search) return EXERCISE_LIBRARY.slice(0, 10);
    return EXERCISE_LIBRARY.filter(ex => 
      ex.name.toLowerCase().includes(search) ||
      ex.muscleGroup.toLowerCase().includes(search)
    ).slice(0, 10);
  }, [exerciseSearch]);
  
  const filteredNewWkExercises = useMemo(() => {
    const search = newWkExerciseSearch.toLowerCase().trim();
    if (!search) return EXERCISE_LIBRARY.slice(0, 10);
    return EXERCISE_LIBRARY.filter(ex => 
      ex.name.toLowerCase().includes(search) ||
      ex.muscleGroup.toLowerCase().includes(search)
    ).slice(0, 10);
  }, [newWkExerciseSearch]);

  useEffect(() => {
    loadData();
  }, [workoutState.workoutHistory]);

  // Check for program completion
  useEffect(() => {
    if (mesoState.activeMesoCycle) {
      const { completedWorkouts, totalWorkouts, currentWeek, totalWeeks, name, startDate } = mesoState.activeMesoCycle;
      
      // Program is complete when all workouts are done
      if (completedWorkouts >= totalWorkouts && totalWorkouts > 0) {
        // Calculate stats from workout history during program period
        const programWorkouts = workoutState.workoutHistory.filter(w => 
          new Date(w.date) >= new Date(startDate)
        );
        
        const totalSets = programWorkouts.reduce((sum, w) => sum + (w.sets?.length || 0), 0);
        const totalVolume = programWorkouts.reduce((sum, w) => 
          sum + (w.sets || []).reduce((s, set) => s + (set.weight * set.reps), 0), 0
        );
        
        setCompletedProgramStats({
          name,
          totalWorkouts: completedWorkouts,
          totalWeeks,
          startDate,
          endDate: new Date().toISOString(),
          totalSets,
          totalVolume,
        });
        setShowProgramComplete(true);
      }
    }
  }, [mesoState.activeMesoCycle?.completedWorkouts]);

  const loadData = async () => {
    const allExercises = await getAllExercises();
    setExercises(allExercises);

    // Load sets for recent workouts
    const setsMap: Record<string, WorkoutSet[]> = {};
    for (const workout of workoutState.workoutHistory.slice(0, 5)) {
      const sets = await getSetsByWorkoutId(workout.id);
      setsMap[workout.id] = sets;
    }
    setWorkoutSets(setsMap);
  };

  const handleRepeatWorkout = async (workoutId: string) => {
    await repeatWorkout(workoutId);
    navigation.navigate('ActiveWorkout');
  };

  const handleEdit = (workout: Workout) => {
    setEditingWorkout(workout);
    setEditName(workout.name);
    // Load sets for editing
    const workoutWithSets = workout as any;
    const sets = workoutWithSets.sets || [];
    setEditSets(sets.map((s: any) => ({
      id: s.id || Date.now().toString() + Math.random(),
      exerciseName: s.exerciseName || '',
      muscleGroup: s.muscleGroup || '',
      weight: s.weight?.toString() || '',
      reps: s.reps?.toString() || '',
    })));
    setShowAddSet(false);
    setNewSetExercise('');
    setNewSetWeight('');
    setNewSetReps('');
  };

  const handleUpdateSet = (setId: string, field: 'weight' | 'reps', value: string) => {
    setEditSets(prev => prev.map(s => 
      s.id === setId ? { ...s, [field]: value } : s
    ));
  };

  const handleDeleteSet = (setId: string) => {
    setEditSets(prev => prev.filter(s => s.id !== setId));
  };

  const handleAddNewSet = () => {
    if (!newSetExercise || !newSetWeight || !newSetReps) return;
    
    const exercise = EXERCISE_LIBRARY.find(e => e.name === newSetExercise);
    const newSet: EditableSet = {
      id: Date.now().toString() + Math.random(),
      exerciseName: newSetExercise,
      muscleGroup: exercise?.muscleGroup || 'other',
      weight: newSetWeight,
      reps: newSetReps,
      isNew: true,
    };
    
    setEditSets(prev => [...prev, newSet]);
    setShowAddSet(false);
    setNewSetExercise('');
    setNewSetWeight('');
    setNewSetReps('');
  };

  const handleSaveEdit = () => {
    if (editingWorkout && editName.trim()) {
      // Convert editSets back to proper format
      const updatedSets = editSets.map(s => ({
        id: s.id,
        exerciseName: s.exerciseName,
        muscleGroup: s.muscleGroup,
        weight: parseFloat(s.weight) || 0,
        reps: parseInt(s.reps) || 0,
      }));
      
      dispatch({
        type: 'UPDATE_WORKOUT',
        payload: { 
          id: editingWorkout.id, 
          updates: { 
            name: editName.trim(),
            sets: updatedSets,
          } 
        }
      });
      setEditingWorkout(null);
    }
  };

  // Add past workout functions
  const handleOpenAddWorkout = () => {
    setShowAddWorkout(true);
    setNewWorkoutName('');
    // Default to today's date
    const today = new Date().toISOString().split('T')[0];
    setNewWorkoutDate(today);
    setNewWorkoutSets([]);
    setAddingSetToNew(false);
  };

  const handleAddSetToNewWorkout = () => {
    if (!newWkSetExercise || !newWkSetWeight || !newWkSetReps) return;
    
    const exercise = EXERCISE_LIBRARY.find(e => e.name === newWkSetExercise);
    const newSet: EditableSet = {
      id: Date.now().toString() + Math.random(),
      exerciseName: newWkSetExercise,
      muscleGroup: exercise?.muscleGroup || 'other',
      weight: newWkSetWeight,
      reps: newWkSetReps,
    };
    
    setNewWorkoutSets(prev => [...prev, newSet]);
    setAddingSetToNew(false);
    setNewWkSetExercise('');
    setNewWkSetWeight('');
    setNewWkSetReps('');
  };

  const handleDeleteNewWorkoutSet = (setId: string) => {
    setNewWorkoutSets(prev => prev.filter(s => s.id !== setId));
  };

  const handleSaveNewWorkout = () => {
    if (!newWorkoutName.trim() || newWorkoutSets.length === 0) {
      // Just return - the Save button is already disabled when no sets
      return;
    }
    
    const workoutId = Date.now().toString();
    const sets = newWorkoutSets.map(s => ({
      id: s.id,
      exerciseName: s.exerciseName,
      muscleGroup: s.muscleGroup,
      weight: parseFloat(s.weight) || 0,
      reps: parseInt(s.reps) || 0,
    }));
    
    // Calculate duration estimate (2 min per set)
    const durationSeconds = sets.length * 120;
    
    dispatch({
      type: 'ADD_WORKOUT',
      payload: {
        id: workoutId,
        name: newWorkoutName.trim(),
        date: newWorkoutDate || new Date().toISOString().split('T')[0],
        duration: durationSeconds,
        sets: sets,
      }
    });
    
    setShowAddWorkout(false);
  };

  const handleDelete = (workout: Workout) => {
    setDeletingWorkout(workout);
  };
  
  const confirmDelete = () => {
    if (deletingWorkout) {
      dispatch({ type: 'DELETE_WORKOUT', payload: deletingWorkout.id });
      setDeletingWorkout(null);
    }
  };

  const recentWorkouts = workoutState.workoutHistory.slice(0, 5);

  // Get the next workout from active program
  const getNextProgramWorkout = useMemo(() => {
    if (!mesoState.activeMesoCycle) return null;
    
    // First try to get weekTemplate from the mesocycle itself (for custom programs)
    let weekTemplate = mesoState.activeMesoCycle.weekTemplate;
    
    // Fallback: try to find in TRAINING_PROGRAMS (for pre-built programs)
    if (!weekTemplate && mesoState.activeMesoCycle.programId) {
      const program = TRAINING_PROGRAMS.find(p => p.id === mesoState.activeMesoCycle?.programId);
      weekTemplate = program?.weekTemplate;
    }
    
    if (!weekTemplate?.days?.length) return null;
    
    // Calculate which day we're on based on completed workouts
    const completedWorkouts = mesoState.activeMesoCycle.completedWorkouts || 0;
    const daysInWeek = weekTemplate.days.length;
    const dayIndex = completedWorkouts % daysInWeek;
    const nextDay = weekTemplate.days[dayIndex];
    
    if (!nextDay) return null;
    
    // Determine day type
    const dayType = nextDay.dayType || 'workout';
    
    return {
      name: nextDay.name,
      dayNumber: dayIndex + 1,
      totalDays: daysInWeek,
      dayType,
      notes: nextDay.notes,
      cardioFinisher: nextDay.cardioFinisher,
      sets: dayType === 'workout' && nextDay.exercises ? nextDay.exercises.map(ex => ({
        exerciseName: ex.exerciseName || `${ex.muscleGroup} exercise`,
        muscleGroup: ex.muscleGroup,
        targetSets: ex.sets,
        repsMin: ex.repsMin,
        repsMax: ex.repsMax,
        rirTarget: ex.rirTarget,
        restSeconds: ex.restSeconds,
        supersetGroupId: ex.supersetGroupId,
        supersetOrder: ex.supersetOrder,
      })) : [],
      // For cardio days
      cardioActivities: nextDay.cardioActivities,
      // For active recovery days
      recoverySuggestions: nextDay.recoverySuggestions,
    };
  }, [mesoState.activeMesoCycle]);

  // Start program workout handler
  const handleStartProgramWorkout = () => {
    if (getNextProgramWorkout) {
      const { dayType } = getNextProgramWorkout;
      
      // Handle rest days
      if (dayType === 'rest') {
        setRestDayInfo(getNextProgramWorkout);
        setShowRestDayDialog(true);
        return;
      }
      
      // Handle cardio days
      if (dayType === 'cardio') {
        setCardioInfo(getNextProgramWorkout);
        setShowCardioDialog(true);
        return;
      }
      
      // Handle active recovery days
      if (dayType === 'active_recovery') {
        setRecoveryInfo(getNextProgramWorkout);
        setShowRecoveryDialog(true);
        return;
      }
      
      // Regular workout day
      navigation.navigate('ActiveWorkout', {
        templateWorkout: {
          name: getNextProgramWorkout.name,
          sets: getNextProgramWorkout.sets,
          isProgramWorkout: true,
          cardioFinisher: getNextProgramWorkout.cardioFinisher,
        }
      });
    } else {
      navigation.navigate('ActiveWorkout');
    }
  };

  // Calculate weekly streak
  const weeklyStreak = useMemo(() => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisWeekWorkouts = workoutState.workoutHistory.filter(w => 
      new Date(w.date) >= oneWeekAgo
    );
    
    // Get unique days this week
    const uniqueDays = new Set(
      thisWeekWorkouts.map(w => new Date(w.date).toDateString())
    );
    
    return uniqueDays.size;
  }, [workoutState.workoutHistory]);

  // Calculate current streak (consecutive days with workouts)
  const currentStreak = useMemo(() => {
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check each day going back
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const hasWorkout = workoutState.workoutHistory.some(w => {
        const workoutDate = new Date(w.date);
        workoutDate.setHours(0, 0, 0, 0);
        return workoutDate.getTime() === checkDate.getTime();
      });
      
      if (hasWorkout) {
        streak++;
      } else if (i > 0) { // Allow today to not have a workout yet
        break;
      }
    }
    
    return streak;
  }, [workoutState.workoutHistory]);

  // Week calendar - shows each day of the current week and whether user worked out
  const weekCalendar = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - dayOfWeek);
    weekStart.setHours(0, 0, 0, 0);
    
    const days = [];
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      
      const hasWorkout = workoutState.workoutHistory.some(w => {
        const workoutDate = new Date(w.date);
        workoutDate.setHours(0, 0, 0, 0);
        return workoutDate.getTime() === date.getTime();
      });
      
      const isToday = date.toDateString() === today.toDateString();
      const isFuture = date > today;
      
      days.push({
        dayName: dayNames[i],
        date: date.getDate(),
        hasWorkout,
        isToday,
        isFuture,
      });
    }
    
    return days;
  }, [workoutState.workoutHistory]);

  // Get recent PRs
  const recentPRs = useMemo(() => {
    const prs: { exercise: string; weight: number; reps: number; e1rm: number; date: string }[] = [];
    const bestByExercise: Record<string, number> = {};
    
    // Sort workouts by date (newest first)
    const sorted = [...workoutState.workoutHistory].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Go through oldest to newest to track when PRs happened
    const reversed = [...sorted].reverse();
    reversed.forEach(workout => {
      (workout.sets || []).forEach((set: any) => {
        const e1rm = calculate1RM_Epley(set.weight, set.reps);
        const exerciseName = set.exerciseName;
        
        if (!bestByExercise[exerciseName] || e1rm > bestByExercise[exerciseName]) {
          // This is a PR!
          if (bestByExercise[exerciseName]) {
            // Update existing PR
            const existingIndex = prs.findIndex(p => p.exercise === exerciseName);
            if (existingIndex >= 0) {
              prs[existingIndex] = {
                exercise: exerciseName,
                weight: set.weight,
                reps: set.reps,
                e1rm,
                date: workout.date
              };
            }
          } else {
            prs.push({
              exercise: exerciseName,
              weight: set.weight,
              reps: set.reps,
              e1rm,
              date: workout.date
            });
          }
          bestByExercise[exerciseName] = e1rm;
        }
      });
    });
    
    // Return most recent PRs (from last 7 days)
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return prs.filter(pr => new Date(pr.date) >= oneWeekAgo).slice(0, 3);
  }, [workoutState.workoutHistory]);

  // Weekly volume by muscle group
  const weeklyVolume = useMemo(() => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisWeekWorkouts = workoutState.workoutHistory.filter(w => 
      new Date(w.date) >= oneWeekAgo
    );
    
    const volumeByMuscle: Record<string, number> = {};
    
    thisWeekWorkouts.forEach(workout => {
      (workout.sets || []).forEach((set: any) => {
        const muscle = set.muscleGroup || 'other';
        volumeByMuscle[muscle] = (volumeByMuscle[muscle] || 0) + 1;
      });
    });
    
    // Sort by volume and take top muscles
    return Object.entries(volumeByMuscle)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([muscle, sets]) => ({ muscle, sets }));
  }, [workoutState.workoutHistory]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Quick Stats Row */}
        <View style={styles.topStatsRow}>
          <Surface style={styles.streakCard} elevation={2}>
            <Text style={{ fontSize: 28 }}>🔥</Text>
            <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
              {currentStreak}
            </Text>
            <Text variant="labelSmall" style={{ color: theme.colors.outline }}>Streak</Text>
          </Surface>
          <Surface style={styles.streakCard} elevation={2}>
            <Text style={{ fontSize: 28 }}>📅</Text>
            <Text variant="headlineSmall" style={{ color: theme.colors.secondary }}>
              {weeklyStreak}/7
            </Text>
            <Text variant="labelSmall" style={{ color: theme.colors.outline }}>This Week</Text>
          </Surface>
          <Surface style={styles.streakCard} elevation={2}>
            <Text style={{ fontSize: 28 }}>💪</Text>
            <Text variant="headlineSmall" style={{ color: theme.colors.tertiary }}>
              {workoutState.workoutHistory.length}
            </Text>
            <Text variant="labelSmall" style={{ color: theme.colors.outline }}>Total</Text>
          </Surface>
        </View>

        {/* Week Calendar */}
        <Surface style={styles.weekCalendar} elevation={1}>
          <View style={styles.weekDays}>
            {weekCalendar.map((day, index) => (
              <View key={index} style={styles.dayColumn}>
                <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
                  {day.dayName}
                </Text>
                <View style={[
                  styles.dayCircle,
                  day.hasWorkout && { backgroundColor: theme.colors.primary },
                  day.isToday && !day.hasWorkout && { borderColor: theme.colors.primary, borderWidth: 2 },
                  day.isFuture && { opacity: 0.3 },
                ]}>
                  {day.hasWorkout ? (
                    <Text style={{ color: '#fff', fontSize: 10 }}>✓</Text>
                  ) : (
                    <Text variant="labelSmall" style={{ color: day.isToday ? theme.colors.primary : theme.colors.outline }}>
                      {day.date}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </Surface>

        {/* Active Mesocycle - Compact Card */}
        {mesoState.activeMesoCycle && (
          <Surface style={styles.mesoCard} elevation={2}>
            <View style={styles.mesoHeader}>
              <View style={{ flex: 1 }}>
                <Text variant="titleMedium">{mesoState.activeMesoCycle.name}</Text>
                <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                  Week {mesoState.activeMesoCycle.currentWeek} of {mesoState.activeMesoCycle.totalWeeks}
                  {getNextProgramWorkout && ` • Day ${getNextProgramWorkout.dayNumber}/${getNextProgramWorkout.totalDays}`}
                </Text>
                {getNextProgramWorkout && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <Text style={{ marginRight: 6 }}>
                      {getNextProgramWorkout.dayType === 'rest' ? '😴' : 
                       getNextProgramWorkout.dayType === 'cardio' ? '🏃' :
                       getNextProgramWorkout.dayType === 'active_recovery' ? '🧘' : '💪'}
                    </Text>
                    <Text variant="labelMedium" style={{ 
                      color: getNextProgramWorkout.dayType === 'rest' ? theme.colors.outline :
                             getNextProgramWorkout.dayType === 'cardio' ? theme.colors.secondary :
                             getNextProgramWorkout.dayType === 'active_recovery' ? theme.colors.tertiary :
                             theme.colors.primary
                    }}>
                      {getNextProgramWorkout.name}
                    </Text>
                  </View>
                )}
              </View>
              <Button
                mode="contained"
                onPress={handleStartProgramWorkout}
                compact
                buttonColor={
                  getNextProgramWorkout?.dayType === 'rest' ? theme.colors.surfaceVariant :
                  getNextProgramWorkout?.dayType === 'cardio' ? theme.colors.secondary :
                  getNextProgramWorkout?.dayType === 'active_recovery' ? theme.colors.tertiary :
                  theme.colors.primary
                }
              >
                {getNextProgramWorkout?.dayType === 'rest' ? '😴 Rest Day' :
                 getNextProgramWorkout?.dayType === 'cardio' ? '🏃 Cardio' :
                 getNextProgramWorkout?.dayType === 'active_recovery' ? '🧘 Recovery' :
                 getNextProgramWorkout ? 'Start Workout' : 'Start Workout'}
              </Button>
            </View>
            <ProgressBar 
              progress={mesoState.activeMesoCycle.currentWeek / mesoState.activeMesoCycle.totalWeeks} 
              color={theme.colors.primary}
              style={{ marginTop: 12, borderRadius: 4 }}
            />
            
            {/* Workout Progress */}
            <View style={styles.workoutProgress}>
              <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
                Workouts: {mesoState.activeMesoCycle.completedWorkouts || 0} / {mesoState.activeMesoCycle.totalWorkouts}
              </Text>
              <ProgressBar 
                progress={(mesoState.activeMesoCycle.completedWorkouts || 0) / mesoState.activeMesoCycle.totalWorkouts}
                color={theme.colors.secondary}
                style={{ marginTop: 4, borderRadius: 2, height: 4 }}
              />
            </View>
            
            {/* Deload indicator */}
            {mesoState.activeMesoCycle.weeks[mesoState.activeMesoCycle.currentWeek - 1]?.isDeload && (
              <Surface style={[styles.deloadBadge, { backgroundColor: 'rgba(255,193,7,0.2)' }]} elevation={0}>
                <Text style={{ fontSize: 14 }}>😌</Text>
                <Text variant="labelMedium" style={{ color: '#FFC107', marginLeft: 8 }}>
                  Deload Week - Reduced Volume
                </Text>
              </Surface>
            )}
          </Surface>
        )}

        {/* Debug Panel for Testing - Separate Card */}
        {mesoState.activeMesoCycle && (
          <Surface style={styles.debugCard} elevation={1}>
            <Text variant="titleSmall" style={{ marginBottom: 8 }}>🧪 Test Workout Progression</Text>
            <Text variant="bodySmall" style={{ color: theme.colors.outline, marginBottom: 12 }}>
              Week {mesoState.activeMesoCycle.currentWeek}/{mesoState.activeMesoCycle.totalWeeks} • Day {getNextProgramWorkout?.dayNumber || '?'}/{getNextProgramWorkout?.totalDays || '?'} - {getNextProgramWorkout?.name || 'N/A'}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <Button
                mode="contained-tonal"
                compact
                onPress={() => {
                  mesoDispatch({
                    type: 'RECORD_WORKOUT_COMPLETION',
                    payload: { workoutId: `test-${Date.now()}`, volumeByMuscle: {} }
                  });
                }}
              >
                +1 Day
              </Button>
              <Button
                mode="contained-tonal"
                compact
                onPress={() => {
                  if (mesoState.activeMesoCycle) {
                    // Jump to next week by setting completedWorkouts
                    const daysPerWeek = getNextProgramWorkout?.totalDays || 3;
                    const currentCompleted = mesoState.activeMesoCycle.completedWorkouts || 0;
                    const nextWeekStart = Math.ceil((currentCompleted + 1) / daysPerWeek) * daysPerWeek;
                    const newWeek = Math.min(
                      Math.floor(nextWeekStart / daysPerWeek) + 1,
                      mesoState.activeMesoCycle.totalWeeks
                    );
                    const updatedMeso = { 
                      ...mesoState.activeMesoCycle, 
                      completedWorkouts: nextWeekStart,
                      currentWeek: newWeek
                    };
                    mesoDispatch({ type: 'UPDATE_MESOCYCLE', payload: updatedMeso });
                  }
                }}
              >
                +1 Week
              </Button>
              <Button
                mode="outlined"
                compact
                onPress={() => {
                  if (mesoState.activeMesoCycle) {
                    const resetMeso = { ...mesoState.activeMesoCycle, completedWorkouts: 0, currentWeek: 1 };
                    mesoDispatch({ type: 'UPDATE_MESOCYCLE', payload: resetMeso });
                  }
                }}
              >
                Reset
              </Button>
            </View>
          </Surface>
        )}

        {/* Fatigue & Volume Indicators (when program active) */}
        {mesoState.activeMesoCycle && Object.values(mesoState.muscleFatigue).some(f => f.currentFatigue > 30) && (
          <Surface style={styles.fatigueCard} elevation={1}>
            <Text variant="titleMedium" style={{ marginBottom: 8 }}>🔋 Muscle Recovery</Text>
            <View style={styles.fatigueGrid}>
              {Object.entries(mesoState.muscleFatigue)
                .filter(([_, f]) => f.currentFatigue > 30)
                .sort((a, b) => b[1].currentFatigue - a[1].currentFatigue)
                .slice(0, 4)
                .map(([muscle, fatigue]) => (
                  <View key={muscle} style={styles.fatigueItem}>
                    <View style={styles.fatigueRow}>
                      <Text variant="labelSmall" style={{ textTransform: 'capitalize' }}>{muscle}</Text>
                      <Text variant="labelSmall" style={{ 
                        color: fatigue.currentFatigue > 70 ? theme.colors.error : 
                               fatigue.currentFatigue > 50 ? '#FFC107' : theme.colors.outline 
                      }}>
                        {fatigue.currentFatigue > 70 ? '⚠️ High' : 
                         fatigue.currentFatigue > 50 ? '🔶 Mod' : '🟢 OK'}
                      </Text>
                    </View>
                    <ProgressBar 
                      progress={fatigue.currentFatigue / 100}
                      color={fatigue.currentFatigue > 70 ? theme.colors.error : 
                             fatigue.currentFatigue > 50 ? '#FFC107' : theme.colors.primary}
                      style={{ height: 4, borderRadius: 2 }}
                    />
                  </View>
                ))}
            </View>
            {Object.values(mesoState.muscleFatigue).some(f => f.needsDeload) && (
              <Button 
                mode="outlined" 
                compact 
                style={{ marginTop: 12 }}
                onPress={() => mesoDispatch({ type: 'TRIGGER_DELOAD' })}
              >
                Start Deload Week
              </Button>
            )}
          </Surface>
        )}

        {/* Quick Start Templates - Always show */}
        <Surface style={styles.quickTemplates} elevation={1}>
          <Text variant="titleMedium" style={{ marginBottom: 12 }}>⚡ Quick Start</Text>
          <View style={styles.templateRow}>
            <TouchableOpacity 
              style={[styles.templateChip, { backgroundColor: 'rgba(0,212,255,0.15)' }]}
              onPress={() => navigation.navigate('ActiveWorkout', { 
                templateWorkout: { name: 'Push Day', sets: [
                  { exerciseName: 'Bench Press', muscleGroup: 'chest' },
                  { exerciseName: 'Overhead Press', muscleGroup: 'shoulders' },
                  { exerciseName: 'Incline Dumbbell Press', muscleGroup: 'chest' },
                  { exerciseName: 'Tricep Pushdowns', muscleGroup: 'triceps' },
                ]}
              })}
            >
              <Text style={{ fontSize: 16 }}>🏋️</Text>
              <Text variant="labelMedium" style={{ color: theme.colors.primary }}>Push</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.templateChip, { backgroundColor: 'rgba(255,107,107,0.15)' }]}
              onPress={() => navigation.navigate('ActiveWorkout', { 
                templateWorkout: { name: 'Pull Day', sets: [
                  { exerciseName: 'Barbell Row', muscleGroup: 'back' },
                  { exerciseName: 'Lat Pulldown', muscleGroup: 'back' },
                  { exerciseName: 'Face Pulls', muscleGroup: 'rear_delts' },
                  { exerciseName: 'Barbell Curl', muscleGroup: 'biceps' },
                ]}
              })}
            >
              <Text style={{ fontSize: 16 }}>💪</Text>
              <Text variant="labelMedium" style={{ color: '#FF6B6B' }}>Pull</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.templateChip, { backgroundColor: 'rgba(78,205,196,0.15)' }]}
              onPress={() => navigation.navigate('ActiveWorkout', { 
                templateWorkout: { name: 'Legs Day', sets: [
                  { exerciseName: 'Squat', muscleGroup: 'quads' },
                  { exerciseName: 'Romanian Deadlift', muscleGroup: 'hamstrings' },
                  { exerciseName: 'Leg Press', muscleGroup: 'quads' },
                  { exerciseName: 'Leg Curl', muscleGroup: 'hamstrings' },
                ]}
              })}
            >
              <Text style={{ fontSize: 16 }}>🦵</Text>
              <Text variant="labelMedium" style={{ color: '#4ECDC4' }}>Legs</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.templateChip, { backgroundColor: 'rgba(153,102,255,0.15)' }]}
              onPress={() => navigation.navigate('ActiveWorkout')}
            >
              <Text style={{ fontSize: 16 }}>✏️</Text>
              <Text variant="labelMedium" style={{ color: '#9966FF' }}>Custom</Text>
            </TouchableOpacity>
          </View>
        </Surface>

        {/* Completed Programs History */}
        {mesoState.mesoCycleHistory.filter(m => m.status === 'completed').length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium">🏆 Completed Programs</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16, paddingHorizontal: 16 }}>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                {mesoState.mesoCycleHistory
                  .filter(m => m.status === 'completed')
                  .sort((a, b) => new Date(b.endDate || b.startDate).getTime() - new Date(a.endDate || a.startDate).getTime())
                  .slice(0, 5)
                  .map(program => (
                    <Surface key={program.id} style={styles.completedProgramCard} elevation={1}>
                      <Text variant="labelSmall" style={{ color: theme.colors.primary }}>✓ COMPLETED</Text>
                      <Text variant="titleSmall" numberOfLines={1}>{program.name}</Text>
                      <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                        {program.totalWeeks} weeks • {program.completedWorkouts || program.totalWorkouts} workouts
                      </Text>
                      <Text variant="labelSmall" style={{ color: theme.colors.outline, marginTop: 4 }}>
                        {new Date(program.endDate || program.startDate).toLocaleDateString()}
                      </Text>
                    </Surface>
                  ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Recent Workouts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium">Recent Workouts</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button mode="text" compact onPress={handleOpenAddWorkout}>
                + Add Past
              </Button>
              <Button mode="text" compact onPress={() => navigation.navigate('History')}>
                See All
              </Button>
            </View>
          </View>

          {recentWorkouts.length === 0 ? (
            <Surface style={styles.emptyCard} elevation={1}>
              <Text variant="bodyMedium" style={{ color: theme.colors.outline, textAlign: 'center' }}>
                No workouts yet. Start your first workout!
              </Text>
              <Button 
                mode="outlined" 
                onPress={handleOpenAddWorkout}
                style={{ marginTop: 12 }}
              >
                + Log a Past Workout
              </Button>
            </Surface>
          ) : (
            recentWorkouts.map((workout) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                sets={workoutSets[workout.id] || []}
                exercises={exercises}
                onPress={() => navigation.navigate('WorkoutDetail', { workoutId: workout.id })}
                onRepeat={() => handleRepeatWorkout(workout.id)}
                onEdit={() => handleEdit(workout)}
                onDelete={() => handleDelete(workout)}
              />
            ))
          )}
        </View>

        {/* Weekly Volume Summary - Only if has data */}
        {weeklyVolume.length > 0 && (
          <Surface style={styles.volumeCard} elevation={1}>
            <Text variant="titleMedium" style={{ marginBottom: 12 }}>📊 This Week's Volume</Text>
            <View style={styles.volumeGrid}>
              {weeklyVolume.map(({ muscle, sets }) => (
                <View key={muscle} style={styles.volumeItem}>
                  <Text variant="titleLarge" style={{ color: theme.colors.primary }}>{sets}</Text>
                  <Text variant="labelSmall" style={{ color: theme.colors.outline, textTransform: 'capitalize' }}>
                    {muscle}
                  </Text>
                </View>
              ))}
            </View>
          </Surface>
        )}

        {/* Recent PRs - Only if has PRs */}
        {recentPRs.length > 0 && (
          <Surface style={styles.prCard} elevation={1}>
            <View style={styles.prHeader}>
              <Text style={{ fontSize: 20 }}>🏆</Text>
              <Text variant="titleMedium" style={{ marginLeft: 8 }}>Recent PRs</Text>
            </View>
            {recentPRs.slice(0, 3).map((pr, index) => (
              <View key={index} style={styles.prItem}>
                <Text variant="bodyMedium" style={{ flex: 1 }} numberOfLines={1}>
                  {pr.exercise}
                </Text>
                <Text variant="titleSmall" style={{ color: theme.colors.primary }}>
                  {pr.weight} × {pr.reps}
                </Text>
              </View>
            ))}
          </Surface>
        )}
      </ScrollView>

      {/* Edit Dialog */}
      <Portal>
        <Dialog 
          visible={!!editingWorkout} 
          onDismiss={() => setEditingWorkout(null)}
          style={{ maxHeight: '85%' }}
        >
          <Dialog.Title>Edit Workout</Dialog.Title>
          <Dialog.ScrollArea style={{ paddingHorizontal: 0 }}>
            <ScrollView style={{ paddingHorizontal: 24 }}>
              <TextInput
                label="Workout Name"
                value={editName}
                onChangeText={setEditName}
                mode="outlined"
                style={{ marginBottom: 16 }}
              />
              
              <Text variant="titleSmall" style={{ marginBottom: 8 }}>Sets</Text>
              
              {editSets.length === 0 ? (
                <Text variant="bodySmall" style={{ color: theme.colors.outline, marginBottom: 12 }}>
                  No sets recorded
                </Text>
              ) : (
                editSets.map((set, index) => (
                  <View key={set.id} style={styles.editSetRow}>
                    <Text variant="bodySmall" style={{ flex: 1 }} numberOfLines={1}>
                      {set.exerciseName}
                    </Text>
                    <TextInput
                      value={set.weight}
                      onChangeText={(v) => handleUpdateSet(set.id, 'weight', v)}
                      keyboardType="numeric"
                      mode="outlined"
                      dense
                      style={styles.editSetInput}
                      placeholder="lbs"
                    />
                    <Text style={{ marginHorizontal: 4 }}>×</Text>
                    <TextInput
                      value={set.reps}
                      onChangeText={(v) => handleUpdateSet(set.id, 'reps', v)}
                      keyboardType="numeric"
                      mode="outlined"
                      dense
                      style={styles.editSetInput}
                      placeholder="reps"
                    />
                    <TouchableOpacity 
                      onPress={() => setDeleteConfirmSet(set.id)}
                      style={{ padding: 8 }}
                    >
                      <Text style={{ color: theme.colors.error }}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
              
              {/* Add New Set */}
              {showAddSet ? (
                <View style={styles.addSetForm}>
                  <View style={{ position: 'relative', zIndex: 1 }}>
                    <TextInput
                      label="Exercise"
                      value={newSetExercise || exerciseSearch}
                      onChangeText={(text) => {
                        setExerciseSearch(text);
                        setNewSetExercise('');
                        setShowExerciseDropdown(true);
                      }}
                      onFocus={() => setShowExerciseDropdown(true)}
                      mode="outlined"
                      dense
                      placeholder="Search exercises..."
                      style={{ marginBottom: showExerciseDropdown ? 0 : 8 }}
                    />
                    {showExerciseDropdown && (
                      <Surface style={styles.exerciseDropdown} elevation={3}>
                        <ScrollView style={{ maxHeight: 150 }} nestedScrollEnabled>
                          {filteredExercises.map((ex) => (
                            <TouchableOpacity
                              key={ex.name}
                              style={styles.exerciseOption}
                              onPress={() => {
                                setNewSetExercise(ex.name);
                                setExerciseSearch('');
                                setShowExerciseDropdown(false);
                              }}
                            >
                              <Text variant="bodyMedium">{ex.name}</Text>
                              <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                                {ex.muscleGroup}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </Surface>
                    )}
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                    <TextInput
                      label="Weight"
                      value={newSetWeight}
                      onChangeText={setNewSetWeight}
                      keyboardType="numeric"
                      mode="outlined"
                      dense
                      style={{ flex: 1 }}
                    />
                    <TextInput
                      label="Reps"
                      value={newSetReps}
                      onChangeText={setNewSetReps}
                      keyboardType="numeric"
                      mode="outlined"
                      dense
                      style={{ flex: 1 }}
                    />
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Button mode="outlined" onPress={() => {
                      setShowAddSet(false);
                      setExerciseSearch('');
                      setShowExerciseDropdown(false);
                    }} style={{ flex: 1 }}>
                      Cancel
                    </Button>
                    <Button mode="contained" onPress={handleAddNewSet} style={{ flex: 1 }}>
                      Add Set
                    </Button>
                  </View>
                </View>
              ) : (
                <Button 
                  mode="outlined" 
                  onPress={() => {
                    setShowAddSet(true);
                    setExerciseSearch('');
                    setShowExerciseDropdown(false);
                  }}
                  style={{ marginTop: 8 }}
                >
                  + Add Missing Set
                </Button>
              )}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setEditingWorkout(null)}>Cancel</Button>
            <Button onPress={handleSaveEdit}>Save Changes</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Add Past Workout Dialog */}
      <Portal>
        <Dialog 
          visible={showAddWorkout} 
          onDismiss={() => setShowAddWorkout(false)}
          style={{ maxHeight: '85%' }}
        >
          <Dialog.Title>Log Past Workout</Dialog.Title>
          <Dialog.ScrollArea style={{ paddingHorizontal: 0 }}>
            <ScrollView style={{ paddingHorizontal: 24 }}>
              <TextInput
                label="Workout Name"
                value={newWorkoutName}
                onChangeText={setNewWorkoutName}
                mode="outlined"
                placeholder="e.g., Chest & Triceps"
                style={{ marginBottom: 12 }}
              />
              
              <TextInput
                label="Date (YYYY-MM-DD)"
                value={newWorkoutDate}
                onChangeText={setNewWorkoutDate}
                mode="outlined"
                placeholder="2026-02-08"
                style={{ marginBottom: 16 }}
              />
              
              <Text variant="titleSmall" style={{ marginBottom: 8 }}>Sets</Text>
              
              {newWorkoutSets.length === 0 ? (
                <Text variant="bodySmall" style={{ color: theme.colors.outline, marginBottom: 12 }}>
                  No sets added yet. Add your exercises below.
                </Text>
              ) : (
                newWorkoutSets.map((set, index) => (
                  <View key={set.id} style={styles.editSetRow}>
                    <Text variant="bodySmall" style={{ flex: 1 }} numberOfLines={1}>
                      {set.exerciseName}
                    </Text>
                    <Text variant="bodyMedium" style={{ marginRight: 8 }}>
                      {set.weight} × {set.reps}
                    </Text>
                    <TouchableOpacity 
                      onPress={() => setDeleteConfirmNewSet(set.id)}
                      style={{ padding: 8 }}
                    >
                      <Text style={{ color: theme.colors.error }}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
              
              {/* Add Set Form */}
              {addingSetToNew ? (
                <View style={styles.addSetForm}>
                  <View style={{ position: 'relative', zIndex: 1 }}>
                    <TextInput
                      label="Exercise Name"
                      value={newWkSetExercise || newWkExerciseSearch}
                      onChangeText={(text) => {
                        setNewWkExerciseSearch(text);
                        setNewWkSetExercise('');
                        setShowNewWkExerciseDropdown(true);
                      }}
                      onFocus={() => setShowNewWkExerciseDropdown(true)}
                      mode="outlined"
                      dense
                      placeholder="Search exercises..."
                      style={{ marginBottom: showNewWkExerciseDropdown ? 0 : 8 }}
                    />
                    {showNewWkExerciseDropdown && (
                      <Surface style={styles.exerciseDropdown} elevation={3}>
                        <ScrollView style={{ maxHeight: 150 }} nestedScrollEnabled>
                          {filteredNewWkExercises.map((ex) => (
                            <TouchableOpacity
                              key={ex.name}
                              style={styles.exerciseOption}
                              onPress={() => {
                                setNewWkSetExercise(ex.name);
                                setNewWkExerciseSearch('');
                                setShowNewWkExerciseDropdown(false);
                              }}
                            >
                              <Text variant="bodyMedium">{ex.name}</Text>
                              <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                                {ex.muscleGroup}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </Surface>
                    )}
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                    <TextInput
                      label="Weight (lbs)"
                      value={newWkSetWeight}
                      onChangeText={setNewWkSetWeight}
                      keyboardType="numeric"
                      mode="outlined"
                      dense
                      style={{ flex: 1 }}
                    />
                    <TextInput
                      label="Reps"
                      value={newWkSetReps}
                      onChangeText={setNewWkSetReps}
                      keyboardType="numeric"
                      mode="outlined"
                      dense
                      style={{ flex: 1 }}
                    />
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Button mode="outlined" onPress={() => {
                      setAddingSetToNew(false);
                      setNewWkExerciseSearch('');
                      setShowNewWkExerciseDropdown(false);
                    }} style={{ flex: 1 }}>
                      Cancel
                    </Button>
                    <Button mode="contained" onPress={handleAddSetToNewWorkout} style={{ flex: 1 }}>
                      Add Set
                    </Button>
                  </View>
                </View>
              ) : (
                <Button 
                  mode="outlined" 
                  onPress={() => {
                    setAddingSetToNew(true);
                    setNewWkExerciseSearch('');
                    setShowNewWkExerciseDropdown(false);
                  }}
                  style={{ marginTop: 8 }}
                >
                  + Add Set
                </Button>
              )}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setShowAddWorkout(false)}>Cancel</Button>
            <Button onPress={handleSaveNewWorkout} disabled={newWorkoutSets.length === 0}>
              Save Workout
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Delete Confirmation Dialog */}
      <Portal>
        <Dialog 
          visible={deletingWorkout !== null} 
          onDismiss={() => setDeletingWorkout(null)}
        >
          <Dialog.Title>Delete Workout</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to delete "{deletingWorkout?.name}"? This cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeletingWorkout(null)}>Cancel</Button>
            <Button 
              onPress={confirmDelete}
              textColor={theme.colors.error}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Program Completion Modal */}
      <Portal>
        <Dialog visible={showProgramComplete} onDismiss={() => setShowProgramComplete(false)}>
          <Dialog.Title style={{ textAlign: 'center' }}>🎉 Program Complete!</Dialog.Title>
          <Dialog.Content>
            {completedProgramStats && (
              <View style={{ alignItems: 'center' }}>
                <Text variant="headlineSmall" style={{ marginBottom: 16, color: theme.colors.primary }}>
                  {completedProgramStats.name}
                </Text>
                
                <Surface style={{ padding: 16, borderRadius: 12, width: '100%', marginBottom: 16 }} elevation={1}>
                  <Text variant="titleMedium" style={{ marginBottom: 12, textAlign: 'center' }}>📊 Your Progress</Text>
                  
                  <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 }}>
                    <View style={{ alignItems: 'center' }}>
                      <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
                        {completedProgramStats.totalWeeks}
                      </Text>
                      <Text variant="labelSmall">Weeks</Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                      <Text variant="headlineMedium" style={{ color: theme.colors.secondary }}>
                        {completedProgramStats.totalWorkouts}
                      </Text>
                      <Text variant="labelSmall">Workouts</Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                      <Text variant="headlineMedium" style={{ color: theme.colors.tertiary }}>
                        {completedProgramStats.totalSets}
                      </Text>
                      <Text variant="labelSmall">Sets</Text>
                    </View>
                  </View>
                  
                  <Divider style={{ marginVertical: 8 }} />
                  
                  <View style={{ alignItems: 'center' }}>
                    <Text variant="bodyMedium" style={{ color: theme.colors.outline }}>
                      Total Volume Lifted
                    </Text>
                    <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
                      {completedProgramStats.totalVolume.toLocaleString()} lbs
                    </Text>
                  </View>
                </Surface>
                
                <Text variant="bodyMedium" style={{ textAlign: 'center', color: theme.colors.outline, marginBottom: 8 }}>
                  Great job completing your program! Ready for the next challenge?
                </Text>
              </View>
            )}
          </Dialog.Content>
          <Dialog.Actions style={{ justifyContent: 'center', gap: 12 }}>
            <Button
              mode="outlined"
              onPress={() => {
                // Complete and archive the program
                if (mesoState.activeMesoCycle) {
                  mesoDispatch({ type: 'COMPLETE_MESOCYCLE', payload: mesoState.activeMesoCycle.id });
                }
                setShowProgramComplete(false);
              }}
            >
              View History
            </Button>
            <Button
              mode="contained"
              onPress={() => {
                // Complete the program and navigate to pick a new one
                if (mesoState.activeMesoCycle) {
                  mesoDispatch({ type: 'COMPLETE_MESOCYCLE', payload: mesoState.activeMesoCycle.id });
                }
                setShowProgramComplete(false);
                navigation.navigate('Programs');
              }}
            >
              Start New Program
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Delete Set Confirmation Dialog */}
      <Portal>
        <Dialog visible={!!deleteConfirmSet} onDismiss={() => setDeleteConfirmSet(null)}>
          <Dialog.Title>Delete Set?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to delete this set?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteConfirmSet(null)}>Cancel</Button>
            <Button 
              textColor={theme.colors.error}
              onPress={() => {
                if (deleteConfirmSet) {
                  handleDeleteSet(deleteConfirmSet);
                  setDeleteConfirmSet(null);
                }
              }}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Delete New Workout Set Confirmation Dialog */}
      <Portal>
        <Dialog visible={!!deleteConfirmNewSet} onDismiss={() => setDeleteConfirmNewSet(null)}>
          <Dialog.Title>Delete Set?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to delete this set?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteConfirmNewSet(null)}>Cancel</Button>
            <Button 
              textColor={theme.colors.error}
              onPress={() => {
                if (deleteConfirmNewSet) {
                  handleDeleteNewWorkoutSet(deleteConfirmNewSet);
                  setDeleteConfirmNewSet(null);
                }
              }}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Rest Day Dialog */}
      <Portal>
        <Dialog visible={showRestDayDialog} onDismiss={() => setShowRestDayDialog(false)}>
          <Dialog.Title>😴 Rest Day</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ marginBottom: 12 }}>
              Today is a scheduled rest day: <Text style={{ fontWeight: 'bold' }}>{restDayInfo?.name}</Text>
            </Text>
            {restDayInfo?.notes && (
              <Text variant="bodySmall" style={{ color: theme.colors.outline, marginBottom: 12, fontStyle: 'italic' }}>
                {restDayInfo.notes}
              </Text>
            )}
            <Surface style={{ padding: 12, borderRadius: 8, backgroundColor: theme.colors.surfaceVariant }} elevation={0}>
              <Text variant="labelMedium" style={{ marginBottom: 8 }}>💡 Rest Day Tips:</Text>
              <Text variant="bodySmall">• Get 7-9 hours of sleep</Text>
              <Text variant="bodySmall">• Eat enough protein (1g per lb bodyweight)</Text>
              <Text variant="bodySmall">• Stay hydrated</Text>
              <Text variant="bodySmall">• Light walking is fine if you're feeling active</Text>
            </Surface>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowRestDayDialog(false)}>Maybe Later</Button>
            <Button 
              mode="contained"
              onPress={() => {
                // Mark rest day as complete - advance to next day
                if (mesoState.activeMesoCycle) {
                  mesoDispatch({ type: 'ADVANCE_DAY' });
                }
                setShowRestDayDialog(false);
              }}
            >
              Complete Rest Day ✓
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Cardio Day Dialog */}
      <Portal>
        <Dialog visible={showCardioDialog} onDismiss={() => setShowCardioDialog(false)}>
          <Dialog.Title>🏃 Cardio Day</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ marginBottom: 12 }}>
              Today is: <Text style={{ fontWeight: 'bold' }}>{cardioInfo?.name}</Text>
            </Text>
            {cardioInfo?.notes && (
              <Text variant="bodySmall" style={{ color: theme.colors.outline, marginBottom: 12, fontStyle: 'italic' }}>
                {cardioInfo.notes}
              </Text>
            )}
            {cardioInfo?.cardioActivities?.length > 0 && (
              <Surface style={{ padding: 12, borderRadius: 8, backgroundColor: theme.colors.surfaceVariant }} elevation={0}>
                <Text variant="labelMedium" style={{ marginBottom: 8 }}>Suggested Activities:</Text>
                {cardioInfo.cardioActivities.map((activity: any, idx: number) => (
                  <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={{ marginRight: 8 }}>•</Text>
                    <Text variant="bodySmall" style={{ flex: 1 }}>{activity.name}</Text>
                    <Text variant="labelSmall" style={{ color: theme.colors.primary }}>
                      {activity.durationMinutes} min
                    </Text>
                  </View>
                ))}
              </Surface>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowCardioDialog(false)}>Skip</Button>
            <Button 
              mode="contained"
              onPress={() => {
                // Mark cardio day as complete
                if (mesoState.activeMesoCycle) {
                  mesoDispatch({ type: 'ADVANCE_DAY' });
                }
                setShowCardioDialog(false);
              }}
            >
              Complete Cardio ✓
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Active Recovery Day Dialog */}
      <Portal>
        <Dialog visible={showRecoveryDialog} onDismiss={() => setShowRecoveryDialog(false)}>
          <Dialog.Title>🧘 Active Recovery</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ marginBottom: 12 }}>
              Today is: <Text style={{ fontWeight: 'bold' }}>{recoveryInfo?.name}</Text>
            </Text>
            {recoveryInfo?.notes && (
              <Text variant="bodySmall" style={{ color: theme.colors.outline, marginBottom: 12, fontStyle: 'italic' }}>
                {recoveryInfo.notes}
              </Text>
            )}
            {recoveryInfo?.recoverySuggestions?.length > 0 && (
              <Surface style={{ padding: 12, borderRadius: 8, backgroundColor: theme.colors.surfaceVariant }} elevation={0}>
                <Text variant="labelMedium" style={{ marginBottom: 8 }}>Recommended Recovery Activities:</Text>
                {recoveryInfo.recoverySuggestions.map((suggestion: any, idx: number) => (
                  <View key={idx} style={{ marginBottom: 8, paddingBottom: 8, borderBottomWidth: idx < recoveryInfo.recoverySuggestions.length - 1 ? 1 : 0, borderBottomColor: theme.colors.outlineVariant }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text variant="bodyMedium" style={{ fontWeight: '600' }}>{suggestion.name}</Text>
                      <Text variant="labelSmall" style={{ color: theme.colors.primary }}>
                        {suggestion.durationMinutes} min
                      </Text>
                    </View>
                    <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                      {suggestion.description}
                    </Text>
                    <Text variant="labelSmall" style={{ color: theme.colors.tertiary, fontStyle: 'italic' }}>
                      {suggestion.rationale}
                    </Text>
                  </View>
                ))}
              </Surface>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowRecoveryDialog(false)}>Skip</Button>
            <Button 
              mode="contained"
              onPress={() => {
                // Mark recovery day as complete
                if (mesoState.activeMesoCycle) {
                  mesoDispatch({ type: 'ADVANCE_DAY' });
                }
                setShowRecoveryDialog(false);
              }}
            >
              Complete Recovery ✓
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Start Workout Button - When no program */}
      {!workoutState.activeWorkout && !mesoState.activeMesoCycle && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('Programs')}
          activeOpacity={0.8}
        >
          <Text style={{ color: theme.colors.onPrimary, fontWeight: 'bold', fontSize: 16 }}>+ Start Program</Text>
        </TouchableOpacity>
      )}

      {/* New Workout Button - When program is active */}
      {mesoState.activeMesoCycle && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.colors.secondary }]}
          onPress={() => navigation.navigate('ActiveWorkout')}
          activeOpacity={0.8}
        >
          <Text style={{ color: theme.colors.onSecondary, fontWeight: 'bold', fontSize: 16 }}>+ New Workout</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  topStatsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  streakCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  weekCalendar: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  dayColumn: {
    alignItems: 'center',
    gap: 6,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(100,130,153,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickTemplates: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  templateRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  templateChip: {
    flex: 1,
    minWidth: 70,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    gap: 4,
  },
  workoutProgress: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(100,130,153,0.2)',
  },
  deloadBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    marginTop: 12,
  },
  fatigueCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  fatigueGrid: {
    gap: 8,
  },
  fatigueItem: {
    gap: 4,
  },
  fatigueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  prCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  prHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  prItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(100,130,153,0.2)',
  },
  volumeCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  volumeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  volumeItem: {
    width: '30%',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statsCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  stat: {
    alignItems: 'center',
  },
  activeCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeContent: {
    flex: 1,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyCard: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 28,
    elevation: 4,
    shadowColor: '#1B2838',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 100,
  },
  mesoCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  debugCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,193,7,0.4)',
    backgroundColor: 'rgba(255,193,7,0.05)',
  },
  mesoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  deloadWarning: {
    marginTop: 12,
    padding: 8,
    borderRadius: 4,
  },
  noProgramCard: {
    padding: 24,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  completedProgramCard: {
    padding: 12,
    borderRadius: 12,
    minWidth: 150,
    maxWidth: 180,
  },
  editSetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  editSetInput: {
    width: 60,
    textAlign: 'center',
  },
  addSetForm: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(0,212,255,0.05)',
    borderRadius: 8,
  },
  exerciseDropdown: {
    marginTop: 4,
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  exerciseOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(100,130,153,0.2)',
  },
});

export default HomeScreen;
