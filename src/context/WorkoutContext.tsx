// Workout Context - Manages workout state and actions

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Storage } from '../utils/storage';
import type {
  Workout,
  WorkoutSet,
  WorkoutTemplate,
  WorkoutState,
  WorkoutAction,
  Exercise,
  TemplateExercise,
  PausedWorkout,
  DeloadState,
} from '../types';
import {
  getAllWorkouts,
  getAllTemplates,
  createWorkout,
  updateWorkout,
  createWorkoutSet,
  getSetsByWorkoutId,
  deleteWorkoutSet,
  updateWorkoutSet,
} from '../services/db';
import { generateUUID, toISODate } from '../utils';

// Initial state
const initialState: WorkoutState = {
  activeWorkout: null,
  activeSets: [],
  currentExerciseIndex: 0,
  isRestTimerRunning: false,
  restTimeRemaining: 0,
  workoutHistory: [],
  templates: [],
  pausedWorkout: null,
  deloadState: {
    lastAnalysis: null,
    lastDeloadDate: null,
    isDismissed: false,
    isInDeloadWeek: false,
    deloadStartDate: null,
  },
};

// Reducer
function workoutReducer(state: WorkoutState, action: WorkoutAction): WorkoutState {
  switch (action.type) {
    case 'START_WORKOUT':
      return {
        ...state,
        activeWorkout: action.payload.workout,
        activeSets: [],
        currentExerciseIndex: 0,
        isRestTimerRunning: false,
        restTimeRemaining: 0,
      };

    case 'END_WORKOUT':
      return {
        ...state,
        activeWorkout: null,
        activeSets: [],
        currentExerciseIndex: 0,
        isRestTimerRunning: false,
        restTimeRemaining: 0,
      };

    case 'CANCEL_WORKOUT':
      return {
        ...state,
        activeWorkout: null,
        activeSets: [],
        currentExerciseIndex: 0,
        isRestTimerRunning: false,
        restTimeRemaining: 0,
      };

    case 'ADD_SET':
      return {
        ...state,
        activeSets: [...state.activeSets, action.payload],
      };

    case 'UPDATE_SET':
      return {
        ...state,
        activeSets: state.activeSets.map((set) =>
          set.id === action.payload.id ? action.payload : set
        ),
      };

    case 'DELETE_SET':
      return {
        ...state,
        activeSets: state.activeSets.filter((set) => set.id !== action.payload),
      };

    case 'NEXT_EXERCISE':
      return {
        ...state,
        currentExerciseIndex: state.currentExerciseIndex + 1,
      };

    case 'PREVIOUS_EXERCISE':
      return {
        ...state,
        currentExerciseIndex: Math.max(0, state.currentExerciseIndex - 1),
      };

    case 'SET_EXERCISE_INDEX':
      return {
        ...state,
        currentExerciseIndex: action.payload,
      };

    case 'LOAD_HISTORY':
      return {
        ...state,
        workoutHistory: action.payload,
      };

    case 'LOAD_TEMPLATES':
      return {
        ...state,
        templates: action.payload,
      };

    case 'START_REST_TIMER':
      return {
        ...state,
        isRestTimerRunning: true,
        restTimeRemaining: action.payload,
      };

    case 'TICK_REST_TIMER':
      const newTime = state.restTimeRemaining - 1;
      return {
        ...state,
        restTimeRemaining: Math.max(0, newTime),
        isRestTimerRunning: newTime > 0,
      };

    case 'STOP_REST_TIMER':
      return {
        ...state,
        isRestTimerRunning: false,
        restTimeRemaining: 0,
      };

    case 'COMPLETE_WORKOUT':
      // Save workout to history and persist to storage
      const newHistory = [action.payload, ...state.workoutHistory];
      Storage.setItem('fitness_workout_history', JSON.stringify(newHistory)).catch(e => {
        console.error('Failed to save workout history:', e);
      });
      return {
        ...state,
        activeWorkout: null,
        activeSets: [],
        workoutHistory: newHistory,
      };

    case 'DELETE_WORKOUT':
      const filteredHistory = state.workoutHistory.filter(w => w.id !== action.payload);
      Storage.setItem('fitness_workout_history', JSON.stringify(filteredHistory)).catch(e => {
        console.error('Failed to save workout history:', e);
      });
      return {
        ...state,
        workoutHistory: filteredHistory,
      };

    case 'UPDATE_WORKOUT':
      const updatedHistory = state.workoutHistory.map(w => 
        w.id === action.payload.id ? { ...w, ...action.payload.updates } : w
      );
      Storage.setItem('fitness_workout_history', JSON.stringify(updatedHistory)).catch(e => {
        console.error('Failed to save workout history:', e);
      });
      return {
        ...state,
        workoutHistory: updatedHistory,
      };

    case 'PAUSE_WORKOUT':
      Storage.setItem('fitness_paused_workout', JSON.stringify(action.payload)).catch(e => {
        console.error('Failed to save paused workout:', e);
      });
      return {
        ...state,
        pausedWorkout: action.payload,
      };

    case 'CLEAR_PAUSED_WORKOUT':
      Storage.removeItem('fitness_paused_workout').catch(e => {
        console.error('Failed to clear paused workout:', e);
      });
      return {
        ...state,
        pausedWorkout: null,
      };

    case 'SET_DELOAD_STATE':
      Storage.setItem('fitness_deload_state', JSON.stringify(action.payload)).catch(e => {
        console.error('Failed to save deload state:', e);
      });
      return { ...state, deloadState: action.payload };

    case 'START_DELOAD_WEEK': {
      const newDeloadState: DeloadState = {
        ...state.deloadState,
        isInDeloadWeek: true,
        deloadStartDate: new Date().toISOString(),
        isDismissed: false,
      };
      Storage.setItem('fitness_deload_state', JSON.stringify(newDeloadState)).catch(e => {
        console.error('Failed to save deload state:', e);
      });
      return { ...state, deloadState: newDeloadState };
    }

    case 'END_DELOAD_WEEK': {
      const endedDeloadState: DeloadState = {
        ...state.deloadState,
        isInDeloadWeek: false,
        deloadStartDate: null,
        lastDeloadDate: new Date().toISOString(),
        isDismissed: false,
      };
      Storage.setItem('fitness_deload_state', JSON.stringify(endedDeloadState)).catch(e => {
        console.error('Failed to save deload state:', e);
      });
      return { ...state, deloadState: endedDeloadState };
    }

    case 'DISMISS_DELOAD': {
      const dismissedState: DeloadState = {
        ...state.deloadState,
        isDismissed: true,
      };
      Storage.setItem('fitness_deload_state', JSON.stringify(dismissedState)).catch(e => {
        console.error('Failed to save deload state:', e);
      });
      return { ...state, deloadState: dismissedState };
    }

    default:
      return state;
  }
}

