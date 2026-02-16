// MesoCycle Context - Manages periodization, volume tracking, and auto-regulation

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type {
  MesoCycle,
  MesoCycleState,
  MesoCycleAction,
  MuscleGroup,
  MuscleFatigue,
  WorkoutFeedback,
  TrainingProgram,
  MesoCycleWeek,
  MuscleVolumeTracker,
} from '../types';
import { VOLUME_LANDMARKS, MESOCYCLE, VOLUME_ADJUSTMENTS } from '../utils/constants';

// All muscle groups
const ALL_MUSCLES: MuscleGroup[] = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
  'quadriceps', 'hamstrings', 'glutes', 'calves', 'core'
];

// Initialize empty volume tracking
const initializeVolumeTracking = (): Record<MuscleGroup, number> => {
  const tracking: Partial<Record<MuscleGroup, number>> = {};
  ALL_MUSCLES.forEach(muscle => {
    tracking[muscle] = 0;
  });
  return tracking as Record<MuscleGroup, number>;
};

// Initialize fatigue tracking
const initializeFatigueTracking = (): Record<MuscleGroup, MuscleFatigue> => {
  const fatigue: Partial<Record<MuscleGroup, MuscleFatigue>> = {};
  ALL_MUSCLES.forEach(muscle => {
    fatigue[muscle] = {
      muscleGroup: muscle,
      currentFatigue: 0,
      recoveryRate: 15, // Default 15 points per day
      consecutiveHardSessions: 0,
      needsDeload: false,
    };
  });
  return fatigue as Record<MuscleGroup, MuscleFatigue>;
};

// Initial state
const initialState: MesoCycleState = {
  activeMesoCycle: null,
  mesoCycleHistory: [],
  weeklyVolume: initializeVolumeTracking(),
  muscleFatigue: initializeFatigueTracking(),
  workoutFeedback: [],
  availablePrograms: [],
};

// Load state from localStorage
const loadStateFromStorage = (): MesoCycleState => {
  try {
    const stored = localStorage.getItem('mesocycleState');
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...initialState,
        ...parsed,
        weeklyVolume: parsed.weeklyVolume || initializeVolumeTracking(),
        muscleFatigue: parsed.muscleFatigue || initializeFatigueTracking(),
      };
    }
  } catch (e) {
    console.error('Failed to load mesocycle state:', e);
  }
  return initialState;
};

