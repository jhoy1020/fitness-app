// Tests for TemplateCard component

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { TemplateCard } from '../TemplateCard';
import type { WorkoutTemplate, TemplateExercise, Exercise } from '../../../types';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PaperProvider>{children}</PaperProvider>
);

const mockTemplate: WorkoutTemplate = {
  id: 'template-1',
  name: 'Push Day',
  description: 'Chest, shoulders, triceps',
  createdAt: new Date().toISOString(),
  exercises: [],
};

const mockExercises: Array<{ templateExercise: TemplateExercise; exercise: Exercise }> = [
  {
    templateExercise: {
      id: 'te-1',
      templateId: 'template-1',
      exerciseId: 'ex-1',
      targetSets: 4,
      targetReps: 10,
      order: 1,
    },
    exercise: {
      id: 'ex-1',
      name: 'Bench Press',
      muscleGroup: 'chest',
      equipment: 'barbell',
      isCompound: true,
    },
  },
  {
    templateExercise: {
      id: 'te-2',
      templateId: 'template-1',
      exerciseId: 'ex-2',
      targetSets: 3,
      targetReps: 12,
      order: 2,
    },
    exercise: {
      id: 'ex-2',
      name: 'Overhead Press',
      muscleGroup: 'shoulders',
      equipment: 'barbell',
      isCompound: true,
    },
  },
];

describe('TemplateCard', () => {
  describe('basic rendering', () => {
    it('renders without crashing', () => {
      render(<TemplateCard template={mockTemplate} />, { wrapper });
    });

    it('displays template name', () => {
      render(<TemplateCard template={mockTemplate} />, { wrapper });
      expect(screen.getByText('Push Day')).toBeTruthy();
    });

    it('displays template description', () => {
      render(<TemplateCard template={mockTemplate} />, { wrapper });
      expect(screen.getByText('Chest, shoulders, triceps')).toBeTruthy();
    });

    it('displays exercise and set counts', () => {
      render(<TemplateCard template={mockTemplate} exercises={mockExercises} />, { wrapper });
      expect(screen.getByText('2 exercises')).toBeTruthy();
      expect(screen.getByText('7 sets')).toBeTruthy(); // 4 + 3 sets
    });
  });

  describe('muscle groups', () => {
    it('displays muscle group chips', () => {
      render(<TemplateCard template={mockTemplate} exercises={mockExercises} />, { wrapper });
      expect(screen.getByText('chest')).toBeTruthy();
      expect(screen.getByText('shoulders')).toBeTruthy();
    });

    it('handles templates with no exercises', () => {
      render(<TemplateCard template={mockTemplate} exercises={[]} />, { wrapper });
      expect(screen.getByText('0 exercises')).toBeTruthy();
      expect(screen.getByText('0 sets')).toBeTruthy();
    });
  });

  describe('actions', () => {
    it('calls onPress when card is pressed', () => {
      const onPress = jest.fn();
      render(<TemplateCard template={mockTemplate} onPress={onPress} />, { wrapper });
      
      fireEvent.press(screen.getByText('Push Day'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('shows edit button when onEdit provided', () => {
      const onEdit = jest.fn();
      render(<TemplateCard template={mockTemplate} onEdit={onEdit} />, { wrapper });
      
      expect(screen.getByTestId('edit-button')).toBeTruthy();
    });

    it('calls onEdit when edit button pressed', () => {
      const onEdit = jest.fn();
      render(<TemplateCard template={mockTemplate} onEdit={onEdit} />, { wrapper });
      
      fireEvent.press(screen.getByTestId('edit-button'));
      expect(onEdit).toHaveBeenCalledTimes(1);
    });

    it('shows delete button when onDelete provided', () => {
      const onDelete = jest.fn();
      render(<TemplateCard template={mockTemplate} onDelete={onDelete} />, { wrapper });
      
      expect(screen.getByTestId('delete-button')).toBeTruthy();
    });

    it('calls onDelete when delete button pressed', () => {
      const onDelete = jest.fn();
      render(<TemplateCard template={mockTemplate} onDelete={onDelete} />, { wrapper });
      
      fireEvent.press(screen.getByTestId('delete-button'));
      expect(onDelete).toHaveBeenCalledTimes(1);
    });

    it('shows start workout button when onStart provided', () => {
      const onStart = jest.fn();
      render(<TemplateCard template={mockTemplate} onStart={onStart} />, { wrapper });
      
      expect(screen.getByText('Start Workout')).toBeTruthy();
    });

    it('calls onStart when start button pressed', () => {
      const onStart = jest.fn();
      render(<TemplateCard template={mockTemplate} onStart={onStart} />, { wrapper });
      
      fireEvent.press(screen.getByText('Start Workout'));
      expect(onStart).toHaveBeenCalledTimes(1);
    });
  });

  describe('edge cases', () => {
    it('handles template without description', () => {
      const templateNoDesc: WorkoutTemplate = {
        ...mockTemplate,
        description: undefined,
      };
      render(<TemplateCard template={templateNoDesc} />, { wrapper });
      expect(screen.getByText('Push Day')).toBeTruthy();
    });

    it('handles more than 4 muscle groups', () => {
      const manyExercises = [
        { templateExercise: { id: '1', templateId: 't1', exerciseId: 'e1', targetSets: 3, targetReps: 10, order: 1 }, exercise: { id: 'e1', name: 'Ex1', muscleGroup: 'chest', equipment: 'barbell', isCompound: true } },
        { templateExercise: { id: '2', templateId: 't1', exerciseId: 'e2', targetSets: 3, targetReps: 10, order: 2 }, exercise: { id: 'e2', name: 'Ex2', muscleGroup: 'back', equipment: 'barbell', isCompound: true } },
        { templateExercise: { id: '3', templateId: 't1', exerciseId: 'e3', targetSets: 3, targetReps: 10, order: 3 }, exercise: { id: 'e3', name: 'Ex3', muscleGroup: 'shoulders', equipment: 'barbell', isCompound: true } },
        { templateExercise: { id: '4', templateId: 't1', exerciseId: 'e4', targetSets: 3, targetReps: 10, order: 4 }, exercise: { id: 'e4', name: 'Ex4', muscleGroup: 'biceps', equipment: 'dumbbell', isCompound: false } },
        { templateExercise: { id: '5', templateId: 't1', exerciseId: 'e5', targetSets: 3, targetReps: 10, order: 5 }, exercise: { id: 'e5', name: 'Ex5', muscleGroup: 'triceps', equipment: 'cable', isCompound: false } },
      ];
      
      render(<TemplateCard template={mockTemplate} exercises={manyExercises} />, { wrapper });
      expect(screen.getByText('+1 more')).toBeTruthy();
    });
  });
});