// Context type
interface WorkoutContextType {
  state: WorkoutState;
  startWorkout: (name: string, templateId?: string) => Promise<void>;
  endWorkout: () => Promise<void>;
  cancelWorkout: () => void;
  addSet: (set: Omit<WorkoutSet, 'id' | 'createdAt'>) => Promise<WorkoutSet>;
  updateSet: (set: WorkoutSet) => Promise<void>;
  deleteSet: (id: string) => Promise<void>;
  nextExercise: () => void;
  previousExercise: () => void;
  setExerciseIndex: (index: number) => void;
  loadHistory: () => Promise<void>;
  loadTemplates: () => Promise<void>;
  startRestTimer: (seconds: number) => void;
  stopRestTimer: () => void;
  tickRestTimer: () => void;
  repeatWorkout: (workoutId: string) => Promise<void>;
  pauseWorkout: (data: PausedWorkout) => void;
  clearPausedWorkout: () => void;
  startDeloadWeek: () => void;
  endDeloadWeek: () => void;
  dismissDeload: () => void;
  dispatch: React.Dispatch<WorkoutAction>;
}

// Create context
const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

// Provider component
export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(workoutReducer, initialState);

  // Load workout history from storage on mount
  useEffect(() => {
    const loadWorkoutHistory = async () => {
      try {
        const savedHistory = await Storage.getItem('fitness_workout_history');
        if (savedHistory) {
          const history = JSON.parse(savedHistory);
          dispatch({ type: 'LOAD_HISTORY', payload: history });
        }
      } catch (e) {
        console.error('Failed to load workout history:', e);
      }
      try {
        const savedPaused = await Storage.getItem('fitness_paused_workout');
        if (savedPaused) {
          const paused = JSON.parse(savedPaused);
          dispatch({ type: 'PAUSE_WORKOUT', payload: paused });
        }
      } catch (e) {
        console.error('Failed to load paused workout:', e);
      }
      try {
        const savedDeload = await Storage.getItem('fitness_deload_state');
        if (savedDeload) {
          const deload = JSON.parse(savedDeload);
          dispatch({ type: 'SET_DELOAD_STATE', payload: deload });
        }
      } catch (e) {
        console.error('Failed to load deload state:', e);
      }
      loadTemplates();
    };
    loadWorkoutHistory();
  }, []);

  const startWorkout = useCallback(async (name: string, templateId?: string) => {
    const workout = await createWorkout({
      name,
      templateId,
      date: toISODate(),
      startedAt: toISODate(),
    });
    dispatch({ type: 'START_WORKOUT', payload: { workout } });
  }, []);

  const endWorkout = useCallback(async () => {
    if (state.activeWorkout) {
      // Calculate duration
      const startTime = state.activeWorkout.startedAt 
        ? new Date(state.activeWorkout.startedAt).getTime() 
        : Date.now();
      const durationMinutes = Math.round((Date.now() - startTime) / 60000);

      await updateWorkout(state.activeWorkout.id, {
        completedAt: toISODate(),
        durationMinutes,
      });

      // Reload history to include the new workout
      await loadHistory();
    }
    dispatch({ type: 'END_WORKOUT' });
  }, [state.activeWorkout]);

  const cancelWorkout = useCallback(() => {
    dispatch({ type: 'CANCEL_WORKOUT' });
  }, []);

  const addSet = useCallback(async (setData: Omit<WorkoutSet, 'id' | 'createdAt'>) => {
    const newSet = await createWorkoutSet(setData);
    dispatch({ type: 'ADD_SET', payload: newSet });
    return newSet;
  }, []);

  const updateSetAction = useCallback(async (set: WorkoutSet) => {
    await updateWorkoutSet(set.id, set);
    dispatch({ type: 'UPDATE_SET', payload: set });
  }, []);

  const deleteSetAction = useCallback(async (id: string) => {
    await deleteWorkoutSet(id);
    dispatch({ type: 'DELETE_SET', payload: id });
  }, []);

  const nextExercise = useCallback(() => {
    dispatch({ type: 'NEXT_EXERCISE' });
  }, []);

  const previousExercise = useCallback(() => {
    dispatch({ type: 'PREVIOUS_EXERCISE' });
  }, []);

  const setExerciseIndex = useCallback((index: number) => {
    dispatch({ type: 'SET_EXERCISE_INDEX', payload: index });
  }, []);

  const loadHistory = useCallback(async () => {
    const workouts = await getAllWorkouts();
    dispatch({ type: 'LOAD_HISTORY', payload: workouts });
  }, []);

  const loadTemplates = useCallback(async () => {
    const templates = await getAllTemplates();
    dispatch({ type: 'LOAD_TEMPLATES', payload: templates });
  }, []);

  const startRestTimer = useCallback((seconds: number) => {
    dispatch({ type: 'START_REST_TIMER', payload: seconds });
  }, []);

  const stopRestTimer = useCallback(() => {
    dispatch({ type: 'STOP_REST_TIMER' });
  }, []);

  const tickRestTimer = useCallback(() => {
    dispatch({ type: 'TICK_REST_TIMER' });
  }, []);

  const repeatWorkout = useCallback(async (workoutId: string) => {
    const sets = await getSetsByWorkoutId(workoutId);
    const workout = state.workoutHistory.find(w => w.id === workoutId);
    
    if (workout) {
      const newWorkout = await createWorkout({
        name: workout.name,
        templateId: workout.templateId,
        date: toISODate(),
        startedAt: toISODate(),
        notes: `Repeated from ${workout.date}`,
      });
      
      dispatch({ type: 'START_WORKOUT', payload: { workout: newWorkout } });
    }
  }, [state.workoutHistory]);

  const pauseWorkout = useCallback((data: PausedWorkout) => {
    dispatch({ type: 'PAUSE_WORKOUT', payload: data });
  }, []);

  const clearPausedWorkout = useCallback(() => {
    dispatch({ type: 'CLEAR_PAUSED_WORKOUT' });
  }, []);

  const startDeloadWeek = useCallback(() => {
    dispatch({ type: 'START_DELOAD_WEEK' });
  }, []);

  const endDeloadWeek = useCallback(() => {
    dispatch({ type: 'END_DELOAD_WEEK' });
  }, []);

  const dismissDeload = useCallback(() => {
    dispatch({ type: 'DISMISS_DELOAD' });
  }, []);

  const value: WorkoutContextType = {
    state,
    startWorkout,
    endWorkout,
    cancelWorkout,
    addSet,
    updateSet: updateSetAction,
    deleteSet: deleteSetAction,
    nextExercise,
    previousExercise,
    setExerciseIndex,
    loadHistory,
    loadTemplates,
    startRestTimer,
    stopRestTimer,
    tickRestTimer,
    repeatWorkout,
    pauseWorkout,
    clearPausedWorkout,
    startDeloadWeek,
    endDeloadWeek,
    dismissDeload,
    dispatch,
  };

  return (
    <WorkoutContext.Provider value={value}>
      {children}
    </WorkoutContext.Provider>
  );
}

// Hook to use workout context
export function useWorkout(): WorkoutContextType {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
}

export default WorkoutContext;
