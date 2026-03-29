// Tests for ProgramCard component

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ProgramCard } from '../ProgramCard';

const mockTheme = {
  colors: {
    primary: '#6750A4',
    secondary: '#625B71',
    tertiary: '#7D5260',
    outline: '#79747E',
    surfaceVariant: '#49454F',
    onSurfaceVariant: '#CAC4D0',
    onPrimary: '#FFFFFF',
    onSurface: '#E6E1E5',
    error: '#F2B8B5',
    elevation: {
      level2: '#2B2930',
    },
  },
};

const mockMesoCycle = {
  id: 'meso-1',
  name: 'Push/Pull/Legs',
  currentWeek: 3,
  totalWeeks: 6,
  completedWorkouts: 12,
  totalWorkouts: 24,
  weeks: [
    { isDeload: false },
    { isDeload: false },
    { isDeload: false },
    { isDeload: false },
    { isDeload: false },
    { isDeload: true },
  ],
};

const mockNextWorkout = {
  name: 'Push Day A',
  dayNumber: 1,
  totalDays: 6,
  dayType: 'workout',
};

const defaultProps = {
  activeMesoCycle: mockMesoCycle,
  nextWorkout: mockNextWorkout,
  pausedWorkout: null,
  theme: mockTheme,
  onStartWorkout: jest.fn(),
  onResumeWorkout: jest.fn(),
  onDiscardPausedWorkout: jest.fn(),
  onStopProgram: jest.fn(),
};

describe('ProgramCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('renders without crashing', () => {
      render(<ProgramCard {...defaultProps} />);
    });

    it('displays program name', () => {
      render(<ProgramCard {...defaultProps} />);
      expect(screen.getByText('Push/Pull/Legs')).toBeTruthy();
    });

    it('displays week progress text', () => {
      render(<ProgramCard {...defaultProps} />);
      expect(screen.getByText(/Week 3\/6/)).toBeTruthy();
    });

    it('displays workout count', () => {
      render(<ProgramCard {...defaultProps} />);
      expect(screen.getByText(/Workouts 12\/24/)).toBeTruthy();
    });

    it('shows Stop Program button', () => {
      render(<ProgramCard {...defaultProps} />);
      expect(screen.getByText('Stop Program')).toBeTruthy();
    });
  });

  describe('workout button types', () => {
    it('shows "Start Workout" for workout day type', () => {
      render(<ProgramCard {...defaultProps} />);
      expect(screen.getByText('Start Workout')).toBeTruthy();
    });

    it('shows "Rest Day" for rest day type', () => {
      render(
        <ProgramCard
          {...defaultProps}
          nextWorkout={{ ...mockNextWorkout, dayType: 'rest' }}
        />
      );
      expect(screen.getByText('Rest Day')).toBeTruthy();
    });

    it('shows "Start Cardio" for cardio day type', () => {
      render(
        <ProgramCard
          {...defaultProps}
          nextWorkout={{ ...mockNextWorkout, dayType: 'cardio' }}
        />
      );
      expect(screen.getByText('Start Cardio')).toBeTruthy();
    });

    it('shows "Start Recovery" for active recovery day type', () => {
      render(
        <ProgramCard
          {...defaultProps}
          nextWorkout={{ ...mockNextWorkout, dayType: 'active_recovery' }}
        />
      );
      expect(screen.getByText('Start Recovery')).toBeTruthy();
    });
  });

  describe('deload week', () => {
    it('shows deload badge when current week is deload', () => {
      const deloadMeso = {
        ...mockMesoCycle,
        currentWeek: 6,
        weeks: mockMesoCycle.weeks,
      };
      render(
        <ProgramCard
          {...defaultProps}
          activeMesoCycle={deloadMeso}
        />
      );
      expect(screen.getByText('Deload Week')).toBeTruthy();
    });

    it('does not show deload badge on regular weeks', () => {
      render(<ProgramCard {...defaultProps} />);
      expect(screen.queryByText('Deload Week')).toBeNull();
    });
  });

  describe('paused workout state', () => {
    it('shows paused workout info when workout is paused', () => {
      render(
        <ProgramCard
          {...defaultProps}
          pausedWorkout={{
            workoutName: 'Push Day A',
            exercises: [{ id: 'e1' }, { id: 'e2' }, { id: 'e3' }],
            isProgramWorkout: true,
          }}
        />
      );
      expect(screen.getByText('Push Day A')).toBeTruthy();
      expect(screen.getByText(/3 exercises/)).toBeTruthy();
    });

    it('shows Resume button when workout is paused', () => {
      render(
        <ProgramCard
          {...defaultProps}
          pausedWorkout={{
            workoutName: 'Push Day A',
            exercises: [{ id: 'e1' }],
            isProgramWorkout: true,
          }}
        />
      );
      expect(screen.getByText('Resume Workout')).toBeTruthy();
    });

    it('shows Discard button when workout is paused', () => {
      render(
        <ProgramCard
          {...defaultProps}
          pausedWorkout={{
            workoutName: 'Push Day A',
            exercises: [{ id: 'e1' }],
            isProgramWorkout: true,
          }}
        />
      );
      expect(screen.getByText('Discard')).toBeTruthy();
    });
  });

  describe('interactions', () => {
    it('calls onStartWorkout when Start button is pressed', () => {
      const onStartWorkout = jest.fn();
      render(
        <ProgramCard {...defaultProps} onStartWorkout={onStartWorkout} />
      );
      fireEvent.press(screen.getByText('Start Workout'));
      expect(onStartWorkout).toHaveBeenCalledTimes(1);
    });

    it('calls onStopProgram when Stop button is pressed', () => {
      const onStopProgram = jest.fn();
      render(
        <ProgramCard {...defaultProps} onStopProgram={onStopProgram} />
      );
      fireEvent.press(screen.getByText('Stop Program'));
      expect(onStopProgram).toHaveBeenCalledTimes(1);
    });

    it('calls onResumeWorkout when Resume button is pressed', () => {
      const onResumeWorkout = jest.fn();
      render(
        <ProgramCard
          {...defaultProps}
          onResumeWorkout={onResumeWorkout}
          pausedWorkout={{
            workoutName: 'Push Day A',
            exercises: [{ id: 'e1' }],
            isProgramWorkout: true,
          }}
        />
      );
      fireEvent.press(screen.getByText('Resume Workout'));
      expect(onResumeWorkout).toHaveBeenCalledTimes(1);
    });

    it('calls onDiscardPausedWorkout when Discard button is pressed', () => {
      const onDiscardPausedWorkout = jest.fn();
      render(
        <ProgramCard
          {...defaultProps}
          onDiscardPausedWorkout={onDiscardPausedWorkout}
          pausedWorkout={{
            workoutName: 'Push Day A',
            exercises: [{ id: 'e1' }],
            isProgramWorkout: true,
          }}
        />
      );
      fireEvent.press(screen.getByText('Discard'));
      expect(onDiscardPausedWorkout).toHaveBeenCalledTimes(1);
    });
  });

  describe('next workout info', () => {
    it('shows day number and name', () => {
      render(<ProgramCard {...defaultProps} />);
      expect(screen.getByText(/Day 1\/6 — Push Day A/)).toBeTruthy();
    });

    it('handles null nextWorkout', () => {
      const { toJSON } = render(
        <ProgramCard {...defaultProps} nextWorkout={null} />
      );
      expect(toJSON()).toBeTruthy();
    });
  });
});
