// Home Screen
// Dashboard with quick actions and recent workouts

import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button, Surface, useTheme, Divider, Portal, Dialog, TextInput, ProgressBar, IconButton } from 'react-native-paper';
import { TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useWorkout, useUser, useMesoCycle } from '../../context';
import { WorkoutCard, ProgramCard, PausedWorkoutCard } from '../../components';
import { getAllExercises, getSetsByWorkoutId } from '../../services/db';
import { calculate1RM_Epley, getWeekTemplate } from '../../utils/formulas/formulas';
import { EXERCISE_LIBRARY } from '../../services/db/exerciseLibrary';
import { TRAINING_PROGRAMS } from '../../data/programs/programs';
import { getRecoverySuggestions } from '../../utils/recoveryEngine/recoveryEngine';
import { RECOVERY_LIBRARY, RecoveryTemplate } from '../../data/activities/activities';
import { DeloadBanner } from '../../components/DeloadBanner';
import { withAlpha, statusColors, spacing as sp } from '../../theme';
import { AppIcons } from '../../theme/icons';
import type { Exercise, WorkoutSet, Workout, MuscleGroup, RecoverySuggestion, CardioType } from '../../types';
import type { TabScreenProps } from '../../navigation';
import { QuickStatsRow, type ActivityStats } from './QuickStatsRow';
import { QuickStartTemplates } from './QuickStartTemplates';
import { WeeklyVolumeCard } from './WeeklyVolumeCard';
import { RecentPRsCard, type PREntry } from './RecentPRsCard';
import { ProgramCompletionDialog, type CompletedProgramStats } from './ProgramCompletionDialog';
import { LogCardioDialog, type CardioWorkoutData } from './LogCardioDialog';
import { EditWorkoutDialog } from '../../components';
import type { EditableSet } from '../../components';

import { CARDIO_OPTIONS } from './LogCardioDialog';

interface HomeScreenProps {
  navigation: TabScreenProps<'Home'>['navigation'];
}

