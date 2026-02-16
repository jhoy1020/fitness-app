// User Context - Manages user profile and goals

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type {
  UserProfile,
  ExerciseGoal,
  NutritionCalculation,
  UserState,
  UserAction,
  BodyMeasurement,
  OneRepMaxRecord,
} from '../types';
import {
  getUserProfile,
  saveUserProfile,
  getAllExerciseGoals,
  saveExerciseGoal,
} from '../services/db';
import { calculateNutrition } from '../utils';

const WEIGHT_HISTORY_KEY = 'fitness_app_weight_history';
const ONE_REP_MAX_KEY = 'fitness_app_one_rep_max';

// Initial state
const initialState: UserState = {
  profile: null,
  exerciseGoals: [],
  nutrition: null,
  weightHistory: [],
  units: 'imperial',
  oneRepMaxRecords: [],
};

// Reducer
function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case 'SET_PROFILE':
      return {
        ...state,
        profile: action.payload,
        nutrition: calculateNutrition(action.payload),
      };

    case 'UPDATE_PROFILE':
      if (!state.profile) return state;
      const updatedProfile = { ...state.profile, ...action.payload };
      return {
        ...state,
        profile: updatedProfile,
        nutrition: calculateNutrition(updatedProfile),
      };

    case 'SET_EXERCISE_GOALS':
      return {
        ...state,
        exerciseGoals: action.payload,
      };

    case 'ADD_EXERCISE_GOAL':
      return {
        ...state,
        exerciseGoals: [...state.exerciseGoals, action.payload],
      };

    case 'UPDATE_EXERCISE_GOAL':
      return {
        ...state,
        exerciseGoals: state.exerciseGoals.map((goal) =>
          goal.exerciseId === action.payload.exerciseId ? action.payload : goal
        ),
      };

    case 'SET_NUTRITION':
      return {
        ...state,
        nutrition: action.payload,
      };

    case 'SET_WEIGHT_HISTORY':
      return {
        ...state,
        weightHistory: action.payload,
      };

    case 'ADD_WEIGHT_ENTRY':
      return {
        ...state,
        weightHistory: [...state.weightHistory, action.payload].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        ),
      };

    case 'SET_ONE_REP_MAX_RECORDS':
      return {
        ...state,
        oneRepMaxRecords: action.payload,
      };

    case 'ADD_ONE_REP_MAX':
      return {
        ...state,
        oneRepMaxRecords: [...state.oneRepMaxRecords.filter(
          r => r.exerciseName.toLowerCase() !== action.payload.exerciseName.toLowerCase()
        ), action.payload],
      };

    case 'UPDATE_ONE_REP_MAX':
      return {
        ...state,
        oneRepMaxRecords: state.oneRepMaxRecords.map(r =>
          r.id === action.payload.id ? action.payload : r
        ),
      };

    case 'DELETE_ONE_REP_MAX':
      return {
        ...state,
        oneRepMaxRecords: state.oneRepMaxRecords.filter(r => r.id !== action.payload),
      };

    default:
      return state;
  }
}

