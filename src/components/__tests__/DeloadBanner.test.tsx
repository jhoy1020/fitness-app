// Tests for DeloadBanner component

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { DeloadBanner } from '../DeloadBanner';
import { useWorkout } from '../../context/WorkoutContext';
import { useMesoCycle } from '../../context/MesoCycleContext';
import { analyzeDeloadNeed } from '../../utils/deloadDetection';

// Mock context hooks
jest.mock('../../context/WorkoutContext', () => ({
  useWorkout: jest.fn(),
}));
jest.mock('../../context/MesoCycleContext', () => ({
  useMesoCycle: jest.fn(),
}));
jest.mock('../../utils/deloadDetection', () => ({
  analyzeDeloadNeed: jest.fn(),
}));

const mockUseWorkout = useWorkout as jest.MockedFunction<typeof useWorkout>;
const mockUseMesoCycle = useMesoCycle as jest.MockedFunction<typeof useMesoCycle>;
const mockAnalyzeDeloadNeed = analyzeDeloadNeed as jest.MockedFunction<typeof analyzeDeloadNeed>;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PaperProvider>{children}</PaperProvider>
);

const defaultWorkoutState = {
  workoutHistory: [
    { id: '1', name: 'W1', date: '2026-02-20' },
    { id: '2', name: 'W2', date: '2026-02-21' },
    { id: '3', name: 'W3', date: '2026-02-22' },
    { id: '4', name: 'W4', date: '2026-02-23' },
  ],
  deloadState: {
    lastAnalysis: null,
    lastDeloadDate: null,
    isDismissed: false,
    isInDeloadWeek: false,
    deloadStartDate: null,
  },
  activeWorkout: null,
  activeSets: [],
  currentExerciseIndex: 0,
  isRestTimerRunning: false,
  restTimeRemaining: 0,
  templates: [],
  pausedWorkout: null,
};

const defaultMesoState = {
  activeMesoCycle: null,
  mesoCycleHistory: [],
  weeklyVolume: {},
  muscleFatigue: {},
  workoutFeedback: [],
  availablePrograms: [],
};

const noDeloadRecommendation = {
  needsDeload: false,
  confidence: 15,
  signals: [],
  summary: "You're recovering well. Keep pushing!",
  suggestedDuration: 7,
  suggestedVolumeReduction: 0.5,
  suggestedIntensityReduction: 0.4,
  weeksSinceLastDeload: 2,
};

const deloadRecommendation = {
  needsDeload: true,
  confidence: 65,
  signals: [
    { signal: 'Rising Fatigue', description: 'Fatigue trending up', severity: 'medium' as const, value: 4, threshold: 3.5 },
    { signal: 'Stalled Progress', description: '3/5 exercises stalled', severity: 'medium' as const, value: 60, threshold: 40 },
  ],
  summary: 'Your body is showing signs of fatigue accumulation.',
  suggestedDuration: 7,
  suggestedVolumeReduction: 0.5,
  suggestedIntensityReduction: 0.35,
  weeksSinceLastDeload: 5,
};

