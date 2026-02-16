// Timer Context - Manages rest timer state

import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { Platform, Vibration } from 'react-native';
import type { TimerState, TimerAction } from '../types';
import { TIMER } from '../utils/constants';

// Initial state
const initialState: TimerState = {
  isRunning: false,
  timeRemaining: 0,
  totalTime: 0,
  exerciseId: undefined,
};

// Reducer
function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'START':
      return {
        ...state,
        isRunning: true,
        timeRemaining: action.payload.duration,
        totalTime: action.payload.duration,
        exerciseId: action.payload.exerciseId,
      };

    case 'TICK':
      const newTime = state.timeRemaining - 1;
      return {
        ...state,
        timeRemaining: Math.max(0, newTime),
        isRunning: newTime > 0,
      };

    case 'PAUSE':
      return {
        ...state,
        isRunning: false,
      };

    case 'RESUME':
      return {
        ...state,
        isRunning: state.timeRemaining > 0,
      };

    case 'RESET':
      return {
        ...state,
        isRunning: false,
        timeRemaining: state.totalTime,
      };

    case 'STOP':
      return {
        ...initialState,
      };

    case 'ADJUST':
      const adjustedTime = Math.max(TIMER.minRest, Math.min(TIMER.maxRest, state.timeRemaining + action.payload));
      return {
        ...state,
        timeRemaining: adjustedTime,
        totalTime: state.isRunning ? state.totalTime : adjustedTime,
      };

    default:
      return state;
  }
}

// Context type
interface TimerContextType {
  state: TimerState & { remainingTime: number };  // Alias for timeRemaining
  startTimer: (duration: number, exerciseId?: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  stopTimer: () => void;
  adjustTimer: (seconds: number) => void;
  dispatch: React.Dispatch<TimerAction>;
}

// Create context
const TimerContext = createContext<TimerContextType | undefined>(undefined);

// Provider component
export function TimerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(timerReducer, initialState);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const alertedRef = useRef<Set<number>>(new Set());

  // Handle timer tick
  useEffect(() => {
    if (state.isRunning) {
      intervalRef.current = setInterval(() => {
        dispatch({ type: 'TICK' });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isRunning]);

  // Handle alerts at specific times
  useEffect(() => {
    if (state.isRunning) {
      // Check if we should alert
      if (TIMER.alertAt.includes(state.timeRemaining) && !alertedRef.current.has(state.timeRemaining)) {
        alertedRef.current.add(state.timeRemaining);
        
        // Vibrate on mobile
        if (Platform.OS !== 'web') {
          if (state.timeRemaining === 0) {
            // Long vibration when done
            Vibration.vibrate([0, 500, 200, 500]);
          } else {
            // Short vibration for warning
            Vibration.vibrate(200);
          }
        }
        
        // Play sound (would use react-native-sound on native)
        if (Platform.OS === 'web' && state.timeRemaining === 0) {
          try {
            // Simple beep using Web Audio API
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.value = 0.3;
            
            oscillator.start();
            setTimeout(() => oscillator.stop(), 200);
          } catch (e) {
            // Audio not supported or blocked
          }
        }
      }
    } else {
      // Reset alerts when timer stops
      alertedRef.current.clear();
    }
  }, [state.timeRemaining, state.isRunning]);

  const startTimer = useCallback((duration: number, exerciseId?: string) => {
    alertedRef.current.clear();
    dispatch({ type: 'START', payload: { duration, exerciseId } });
  }, []);

  const pauseTimer = useCallback(() => {
    dispatch({ type: 'PAUSE' });
  }, []);

  const resumeTimer = useCallback(() => {
    dispatch({ type: 'RESUME' });
  }, []);

  const resetTimer = useCallback(() => {
    alertedRef.current.clear();
    dispatch({ type: 'RESET' });
  }, []);

  const stopTimer = useCallback(() => {
    alertedRef.current.clear();
    dispatch({ type: 'STOP' });
  }, []);

  const adjustTimer = useCallback((seconds: number) => {
    dispatch({ type: 'ADJUST', payload: seconds });
  }, []);

  const value: TimerContextType = {
    state: { ...state, remainingTime: state.timeRemaining },
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    stopTimer,
    adjustTimer,
    dispatch,
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
}

// Hook to use timer context
export function useTimer(): TimerContextType {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
}

export default TimerContext;
