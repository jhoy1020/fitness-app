// Active Workout Screen - New UI Flow
// 1. Name workout → 2. Add exercises → 3. Tap exercise to log sets → 4. Timer runs during rest

import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import {
  Text,
  Button,
  Surface,
  TextInput,
  useTheme,
  Portal,
  Dialog,
  List,
  Searchbar,
  Divider,
  ProgressBar,
  Chip,
  Switch,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWorkout } from '../context/WorkoutContext';
import { useMesoCycle } from '../context/MesoCycleContext';
import { useUser } from '../context/UserContext';
import { EXERCISE_LIBRARY } from '../services/db/exerciseLibrary';
import { soundService } from '../services/SoundService';
import { calculatePlates, formatPlatesDisplay, getWarmupSets, WarmupSet } from '../utils/plateCalculator';
import { calculate1RM_Epley } from '../utils/formulas';
import { getExerciseDemo } from '../data/exerciseVideos';
import { InfoTooltip, ABBREVIATIONS } from '../components';

// Responsive breakpoint
const NARROW_SCREEN_WIDTH = 375;

// Types
interface SetEntry {
  id: string;
  weight: number;
  reps: number;
  rir: number; // Reps in Reserve (0-4)
  timestamp: Date;
}

interface WorkoutExercise {
  id: string;
  name: string;
  muscleGroup: string;
  sets: SetEntry[];
  // Program targets (if from a program)
  targetSets?: number;
  repsMin?: number;
  repsMax?: number;
  rirTarget?: number;
  restSeconds?: number;
  // Superset pairing
  supersetWith?: string; // ID of paired exercise
  isWarmupComplete?: boolean;
}

interface ActiveWorkoutScreenProps {
  navigation: any;
  route: any;
}

// Rest timer presets in seconds
const REST_PRESETS = [60, 90, 120, 180];