export function HomeScreen({ navigation }: HomeScreenProps) {
  const theme = useTheme();
  const { state: workoutState, dispatch: workoutDispatch, repeatWorkout, clearPausedWorkout } = useWorkout();
  const { state: userState } = useUser();
  const { state: mesoState, dispatch: mesoDispatch, shouldTriggerDeload } = useMesoCycle();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workoutSets, setWorkoutSets] = useState<Record<string, WorkoutSet[]>>({});
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [editName, setEditName] = useState('');
  const [editSets, setEditSets] = useState<EditableSet[]>([]);
  
  // Add past workout state
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [newWorkoutName, setNewWorkoutName] = useState('');
  const [newWorkoutDate, setNewWorkoutDate] = useState('');
  const [newWorkoutSets, setNewWorkoutSets] = useState<EditableSet[]>([]);
  const [addingSetToNew, setAddingSetToNew] = useState(false);
  const [newWkSetExercise, setNewWkSetExercise] = useState('');
  const [newWkSetWeight, setNewWkSetWeight] = useState('');
  const [newWkSetReps, setNewWkSetReps] = useState('');
  
  // Exercise search state (for add-past-workout dialog)
  const [newWkExerciseSearch, setNewWkExerciseSearch] = useState('');
  const [showNewWkExerciseDropdown, setShowNewWkExerciseDropdown] = useState(false);
  
  // Delete confirmation state
  const [deletingWorkout, setDeletingWorkout] = useState<Workout | null>(null);
  const [deleteConfirmNewSet, setDeleteConfirmNewSet] = useState<string | null>(null);
  
  // Log Cardio Workout state
  const [showLogCardio, setShowLogCardio] = useState(false);
  const [cardioWorkoutType, setCardioWorkoutType] = useState<CardioType>('running');
  const [cardioName, setCardioName] = useState('');
  const [cardioDate, setCardioDate] = useState('');
  const [cardioDuration, setCardioDuration] = useState('');  // in minutes
  const [cardioDistance, setCardioDistance] = useState('');  // in miles
  const [cardioCalories, setCardioCalories] = useState('');
  const [cardioNotes, setCardioNotes] = useState('');
  const [cardioAvgHR, setCardioAvgHR] = useState('');
  
  // Stop program confirmation
  const [showStopProgramDialog, setShowStopProgramDialog] = useState(false);
  
  // Rest/Cardio/Recovery day dialogs
  const [showRestDayDialog, setShowRestDayDialog] = useState(false);
  const [showCardioDialog, setShowCardioDialog] = useState(false);
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [restDayInfo, setRestDayInfo] = useState<any>(null);
  const [cardioInfo, setCardioInfo] = useState<any>(null);
  const [recoveryInfo, setRecoveryInfo] = useState<any>(null);
  const [selectedRecoveryActivities, setSelectedRecoveryActivities] = useState<Set<string>>(new Set());
  
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
  
  // Filtered exercises for search (add-past-workout dialog)
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
    // Sets may be stored in DB or embedded in the workout object
    const setsMap: Record<string, WorkoutSet[]> = {};
    for (const workout of workoutState.workoutHistory.slice(0, 5)) {
      // First try to get sets from the database
      let sets = await getSetsByWorkoutId(workout.id);
      
      // If no sets in DB, try to use embedded sets from workout object
      if (sets.length === 0 && (workout as any).sets?.length > 0) {
        const embeddedSets = (workout as any).sets as Array<{
          exerciseName?: string;
          muscleGroup?: string;
          weight: number;
          reps: number;
          rir?: number;
          isWarmup?: boolean;
        }>;
        
        // Transform embedded sets to WorkoutSet format
        sets = embeddedSets.map((s, index) => {
          // Find exerciseId by name
          const exercise = allExercises.find(e => e.name === s.exerciseName);
          return {
            id: `${workout.id}-${index}`,
            workoutId: workout.id,
            exerciseId: exercise?.id || s.exerciseName || 'unknown',
            setNumber: index + 1,
            weight: s.weight,
            weightUnit: 'lbs' as const,
            reps: s.reps,
            rir: s.rir,
            isWarmup: s.isWarmup || false,
            createdAt: workout.date,
          };
        });
      }
      
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
      
      workoutDispatch({
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

  // Log cardio workout functions
  const handleOpenLogCardio = () => {
    setShowLogCardio(true);
    setCardioWorkoutType('running');
    setCardioName('');
    const today = new Date().toISOString().split('T')[0];
    setCardioDate(today);
    setCardioDuration('');
    setCardioDistance('');
    setCardioCalories('');
    setCardioNotes('');
    setCardioAvgHR('');
  };

  const handleSaveCardioWorkout = () => {
    if (!cardioDuration) return;
    
    const cardioOption = CARDIO_OPTIONS.find(c => c.type === cardioWorkoutType);
    const workoutName = cardioName.trim() || `${cardioOption?.emoji} ${cardioOption?.label || 'Cardio'}`;
    const durationMinutes = parseFloat(cardioDuration) || 0;
    const distanceMiles = cardioDistance ? parseFloat(cardioDistance) : undefined;
    
    // Calculate pace if both duration and distance are provided
    let paceMinPerMile: number | undefined;
    if (distanceMiles && distanceMiles > 0 && durationMinutes > 0) {
      paceMinPerMile = durationMinutes / distanceMiles;
    }
    
    const cardioWorkout: Workout = {
      id: Date.now().toString(),
      name: workoutName,
      date: cardioDate || new Date().toISOString().split('T')[0],
      dayType: 'cardio',
      cardioType: cardioWorkoutType,
      durationMinutes,
      distanceMiles,
      paceMinPerMile,
      caloriesBurned: cardioCalories ? parseInt(cardioCalories) : undefined,
      avgHeartRate: cardioAvgHR ? parseInt(cardioAvgHR) : undefined,
      notes: cardioNotes || undefined,
      sets: [],
    };
    
    workoutDispatch({ type: 'COMPLETE_WORKOUT', payload: cardioWorkout });
    setShowLogCardio(false);
  };

  // Format pace for display (e.g., "8:30 /mi")
  const formatPace = (paceMinPerMile: number): string => {
    const minutes = Math.floor(paceMinPerMile);
    const seconds = Math.round((paceMinPerMile - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')} /mi`;
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
    
    workoutDispatch({
      type: 'COMPLETE_WORKOUT',
      payload: {
        id: workoutId,
        name: newWorkoutName.trim(),
        date: newWorkoutDate || new Date().toISOString().split('T')[0],
        duration: durationSeconds,
        sets: sets,
        dayType: 'workout' as const,
      }
    });
    
    setShowAddWorkout(false);
  };

  const handleDelete = (workout: Workout) => {
    setDeletingWorkout(workout);
  };
  
  const confirmDelete = () => {
    if (deletingWorkout) {
      workoutDispatch({ type: 'DELETE_WORKOUT', payload: deletingWorkout.id });
      setDeletingWorkout(null);
    }
  };

  const recentWorkouts = workoutState.workoutHistory.slice(0, 5);

  // Get the next workout from active program
  const getNextProgramWorkout = useMemo(() => {
    if (!mesoState.activeMesoCycle) return null;
    
    // Determine the current week (0-based index)
    const currentWeekIndex = (mesoState.activeMesoCycle.currentWeek || 1) - 1;
    
    // Resolve the week template for the current week, supporting per-week variation
    let resolved = getWeekTemplate(
      mesoState.activeMesoCycle.weekTemplate,
      mesoState.activeMesoCycle.weekTemplates,
      currentWeekIndex
    );
    
    // Fallback: try to find in TRAINING_PROGRAMS (for pre-built programs)
    if (!resolved && mesoState.activeMesoCycle.programId) {
      const program = TRAINING_PROGRAMS.find(p => p.id === mesoState.activeMesoCycle?.programId);
      if (program) {
        resolved = getWeekTemplate(program.weekTemplate, program.weekTemplates, currentWeekIndex);
      }
    }
    
    if (!resolved?.days?.length) return null;
    
    // Calculate which day we're on within the current week
    const completedWorkouts = mesoState.activeMesoCycle.completedWorkouts || 0;
    const daysInWeek = resolved.days.length;
    const dayIndex = completedWorkouts % daysInWeek;
    const nextDay = resolved.days[dayIndex];
    
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
        notes: ex.notes,
        weightMode: ex.weightMode,
        percentageOf1RM: ex.percentageOf1RM,
        fixedWeight: ex.fixedWeight,
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

  // Week calendar - shows each day of the current week with activity type
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
      
      // Find workout for this day
      const dayWorkout = workoutState.workoutHistory.find(w => {
        const workoutDate = new Date(w.date);
        workoutDate.setHours(0, 0, 0, 0);
        return workoutDate.getTime() === date.getTime();
      });
      
      const hasActivity = !!dayWorkout;
      const dayType = dayWorkout?.dayType || (hasActivity ? 'workout' : null);
      
      const isToday = date.toDateString() === today.toDateString();
      const isFuture = date > today;
      
      days.push({
        dayName: dayNames[i],
        date: date.getDate(),
        hasActivity,
        dayType,
        isToday,
        isFuture,
      });
    }
    
    return days;
  }, [workoutState.workoutHistory]);

  // Activity stats for smart recommendations
  const activityStats = useMemo(() => {
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    
    const last14Days = new Date();
    last14Days.setDate(last14Days.getDate() - 14);
    
    const recentWorkouts = workoutState.workoutHistory.filter(w => new Date(w.date) >= last7Days);
    const twoWeekWorkouts = workoutState.workoutHistory.filter(w => new Date(w.date) >= last14Days);
    
    const workoutDays = recentWorkouts.filter(w => !w.dayType || w.dayType === 'workout').length;
    const restDays = recentWorkouts.filter(w => w.dayType === 'rest').length;
    const recoveryDays = recentWorkouts.filter(w => w.dayType === 'active_recovery').length;
    
    // Calculate consecutive workout days (no rest)
    let consecutiveWorkoutDays = 0;
    const sortedHistory = [...workoutState.workoutHistory].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    for (const workout of sortedHistory) {
      if (!workout.dayType || workout.dayType === 'workout') {
        consecutiveWorkoutDays++;
      } else {
        break;
      }
    }
    
    // Smart recommendation
    let recommendation: { type: 'workout' | 'rest' | 'recovery'; message: string; icon: string } | null = null;
    
    if (consecutiveWorkoutDays >= 4) {
      recommendation = {
        type: 'rest',
        message: `${consecutiveWorkoutDays} workout days in a row! Consider a rest day for recovery.`,
        icon: 'power-sleep'
      };
    } else if (workoutDays >= 6 && restDays === 0) {
      recommendation = {
        type: 'rest',
        message: 'Heavy week! Your muscles need recovery time.',
        icon: 'alert'
      };
    } else if (restDays >= 3 && workoutDays <= 2) {
      recommendation = {
        type: 'workout',
        message: 'Well rested! Ready to hit the weights.',
        icon: 'fire'
      };
    } else if (consecutiveWorkoutDays >= 2 && recoveryDays === 0) {
      recommendation = {
        type: 'recovery',
        message: 'Active recovery could help with muscle soreness.',
        icon: 'yoga'
      };
    }
    
    return {
      workoutDays,
      restDays,
      recoveryDays,
      consecutiveWorkoutDays,
      recommendation,
    };
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
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Quick Stats Row */}
        <QuickStatsRow stats={activityStats} />

        {/* Week Calendar */}
        <Surface style={styles.weekCalendar} elevation={1}>
          <View style={styles.weekDays}>
            {weekCalendar.map((day, index) => {
              // Determine icon and color based on day type
              const getDayStyle = () => {
                if (!day.hasActivity) return {};
                switch (day.dayType) {
                  case 'rest': return { backgroundColor: theme.colors.surfaceVariant };
                  case 'active_recovery': return { backgroundColor: theme.colors.tertiaryContainer };
                  case 'cardio': return { backgroundColor: theme.colors.secondaryContainer };
                  default: return { backgroundColor: theme.colors.primary };
                }
              };
              
              const getDayIcon = () => {
                if (!day.hasActivity) return null;
                switch (day.dayType) {
                  case 'rest': return AppIcons.rest;
                  case 'active_recovery': return AppIcons.recovery;
                  case 'cardio': return AppIcons.cardio;
                  default: return AppIcons.warmup;
                }
              };
              
              return (
                <View key={index} style={styles.dayColumn}>
                  <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
                    {day.dayName}
                  </Text>
                  <View style={[
                    styles.dayCircle,
                    getDayStyle(),
                    day.isToday && !day.hasActivity && { borderColor: theme.colors.primary, borderWidth: 2 },
                    day.isFuture && { opacity: 0.3 },
                  ]}>
                    {day.hasActivity ? (
                      <MaterialCommunityIcons name={getDayIcon()!} size={14} color={theme.colors.onSurface} />
                    ) : (
                      <Text variant="labelSmall" style={{ color: day.isToday ? theme.colors.primary : theme.colors.outline }}>
                        {day.date}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
          
          {/* Smart Recommendation */}
          {activityStats.recommendation && (
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              marginTop: 12, 
              paddingTop: 12, 
              borderTopWidth: 1, 
              borderTopColor: theme.colors.outlineVariant,
              backgroundColor: activityStats.recommendation.type === 'rest' ? theme.colors.errorContainer :
                              activityStats.recommendation.type === 'recovery' ? theme.colors.tertiaryContainer :
                              theme.colors.primaryContainer,
              marginHorizontal: -16,
              marginBottom: -16,
              padding: 12,
              borderBottomLeftRadius: 12,
              borderBottomRightRadius: 12,
            }}>
              <MaterialCommunityIcons name={activityStats.recommendation.icon as any} size={20} color={theme.colors.onSurface} style={{ marginRight: 8 }} />
              <Text variant="bodySmall" style={{ flex: 1 }}>
                {activityStats.recommendation.message}
              </Text>
            </View>
          )}
          
          {/* Action Buttons Row - hidden when program is active (ProgramCard handles it) */}
          {!mesoState.activeMesoCycle && (
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.colors.outlineVariant }}>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('ActiveWorkout')}
                style={{ flex: 1 }}
                icon="dumbbell"
                compact
              >
                Workout
              </Button>
              <Button
                mode="outlined"
                onPress={() => {
                  setRestDayInfo({ name: 'Rest Day', dayType: 'rest' });
                  setShowRestDayDialog(true);
                }}
                style={{ flex: 1 }}
                icon={AppIcons.rest}
                compact
              >
                Rest
              </Button>
              <Button
                mode="outlined"
                onPress={() => {
                  // Get muscle groups from recent workouts (last 3 days)
                  const threeDaysAgo = new Date();
                  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
                  const recentWorkouts = workoutState.workoutHistory.filter(w => 
                    w.dayType !== 'rest' && 
                    w.dayType !== 'cardio' && 
                    w.dayType !== 'active_recovery' &&
                    new Date(w.date) >= threeDaysAgo
                  );
                  
                  // Extract muscle groups from recent workout sets
                  const trainedMuscles: MuscleGroup[] = [];
                  recentWorkouts.forEach(w => {
                    w.sets?.forEach(set => {
                      const muscle = set.muscleGroup?.toLowerCase() as MuscleGroup;
                      if (muscle && !trainedMuscles.includes(muscle)) {
                        trainedMuscles.push(muscle);
                      }
                    });
                  });
                  
                  // Get smart suggestions based on trained muscles
                  const smartSuggestions = getRecoverySuggestions(trainedMuscles, 5);
                  
                  setRecoveryInfo({ 
                    name: 'Active Recovery', 
                    dayType: 'active_recovery',
                    trainedMuscles,
                    smartSuggestions,
                  });
                  setSelectedRecoveryActivities(new Set());
                  setShowRecoveryDialog(true);
                }}
                style={{ flex: 1 }}
                icon={AppIcons.recovery}
                compact
              >
                Recovery
              </Button>
            </View>
          )}
          
          {/* Programs Button - when no active program */}
          {!mesoState.activeMesoCycle && (
            <Button
              mode="contained-tonal"
              onPress={() => navigation.navigate('Programs')}
              style={{ marginTop: 8 }}
              icon="clipboard-list"
            >
              Browse Training Programs
            </Button>
          )}
        </Surface>

        {/* Active Program Card */}
        {mesoState.activeMesoCycle && (
          <ProgramCard
            activeMesoCycle={mesoState.activeMesoCycle}
            nextWorkout={getNextProgramWorkout}
            pausedWorkout={workoutState.pausedWorkout?.isProgramWorkout ? workoutState.pausedWorkout : null}
            theme={theme}
            onStartWorkout={handleStartProgramWorkout}
            onResumeWorkout={() => navigation.navigate('ActiveWorkout', { resuming: true })}
            onDiscardPausedWorkout={clearPausedWorkout}
            onStopProgram={() => setShowStopProgramDialog(true)}
          />
        )}

        {/* Paused Standalone Workout Card */}
        {workoutState.pausedWorkout && !workoutState.pausedWorkout.isProgramWorkout && (
          <PausedWorkoutCard
            workoutName={workoutState.pausedWorkout.workoutName}
            exerciseCount={workoutState.pausedWorkout.exercises.length}
            pausedAt={workoutState.pausedWorkout.pausedAt}
            theme={theme}
            onResume={() => navigation.navigate('ActiveWorkout', { resuming: true })}
            onDiscard={clearPausedWorkout}
          />
        )}

        {/* Fatigue & Volume Indicators (when program active) */}
        {mesoState.activeMesoCycle && Object.values(mesoState.muscleFatigue).some(f => f.currentFatigue > 30) && (
          <Surface style={styles.fatigueCard} elevation={1}>
            <Text variant="titleMedium" style={{ marginBottom: 8 }}>
              <MaterialCommunityIcons name="battery-charging" size={18} color={theme.colors.onSurface} />{' '}Muscle Recovery
            </Text>
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
                               fatigue.currentFatigue > 50 ? (theme.colors as any).warning : theme.colors.outline 
                      }}>
                        {fatigue.currentFatigue > 70 ? 'High' : 
                         fatigue.currentFatigue > 50 ? 'Mod' : 'OK'}
                      </Text>
                    </View>
                    <ProgressBar 
                      progress={fatigue.currentFatigue / 100}
                      color={fatigue.currentFatigue > 70 ? theme.colors.error : 
                             fatigue.currentFatigue > 50 ? (theme.colors as any).warning : theme.colors.primary}
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

        {/* Deload Recommendation Banner */}
        <DeloadBanner />

        {/* Quick Start Templates - Always show */}
        <QuickStartTemplates
          onStartWorkout={(template) => {
            if (template) {
              navigation.navigate('ActiveWorkout', { templateWorkout: template });
            } else {
              navigation.navigate('ActiveWorkout');
            }
          }}
        />

        {/* Completed Programs History */}
        {mesoState.mesoCycleHistory.filter(m => m.status === 'completed').length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium">
                <MaterialCommunityIcons name={AppIcons.pr} size={18} color={theme.colors.onSurface} />{' '}Completed Programs
              </Text>
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
              <Button mode="text" compact onPress={handleOpenLogCardio}>
                + Cardio
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
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 12, justifyContent: 'center' }}>
                <Button 
                  mode="outlined" 
                  onPress={handleOpenAddWorkout}
                >
                  + Strength
                </Button>
                <Button 
                  mode="outlined" 
                  onPress={handleOpenLogCardio}
                >
                  + Cardio
                </Button>
              </View>
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
        <WeeklyVolumeCard volume={weeklyVolume} />

        {/* Recent PRs - Only if has PRs */}
        <RecentPRsCard prs={recentPRs} />
      </ScrollView>

      {/* Stop Program Confirmation Dialog */}
      <Portal>
        <Dialog visible={showStopProgramDialog} onDismiss={() => setShowStopProgramDialog(false)}>
          <Dialog.Title>Stop Program?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to stop "{mesoState.activeMesoCycle?.name}"?
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.outline, marginTop: 8 }}>
              You're on Week {mesoState.activeMesoCycle?.currentWeek} of {mesoState.activeMesoCycle?.totalWeeks} with {mesoState.activeMesoCycle?.completedWorkouts || 0} workouts completed. This cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowStopProgramDialog(false)}>Cancel</Button>
            <Button 
              textColor={theme.colors.error}
              onPress={() => {
                if (mesoState.activeMesoCycle) {
                  mesoDispatch({ type: 'ABANDON_MESOCYCLE', payload: mesoState.activeMesoCycle.id });
                }
                setShowStopProgramDialog(false);
              }}
            >
              Stop Program
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Edit Dialog */}
      <EditWorkoutDialog
        visible={!!editingWorkout}
        onDismiss={() => setEditingWorkout(null)}
        workoutName={editName}
        onNameChange={setEditName}
        sets={editSets}
        onSetsChange={setEditSets}
        onSave={handleSaveEdit}
        addSetLabel="+ Add Missing Set"
      />

      {/* Add Past Workout Dialog */}
      <Portal>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <Dialog 
          visible={showAddWorkout} 
          onDismiss={() => setShowAddWorkout(false)}
          style={{ maxHeight: '85%' }}
        >
          <Dialog.Title>Log Past Workout</Dialog.Title>
          <Dialog.ScrollArea style={{ paddingHorizontal: 0 }}>
            <ScrollView style={{ paddingHorizontal: 24 }} keyboardShouldPersistTaps="handled">
              <TextInput
                label="Workout Name"
                value={newWorkoutName}
                onChangeText={setNewWorkoutName}
                mode="outlined"
                placeholder="e.g., Chest & Triceps"
                style={{ marginBottom: 12 }}
              />
              
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4 }}>
                <MaterialCommunityIcons name="calendar" size={18} color={theme.colors.onSurfaceVariant} style={{ marginRight: 8 }} />
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Date: {new Date(newWorkoutDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
              </View>
              
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
                <View style={[styles.addSetForm, { backgroundColor: withAlpha(theme.colors.primary, 0.05) }]}>
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
                              style={[styles.exerciseOption, { borderBottomColor: withAlpha(theme.colors.outline, 0.2) }]}
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
        </KeyboardAvoidingView>
      </Portal>

      {/* Log Cardio Workout Dialog */}
      <LogCardioDialog
        visible={showLogCardio}
        onDismiss={() => setShowLogCardio(false)}
        onSave={(data) => {
          const cardioWorkout: Workout = {
            id: Date.now().toString(),
            name: data.name,
            date: data.date,
            dayType: 'cardio',
            cardioType: data.type,
            durationMinutes: data.durationMinutes,
            distanceMiles: data.distance,
            paceMinPerMile: data.distance && data.distance > 0 ? data.durationMinutes / data.distance : undefined,
            caloriesBurned: data.calories,
            avgHeartRate: data.avgHeartRate,
            notes: data.notes,
            sets: [],
          };
          workoutDispatch({ type: 'COMPLETE_WORKOUT', payload: cardioWorkout });
        }}
      />

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
      <ProgramCompletionDialog
        visible={showProgramComplete}
        stats={completedProgramStats}
        onDismiss={() => setShowProgramComplete(false)}
        onViewHistory={() => {
          if (mesoState.activeMesoCycle) {
            mesoDispatch({ type: 'COMPLETE_MESOCYCLE', payload: mesoState.activeMesoCycle.id });
          }
          setShowProgramComplete(false);
        }}
        onStartNewProgram={() => {
          if (mesoState.activeMesoCycle) {
            mesoDispatch({ type: 'COMPLETE_MESOCYCLE', payload: mesoState.activeMesoCycle.id });
          }
          setShowProgramComplete(false);
          navigation.navigate('Programs');
        }}
      />

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
          <Dialog.Title>Rest Day</Dialog.Title>
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
              <Text variant="labelMedium" style={{ marginBottom: 8 }}>Rest Day Tips:</Text>
              <Text variant="bodySmall">• Get 7-9 hours of sleep</Text>
              <Text variant="bodySmall">• Eat enough protein (1g per lb bodyweight)</Text>
              <Text variant="bodySmall">• Stay hydrated</Text>
              <Text variant="bodySmall">• Light walking is fine if you're feeling active</Text>
            </Surface>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowRestDayDialog(false)}>Close</Button>
            <Button 
              mode="contained"
              onPress={() => {
                // Log rest day to workout history
                const restDay = {
                  id: Date.now().toString(),
                  name: 'Rest Day',
                  date: new Date().toISOString(),
                  dayType: 'rest' as const,
                  sets: [],
                };
                workoutDispatch({ type: 'COMPLETE_WORKOUT', payload: restDay });
                
                // Advance program day if in a program
                if (mesoState.activeMesoCycle) {
                  mesoDispatch({ type: 'ADVANCE_DAY' });
                }
                setShowRestDayDialog(false);
              }}
            >
              Complete ✓
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Cardio Day Dialog */}
      <Portal>
        <Dialog visible={showCardioDialog} onDismiss={() => setShowCardioDialog(false)}>
          <Dialog.Title>Cardio Day</Dialog.Title>
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
                // Log cardio day to workout history
                const cardioDay = {
                  id: Date.now().toString(),
                  name: cardioInfo?.name || 'Cardio Day',
                  date: new Date().toISOString(),
                  dayType: 'cardio' as const,
                  sets: [],
                };
                workoutDispatch({ type: 'COMPLETE_WORKOUT', payload: cardioDay });
                
                // Advance program day if in a program
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
        <Dialog visible={showRecoveryDialog} onDismiss={() => setShowRecoveryDialog(false)} style={{ maxHeight: '85%' }}>
          <Dialog.Title>Active Recovery</Dialog.Title>
          <Dialog.ScrollArea style={{ paddingHorizontal: 0 }}>
            <ScrollView style={{ paddingHorizontal: 24 }}>
              <Text variant="bodySmall" style={{ color: theme.colors.outline, marginBottom: 16 }}>
                Select activities to complete:
              </Text>
              
              {/* Smart Suggestions Section */}
              {recoveryInfo?.smartSuggestions?.length > 0 && (
                <>
                  <Text variant="titleSmall" style={{ marginBottom: 8, color: theme.colors.primary }}>
                    Recommended for You
                  </Text>
                  {recoveryInfo.trainedMuscles?.length > 0 && (
                    <Text variant="bodySmall" style={{ color: theme.colors.outline, marginBottom: 12, fontStyle: 'italic' }}>
                      Based on recent training: {recoveryInfo.trainedMuscles.map((m: string) => m.charAt(0).toUpperCase() + m.slice(1)).join(', ')}
                    </Text>
                  )}
                  {recoveryInfo.smartSuggestions.map((suggestion: RecoverySuggestion, idx: number) => {
                    const isSelected = selectedRecoveryActivities.has(suggestion.name);
                    return (
                      <TouchableOpacity 
                        key={`smart-${idx}`}
                        onPress={() => {
                          const newSet = new Set(selectedRecoveryActivities);
                          if (isSelected) {
                            newSet.delete(suggestion.name);
                          } else {
                            newSet.add(suggestion.name);
                          }
                          setSelectedRecoveryActivities(newSet);
                        }}
                        style={{ 
                          marginBottom: 8, 
                          padding: 12, 
                          borderRadius: 8, 
                          backgroundColor: isSelected ? theme.colors.primaryContainer : theme.colors.surfaceVariant,
                          borderWidth: isSelected ? 2 : 1,
                          borderColor: isSelected ? theme.colors.primary : theme.colors.outlineVariant,
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                            <Text style={{ fontSize: 18, marginRight: 8 }}>
                              {isSelected ? '☑️' : '⬜'}
                            </Text>
                            <View style={{ flex: 1 }}>
                              <Text variant="bodyMedium" style={{ fontWeight: '600' }}>{suggestion.name}</Text>
                              <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                                {suggestion.description}
                              </Text>
                            </View>
                          </View>
                          <Text variant="labelSmall" style={{ color: theme.colors.primary, marginLeft: 8 }}>
                            {suggestion.durationMinutes} min
                          </Text>
                        </View>
                        <Text variant="labelSmall" style={{ color: theme.colors.tertiary, fontStyle: 'italic', marginTop: 4, marginLeft: 26 }}>
                          {suggestion.rationale}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </>
              )}

              {/* All Recovery Activities */}
              <Text variant="titleSmall" style={{ marginTop: 16, marginBottom: 12, color: theme.colors.secondary }}>
                📋 All Recovery Activities
              </Text>
              
              {/* Group activities by type */}
              {(['stretching', 'foam_rolling', 'yoga', 'mobility_work', 'light_walking', 'meditation'] as const).map(activityType => {
                const activities = RECOVERY_LIBRARY.filter(a => a.type === activityType);
                if (activities.length === 0) return null;
                
                const typeLabels: Record<string, string> = {
                  stretching: '🤸 Stretching',
                  foam_rolling: '🧱 Foam Rolling',
                  yoga: '🧘 Yoga',
                  mobility_work: '🔄 Mobility Work',
                  light_walking: '🚶 Light Walking',
                  meditation: '🧠 Meditation',
                };
                
                return (
                  <View key={activityType} style={{ marginBottom: 12 }}>
                    <Text variant="labelMedium" style={{ marginBottom: 6, color: theme.colors.outline }}>
                      {typeLabels[activityType] || activityType}
                    </Text>
                    {activities.map((activity, idx) => {
                      const isSelected = selectedRecoveryActivities.has(activity.name);
                      return (
                        <TouchableOpacity 
                          key={`${activityType}-${idx}`}
                          onPress={() => {
                            const newSet = new Set(selectedRecoveryActivities);
                            if (isSelected) {
                              newSet.delete(activity.name);
                            } else {
                              newSet.add(activity.name);
                            }
                            setSelectedRecoveryActivities(newSet);
                          }}
                          style={{ 
                            marginBottom: 6, 
                            padding: 10, 
                            borderRadius: 6, 
                            backgroundColor: isSelected ? theme.colors.secondaryContainer : theme.colors.surface,
                            borderWidth: 1,
                            borderColor: isSelected ? theme.colors.secondary : theme.colors.outlineVariant,
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}
                        >
                          <Text style={{ fontSize: 16, marginRight: 8 }}>
                            {isSelected ? '☑️' : '⬜'}
                          </Text>
                          <View style={{ flex: 1 }}>
                            <Text variant="bodySmall" style={{ fontWeight: '500' }}>{activity.name}</Text>
                            <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
                              {activity.description}
                            </Text>
                          </View>
                          <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
                            {activity.durationMinutes}m
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                );
              })}
              
              {/* Selected Summary */}
              {selectedRecoveryActivities.size > 0 && (
                <Surface style={{ padding: 12, borderRadius: 8, marginTop: 8, marginBottom: 16, backgroundColor: theme.colors.primaryContainer }} elevation={0}>
                  <Text variant="labelMedium" style={{ color: theme.colors.onPrimaryContainer }}>
                    Selected: {selectedRecoveryActivities.size} activities
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onPrimaryContainer }}>
                    {Array.from(selectedRecoveryActivities).join(', ')}
                  </Text>
                </Surface>
              )}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setShowRecoveryDialog(false)}>Close</Button>
            <Button 
              mode="contained"
              onPress={() => {
                // Log recovery day to workout history with selected activities
                const selectedList = Array.from(selectedRecoveryActivities);
                const recoveryDay = {
                  id: Date.now().toString(),
                  name: selectedList.length > 0 
                    ? `Recovery: ${selectedList.slice(0, 2).join(', ')}${selectedList.length > 2 ? ` +${selectedList.length - 2}` : ''}`
                    : 'Active Recovery',
                  date: new Date().toISOString(),
                  dayType: 'active_recovery' as const,
                  sets: [],
                  notes: selectedList.length > 0 ? `Completed: ${selectedList.join(', ')}` : undefined,
                };
                workoutDispatch({ type: 'COMPLETE_WORKOUT', payload: recoveryDay });
                
                // Advance program day if in a program
                if (mesoState.activeMesoCycle) {
                  mesoDispatch({ type: 'ADVANCE_DAY' });
                }
                setShowRecoveryDialog(false);
              }}
            >
              Complete ✓
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'transparent',
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
    borderTopColor: 'transparent',  // set inline from theme
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
    borderTopColor: 'transparent',  // set inline from theme
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
  mesoCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'visible' as const,
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
    backgroundColor: 'transparent',  // set inline from theme
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
    borderBottomColor: 'transparent',  // set inline from theme
  },
});

export default HomeScreen;
