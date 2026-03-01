// Tests for WorkoutCard component

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { WorkoutCard } from '../WorkoutCard';
import type { Workout, WorkoutSet, Exercise } from '../../../types';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PaperProvider>{children}</PaperProvider>
);

const mockWorkout: Workout = {
  id: 'w-1',
  templateId: 'template-1',
  name: 'Push Day',
  date: '2024-01-15',
  durationMinutes: 65,
  notes: 'Great session!',
  isActive: false,
  completedAt: '2024-01-15T10:30:00.000Z',
};

const mockExercises: Exercise[] = [
  { id: 'ex-1', name: 'Bench Press', muscleGroup: 'chest', equipment: 'barbell', isCompound: true },
  { id: 'ex-2', name: 'Incline Press', muscleGroup: 'chest', equipment: 'dumbbell', isCompound: true },
  { id: 'ex-3', name: 'Tricep Pushdown', muscleGroup: 'triceps', equipment: 'cable', isCompound: false },
  { id: 'ex-4', name: 'Lateral Raise', muscleGroup: 'shoulders', equipment: 'dumbbell', isCompound: false },
];

const mockSets: WorkoutSet[] = [
  { id: 's-1', workoutId: 'w-1', exerciseId: 'ex-1', setNumber: 1, weight: 185, reps: 8, rpe: 7, isWarmup: false, completedAt: '' },
  { id: 's-2', workoutId: 'w-1', exerciseId: 'ex-1', setNumber: 2, weight: 185, reps: 8, rpe: 8, isWarmup: false, completedAt: '' },
  { id: 's-3', workoutId: 'w-1', exerciseId: 'ex-1', setNumber: 3, weight: 185, reps: 7, rpe: 9, isWarmup: false, completedAt: '' },
  { id: 's-4', workoutId: 'w-1', exerciseId: 'ex-2', setNumber: 1, weight: 70, reps: 10, rpe: 7, isWarmup: false, completedAt: '' },
  { id: 's-5', workoutId: 'w-1', exerciseId: 'ex-2', setNumber: 2, weight: 70, reps: 10, rpe: 8, isWarmup: false, completedAt: '' },
];

const warmupSet: WorkoutSet = {
  id: 's-w1', workoutId: 'w-1', exerciseId: 'ex-1', setNumber: 0, weight: 95, reps: 10, isWarmup: true, completedAt: ''
};