// Save state to localStorage
const saveStateToStorage = (state: MesoCycleState) => {
  try {
    localStorage.setItem('mesocycleState', JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save mesocycle state:', e);
  }
};

// Reducer
function mesoCycleReducer(state: MesoCycleState, action: MesoCycleAction): MesoCycleState {
  let newState: MesoCycleState;
  
  switch (action.type) {
    case 'CREATE_MESOCYCLE':
      newState = {
        ...state,
        mesoCycleHistory: [...state.mesoCycleHistory, action.payload],
      };
      break;

    case 'START_MESOCYCLE': {
      const meso = state.mesoCycleHistory.find(m => m.id === action.payload);
      if (meso) {
        const activeMeso = { ...meso, status: 'active' as const, currentWeek: 1 };
        newState = {
          ...state,
          activeMesoCycle: activeMeso,
          weeklyVolume: initializeVolumeTracking(),
          mesoCycleHistory: state.mesoCycleHistory.map(m =>
            m.id === action.payload ? activeMeso : m
          ),
        };
      } else {
        newState = state;
      }
      break;
    }

    case 'COMPLETE_MESOCYCLE': {
      if (state.activeMesoCycle?.id === action.payload) {
        const completedMeso = { ...state.activeMesoCycle, status: 'completed' as const, endDate: new Date().toISOString() };
        newState = {
          ...state,
          activeMesoCycle: null,
          mesoCycleHistory: state.mesoCycleHistory.map(m =>
            m.id === action.payload ? completedMeso : m
          ),
          weeklyVolume: initializeVolumeTracking(),
        };
      } else {
        newState = state;
      }
      break;
    }

    case 'ABANDON_MESOCYCLE': {
      if (state.activeMesoCycle?.id === action.payload) {
        const abandonedMeso = { ...state.activeMesoCycle, status: 'abandoned' as const, endDate: new Date().toISOString() };
        newState = {
          ...state,
          activeMesoCycle: null,
          mesoCycleHistory: state.mesoCycleHistory.map(m =>
            m.id === action.payload ? abandonedMeso : m
          ),
          weeklyVolume: initializeVolumeTracking(),
        };
      } else {
        newState = state;
      }
      break;
    }

    case 'ADVANCE_WEEK': {
      if (!state.activeMesoCycle) {
        newState = state;
        break;
      }
      
      const nextWeek = state.activeMesoCycle.currentWeek + 1;
      
      // Check if mesocycle is complete
      if (nextWeek > state.activeMesoCycle.totalWeeks) {
        const completedMeso = { ...state.activeMesoCycle, status: 'completed' as const, endDate: new Date().toISOString() };
        newState = {
          ...state,
          activeMesoCycle: null,
          mesoCycleHistory: state.mesoCycleHistory.map(m =>
            m.id === completedMeso.id ? completedMeso : m
          ),
          weeklyVolume: initializeVolumeTracking(),
        };
      } else {
        // Advance to next week
        const updatedMeso = {
          ...state.activeMesoCycle,
          currentWeek: nextWeek,
          weeks: state.activeMesoCycle.weeks.map((week, idx) => {
            if (idx === state.activeMesoCycle!.currentWeek - 1) {
              return { ...week, status: 'completed' as const, completedVolume: { ...state.weeklyVolume } };
            }
            if (idx === nextWeek - 1) {
              return { ...week, status: 'in_progress' as const };
            }
            return week;
          }),
        };
        newState = {
          ...state,
          activeMesoCycle: updatedMeso,
          weeklyVolume: initializeVolumeTracking(),
          mesoCycleHistory: state.mesoCycleHistory.map(m =>
            m.id === updatedMeso.id ? updatedMeso : m
          ),
        };
      }
      break;
    }

    case 'UPDATE_WEEK_VOLUME':
      newState = {
        ...state,
        weeklyVolume: {
          ...state.weeklyVolume,
          [action.payload.muscleGroup]: state.weeklyVolume[action.payload.muscleGroup] + action.payload.sets,
        },
      };
      break;

    case 'RESET_WEEKLY_VOLUME':
      newState = {
        ...state,
        weeklyVolume: initializeVolumeTracking(),
      };
      break;

    case 'ADD_WORKOUT_FEEDBACK':
      newState = {
        ...state,
        workoutFeedback: [action.payload, ...state.workoutFeedback].slice(0, 100), // Keep last 100
      };
      break;

    case 'UPDATE_FATIGUE':
      newState = {
        ...state,
        muscleFatigue: {
          ...state.muscleFatigue,
          [action.payload.muscleGroup]: action.payload.fatigue,
        },
      };
      break;

    case 'TRIGGER_DELOAD': {
      if (!state.activeMesoCycle) {
        newState = state;
        break;
      }
      
      // Find or create deload week
      const currentWeekIdx = state.activeMesoCycle.currentWeek - 1;
      const updatedWeeks = [...state.activeMesoCycle.weeks];
      updatedWeeks[currentWeekIdx] = {
        ...updatedWeeks[currentWeekIdx],
        isDeload: true,
        targetVolume: Object.fromEntries(
          ALL_MUSCLES.map(m => [m, Math.round(VOLUME_LANDMARKS[m].MV)])
        ) as Record<MuscleGroup, number>,
      };
      
      newState = {
        ...state,
        activeMesoCycle: {
          ...state.activeMesoCycle,
          weeks: updatedWeeks,
        },
        muscleFatigue: initializeFatigueTracking(), // Reset fatigue on deload
      };
      break;
    }

    case 'LOAD_MESOCYCLE_HISTORY':
      newState = {
        ...state,
        mesoCycleHistory: action.payload,
        activeMesoCycle: action.payload.find(m => m.status === 'active') || null,
      };
      break;

    case 'UPDATE_MESOCYCLE': {
      newState = {
        ...state,
        activeMesoCycle: action.payload,
        mesoCycleHistory: state.mesoCycleHistory.map(m => 
          m.id === action.payload.id ? action.payload : m
        ),
      };
      break;
    }
    case 'RECORD_WORKOUT_COMPLETION': {
      if (!state.activeMesoCycle) {
        newState = state;
        break;
      }
      
      const { workoutId, volumeByMuscle } = action.payload;
      const newCompletedWorkouts = (state.activeMesoCycle.completedWorkouts || 0) + 1;
      
      // Update weekly volume
      const newWeeklyVolume = { ...state.weeklyVolume };
      Object.entries(volumeByMuscle).forEach(([muscle, sets]) => {
        if (muscle in newWeeklyVolume) {
          newWeeklyVolume[muscle as MuscleGroup] = (newWeeklyVolume[muscle as MuscleGroup] || 0) + sets;
        }
      });
      
      // Update fatigue based on volume
      const newFatigue = { ...state.muscleFatigue };
      Object.entries(volumeByMuscle).forEach(([muscle, sets]) => {
        if (muscle in newFatigue) {
          const currentFatigue = newFatigue[muscle as MuscleGroup];
          newFatigue[muscle as MuscleGroup] = {
            ...currentFatigue,
            currentFatigue: Math.min(100, currentFatigue.currentFatigue + (sets * 5)),
            consecutiveHardSessions: sets > 4 ? currentFatigue.consecutiveHardSessions + 1 : 0,
            needsDeload: currentFatigue.currentFatigue > 70,
          };
        }
      });
      
      // Check if week should advance (completed all workouts for the week)
      const currentWeek = state.activeMesoCycle.weeks[state.activeMesoCycle.currentWeek - 1];
      const workoutsPerWeek = state.activeMesoCycle.totalWorkouts / state.activeMesoCycle.totalWeeks;
      const workoutsThisWeek = newCompletedWorkouts % workoutsPerWeek;
      
      let updatedMeso = {
        ...state.activeMesoCycle,
        completedWorkouts: newCompletedWorkouts,
        weeks: state.activeMesoCycle.weeks.map((week, idx) => {
          if (idx === state.activeMesoCycle!.currentWeek - 1) {
            return {
              ...week,
              workoutIds: [...week.workoutIds, workoutId],
              completedVolume: newWeeklyVolume,
            };
          }
          return week;
        }),
      };
      
      // Auto-advance week if all workouts done
      if (workoutsThisWeek === 0 && newCompletedWorkouts > 0) {
        const nextWeek = state.activeMesoCycle.currentWeek + 1;
        if (nextWeek <= state.activeMesoCycle.totalWeeks) {
          updatedMeso = {
            ...updatedMeso,
            currentWeek: nextWeek,
            weeks: updatedMeso.weeks.map((week, idx) => {
              if (idx === state.activeMesoCycle!.currentWeek - 1) {
                return { ...week, status: 'completed' };
              }
              if (idx === nextWeek - 1) {
                return { ...week, status: 'in_progress' };
              }
              return week;
            }),
          };
        }
      }
      
      newState = {
        ...state,
        activeMesoCycle: updatedMeso,
        weeklyVolume: newWeeklyVolume,
        muscleFatigue: newFatigue,
        mesoCycleHistory: state.mesoCycleHistory.map(m =>
          m.id === updatedMeso.id ? updatedMeso : m
        ),
      };
      break;
    }

    case 'LOAD_PROGRAMS':
      newState = {
        ...state,
        availablePrograms: action.payload,
      };
      break;

    case 'START_PROGRAM': {
      const { program, startDate } = action.payload;
      
      // Generate mesocycle from program
      const mesoCycle = createMesoCycleFromProgram(program, startDate);
      
      newState = {
        ...state,
        activeMesoCycle: mesoCycle,
        mesoCycleHistory: [...state.mesoCycleHistory, mesoCycle],
        weeklyVolume: initializeVolumeTracking(),
      };
      break;
    }

    default:
      newState = state;
  }
  
  // Persist to localStorage
  saveStateToStorage(newState);
  return newState;
}

// Helper: Create mesocycle from program template
function createMesoCycleFromProgram(program: TrainingProgram, startDate: string): MesoCycle {
  const weeks: MesoCycleWeek[] = [];
  
  for (let i = 0; i < program.durationWeeks; i++) {
    const isDeload = i === program.durationWeeks - 1;
    const weekMultiplier = isDeload ? MESOCYCLE.deloadVolumePercent : 1 + (i * 0.1);
    
    const targetVolume = Object.fromEntries(
      ALL_MUSCLES.map(muscle => {
        const landmark = VOLUME_LANDMARKS[muscle];
        const baseVolume = landmark.MEV * program.startingVolumeMultiplier;
        const weekVolume = isDeload ? landmark.MV : Math.min(
          baseVolume + (i * program.volumeProgressionPerWeek),
          landmark.MRV
        );
        return [muscle, Math.round(weekVolume)];
      })
    ) as Record<MuscleGroup, number>;
    
    weeks.push({
      weekNumber: i + 1,
      isDeload,
      targetVolume,
      completedVolume: initializeVolumeTracking(),
      workoutIds: [],
      status: i === 0 ? 'in_progress' : 'upcoming',
    });
  }
  
  return {
    id: Date.now().toString(),
    name: program.name,
    description: program.description,
    startDate,
    status: 'active',
    totalWeeks: program.durationWeeks,
    currentWeek: 1,
    weeks,
    musclePriorities: program.musclePriorities,
    weeklyFrequency: program.weeklyFrequency,
    startingVolume: Object.fromEntries(
      ALL_MUSCLES.map(m => [m, Math.round(VOLUME_LANDMARKS[m].MEV * program.startingVolumeMultiplier)])
    ) as Record<MuscleGroup, number>,
    volumeProgressionPerWeek: program.volumeProgressionPerWeek,
    programId: program.id,
    programName: program.name,
    weekTemplate: program.weekTemplate,
    totalWorkouts: program.durationWeeks * program.daysPerWeek,
    completedWorkouts: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Context type
interface MesoCycleContextType {
  state: MesoCycleState;
  dispatch: React.Dispatch<MesoCycleAction>;
  
  // Helpers
  createMesoCycle: (name: string, weeks: number, priorities?: Record<MuscleGroup, 'focus' | 'normal' | 'maintain'>) => MesoCycle;
  getVolumeStatus: (muscleGroup: MuscleGroup) => MuscleVolumeTracker;
  getVolumeRecommendation: (muscleGroup: MuscleGroup) => number;
  shouldTriggerDeload: () => boolean;
  calculateNextWeekVolume: (feedback: WorkoutFeedback) => Record<MuscleGroup, number>;
  addSetsToVolume: (muscleGroup: MuscleGroup, sets: number) => void;
  submitWorkoutFeedback: (feedback: Omit<WorkoutFeedback, 'id' | 'totalScore'>) => void;
}

// Create context
const MesoCycleContext = createContext<MesoCycleContextType | undefined>(undefined);

// Provider component
export function MesoCycleProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(mesoCycleReducer, initialState, loadStateFromStorage);

  // Create a new mesocycle
  const createMesoCycle = useCallback((
    name: string,
    weeks: number,
    priorities?: Record<MuscleGroup, 'focus' | 'normal' | 'maintain'>
  ): MesoCycle => {
    const defaultPriorities = Object.fromEntries(
      ALL_MUSCLES.map(m => [m, 'normal'])
    ) as Record<MuscleGroup, 'focus' | 'normal' | 'maintain'>;
    
    const musclePriorities = priorities || defaultPriorities;
    
    // Calculate starting volume based on priorities
    const startingVolume = Object.fromEntries(
      ALL_MUSCLES.map(muscle => {
        const landmark = VOLUME_LANDMARKS[muscle];
        const priority = musclePriorities[muscle];
        let volume = landmark.MEV;
        if (priority === 'focus') volume = landmark.MEV + 2;
        if (priority === 'maintain') volume = landmark.MV;
        return [muscle, volume];
      })
    ) as Record<MuscleGroup, number>;
    
    // Build weekly structure
    const mesoWeeks: MesoCycleWeek[] = [];
    for (let i = 0; i < weeks; i++) {
      const isDeload = i === weeks - 1;
      const targetVolume = Object.fromEntries(
        ALL_MUSCLES.map(muscle => {
          const base = startingVolume[muscle];
          if (isDeload) return [muscle, VOLUME_LANDMARKS[muscle].MV];
          return [muscle, Math.min(base + (i * MESOCYCLE.volumeIncreasePerWeek), VOLUME_LANDMARKS[muscle].MRV)];
        })
      ) as Record<MuscleGroup, number>;
      
      mesoWeeks.push({
        weekNumber: i + 1,
        isDeload,
        targetVolume,
        completedVolume: initializeVolumeTracking(),
        workoutIds: [],
        status: 'upcoming',
      });
    }
    
    const mesoCycle: MesoCycle = {
      id: Date.now().toString(),
      name,
      status: 'planned',
      startDate: new Date().toISOString(),
      totalWeeks: weeks,
      currentWeek: 0,
      weeks: mesoWeeks,
      musclePriorities,
      weeklyFrequency: Object.fromEntries(ALL_MUSCLES.map(m => [m, 2])) as Record<MuscleGroup, number>,
      startingVolume,
      volumeProgressionPerWeek: MESOCYCLE.volumeIncreasePerWeek,
      totalWorkouts: 0,
      completedWorkouts: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    dispatch({ type: 'CREATE_MESOCYCLE', payload: mesoCycle });
    return mesoCycle;
  }, []);

  // Get volume status for a muscle group
  const getVolumeStatus = useCallback((muscleGroup: MuscleGroup): MuscleVolumeTracker => {
    const completed = state.weeklyVolume[muscleGroup] || 0;
    const landmarks = VOLUME_LANDMARKS[muscleGroup];
    const currentWeek = state.activeMesoCycle?.weeks[state.activeMesoCycle.currentWeek - 1];
    const target = currentWeek?.targetVolume[muscleGroup] || landmarks.MEV;
    const percentOfMRV = (completed / landmarks.MRV) * 100;
    
    let status: MuscleVolumeTracker['status'] = 'below_mev';
    if (completed >= landmarks.MRV) status = 'at_mrv';
    else if (completed >= landmarks.MRV - 2) status = 'near_mrv';
    else if (completed >= landmarks.MAV[0]) status = 'in_mav';
    else if (completed >= landmarks.MEV) status = 'at_mev';
    
    return {
      muscleGroup,
      setsCompleted: completed,
      targetSets: target,
      percentOfMRV,
      status,
    };
  }, [state.weeklyVolume, state.activeMesoCycle]);

  // Get volume recommendation for this week
  const getVolumeRecommendation = useCallback((muscleGroup: MuscleGroup): number => {
    if (!state.activeMesoCycle) {
      return VOLUME_LANDMARKS[muscleGroup].MEV;
    }
    
    const currentWeek = state.activeMesoCycle.weeks[state.activeMesoCycle.currentWeek - 1];
    return currentWeek?.targetVolume[muscleGroup] || VOLUME_LANDMARKS[muscleGroup].MEV;
  }, [state.activeMesoCycle]);

  // Check if deload should be triggered
  const shouldTriggerDeload = useCallback((): boolean => {
    // Check if multiple muscles are showing high fatigue
    const fatigued = Object.values(state.muscleFatigue).filter(f => f.needsDeload || f.currentFatigue > 80);
    if (fatigued.length >= 3) return true;
    
    // Check recent feedback
    const recentFeedback = state.workoutFeedback.slice(0, 3);
    const avgScore = recentFeedback.reduce((sum, f) => sum + f.totalScore, 0) / recentFeedback.length;
    if (avgScore >= VOLUME_ADJUSTMENTS.thresholds.deload) return true;
    
    return false;
  }, [state.muscleFatigue, state.workoutFeedback]);

  // Calculate next week's volume based on feedback
  const calculateNextWeekVolume = useCallback((feedback: WorkoutFeedback): Record<MuscleGroup, number> => {
    const score = feedback.totalScore;
    let adjustment = 0;
    
    if (score <= VOLUME_ADJUSTMENTS.thresholds.increaseHigh) {
      adjustment = VOLUME_ADJUSTMENTS.setAdjustments.increaseHigh;
    } else if (score <= VOLUME_ADJUSTMENTS.thresholds.increaseLow) {
      adjustment = VOLUME_ADJUSTMENTS.setAdjustments.increaseLow;
    } else if (score === VOLUME_ADJUSTMENTS.thresholds.maintain) {
      adjustment = VOLUME_ADJUSTMENTS.setAdjustments.maintain;
    } else if (score >= VOLUME_ADJUSTMENTS.thresholds.deload) {
      adjustment = VOLUME_ADJUSTMENTS.setAdjustments.deload;
    } else {
      adjustment = VOLUME_ADJUSTMENTS.setAdjustments.decrease;
    }
    
    return Object.fromEntries(
      ALL_MUSCLES.map(muscle => {
        const current = getVolumeRecommendation(muscle);
        const landmarks = VOLUME_LANDMARKS[muscle];
        const newVolume = Math.max(landmarks.MV, Math.min(current + adjustment, landmarks.MRV));
        return [muscle, newVolume];
      })
    ) as Record<MuscleGroup, number>;
  }, [getVolumeRecommendation]);

  // Add sets to weekly volume
  const addSetsToVolume = useCallback((muscleGroup: MuscleGroup, sets: number) => {
    dispatch({ type: 'UPDATE_WEEK_VOLUME', payload: { muscleGroup, sets } });
  }, []);

  // Submit workout feedback
  const submitWorkoutFeedback = useCallback((feedback: Omit<WorkoutFeedback, 'id' | 'totalScore'>) => {
    const totalScore = feedback.pumpRating + feedback.sorenessRating + feedback.performanceRating;
    const fullFeedback: WorkoutFeedback = {
      ...feedback,
      id: Date.now().toString(),
      totalScore,
    };
    dispatch({ type: 'ADD_WORKOUT_FEEDBACK', payload: fullFeedback });
  }, []);

  return (
    <MesoCycleContext.Provider
      value={{
        state,
        dispatch,
        createMesoCycle,
        getVolumeStatus,
        getVolumeRecommendation,
        shouldTriggerDeload,
        calculateNextWeekVolume,
        addSetsToVolume,
        submitWorkoutFeedback,
      }}
    >
      {children}
    </MesoCycleContext.Provider>
  );
}

// Hook
export function useMesoCycle() {
  const context = useContext(MesoCycleContext);
  if (!context) {
    throw new Error('useMesoCycle must be used within a MesoCycleProvider');
  }
  return context;
}

export default MesoCycleContext;
