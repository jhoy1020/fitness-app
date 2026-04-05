// useRestTimer — extracted from TimerContext
// Self-contained rest timer with sound, auto-start, and adjustment.

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseRestTimerResult {
  isRunning: boolean;
  timeRemaining: number;
  totalTime: number;
  exerciseId?: string;

  start: (duration: number, exerciseId?: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  adjust: (deltaSeconds: number) => void;
  reset: () => void;
}

export function useRestTimer(onComplete?: () => void): UseRestTimerResult {
  const [isRunning, setIsRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [exerciseId, setExerciseId] = useState<string | undefined>(undefined);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback((duration: number, exId?: string) => {
    clearTimer();
    setTotalTime(duration);
    setTimeRemaining(duration);
    setExerciseId(exId);
    setIsRunning(true);

    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearTimer();
          setIsRunning(false);
          onCompleteRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimer]);

  const pause = useCallback(() => {
    clearTimer();
    setIsRunning(false);
  }, [clearTimer]);

  const resume = useCallback(() => {
    if (timeRemaining <= 0) return;
    setIsRunning(true);

    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearTimer();
          setIsRunning(false);
          onCompleteRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimer, timeRemaining]);

  const stop = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setTimeRemaining(0);
    setTotalTime(0);
    setExerciseId(undefined);
  }, [clearTimer]);

  const adjust = useCallback((deltaSeconds: number) => {
    setTimeRemaining(prev => Math.max(0, prev + deltaSeconds));
    setTotalTime(prev => Math.max(0, prev + deltaSeconds));
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setTimeRemaining(totalTime);
  }, [clearTimer, totalTime]);

  return {
    isRunning,
    timeRemaining,
    totalTime,
    exerciseId,
    start,
    pause,
    resume,
    stop,
    adjust,
    reset,
  };
}