// Context type
interface UserContextType {
  state: UserState;
  loadProfile: () => Promise<void>;
  updateProfile: (profile: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  loadExerciseGoals: () => Promise<void>;
  setExerciseGoal: (goal: Omit<ExerciseGoal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  recalculateNutrition: () => void;
  addWeightEntry: (weight: number, bodyFatPercent?: number) => void;
  loadWeightHistory: () => void;
  // 1RM functions
  addOneRepMax: (exerciseName: string, weight: number, method: 'tested' | 'calculated', notes?: string) => void;
  updateOneRepMax: (record: OneRepMaxRecord) => void;
  deleteOneRepMax: (id: string) => void;
  getOneRepMax: (exerciseName: string) => OneRepMaxRecord | undefined;
}

// Create context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider component
export function UserProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(userReducer, initialState);

  // Load user data on mount
  useEffect(() => {
    loadProfile();
    loadExerciseGoals();
    loadWeightHistory();
    loadOneRepMaxRecords();
  }, []);

  // Persist 1RM records to localStorage
  useEffect(() => {
    if (state.oneRepMaxRecords.length > 0) {
      localStorage.setItem(ONE_REP_MAX_KEY, JSON.stringify(state.oneRepMaxRecords));
    }
  }, [state.oneRepMaxRecords]);

  const loadOneRepMaxRecords = useCallback(() => {
    try {
      const stored = localStorage.getItem(ONE_REP_MAX_KEY);
      if (stored) {
        const records = JSON.parse(stored) as OneRepMaxRecord[];
        dispatch({ type: 'SET_ONE_REP_MAX_RECORDS', payload: records });
      }
    } catch (e) {
      console.error('Failed to load 1RM records:', e);
    }
  }, []);

  const loadWeightHistory = useCallback(() => {
    try {
      const stored = localStorage.getItem(WEIGHT_HISTORY_KEY);
      if (stored) {
        const history = JSON.parse(stored) as BodyMeasurement[];
        dispatch({ type: 'SET_WEIGHT_HISTORY', payload: history });
      }
    } catch (e) {
      console.error('Failed to load weight history:', e);
    }
  }, []);

  const addWeightEntry = useCallback((weight: number, bodyFatPercent?: number) => {
    const entry: BodyMeasurement = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      weight,
      bodyFatPercent,
      createdAt: new Date().toISOString(),
    };
    
    dispatch({ type: 'ADD_WEIGHT_ENTRY', payload: entry });
    
    // Save to localStorage
    try {
      const stored = localStorage.getItem(WEIGHT_HISTORY_KEY);
      const history = stored ? JSON.parse(stored) : [];
      history.push(entry);
      localStorage.setItem(WEIGHT_HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save weight entry:', e);
    }
  }, []);

  const loadProfile = useCallback(async () => {
    const profile = await getUserProfile();
    if (profile) {
      dispatch({ type: 'SET_PROFILE', payload: profile });
    }
  }, []);

  const updateProfile = useCallback(async (profileData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
    const profile = await saveUserProfile(profileData);
    dispatch({ type: 'SET_PROFILE', payload: profile });
  }, []);

  const loadExerciseGoals = useCallback(async () => {
    const goals = await getAllExerciseGoals();
    dispatch({ type: 'SET_EXERCISE_GOALS', payload: goals });
  }, []);

  const setExerciseGoal = useCallback(async (goalData: Omit<ExerciseGoal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const goal = await saveExerciseGoal(goalData);
    
    // Check if goal exists, update or add
    const existingGoal = state.exerciseGoals.find(g => g.exerciseId === goal.exerciseId);
    if (existingGoal) {
      dispatch({ type: 'UPDATE_EXERCISE_GOAL', payload: goal });
    } else {
      dispatch({ type: 'ADD_EXERCISE_GOAL', payload: goal });
    }
  }, [state.exerciseGoals]);

  const recalculateNutrition = useCallback(() => {
    if (state.profile) {
      const nutrition = calculateNutrition(state.profile);
      dispatch({ type: 'SET_NUTRITION', payload: nutrition });
    }
  }, [state.profile]);

  // 1RM Helper Functions
  const addOneRepMax = useCallback((exerciseName: string, weight: number, method: 'tested' | 'calculated', notes?: string) => {
    const record: OneRepMaxRecord = {
      id: Date.now().toString(),
      exerciseName,
      weight,
      unit: 'lbs',
      testedDate: new Date().toISOString(),
      method,
      notes,
    };
    dispatch({ type: 'ADD_ONE_REP_MAX', payload: record });
  }, []);

  const updateOneRepMax = useCallback((record: OneRepMaxRecord) => {
    dispatch({ type: 'UPDATE_ONE_REP_MAX', payload: record });
  }, []);

  const deleteOneRepMax = useCallback((id: string) => {
    dispatch({ type: 'DELETE_ONE_REP_MAX', payload: id });
  }, []);

  const getOneRepMax = useCallback((exerciseName: string): OneRepMaxRecord | undefined => {
    return state.oneRepMaxRecords.find(
      r => r.exerciseName.toLowerCase() === exerciseName.toLowerCase()
    );
  }, [state.oneRepMaxRecords]);

  const value: UserContextType = {
    state,
    loadProfile,
    updateProfile,
    loadExerciseGoals,
    setExerciseGoal,
    recalculateNutrition,
    addWeightEntry,
    loadWeightHistory,
    addOneRepMax,
    updateOneRepMax,
    deleteOneRepMax,
    getOneRepMax,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

// Hook to use user context
export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export default UserContext;
