// Tests for TimerContext

import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { TimerProvider, useTimer } from '../TimerContext';

// Set Platform to web so Vibration.vibrate is never called
const originalOS = Platform.OS;
beforeAll(() => {
  (Platform as any).OS = 'web';
});
afterAll(() => {
  (Platform as any).OS = originalOS;
});

describe('TimerContext', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('TimerProvider', () => {
    it('provides default state', () => {
      const { result } = renderHook(() => useTimer(), {
        wrapper: TimerProvider,
      });

      expect(result.current.state.isRunning).toBe(false);
      expect(result.current.state.timeRemaining).toBe(0);
      expect(result.current.state.totalTime).toBe(0);
      expect(result.current.state.exerciseId).toBeUndefined();
    });

    it('provides remainingTime alias', () => {
      const { result } = renderHook(() => useTimer(), {
        wrapper: TimerProvider,
      });

      expect(result.current.state.remainingTime).toBe(0);
    });
  });

  describe('startTimer', () => {
    it('starts timer with duration', () => {
      const { result } = renderHook(() => useTimer(), {
        wrapper: TimerProvider,
      });

      act(() => {
        result.current.startTimer(90);
      });

      expect(result.current.state.isRunning).toBe(true);
      expect(result.current.state.timeRemaining).toBe(90);
      expect(result.current.state.totalTime).toBe(90);
    });

    it('starts timer with exerciseId', () => {
      const { result } = renderHook(() => useTimer(), {
        wrapper: TimerProvider,
      });

      act(() => {
        result.current.startTimer(60, 'exercise-1');
      });

      expect(result.current.state.exerciseId).toBe('exercise-1');
    });

    it('counts down every second', () => {
      const { result } = renderHook(() => useTimer(), {
        wrapper: TimerProvider,
      });

      act(() => {
        result.current.startTimer(5);
      });

      expect(result.current.state.timeRemaining).toBe(5);

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.state.timeRemaining).toBe(4);

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(result.current.state.timeRemaining).toBe(2);
    });

    it('stops running when reaching 0', () => {
      const { result } = renderHook(() => useTimer(), {
        wrapper: TimerProvider,
      });

      act(() => {
        result.current.startTimer(2);
      });

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(result.current.state.timeRemaining).toBe(0);
      expect(result.current.state.isRunning).toBe(false);
    });
  });

  describe('pauseTimer', () => {
    it('pauses running timer', () => {
      const { result } = renderHook(() => useTimer(), {
        wrapper: TimerProvider,
      });

      act(() => {
        result.current.startTimer(60);
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      act(() => {
        result.current.pauseTimer();
      });

      expect(result.current.state.isRunning).toBe(false);
      expect(result.current.state.timeRemaining).toBe(59);
    });

    it('maintains time when paused', () => {
      const { result } = renderHook(() => useTimer(), {
        wrapper: TimerProvider,
      });

      act(() => {
        result.current.startTimer(60);
      });

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      act(() => {
        result.current.pauseTimer();
      });

      const pausedTime = result.current.state.timeRemaining;

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Time should not change while paused
      expect(result.current.state.timeRemaining).toBe(pausedTime);
    });
  });

  describe('resumeTimer', () => {
    it('resumes paused timer', () => {
      const { result } = renderHook(() => useTimer(), {
        wrapper: TimerProvider,
      });

      act(() => {
        result.current.startTimer(60);
      });

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      act(() => {
        result.current.pauseTimer();
      });

      const pausedTime = result.current.state.timeRemaining;

      act(() => {
        result.current.resumeTimer();
      });

      expect(result.current.state.isRunning).toBe(true);

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.state.timeRemaining).toBe(pausedTime - 1);
    });
  });

  describe('resetTimer', () => {
    it('resets timer to total time', () => {
      const { result } = renderHook(() => useTimer(), {
        wrapper: TimerProvider,
      });

      act(() => {
        result.current.startTimer(60);
      });

      act(() => {
        jest.advanceTimersByTime(10000);
      });

      act(() => {
        result.current.resetTimer();
      });

      expect(result.current.state.isRunning).toBe(false);
      expect(result.current.state.timeRemaining).toBe(60);
    });
  });

  describe('stopTimer', () => {
    it('stops timer and resets to initial state', () => {
      const { result } = renderHook(() => useTimer(), {
        wrapper: TimerProvider,
      });

      act(() => {
        result.current.startTimer(60, 'exercise-1');
      });

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      act(() => {
        result.current.stopTimer();
      });

      expect(result.current.state.isRunning).toBe(false);
      expect(result.current.state.timeRemaining).toBe(0);
      expect(result.current.state.totalTime).toBe(0);
      expect(result.current.state.exerciseId).toBeUndefined();
    });
  });

  describe('adjustTimer', () => {
    it('adds time to the timer', () => {
      const { result } = renderHook(() => useTimer(), {
        wrapper: TimerProvider,
      });

      act(() => {
        result.current.startTimer(60);
      });

      act(() => {
        result.current.adjustTimer(15);
      });

      expect(result.current.state.timeRemaining).toBe(75);
    });

    it('subtracts time from the timer', () => {
      const { result } = renderHook(() => useTimer(), {
        wrapper: TimerProvider,
      });

      act(() => {
        result.current.startTimer(60);
      });

      act(() => {
        result.current.adjustTimer(-15);
      });

      expect(result.current.state.timeRemaining).toBe(45);
    });
  });

  describe('useTimer hook', () => {
    it('throws when used outside provider', () => {
      // Silence console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        renderHook(() => useTimer());
      }).toThrow('useTimer must be used within a TimerProvider');

      consoleSpy.mockRestore();
    });
  });
});