describe('DeloadBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMesoCycle.mockReturnValue({
      state: defaultMesoState,
    } as any);
  });

  describe('hidden states', () => {
    it('returns null when not enough workout history', () => {
      mockUseWorkout.mockReturnValue({
        state: {
          ...defaultWorkoutState,
          workoutHistory: [{ id: '1', name: 'W1', date: '2026-02-20' }],
        },
        startDeloadWeek: jest.fn(),
        endDeloadWeek: jest.fn(),
        dismissDeload: jest.fn(),
      } as any);
      mockAnalyzeDeloadNeed.mockReturnValue(noDeloadRecommendation);

      render(<DeloadBanner />, { wrapper });
      // With < 4 workouts, the banner should not show deload content
      expect(screen.queryByText('Deload Recommended')).toBeNull();
      expect(screen.queryByText('Deload Week Active')).toBeNull();
    });

    it('returns null when deload is not needed', () => {
      mockUseWorkout.mockReturnValue({
        state: defaultWorkoutState,
        startDeloadWeek: jest.fn(),
        endDeloadWeek: jest.fn(),
        dismissDeload: jest.fn(),
      } as any);
      mockAnalyzeDeloadNeed.mockReturnValue(noDeloadRecommendation);

      render(<DeloadBanner />, { wrapper });
      expect(screen.queryByText('Deload Recommended')).toBeNull();
      expect(screen.queryByText('Deload Week Active')).toBeNull();
    });

    it('returns null when deload is dismissed', () => {
      mockUseWorkout.mockReturnValue({
        state: {
          ...defaultWorkoutState,
          deloadState: { ...defaultWorkoutState.deloadState, isDismissed: true },
        },
        startDeloadWeek: jest.fn(),
        endDeloadWeek: jest.fn(),
        dismissDeload: jest.fn(),
      } as any);
      mockAnalyzeDeloadNeed.mockReturnValue(deloadRecommendation);

      render(<DeloadBanner />, { wrapper });
      expect(screen.queryByText('Deload Recommended')).toBeNull();
    });
  });

  describe('deload recommendation state', () => {
    beforeEach(() => {
      mockUseWorkout.mockReturnValue({
        state: defaultWorkoutState,
        startDeloadWeek: jest.fn(),
        endDeloadWeek: jest.fn(),
        dismissDeload: jest.fn(),
      } as any);
      mockAnalyzeDeloadNeed.mockReturnValue(deloadRecommendation);
    });

    it('shows "Deload Recommended" when deload is needed', () => {
      render(<DeloadBanner />, { wrapper });
      expect(screen.getByText('Deload Recommended')).toBeTruthy();
    });

    it('shows confidence percentage', () => {
      render(<DeloadBanner />, { wrapper });
      expect(screen.getByText(/65% confidence/)).toBeTruthy();
    });

    it('shows signal count', () => {
      render(<DeloadBanner />, { wrapper });
      expect(screen.getByText(/2 signals detected/)).toBeTruthy();
    });

    it('shows recommendation summary', () => {
      render(<DeloadBanner />, { wrapper });
      expect(screen.getByText(/showing signs of fatigue/)).toBeTruthy();
    });
  });

  describe('active deload state', () => {
    it('shows "Deload Week Active" when in deload week', () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 2);
      
      mockUseWorkout.mockReturnValue({
        state: {
          ...defaultWorkoutState,
          deloadState: {
            ...defaultWorkoutState.deloadState,
            isInDeloadWeek: true,
            deloadStartDate: startDate.toISOString(),
          },
        },
        startDeloadWeek: jest.fn(),
        endDeloadWeek: jest.fn(),
        dismissDeload: jest.fn(),
      } as any);
      mockAnalyzeDeloadNeed.mockReturnValue(deloadRecommendation);

      render(<DeloadBanner />, { wrapper });
      expect(screen.getByText('Deload Week Active')).toBeTruthy();
    });

    it('shows deload tips', () => {
      mockUseWorkout.mockReturnValue({
        state: {
          ...defaultWorkoutState,
          deloadState: {
            ...defaultWorkoutState.deloadState,
            isInDeloadWeek: true,
            deloadStartDate: new Date().toISOString(),
          },
        },
        startDeloadWeek: jest.fn(),
        endDeloadWeek: jest.fn(),
        dismissDeload: jest.fn(),
      } as any);
      mockAnalyzeDeloadNeed.mockReturnValue(deloadRecommendation);

      render(<DeloadBanner />, { wrapper });
      expect(screen.getByText(/Reduce weight by ~35%/)).toBeTruthy();
    });

    it('calls endDeloadWeek when End button is pressed', () => {
      const endDeloadWeek = jest.fn();
      mockUseWorkout.mockReturnValue({
        state: {
          ...defaultWorkoutState,
          deloadState: {
            ...defaultWorkoutState.deloadState,
            isInDeloadWeek: true,
            deloadStartDate: new Date().toISOString(),
          },
        },
        startDeloadWeek: jest.fn(),
        endDeloadWeek,
        dismissDeload: jest.fn(),
      } as any);
      mockAnalyzeDeloadNeed.mockReturnValue(deloadRecommendation);

      render(<DeloadBanner />, { wrapper });
      fireEvent.press(screen.getByText('End'));
      expect(endDeloadWeek).toHaveBeenCalledTimes(1);
    });
  });
});
