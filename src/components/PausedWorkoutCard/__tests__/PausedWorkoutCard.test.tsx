// Tests for PausedWorkoutCard component

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { PausedWorkoutCard } from '../PausedWorkoutCard';

const mockTheme = {
  colors: {
    primary: '#6750A4',
    onPrimary: '#FFFFFF',
    outline: '#79747E',
    onSurface: '#1D1B20',
    error: '#B3261E',
    elevation: {
      level2: '#2B2930',
    },
  },
};

const defaultProps = {
  workoutName: 'Push Day A',
  exerciseCount: 5,
  pausedAt: new Date().toISOString(),
  theme: mockTheme,
  onResume: jest.fn(),
  onDiscard: jest.fn(),
};

describe('PausedWorkoutCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('renders without crashing', () => {
      render(<PausedWorkoutCard {...defaultProps} />);
    });

    it('displays workout name', () => {
      render(<PausedWorkoutCard {...defaultProps} />);
      expect(screen.getByText('Push Day A')).toBeTruthy();
    });

    it('displays exercise count with correct pluralization', () => {
      render(<PausedWorkoutCard {...defaultProps} exerciseCount={5} />);
      expect(screen.getByText(/5 exercises/)).toBeTruthy();
    });

    it('displays singular exercise text for 1 exercise', () => {
      render(<PausedWorkoutCard {...defaultProps} exerciseCount={1} />);
      expect(screen.getByText(/1 exercise\b/)).toBeTruthy();
    });

    it('displays time ago indicator', () => {
      render(<PausedWorkoutCard {...defaultProps} />);
      expect(screen.getByText(/Paused/)).toBeTruthy();
    });
  });

  describe('time ago formatting', () => {
    it('shows "just now" for very recent pause', () => {
      render(
        <PausedWorkoutCard
          {...defaultProps}
          pausedAt={new Date().toISOString()}
        />
      );
      expect(screen.getByText(/just now/)).toBeTruthy();
    });

    it('shows minutes ago', () => {
      const thirtyMinAgo = new Date(Date.now() - 30 * 60000).toISOString();
      render(
        <PausedWorkoutCard {...defaultProps} pausedAt={thirtyMinAgo} />
      );
      expect(screen.getByText(/30m ago/)).toBeTruthy();
    });

    it('shows hours ago', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60000).toISOString();
      render(
        <PausedWorkoutCard {...defaultProps} pausedAt={twoHoursAgo} />
      );
      expect(screen.getByText(/2h ago/)).toBeTruthy();
    });

    it('shows days ago', () => {
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60000).toISOString();
      render(
        <PausedWorkoutCard {...defaultProps} pausedAt={twoDaysAgo} />
      );
      expect(screen.getByText(/2d ago/)).toBeTruthy();
    });
  });

  describe('button interactions', () => {
    it('calls onResume when Resume button is pressed', () => {
      const onResume = jest.fn();
      render(<PausedWorkoutCard {...defaultProps} onResume={onResume} />);

      fireEvent.press(screen.getByText('Resume Workout'));
      expect(onResume).toHaveBeenCalledTimes(1);
    });

    it('calls onDiscard when Discard button is pressed', () => {
      const onDiscard = jest.fn();
      render(<PausedWorkoutCard {...defaultProps} onDiscard={onDiscard} />);

      fireEvent.press(screen.getByText('Discard'));
      expect(onDiscard).toHaveBeenCalledTimes(1);
    });
  });

  describe('styling', () => {
    it('renders with theme colors', () => {
      const { toJSON } = render(<PausedWorkoutCard {...defaultProps} />);
      expect(toJSON()).toBeTruthy();
    });
  });
});
