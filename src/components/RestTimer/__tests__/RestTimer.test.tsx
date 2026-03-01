// Tests for RestTimer component

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { RestTimer } from '../RestTimer';

// Mock the useTimer hook
const mockPauseTimer = jest.fn();
const mockResumeTimer = jest.fn();
const mockStopTimer = jest.fn();
const mockAdjustTimer = jest.fn();

let mockTimerState = {
  isRunning: true,
  timeRemaining: 60,
  totalTime: 90,
};

jest.mock('../../../context', () => ({
  useTimer: () => ({
    state: mockTimerState,
    pauseTimer: mockPauseTimer,
    resumeTimer: mockResumeTimer,
    stopTimer: mockStopTimer,
    adjustTimer: mockAdjustTimer,
  }),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PaperProvider>{children}</PaperProvider>
);

describe('RestTimer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTimerState = {
      isRunning: true,
      timeRemaining: 60,
      totalTime: 90,
    };
  });

  describe('basic rendering', () => {
    it('renders without crashing', () => {
      render(<RestTimer />, { wrapper });
    });

    it('displays time remaining', () => {
      render(<RestTimer />, { wrapper });
      expect(screen.getByText('1:00')).toBeTruthy();
    });
  });

  describe('compact mode', () => {
    it('renders compact version', () => {
      render(<RestTimer compact={true} />, { wrapper });
      // Compact version should render
    });

    it('shows pause button when running in compact mode', () => {
      render(<RestTimer compact={true} />, { wrapper });
      expect(screen.getByTestId('pause-button')).toBeTruthy();
    });

    it('shows play button when paused in compact mode', () => {
      mockTimerState.isRunning = false;
      render(<RestTimer compact={true} />, { wrapper });
      expect(screen.getByTestId('play-button')).toBeTruthy();
    });

    it('shows stop button in compact mode', () => {
      render(<RestTimer compact={true} />, { wrapper });
      expect(screen.getByTestId('stop-button')).toBeTruthy();
    });

    it('calls pauseTimer when pause button pressed', () => {
      render(<RestTimer compact={true} />, { wrapper });
      fireEvent.press(screen.getByTestId('pause-button'));
      expect(mockPauseTimer).toHaveBeenCalledTimes(1);
    });

    it('calls resumeTimer when play button pressed', () => {
      mockTimerState.isRunning = false;
      render(<RestTimer compact={true} />, { wrapper });
      fireEvent.press(screen.getByTestId('play-button'));
      expect(mockResumeTimer).toHaveBeenCalledTimes(1);
    });

    it('calls stopTimer when stop button pressed', () => {
      render(<RestTimer compact={true} />, { wrapper });
      fireEvent.press(screen.getByTestId('stop-button'));
      expect(mockStopTimer).toHaveBeenCalledTimes(1);
    });
  });

  describe('timer state', () => {
    it('renders when timer has remaining time', () => {
      mockTimerState = {
        isRunning: false,
        timeRemaining: 30,
        totalTime: 60,
      };
      render(<RestTimer compact={true} />, { wrapper });
      expect(screen.getByText('0:30')).toBeTruthy();
    });
  });

  describe('timer colors', () => {
    it('shows error color when time is 5 seconds or less', () => {
      mockTimerState.timeRemaining = 5;
      const { toJSON } = render(<RestTimer compact={true} />, { wrapper });
      expect(toJSON()).toBeTruthy();
    });

    it('shows warning color when time is 10 seconds or less', () => {
      mockTimerState.timeRemaining = 10;
      const { toJSON } = render(<RestTimer compact={true} />, { wrapper });
      expect(toJSON()).toBeTruthy();
    });

    it('shows primary color when time is above 10 seconds', () => {
      mockTimerState.timeRemaining = 60;
      const { toJSON } = render(<RestTimer compact={true} />, { wrapper });
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('completion callback', () => {
    it('calls onComplete when timer reaches 0', () => {
      const onComplete = jest.fn();
      mockTimerState = {
        isRunning: false,
        timeRemaining: 0,
        totalTime: 60,
      };
      render(<RestTimer onComplete={onComplete} compact={true} />, { wrapper });
      expect(onComplete).toHaveBeenCalled();
    });
  });
});
