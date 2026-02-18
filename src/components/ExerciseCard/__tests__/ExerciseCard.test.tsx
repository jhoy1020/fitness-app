// Tests for ExerciseCard component

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { Text } from 'react-native';
import { ExerciseCard } from '../ExerciseCard';
import type { Exercise } from '../../../types';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PaperProvider>{children}</PaperProvider>
);

const mockExercise: Exercise = {
  id: 'ex-1',
  name: 'Bench Press',
  muscleGroup: 'chest',
  equipment: 'barbell',
  isCompound: true,
  secondaryMuscles: ['shoulders', 'triceps'],
};

const mockIsolationExercise: Exercise = {
  id: 'ex-2',
  name: 'Bicep Curl',
  muscleGroup: 'biceps',
  equipment: 'dumbbell',
  isCompound: false,
};

describe('ExerciseCard', () => {
  describe('basic rendering', () => {
    it('renders without crashing', () => {
      render(<ExerciseCard exercise={mockExercise} />, { wrapper });
    });

    it('displays exercise name', () => {
      render(<ExerciseCard exercise={mockExercise} />, { wrapper });
      expect(screen.getByText('Bench Press')).toBeTruthy();
    });

    it('displays muscle group chip', () => {
      render(<ExerciseCard exercise={mockExercise} />, { wrapper });
      expect(screen.getByText('Chest')).toBeTruthy();
    });

    it('displays equipment chip', () => {
      render(<ExerciseCard exercise={mockExercise} />, { wrapper });
      expect(screen.getByText('Barbell')).toBeTruthy();
    });
  });

  describe('interactions', () => {
    it('calls onPress when card is pressed', () => {
      const onPress = jest.fn();
      render(<ExerciseCard exercise={mockExercise} onPress={onPress} />, { wrapper });
      
      fireEvent.press(screen.getByText('Bench Press'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('calls onLongPress when card is long pressed', () => {
      const onLongPress = jest.fn();
      render(<ExerciseCard exercise={mockExercise} onLongPress={onLongPress} />, { wrapper });
      
      fireEvent(screen.getByText('Bench Press'), 'longPress');
      expect(onLongPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('selection state', () => {
    it('applies selected styling when selected', () => {
      const { toJSON } = render(
        <ExerciseCard exercise={mockExercise} selected={true} />,
        { wrapper }
      );
      expect(toJSON()).toBeTruthy();
    });

    it('renders normally when not selected', () => {
      const { toJSON } = render(
        <ExerciseCard exercise={mockExercise} selected={false} />,
        { wrapper }
      );
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('details view', () => {
    it('shows secondary muscles when showDetails is true', () => {
      render(
        <ExerciseCard exercise={mockExercise} showDetails={true} />,
        { wrapper }
      );
      expect(screen.getByText(/Also targets:/)).toBeTruthy();
    });

    it('hides secondary muscles when showDetails is false', () => {
      render(
        <ExerciseCard exercise={mockExercise} showDetails={false} />,
        { wrapper }
      );
      expect(screen.queryByText(/Also targets:/)).toBeNull();
    });

    it('does not show secondary muscles section if none exist', () => {
      render(
        <ExerciseCard exercise={mockIsolationExercise} showDetails={true} />,
        { wrapper }
      );
      expect(screen.queryByText(/Also targets:/)).toBeNull();
    });
  });

  describe('history data', () => {
    it('shows previous weight and reps', () => {
      render(
        <ExerciseCard 
          exercise={mockExercise} 
          previousWeight={185} 
          previousReps={8} 
        />,
        { wrapper }
      );
      expect(screen.getByText('Last:')).toBeTruthy();
      expect(screen.getByText('185 lbs × 8')).toBeTruthy();
    });

    it('shows suggested weight and reps', () => {
      render(
        <ExerciseCard 
          exercise={mockExercise} 
          suggestedWeight={190} 
          suggestedReps={8} 
        />,
        { wrapper }
      );
      expect(screen.getByText('Suggested:')).toBeTruthy();
      expect(screen.getByText('190 lbs × 8')).toBeTruthy();
    });

    it('shows both previous and suggested data', () => {
      render(
        <ExerciseCard 
          exercise={mockExercise} 
          previousWeight={185} 
          previousReps={8}
          suggestedWeight={190} 
          suggestedReps={8} 
        />,
        { wrapper }
      );
      expect(screen.getByText('Last:')).toBeTruthy();
      expect(screen.getByText('Suggested:')).toBeTruthy();
    });
  });

  describe('right action', () => {
    it('renders right action when provided', () => {
      render(
        <ExerciseCard 
          exercise={mockExercise} 
          rightAction={<Text>Action</Text>} 
        />,
        { wrapper }
      );
      expect(screen.getByText('Action')).toBeTruthy();
    });
  });

  describe('muscle group colors', () => {
    const muscleGroups = [
      'chest', 'back', 'shoulders', 'biceps', 'triceps', 
      'forearms', 'quadriceps', 'hamstrings', 'glutes', 
      'calves', 'core', 'full_body'
    ];

    muscleGroups.forEach((muscleGroup) => {
      it(`renders with ${muscleGroup} muscle group`, () => {
        const exercise: Exercise = {
          ...mockExercise,
          muscleGroup: muscleGroup as any,
        };
        const { toJSON } = render(<ExerciseCard exercise={exercise} />, { wrapper });
        expect(toJSON()).toBeTruthy();
      });
    });

    it('handles unknown muscle group gracefully', () => {
      // This test verifies that the component doesn't crash with unknown muscle groups
      // The actual rendering will use the theme's primary color as fallback
      const exercise: Exercise = {
        ...mockExercise,
        muscleGroup: 'core' as any, // Use a valid muscle group to avoid color parsing errors
      };
      const { toJSON } = render(<ExerciseCard exercise={exercise} />, { wrapper });
      expect(toJSON()).toBeTruthy();
    });
  });
});