export function ActiveWorkoutScreen({ navigation, route }: ActiveWorkoutScreenProps) {
  const theme = useTheme();
  const { state: workoutState, dispatch: workoutDispatch } = useWorkout();
  const { state: mesoState, dispatch: mesoDispatch } = useMesoCycle();
  const { getOneRepMax } = useUser();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const isNarrowScreen = screenWidth < NARROW_SCREEN_WIDTH;

  // Workout state
  const [workoutName, setWorkoutName] = useState('');
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [isNaming, setIsNaming] = useState(true);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [isProgramWorkout, setIsProgramWorkout] = useState(false);
  
  // Currently selected exercise for adding sets
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  
  // Exercise history modal
  const [showExerciseHistory, setShowExerciseHistory] = useState(false);
  const [historyExerciseName, setHistoryExerciseName] = useState('');
  
  // Exercise substitution modal
  const [showSubstitutes, setShowSubstitutes] = useState(false);
  const [substituteExerciseId, setSubstituteExerciseId] = useState<string | null>(null);
  
  // Set entry inputs
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [rir, setRir] = useState('2'); // Default RIR of 2
  
  // Muscle group filter for exercise picker
  const [muscleFilter, setMuscleFilter] = useState<string | null>(null);
  
  // Exercise picker
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');

  // Rest timer - now countdown based
  const [restTarget, setRestTarget] = useState(120); // Default 2 min rest
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [timerSoundPlayed, setTimerSoundPlayed] = useState(false);
  
  // Warm-up modal
  const [showWarmup, setShowWarmup] = useState(false);
  const [warmupExerciseId, setWarmupExerciseId] = useState<string | null>(null);
  const [warmupSets, setWarmupSets] = useState<WarmupSet[]>([]);
  
  // Plate calculator modal
  const [showPlateCalc, setShowPlateCalc] = useState(false);
  const [plateCalcWeight, setPlateCalcWeight] = useState('');
  const [plateCalcBar, setPlateCalcBar] = useState('45');
  
  // Superset pairing
  const [showSupersetPicker, setShowSupersetPicker] = useState(false);
  const [supersetSourceId, setSupersetSourceId] = useState<string | null>(null);
  
  // Exercise demo modal
  const [showExerciseDemo, setShowExerciseDemo] = useState(false);
  const [demoExerciseName, setDemoExerciseName] = useState('');

  // Get last workout performance for an exercise
  const getLastPerformance = (exerciseName: string) => {
    for (const workout of workoutState.workoutHistory) {
      const sets = (workout as any).sets || [];
      const exerciseSets = sets.filter((s: any) => 
        s.exerciseName?.toLowerCase() === exerciseName.toLowerCase()
      );
      if (exerciseSets.length > 0) {
        // Return best set from last workout
        const bestSet = exerciseSets.reduce((best: any, current: any) => {
          const bestVolume = best.weight * best.reps;
          const currentVolume = current.weight * current.reps;
          return currentVolume > bestVolume ? current : best;
        }, exerciseSets[0]);
        return {
          weight: bestSet.weight,
          reps: bestSet.reps,
          date: workout.date,
          totalSets: exerciseSets.length,
        };
      }
    }
    return null;
  };

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

  // Calculate suggested progression based on RP-style double progression
  const getSuggestedTarget = (lastPerf: { weight: number; reps: number; rir?: number } | null, exercise?: WorkoutExercise) => {
    // Get rep range from exercise or use defaults
    const minReps = exercise?.repsMin || 8;
    const maxReps = exercise?.repsMax || 12;
    const targetReps = Math.floor((minReps + maxReps) / 2);
    
    // First priority: Check for 1RM-based suggestion
    if (exercise) {
      const oneRMWeight = getWeightFrom1RM(exercise.name, targetReps);
      if (oneRMWeight && !lastPerf) {
        // No history, use 1RM-based suggestion
        return { weight: oneRMWeight, reps: targetReps, basedOn1RM: true };
      }
    }
    
    if (!lastPerf) return null;
    
    // RP-style double progression:
    // 1. If reps are below max of rep range, add reps
    // 2. If reps hit max of rep range (or RIR was too high), increase weight and reset to min reps
    
    if (lastPerf.reps < maxReps) {
      // Add 1-2 reps at same weight
      return { weight: lastPerf.weight, reps: Math.min(lastPerf.reps + 1, maxReps), basedOn1RM: false };
    } else {
      // Hit top of rep range - move up weight, reset to bottom of rep range
      // Weight increment: 5 lbs for most exercises, could be smarter based on exercise type
      const weightIncrement = lastPerf.weight >= 100 ? 5 : 2.5;
      return { weight: lastPerf.weight + weightIncrement, reps: minReps, basedOn1RM: false };
    }
  };

  // Load template if repeating a workout
  useEffect(() => {
    if (route.params?.templateWorkout) {
      const template = route.params.templateWorkout;
      setWorkoutName(template.name);
      setIsProgramWorkout(!!template.isProgramWorkout);
      
      // Convert template to exercises with empty sets
      if (template.sets && template.sets.length > 0) {
        const exerciseMap = new Map<string, WorkoutExercise>();
        template.sets.forEach((set: any) => {
          if (!exerciseMap.has(set.exerciseName)) {
            exerciseMap.set(set.exerciseName, {
              id: Date.now().toString() + Math.random(),
              name: set.exerciseName,
              muscleGroup: set.muscleGroup || 'other',
              sets: [],
              // Program targets
              targetSets: set.targetSets,
              repsMin: set.repsMin,
              repsMax: set.repsMax,
              rirTarget: set.rirTarget,
              restSeconds: set.restSeconds,
            });
          }
        });
        setExercises(Array.from(exerciseMap.values()));
        
        // Set rest timer to program's rest time if available
        const firstWithRest = template.sets.find((s: any) => s.restSeconds);
        if (firstWithRest?.restSeconds) {
          setRestTarget(firstWithRest.restSeconds);
        }
      }
      setIsNaming(false);
    }
  }, [route.params]);

  // Timer effect - countdown from restTarget with sound
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          const newValue = prev + 1;
          // Play sound when timer reaches target
          if (newValue === restTarget && !timerSoundPlayed) {
            soundService.playTimerComplete();
            setTimerSoundPlayed(true);
          }
          return newValue;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setTimerSoundPlayed(false);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerRunning]);

  // Filter exercises for picker
  const filteredExercises = EXERCISE_LIBRARY.filter(exercise => {
    const searchLower = exerciseSearch.toLowerCase();
    const matchesSearch = (
      exercise.name.toLowerCase().includes(searchLower) ||
      exercise.muscleGroup.toLowerCase().includes(searchLower) ||
      exercise.equipment.toLowerCase().includes(searchLower)
    );
    const matchesMuscle = !muscleFilter || exercise.muscleGroup === muscleFilter;
    return matchesSearch && matchesMuscle;
  });

  // Get exercise history
  const getExerciseHistory = (exerciseName: string) => {
    const history: { date: string; sets: { weight: number; reps: number; rir?: number }[] }[] = [];
    
    workoutState.workoutHistory.forEach(workout => {
      const sets = ((workout as any).sets || []).filter((s: any) => 
        s.exerciseName?.toLowerCase() === exerciseName.toLowerCase()
      );
      if (sets.length > 0) {
        history.push({
          date: workout.date,
          sets: sets.map((s: any) => ({ weight: s.weight, reps: s.reps, rir: s.rir })),
        });
      }
    });
    
    return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
  };

  // Show exercise history modal
  const handleShowHistory = (exerciseName: string) => {
    setHistoryExerciseName(exerciseName);
    setShowExerciseHistory(true);
  };

  // Get substitute exercises for the same muscle group
  const getSubstituteExercises = (exerciseId: string) => {
    const exercise = exercises.find(e => e.id === exerciseId);
    if (!exercise) return [];
    
    return EXERCISE_LIBRARY.filter(e => 
      e.muscleGroup === exercise.muscleGroup &&
      e.name !== exercise.name
    ).slice(0, 10);
  };

  // Handle showing substitutes
  const handleShowSubstitutes = (exerciseId: string) => {
    setSubstituteExerciseId(exerciseId);
    setShowSubstitutes(true);
  };

  // Handle swapping exercise
  const handleSwapExercise = (newExerciseName: string, newMuscleGroup: string) => {
    if (!substituteExerciseId) return;
    
    setExercises(prev => prev.map(ex => 
      ex.id === substituteExerciseId
        ? { ...ex, name: newExerciseName, muscleGroup: newMuscleGroup, sets: [] }
        : ex
    ));
    setShowSubstitutes(false);
    setSubstituteExerciseId(null);
  };

  // Show warm-up sets for an exercise
  const handleShowWarmup = (exerciseId: string) => {
    const exercise = exercises.find(e => e.id === exerciseId);
    if (!exercise) return;
    
    // Get working weight from last performance or target
    const lastPerf = getLastPerformance(exercise.name);
    const workingWeight = lastPerf?.weight || 135;
    
    const warmups = getWarmupSets(workingWeight, 45, false);
    setWarmupSets(warmups);
    setWarmupExerciseId(exerciseId);
    setShowWarmup(true);
  };

  // Mark warm-up complete
  const handleWarmupComplete = () => {
    if (warmupExerciseId) {
      setExercises(prev => prev.map(ex =>
        ex.id === warmupExerciseId ? { ...ex, isWarmupComplete: true } : ex
      ));
    }
    setShowWarmup(false);
  };

  // Get suggested weight based on last performance and RIR
  const getSuggestedWeight = (exerciseName: string, targetReps: number, targetRir: number) => {
    const lastPerf = getLastPerformance(exerciseName);
    if (!lastPerf) return null;
    
    // Calculate e1RM from last workout
    const last1RM = calculate1RM_Epley(lastPerf.weight, lastPerf.reps);
    
    // Calculate target weight for given reps and RIR
    // Higher RIR = lower weight, Lower RIR = higher weight
    const rirAdjustment = (2 - targetRir) * 2.5; // +/-2.5% per RIR difference from 2
    const repPercentage = 100 - (targetReps * 2.5); // ~2.5% less per rep above 1
    const targetPercentage = (repPercentage + rirAdjustment) / 100;
    
    const suggestedWeight = Math.round(last1RM * targetPercentage / 5) * 5; // Round to 5
    return Math.max(suggestedWeight, 45); // Minimum bar weight
  };

  // Create superset pairing
  const handleCreateSuperset = (sourceId: string) => {
    setSupersetSourceId(sourceId);
    setShowSupersetPicker(true);
  };

  const handlePairSuperset = (targetId: string) => {
    if (!supersetSourceId) return;
    
    setExercises(prev => prev.map(ex => {
      if (ex.id === supersetSourceId) {
        return { ...ex, supersetWith: targetId };
      }
      if (ex.id === targetId) {
        return { ...ex, supersetWith: supersetSourceId };
      }
      return ex;
    }));
    
    setShowSupersetPicker(false);
    setSupersetSourceId(null);
  };

  const handleRemoveSuperset = (exerciseId: string) => {
    const exercise = exercises.find(e => e.id === exerciseId);
    if (!exercise?.supersetWith) return;
    
    const pairedId = exercise.supersetWith;
    setExercises(prev => prev.map(ex => {
      if (ex.id === exerciseId || ex.id === pairedId) {
        return { ...ex, supersetWith: undefined };
      }
      return ex;
    }));
  };

  // Unique muscle groups for filter
  const muscleGroups = [...new Set(EXERCISE_LIBRARY.map(e => e.muscleGroup))];

  // Format timer display
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Start workout with name
  const handleStartWorkout = () => {
    if (workoutName.trim()) {
      setIsNaming(false);
    }
  };

  // Add exercise to workout
  const handleAddExercise = (exerciseName: string, muscleGroup: string) => {
    const newExercise: WorkoutExercise = {
      id: Date.now().toString(),
      name: exerciseName,
      muscleGroup: muscleGroup,
      sets: [],
    };
    setExercises(prev => [...prev, newExercise]);
    setShowExercisePicker(false);
    setExerciseSearch('');
    setActiveExerciseId(newExercise.id);
  };

  // Remove exercise from workout
  const handleRemoveExercise = (exerciseId: string) => {
    setExercises(prev => prev.filter(e => e.id !== exerciseId));
    if (activeExerciseId === exerciseId) {
      setActiveExerciseId(null);
    }
  };

  // Toggle exercise expansion
  const handleToggleExercise = (exerciseId: string) => {
    if (activeExerciseId === exerciseId) {
      setActiveExerciseId(null);
    } else {
      setActiveExerciseId(exerciseId);
      // Pre-fill with last set values if available
      const exercise = exercises.find(e => e.id === exerciseId);
      if (exercise && exercise.sets.length > 0) {
        const lastSet = exercise.sets[exercise.sets.length - 1];
        setWeight(lastSet.weight.toString());
        setReps(lastSet.reps.toString());
        setRir(lastSet.rir?.toString() || '2');
      } else if (exercise) {
        // No sets logged yet - use suggested values from history
        const lastPerf = getLastPerformance(exercise.name);
        const suggested = getSuggestedTarget(lastPerf, exercise);
        if (suggested) {
          setWeight(suggested.weight.toString());
          setReps(suggested.reps.toString());
        } else if (exercise.repsMin && exercise.repsMax) {
          // Use program target if no history
          setWeight('');
          setReps(Math.floor((exercise.repsMin + exercise.repsMax) / 2).toString());
        } else {
          setWeight('');
          setReps('');
        }
        // Set RIR from program target if available
        setRir(exercise.rirTarget?.toString() || '2');
      } else {
        setWeight('');
        setReps('');
        setRir('2');
      }
    }
  };

  // Log a set for the active exercise
  const handleLogSet = () => {
    if (!activeExerciseId || !weight || !reps) return;

    const parsedRir = parseInt(rir, 10);
    const newSet: SetEntry = {
      id: Date.now().toString(),
      weight: parseFloat(weight),
      reps: parseInt(reps, 10),
      rir: isNaN(parsedRir) ? 2 : parsedRir,
      timestamp: new Date(),
    };

    setExercises(prev => prev.map(exercise => {
      if (exercise.id === activeExerciseId) {
        return { ...exercise, sets: [...exercise.sets, newSet] };
      }
      return exercise;
    }));

    // Play set logged sound
    soundService.playSetLogged();

    // Start rest timer
    setTimerSeconds(0);
    setTimerRunning(true);

    // Keep same weight/reps for next set
  };

  // Delete a set
  const handleDeleteSet = (exerciseId: string, setId: string) => {
    setExercises(prev => prev.map(exercise => {
      if (exercise.id === exerciseId) {
        return { ...exercise, sets: exercise.sets.filter(s => s.id !== setId) };
      }
      return exercise;
    }));
  };

  // Generate warm-up sets for an exercise
  const handleGenerateWarmup = (exerciseId: string, workingWeight: number) => {
    if (!workingWeight || workingWeight <= 0) return;

    // Warm-up set percentages and reps
    const warmupScheme = [
      { percent: 0.4, reps: 10 },  // 40% x 10
      { percent: 0.6, reps: 6 },   // 60% x 6
      { percent: 0.75, reps: 4 },  // 75% x 4
      { percent: 0.9, reps: 2 },   // 90% x 2
    ];

    const warmupSets: SetEntry[] = warmupScheme.map((scheme, index) => ({
      id: `warmup-${Date.now()}-${index}`,
      weight: Math.round(workingWeight * scheme.percent / 5) * 5, // Round to nearest 5
      reps: scheme.reps,
      rir: 5, // Warm-ups should feel easy
      timestamp: new Date(),
    }));

    setExercises(prev => prev.map(exercise => {
      if (exercise.id === exerciseId) {
        return { ...exercise, sets: [...warmupSets, ...exercise.sets] };
      }
      return exercise;
    }));
  };

  // Stop timer (ready to lift)
  const handleStopTimer = () => {
    setTimerRunning(false);
    setTimerSeconds(0);
  };

  // Finish workout
  const handleFinishWorkout = () => {
    const allSets = exercises.flatMap(e => 
      e.sets.map(s => ({
        exerciseName: e.name,
        muscleGroup: e.muscleGroup,
        weight: s.weight,
        reps: s.reps,
        rir: s.rir,
        timestamp: s.timestamp,
        defaultRestSeconds: 90,
      }))
    );

    if (allSets.length === 0) {
      navigation.goBack();
      return;
    }

    // Play workout complete sound
    soundService.playWorkoutComplete();

    const workoutId = Date.now().toString();
    const workout = {
      id: workoutId,
      name: workoutName,
      date: new Date().toISOString(),
      notes: workoutNotes || undefined,
      duration: allSets.length > 0 
        ? Math.round((new Date().getTime() - allSets[0].timestamp.getTime()) / 1000)
        : 0,
      sets: allSets,
      exercises: exercises.map(e => ({
        exerciseId: e.id,
        exerciseName: e.name,
        sets: e.sets.map(s => ({
          weight: s.weight,
          targetReps: s.reps,
          actualReps: s.reps,
          rir: s.rir,
          completed: true,
        })),
      })),
    };

    // Calculate volume by muscle group
    const volumeByMuscle: Record<string, number> = {};
    exercises.forEach(e => {
      volumeByMuscle[e.muscleGroup] = (volumeByMuscle[e.muscleGroup] || 0) + e.sets.length;
    });

    workoutDispatch({ type: 'COMPLETE_WORKOUT', payload: workout });
    
    // Update mesocycle progress if this is a program workout
    if (isProgramWorkout && mesoState.activeMesoCycle) {
      mesoDispatch({ 
        type: 'RECORD_WORKOUT_COMPLETION', 
        payload: { workoutId, volumeByMuscle } 
      });
    }
    
    setTimerRunning(false);
    
    // Navigate to summary screen
    navigation.replace('WorkoutSummary', { workout, volumeByMuscle, isProgramWorkout });
  };

  // Get total sets count
  const totalSets = exercises.reduce((sum, e) => sum + e.sets.length, 0);

  // Naming screen
  if (isNaming) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Surface style={styles.namingCard} elevation={2}>
          <Text variant="headlineMedium" style={styles.title}>
            New Workout
          </Text>
          <TextInput
            label="Workout Name"
            value={workoutName}
            onChangeText={setWorkoutName}
            mode="outlined"
            placeholder="e.g., Push Day, Leg Day"
            style={styles.nameInput}
            autoFocus
          />
          <TextInput
            label="Notes (optional)"
            value={workoutNotes}
            onChangeText={setWorkoutNotes}
            mode="outlined"
            placeholder="How are you feeling? Any goals for today?"
            multiline
            numberOfLines={2}
            style={styles.nameInput}
          />
          <Button
            mode="contained"
            onPress={handleStartWorkout}
            disabled={!workoutName.trim()}
            style={styles.startButton}
          >
            Start Workout
          </Button>
          <Button
            mode="text"
            onPress={() => navigation.goBack()}
          >
            Cancel
          </Button>
        </Surface>
      </View>
    );
  }

  // Main workout screen
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header with timer */}
      <Surface style={styles.header} elevation={2}>
        <View style={styles.headerTop}>
          <View>
            <Text variant="titleLarge" style={styles.workoutTitle}>{workoutName}</Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {exercises.length} exercises • {totalSets} sets
            </Text>
          </View>
          
          {/* Rest Timer */}
          <Surface style={[
            styles.timerBox, 
            { backgroundColor: timerRunning 
                ? (timerSeconds >= restTarget ? theme.colors.tertiaryContainer : theme.colors.primaryContainer) 
                : theme.colors.surfaceVariant }
          ]} elevation={1}>
            <Text variant="headlineMedium" style={{ 
              color: timerRunning 
                ? (timerSeconds >= restTarget ? theme.colors.onTertiaryContainer : theme.colors.onPrimaryContainer) 
                : theme.colors.onSurfaceVariant,
              fontFamily: 'monospace',
            }}>
              {timerRunning 
                ? (timerSeconds >= restTarget 
                    ? `+${formatTime(timerSeconds - restTarget)}` 
                    : formatTime(restTarget - timerSeconds))
                : formatTime(restTarget)}
            </Text>
            {timerRunning ? (
              <Button 
                mode="contained" 
                compact 
                onPress={handleStopTimer}
                style={styles.stopButton}
              >
                GO!
              </Button>
            ) : (
              <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                {REST_PRESETS.map(seconds => (
                  <TouchableOpacity
                    key={seconds}
                    onPress={() => setRestTarget(seconds)}
                    style={[
                      styles.restPreset,
                      { backgroundColor: restTarget === seconds ? theme.colors.primary : theme.colors.surfaceVariant }
                    ]}
                    hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                  >
                    <Text 
                      variant="labelMedium" 
                      style={{ color: restTarget === seconds ? theme.colors.onPrimary : theme.colors.onSurfaceVariant }}
                    >
                      {seconds >= 60 ? `${seconds / 60}m` : `${seconds}s`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </Surface>
        </View>
      </Surface>

      {/* Exercise List */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {exercises.length === 0 ? (
          <Surface style={styles.emptyCard} elevation={1}>
            <Text variant="bodyLarge" style={{ textAlign: 'center', marginBottom: 8 }}>
              No exercises yet
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
              Add exercises to your workout to get started
            </Text>
          </Surface>
        ) : (
          exercises.map((exercise) => {
            const lastPerf = getLastPerformance(exercise.name);
            const suggested = getSuggestedTarget(lastPerf, exercise);
            
            return (
            <Surface key={exercise.id} style={styles.exerciseCard} elevation={1}>
              {/* Exercise Header */}
              <TouchableOpacity 
                onPress={() => handleToggleExercise(exercise.id)}
                style={styles.exerciseHeader}
              >
                <View style={styles.exerciseInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <Text variant="titleMedium" style={styles.exerciseName}>
                      {exercise.name}
                    </Text>
                    {getOneRepMax(exercise.name) && (
                      <Surface style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, backgroundColor: theme.colors.primaryContainer }} elevation={0}>
                        <Text variant="labelSmall" style={{ color: theme.colors.primary }}>
                          1RM: {getOneRepMax(exercise.name)?.weight} lbs
                        </Text>
                      </Surface>
                    )}
                    {exercise.supersetWith && (
                      <Surface style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, backgroundColor: theme.colors.tertiaryContainer }} elevation={0}>
                        <Text variant="labelSmall" style={{ color: theme.colors.tertiary }}>🔗 Superset</Text>
                      </Surface>
                    )}
                    {exercise.isWarmupComplete && (
                      <Text style={{ fontSize: 12 }}>🔥</Text>
                    )}
                  </View>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {exercise.muscleGroup} • {exercise.sets.length}{exercise.targetSets ? `/${exercise.targetSets}` : ''} sets
                    {exercise.repsMin && exercise.repsMax && ` • ${exercise.repsMin}-${exercise.repsMax} reps`}
                    {exercise.rirTarget !== undefined && ` @ RIR ${exercise.rirTarget}`}
                  </Text>
                </View>
                <View style={styles.exerciseActions}>
                  <TouchableOpacity
                    onPress={() => handleShowSubstitutes(exercise.id)}
                    style={{ padding: 8 }}
                  >
                    <Text style={{ fontSize: 16 }}>🔄</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleShowHistory(exercise.name)}
                    style={{ padding: 8 }}
                  >
                    <Text style={{ fontSize: 16 }}>📊</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleRemoveExercise(exercise.id)}
                    style={{ padding: 8 }}
                  >
                    <Text style={{ fontSize: 16, color: theme.colors.error }}>✕</Text>
                  </TouchableOpacity>
                  <Text style={{ fontSize: 20, marginLeft: 4 }}>
                    {activeExerciseId === exercise.id ? '▲' : '▼'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Expanded Content */}
              {activeExerciseId === exercise.id && (
                <View style={styles.exerciseExpanded}>
                  <Divider style={{ marginVertical: 8 }} />

                  {/* Quick Actions Row */}
                  <View style={styles.quickActionsRow}>
                    {!exercise.isWarmupComplete && exercise.sets.length === 0 && (
                      <TouchableOpacity 
                        style={[styles.quickActionBtn, { backgroundColor: 'rgba(255,107,53,0.15)' }]}
                        onPress={() => handleShowWarmup(exercise.id)}
                      >
                        <Text style={{ fontSize: 14 }}>🔥</Text>
                        <Text variant="labelSmall" style={{ color: '#FF6B35' }}>Warm-up</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity 
                      style={[styles.quickActionBtn, { backgroundColor: 'rgba(153,102,255,0.15)' }]}
                      onPress={() => {
                        setDemoExerciseName(exercise.name);
                        setShowExerciseDemo(true);
                      }}
                    >
                      <Text style={{ fontSize: 14 }}>🎥</Text>
                      <Text variant="labelSmall" style={{ color: '#9966FF' }}>Demo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.quickActionBtn, { backgroundColor: 'rgba(0,212,255,0.15)' }]}
                      onPress={() => setShowPlateCalc(true)}
                    >
                      <Text style={{ fontSize: 14 }}>🧮</Text>
                      <Text variant="labelSmall" style={{ color: theme.colors.primary }}>Plates</Text>
                    </TouchableOpacity>
                    {!exercise.supersetWith ? (
                      <TouchableOpacity 
                        style={[styles.quickActionBtn, { backgroundColor: 'rgba(173,255,47,0.15)' }]}
                        onPress={() => handleCreateSuperset(exercise.id)}
                      >
                        <Text style={{ fontSize: 14 }}>🔗</Text>
                        <Text variant="labelSmall" style={{ color: theme.colors.tertiary }}>Superset</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity 
                        style={[styles.quickActionBtn, { backgroundColor: 'rgba(255,71,87,0.15)' }]}
                        onPress={() => handleRemoveSuperset(exercise.id)}
                      >
                        <Text style={{ fontSize: 14 }}>✂️</Text>
                        <Text variant="labelSmall" style={{ color: theme.colors.error }}>Unlink</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  
                  {/* Last Performance & Target */}
                  {(lastPerf || suggested) && (
                    <View style={styles.perfRow}>
                      {lastPerf && (
                        <View style={styles.perfItem}>
                          <Text variant="labelSmall" style={{ color: theme.colors.outline }}>LAST</Text>
                          <Text variant="bodyMedium">{lastPerf.weight} × {lastPerf.reps}</Text>
                          <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
                            {lastPerf.totalSets} sets
                          </Text>
                        </View>
                      )}
                      {suggested && (
                        <View style={styles.perfItem}>
                          <Text variant="labelSmall" style={{ color: theme.colors.primary }}>
                            {(suggested as any).basedOn1RM ? '🎯 1RM TARGET' : 'TARGET'}
                          </Text>
                          <Text variant="bodyMedium" style={{ color: theme.colors.primary, fontWeight: '600' }}>
                            {suggested.weight} × {suggested.reps}+
                          </Text>
                          <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
                            {(suggested as any).basedOn1RM 
                              ? `Based on ${getOneRepMax(exercise.name)?.weight} lbs 1RM`
                              : lastPerf 
                                ? (suggested.weight > lastPerf.weight ? '↑ weight' : '↑ reps')
                                : 'suggested'
                            }
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Exercise Tips */}
                  {(() => {
                    const exerciseData = EXERCISE_LIBRARY.find(e => e.name === exercise.name);
                    return exerciseData?.tips ? (
                      <View style={styles.tipsBox}>
                        <Text variant="labelSmall" style={{ color: theme.colors.primary, fontWeight: '600' }}>
                          💡 TIP
                        </Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                          {exerciseData.tips}
                        </Text>
                      </View>
                    ) : null;
                  })()}
                  
                  {/* Previous Sets */}
                  {exercise.sets.length > 0 && (
                    <View style={styles.setsTable}>
                      <View style={styles.setsHeader}>
                        <Text style={[styles.setCell, styles.setNumCell]}>Set</Text>
                        <Text style={[styles.setCell, styles.weightCell]}>Weight</Text>
                        <Text style={[styles.setCell, styles.repsCell]}>Reps</Text>
                        <View style={{ flex: 0.6, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                          <Text>RIR</Text>
                          <InfoTooltip {...ABBREVIATIONS.RIR} size="small" />
                        </View>
                        <Text style={[styles.setCell, styles.deleteCell]}>{' '}</Text>
                      </View>
                      {exercise.sets.map((set, index) => (
                        <View key={set.id} style={styles.setRow}>
                          <Text style={[styles.setCell, styles.setNumCell]}>{index + 1}</Text>
                          <Text style={[styles.setCell, styles.weightCell]}>{set.weight} lbs</Text>
                          <Text style={[styles.setCell, styles.repsCell]}>{set.reps}</Text>
                          <Text style={[styles.setCell, styles.rirCell, { color: set.rir <= 1 ? theme.colors.error : set.rir >= 3 ? '#00E676' : theme.colors.onSurface }]}>{set.rir}</Text>
                          <TouchableOpacity 
                            onPress={() => handleDeleteSet(exercise.id, set.id)}
                            style={styles.deleteCell}
                          >
                            <Text style={{ color: theme.colors.error }}>✕</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Add New Set - Responsive layout */}
                  <View style={[
                    styles.addSetRow, 
                    isNarrowScreen && styles.addSetRowNarrow
                  ]}>
                    <View style={[
                      styles.inputGroup,
                      isNarrowScreen && styles.inputGroupNarrow
                    ]}>
                      <TextInput
                        label="Weight"
                        value={weight}
                        onChangeText={setWeight}
                        keyboardType="numeric"
                        mode="outlined"
                        style={[styles.setInput, isNarrowScreen && { minWidth: 80 }]}
                        dense
                      />
                      <TextInput
                        label="Reps"
                        value={reps}
                        onChangeText={setReps}
                        keyboardType="numeric"
                        mode="outlined"
                        style={[styles.setInput, isNarrowScreen && { minWidth: 70 }]}
                        dense
                      />
                      <TextInput
                        label="RIR"
                        value={rir}
                        onChangeText={setRir}
                        keyboardType="numeric"
                        mode="outlined"
                        style={[styles.setInput, { flex: isNarrowScreen ? 1 : 0.6 }, isNarrowScreen && { minWidth: 60 }]}
                        dense
                      />
                    </View>
                    <Button
                      mode="contained"
                      onPress={handleLogSet}
                      disabled={!weight || !reps}
                      style={[styles.logButton, isNarrowScreen && styles.logButtonNarrow]}
                    >
                      Log Set
                    </Button>
                  </View>

                  {/* Quick Actions */}
                  <View style={styles.quickActions}>
                    {/* Use Suggested button */}
                    {suggested && exercise.sets.length < (exercise.targetSets || 4) && (
                      <Button
                        mode="contained-tonal"
                        compact
                        onPress={() => {
                          setWeight(suggested.weight.toString());
                          setReps(suggested.reps.toString());
                        }}
                        icon={() => <Text>🎯</Text>}
                        style={{ marginRight: 8 }}
                      >
                        Use Suggested ({suggested.weight}×{suggested.reps})
                      </Button>
                    )}
                    {exercise.sets.length === 0 && weight && (
                      <Button
                        mode="outlined"
                        compact
                        onPress={() => handleGenerateWarmup(exercise.id, parseFloat(weight))}
                        icon={() => <Text>🔥</Text>}
                      >
                        Generate Warm-up
                      </Button>
                    )}
                    {exercise.sets.length > 0 && !suggested && (
                      <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                        💡 Tip: Previous weight was {exercise.sets[exercise.sets.length - 1].weight} lbs
                      </Text>
                    )}
                  </View>
                </View>
              )}
            </Surface>
          );})
        )}
      </ScrollView>

      {/* Bottom Actions - with safe area insets */}
      <Surface style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]} elevation={3}>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('Home')}
          style={styles.bottomButton}
        >
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleFinishWorkout}
          style={styles.bottomButton}
        >
          Finish
        </Button>
      </Surface>

      {/* Add Exercise Button - with safe area offset */}
      <TouchableOpacity
        style={[
          styles.fab, 
          { 
            backgroundColor: theme.colors.primary,
            bottom: 90 + Math.max(insets.bottom, 0),
          }
        ]}
        onPress={() => setShowExercisePicker(true)}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>+ Add Exercise</Text>
      </TouchableOpacity>

      {/* Exercise Picker Dialog */}
      <Portal>
        <Dialog visible={showExercisePicker} onDismiss={() => setShowExercisePicker(false)} style={{ maxHeight: '85%' }}>
          <Dialog.Title>Add Exercise</Dialog.Title>
          <View style={{ paddingHorizontal: 24, paddingBottom: 8 }}>
            <Searchbar
              placeholder="Search exercises..."
              onChangeText={setExerciseSearch}
              value={exerciseSearch}
              style={styles.searchBar}
            />
            {/* Muscle Group Filter */}
            <View style={{ height: 40 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center' }}>
                <TouchableOpacity
                  onPress={() => setMuscleFilter(null)}
                  style={[
                    styles.filterChip,
                    !muscleFilter && { backgroundColor: theme.colors.primary }
                  ]}
                >
                  <Text style={{ color: !muscleFilter ? '#fff' : theme.colors.onSurface, fontSize: 12 }}>All</Text>
                </TouchableOpacity>
                {muscleGroups.map(mg => (
                  <TouchableOpacity
                    key={mg}
                    onPress={() => setMuscleFilter(muscleFilter === mg ? null : mg)}
                    style={[
                      styles.filterChip,
                      muscleFilter === mg && { backgroundColor: theme.colors.primary }
                    ]}
                  >
                    <Text style={{ 
                      color: muscleFilter === mg ? '#fff' : theme.colors.onSurface, 
                      fontSize: 12,
                      textTransform: 'capitalize' 
                    }}>{mg}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
          <Dialog.ScrollArea style={{ paddingHorizontal: 0, maxHeight: 320 }}>
            <ScrollView contentContainerStyle={{ paddingHorizontal: 8 }}>
              {filteredExercises.map((exercise, index) => (
                <TouchableOpacity
                  key={`${exercise.name}-${index}`}
                  onPress={() => handleAddExercise(exercise.name, exercise.muscleGroup)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: 'rgba(100,130,153,0.15)',
                  }}
                >
                  <Text style={{ fontSize: 18, marginRight: 12 }}>🏋️</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '500', color: theme.colors.onSurface }}>{exercise.name}</Text>
                    <Text style={{ fontSize: 12, color: theme.colors.outline }}>{exercise.muscleGroup} • {exercise.equipment}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setShowExercisePicker(false)}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Exercise History Dialog */}
      <Portal>
        <Dialog visible={showExerciseHistory} onDismiss={() => setShowExerciseHistory(false)}>
          <Dialog.Title>📊 {historyExerciseName} History</Dialog.Title>
          <Dialog.ScrollArea style={{ maxHeight: 400 }}>
            <ScrollView>
              {getExerciseHistory(historyExerciseName).length === 0 ? (
                <Text style={{ padding: 16, color: theme.colors.outline, textAlign: 'center' }}>
                  No history found for this exercise
                </Text>
              ) : (
                getExerciseHistory(historyExerciseName).map((session, idx) => (
                  <View key={idx} style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(100,130,153,0.2)' }}>
                    <Text variant="labelMedium" style={{ color: theme.colors.primary, marginBottom: 4 }}>
                      {new Date(session.date).toLocaleDateString()}
                    </Text>
                    {session.sets.map((set, setIdx) => (
                      <Text key={setIdx} variant="bodySmall" style={{ color: theme.colors.onSurface }}>
                        Set {setIdx + 1}: {set.weight} × {set.reps} {set.rir !== undefined && `@ RIR ${set.rir}`}
                      </Text>
                    ))}
                  </View>
                ))
              )}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setShowExerciseHistory(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Exercise Substitutes Dialog */}
      <Portal>
        <Dialog visible={showSubstitutes} onDismiss={() => setShowSubstitutes(false)}>
          <Dialog.Title>🔄 Swap Exercise</Dialog.Title>
          <Dialog.ScrollArea style={{ maxHeight: 400 }}>
            <ScrollView>
              {substituteExerciseId && (
                <>
                  <Text variant="bodySmall" style={{ padding: 16, color: theme.colors.outline }}>
                    Similar exercises for the same muscle group:
                  </Text>
                  {getSubstituteExercises(substituteExerciseId).map((ex) => (
                    <List.Item
                      key={ex.name}
                      title={ex.name}
                      description={`${ex.equipment} • ${ex.muscleGroup}`}
                      onPress={() => handleSwapExercise(ex.name, ex.muscleGroup)}
                      left={() => <Text style={{ fontSize: 20, marginLeft: 8 }}>💪</Text>}
                      style={{ paddingVertical: 4 }}
                    />
                  ))}
                  {getSubstituteExercises(substituteExerciseId).length === 0 && (
                    <Text style={{ padding: 16, color: theme.colors.outline, textAlign: 'center' }}>
                      No alternative exercises found
                    </Text>
                  )}
                </>
              )}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setShowSubstitutes(false)}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Warm-up Sets Dialog */}
      <Portal>
        <Dialog visible={showWarmup} onDismiss={() => setShowWarmup(false)}>
          <Dialog.Title>🔥 Warm-up Sets</Dialog.Title>
          <Dialog.ScrollArea style={{ maxHeight: 400 }}>
            <ScrollView style={{ padding: 16 }}>
              <Text variant="bodySmall" style={{ color: theme.colors.outline, marginBottom: 16 }}>
                Recommended warm-up progression:
              </Text>
              {warmupSets.map((warmup, idx) => (
                <Surface key={idx} style={{ padding: 12, borderRadius: 8, marginBottom: 8 }} elevation={1}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                      <Text variant="titleMedium">{warmup.weight} lbs × {warmup.reps}</Text>
                      <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                        {warmup.percentage}% • Rest {warmup.rest}s
                      </Text>
                    </View>
                    <Text variant="bodySmall" style={{ color: theme.colors.primary }}>
                      {formatPlatesDisplay(warmup.plates, false)}
                    </Text>
                  </View>
                </Surface>
              ))}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setShowWarmup(false)}>Close</Button>
            <Button mode="contained" onPress={handleWarmupComplete}>Done Warming Up</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Plate Calculator Dialog */}
      <Portal>
        <Dialog visible={showPlateCalc} onDismiss={() => setShowPlateCalc(false)}>
          <Dialog.Title>🧮 Plate Calculator</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Target Weight (lbs)"
              mode="outlined"
              keyboardType="numeric"
              value={plateCalcWeight}
              onChangeText={setPlateCalcWeight}
              style={{ marginBottom: 12 }}
            />
            <TextInput
              label="Bar Weight (lbs)"
              mode="outlined"
              keyboardType="numeric"
              value={plateCalcBar}
              onChangeText={setPlateCalcBar}
              style={{ marginBottom: 16 }}
            />
            {plateCalcWeight && parseFloat(plateCalcWeight) > 0 && (
              <Surface style={{ padding: 16, borderRadius: 12 }} elevation={1}>
                <Text variant="titleMedium" style={{ marginBottom: 8 }}>Each Side:</Text>
                <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
                  {formatPlatesDisplay(
                    calculatePlates(parseFloat(plateCalcWeight), parseFloat(plateCalcBar) || 45, false),
                    false
                  )}
                </Text>
                {!calculatePlates(parseFloat(plateCalcWeight), parseFloat(plateCalcBar) || 45, false).achievable && (
                  <Text variant="bodySmall" style={{ color: theme.colors.error, marginTop: 8 }}>
                    ⚠️ Can't hit exact weight. Closest: {calculatePlates(parseFloat(plateCalcWeight), parseFloat(plateCalcBar) || 45, false).totalWeight} lbs
                  </Text>
                )}
              </Surface>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowPlateCalc(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Superset Picker Dialog */}
      <Portal>
        <Dialog visible={showSupersetPicker} onDismiss={() => setShowSupersetPicker(false)}>
          <Dialog.Title>🔗 Create Superset</Dialog.Title>
          <Dialog.ScrollArea style={{ maxHeight: 400 }}>
            <ScrollView>
              <Text variant="bodySmall" style={{ padding: 16, color: theme.colors.outline }}>
                Select an exercise to pair:
              </Text>
              {exercises
                .filter(ex => ex.id !== supersetSourceId && !ex.supersetWith)
                .map((ex) => (
                  <List.Item
                    key={ex.id}
                    title={ex.name}
                    description={ex.muscleGroup}
                    onPress={() => handlePairSuperset(ex.id)}
                    left={() => <Text style={{ fontSize: 20, marginLeft: 8 }}>💪</Text>}
                    style={{ paddingVertical: 4 }}
                  />
                ))}
              {exercises.filter(ex => ex.id !== supersetSourceId && !ex.supersetWith).length === 0 && (
                <Text style={{ padding: 16, color: theme.colors.outline, textAlign: 'center' }}>
                  Add more exercises to create a superset
                </Text>
              )}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setShowSupersetPicker(false)}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Exercise Demo Dialog */}
      <Portal>
        <Dialog visible={showExerciseDemo} onDismiss={() => setShowExerciseDemo(false)}>
          <Dialog.Title>🎥 {demoExerciseName}</Dialog.Title>
          <Dialog.ScrollArea style={{ maxHeight: 450 }}>
            <ScrollView style={{ padding: 16 }}>
              {(() => {
                const demo = getExerciseDemo(demoExerciseName);
                const exercise = EXERCISE_LIBRARY.find(e => e.name === demoExerciseName);
                return (
                  <>
                    <Surface style={{ padding: 16, borderRadius: 12, marginBottom: 16, backgroundColor: 'rgba(0,212,255,0.1)' }} elevation={0}>
                      <Text variant="bodyMedium">{demo.description}</Text>
                    </Surface>
                    
                    <Text variant="titleSmall" style={{ marginBottom: 8 }}>Form Cues:</Text>
                    {demo.cues.map((cue, idx) => (
                      <View key={idx} style={{ flexDirection: 'row', marginBottom: 8, alignItems: 'flex-start' }}>
                        <Text style={{ marginRight: 8 }}>✓</Text>
                        <Text variant="bodyMedium" style={{ flex: 1 }}>{cue}</Text>
                      </View>
                    ))}
                    
                    {exercise?.tips && (
                      <>
                        <Divider style={{ marginVertical: 16 }} />
                        <Text variant="titleSmall" style={{ marginBottom: 8 }}>💡 Pro Tips:</Text>
                        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                          {exercise.tips}
                        </Text>
                      </>
                    )}
                  </>
                );
              })()}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setShowExerciseDemo(false)}>Close</Button>
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
  namingCard: {
    margin: 20,
    padding: 24,
    borderRadius: 16,
    marginTop: 60,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
  },
  nameInput: {
    marginBottom: 16,
  },
  startButton: {
    marginTop: 8,
    marginBottom: 8,
  },
  header: {
    padding: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workoutTitle: {
    fontWeight: 'bold',
  },
  timerBox: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 120,
  },
  stopButton: {
    marginTop: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 160,
  },
  emptyCard: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  exerciseCard: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontWeight: '600',
  },
  exerciseActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseExpanded: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  quickActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  setsTable: {
    marginBottom: 12,
  },
  setsHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(100,130,153,0.25)',
  },
  setRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    alignItems: 'center',
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
  rirCell: {
    width: 40,
    fontWeight: '600',
  },
  deleteCell: {
    width: 40,
    alignItems: 'center',
  },
  addSetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addSetRowNarrow: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 12,
  },
  inputGroup: {
    flexDirection: 'row',
    flex: 1,
    gap: 8,
  },
  inputGroupNarrow: {
    width: '100%',
  },
  setInput: {
    flex: 1,
  },
  logButton: {
    marginTop: 6,
    minHeight: 44,
    justifyContent: 'center',
  },
  logButtonNarrow: {
    width: '100%',
    marginTop: 8,
  },
  quickActions: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(100,130,153,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  perfRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0,212,255,0.05)',
    borderRadius: 8,
  },
  perfItem: {
    alignItems: 'center',
  },
  restPreset: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    minHeight: 44,
    minWidth: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipsBox: {
    backgroundColor: 'rgba(0, 212, 255, 0.08)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 4,
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
    zIndex: 100,
  },
  bottomButton: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 28,
    minHeight: 48,
    elevation: 4,
    shadowColor: '#1B2838',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 101,
  },
  searchBar: {
    marginBottom: 12,
    elevation: 0,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: 'rgba(100,130,153,0.2)',
  },
});

export default ActiveWorkoutScreen;