describe('WorkoutCard', () => {
  describe('basic rendering', () => {
    it('renders without crashing', () => {
      render(<WorkoutCard workout={mockWorkout} />, { wrapper });
    });

    it('displays workout name', () => {
      render(<WorkoutCard workout={mockWorkout} />, { wrapper });
      expect(screen.getByText('Push Day')).toBeTruthy();
    });

    it('displays workout date', () => {
      render(<WorkoutCard workout={mockWorkout} />, { wrapper });
      // Date format will vary, just check something is rendered
      expect(screen.getByText(/15|Jan/)).toBeTruthy();
    });

    it('displays duration when available', () => {
      render(<WorkoutCard workout={mockWorkout} />, { wrapper });
      expect(screen.getByText(/65 min/)).toBeTruthy();
    });

    it('displays notes when available', () => {
      render(<WorkoutCard workout={mockWorkout} />, { wrapper });
      expect(screen.getByText('Great session!')).toBeTruthy();
    });
  });

  describe('stats', () => {
    it('displays set count', () => {
      render(<WorkoutCard workout={mockWorkout} sets={mockSets} />, { wrapper });
      expect(screen.getByText('5')).toBeTruthy(); // 5 working sets
      expect(screen.getByText('Sets')).toBeTruthy();
    });

    it('displays exercise count', () => {
      render(<WorkoutCard workout={mockWorkout} sets={mockSets} />, { wrapper });
      expect(screen.getByText('2')).toBeTruthy(); // 2 unique exercises
      expect(screen.getByText('Exercises')).toBeTruthy();
    });

    it('displays total volume', () => {
      render(<WorkoutCard workout={mockWorkout} sets={mockSets} />, { wrapper });
      // Volume = (185*8 + 185*8 + 185*7) + (70*10 + 70*10) = 4255 + 1400 = 5655
      expect(screen.getByText(/5,655|5655/)).toBeTruthy();
      expect(screen.getByText('lbs Volume')).toBeTruthy();
    });

    it('excludes warmup sets from stats', () => {
      const setsWithWarmup = [...mockSets, warmupSet];
      render(<WorkoutCard workout={mockWorkout} sets={setsWithWarmup} />, { wrapper });
      // Should still show 5 sets, not 6
      expect(screen.getByText('5')).toBeTruthy();
    });
  });

  describe('exercise list', () => {
    it('displays exercise names with set info', () => {
      render(
        <WorkoutCard workout={mockWorkout} sets={mockSets} exercises={mockExercises} />,
        { wrapper }
      );
      expect(screen.getByText(/Bench Press/)).toBeTruthy();
      expect(screen.getByText(/Incline Press/)).toBeTruthy();
    });

    it('shows +X more when more than 3 exercises', () => {
      const manySets: WorkoutSet[] = [
        ...mockSets,
        { id: 's-6', workoutId: 'w-1', exerciseId: 'ex-3', setNumber: 1, weight: 50, reps: 12, isWarmup: false, completedAt: '' },
        { id: 's-7', workoutId: 'w-1', exerciseId: 'ex-4', setNumber: 1, weight: 20, reps: 15, isWarmup: false, completedAt: '' },
      ];
      render(
        <WorkoutCard workout={mockWorkout} sets={manySets} exercises={mockExercises} />,
        { wrapper }
      );
      expect(screen.getByText('+1 more exercises')).toBeTruthy();
    });

    it('handles unknown exercise IDs', () => {
      const unknownSets: WorkoutSet[] = [
        { id: 's-u1', workoutId: 'w-1', exerciseId: 'unknown-id', setNumber: 1, weight: 100, reps: 10, isWarmup: false, completedAt: '' },
      ];
      render(
        <WorkoutCard workout={mockWorkout} sets={unknownSets} exercises={mockExercises} />,
        { wrapper }
      );
      expect(screen.getByText(/Unknown Exercise/)).toBeTruthy();
    });
  });

  describe('actions', () => {
    it('calls onPress when card is pressed', () => {
      const onPress = jest.fn();
      render(<WorkoutCard workout={mockWorkout} onPress={onPress} />, { wrapper });
      
      fireEvent.press(screen.getByText('Push Day'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('shows edit button when onEdit provided', () => {
      const onEdit = jest.fn();
      render(<WorkoutCard workout={mockWorkout} onEdit={onEdit} />, { wrapper });
      
      expect(screen.getByTestId('edit-button')).toBeTruthy();
    });

    it('calls onEdit when edit button pressed', () => {
      const onEdit = jest.fn();
      render(<WorkoutCard workout={mockWorkout} onEdit={onEdit} />, { wrapper });
      
      fireEvent.press(screen.getByTestId('edit-button'));
      expect(onEdit).toHaveBeenCalledTimes(1);
    });

    it('shows delete button when onDelete provided', () => {
      const onDelete = jest.fn();
      render(<WorkoutCard workout={mockWorkout} onDelete={onDelete} />, { wrapper });
      
      expect(screen.getByTestId('delete-button')).toBeTruthy();
    });

    it('calls onDelete when delete button pressed', () => {
      const onDelete = jest.fn();
      render(<WorkoutCard workout={mockWorkout} onDelete={onDelete} />, { wrapper });
      
      fireEvent.press(screen.getByTestId('delete-button'));
      expect(onDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('edge cases', () => {
    it('handles workout without notes', () => {
      const workoutNoNotes: Workout = { ...mockWorkout, notes: undefined };
      render(<WorkoutCard workout={workoutNoNotes} />, { wrapper });
      expect(screen.getByText('Push Day')).toBeTruthy();
    });

    it('handles workout without duration', () => {
      const workoutNoDuration: Workout = { ...mockWorkout, durationMinutes: undefined };
      render(<WorkoutCard workout={workoutNoDuration} />, { wrapper });
      expect(screen.getByText('Push Day')).toBeTruthy();
    });

    it('handles empty sets array', () => {
      render(<WorkoutCard workout={mockWorkout} sets={[]} exercises={mockExercises} />, { wrapper });
      expect(screen.getAllByText('0').length).toBeGreaterThan(0); // Multiple 0s for sets, exercises
    });

    it('handles empty exercises array', () => {
      render(<WorkoutCard workout={mockWorkout} sets={mockSets} exercises={[]} />, { wrapper });
      expect(screen.getAllByText(/Unknown Exercise/).length).toBeGreaterThan(0);
    });
  });
});
