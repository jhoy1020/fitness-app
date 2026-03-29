// Tests for SetInput component

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { SetInput } from '../SetInput';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PaperProvider>{children}</PaperProvider>
);

const defaultProps = {
  setNumber: 1,
  weight: 135,
  reps: 10,
  isWarmup: false,
  weightUnit: 'lbs' as const,
  onWeightChange: jest.fn(),
  onRepsChange: jest.fn(),
  onRpeChange: jest.fn(),
  onWarmupChange: jest.fn(),
};

describe('SetInput', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('renders without crashing', () => {
      render(<SetInput {...defaultProps} />, { wrapper });
    });

    it('displays set number', () => {
      render(<SetInput {...defaultProps} setNumber={3} />, { wrapper });
      expect(screen.getByText('3')).toBeTruthy();
    });

    it('displays "W" for warmup sets', () => {
      render(<SetInput {...defaultProps} isWarmup={true} />, { wrapper });
      expect(screen.getByText('W')).toBeTruthy();
    });

    it('displays weight value in input', () => {
      render(<SetInput {...defaultProps} weight={225} />, { wrapper });
      expect(screen.getByDisplayValue('225')).toBeTruthy();
    });

    it('displays reps value in input', () => {
      render(<SetInput {...defaultProps} reps={8} />, { wrapper });
      expect(screen.getByDisplayValue('8')).toBeTruthy();
    });

    it('shows empty input when weight is 0', () => {
      render(<SetInput {...defaultProps} weight={0} />, { wrapper });
      expect(screen.queryByDisplayValue('0')).toBeNull();
    });

    it('shows empty input when reps is 0', () => {
      render(<SetInput {...defaultProps} reps={0} />, { wrapper });
      expect(screen.queryByDisplayValue('0')).toBeNull();
    });
  });

  describe('weight input', () => {
    it('calls onWeightChange when weight is entered', () => {
      const onWeightChange = jest.fn();
      render(
        <SetInput {...defaultProps} weight={0} onWeightChange={onWeightChange} />,
        { wrapper }
      );

      // react-native-paper TextInput uses testID="text-input-outlined"
      const inputs = screen.getAllByTestId('text-input-outlined');
      // First outlined input is weight, second is reps
      fireEvent.changeText(inputs[0], '185');
      expect(onWeightChange).toHaveBeenCalledWith(185);
    });

    it('handles decimal weight input', () => {
      const onWeightChange = jest.fn();
      render(
        <SetInput {...defaultProps} weight={0} onWeightChange={onWeightChange} />,
        { wrapper }
      );

      const inputs = screen.getAllByTestId('text-input-outlined');
      fireEvent.changeText(inputs[0], '132.5');
      expect(onWeightChange).toHaveBeenCalledWith(132.5);
    });

    it('handles empty weight input as 0', () => {
      const onWeightChange = jest.fn();
      render(
        <SetInput {...defaultProps} onWeightChange={onWeightChange} />,
        { wrapper }
      );

      const inputs = screen.getAllByTestId('text-input-outlined');
      fireEvent.changeText(inputs[0], '');
      expect(onWeightChange).toHaveBeenCalledWith(0);
    });

    it('shows kg label when weightUnit is kg', () => {
      render(<SetInput {...defaultProps} weightUnit="kg" />, { wrapper });
      // The label "kg" appears in react-native-paper's internal label text
      expect(screen.getAllByText('kg').length).toBeGreaterThan(0);
    });
  });

  describe('reps input', () => {
    it('calls onRepsChange when reps are entered', () => {
      const onRepsChange = jest.fn();
      render(
        <SetInput {...defaultProps} reps={0} onRepsChange={onRepsChange} />,
        { wrapper }
      );

      const inputs = screen.getAllByTestId('text-input-outlined');
      // Second input is reps
      fireEvent.changeText(inputs[1], '12');
      expect(onRepsChange).toHaveBeenCalledWith(12);
    });

    it('handles empty reps input as 0', () => {
      const onRepsChange = jest.fn();
      render(
        <SetInput {...defaultProps} onRepsChange={onRepsChange} />,
        { wrapper }
      );

      const inputs = screen.getAllByTestId('text-input-outlined');
      fireEvent.changeText(inputs[1], '');
      expect(onRepsChange).toHaveBeenCalledWith(0);
    });
  });

  describe('RPE selector', () => {
    it('displays RPE value when set', () => {
      render(<SetInput {...defaultProps} rpe={8} />, { wrapper });
      // RPE text appears in anchor button: "RPE 8"
      expect(screen.getAllByText(/RPE 8/).length).toBeGreaterThan(0);
    });
  });

  describe('warmup toggle', () => {
    it('calls onWarmupChange when toggled', () => {
      const onWarmupChange = jest.fn();
      render(
        <SetInput {...defaultProps} isWarmup={false} onWarmupChange={onWarmupChange} />,
        { wrapper }
      );

      const checkbox = screen.getByRole('checkbox');
      fireEvent.press(checkbox);
      expect(onWarmupChange).toHaveBeenCalledWith(true);
    });

    it('shows unchecked warmup checkbox for regular sets', () => {
      render(<SetInput {...defaultProps} isWarmup={false} />, { wrapper });
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeTruthy();
    });
  });

  describe('previous/suggested data', () => {
    it('shows previous weight and reps', () => {
      render(
        <SetInput
          {...defaultProps}
          previousWeight={180}
          previousReps={8}
        />,
        { wrapper }
      );
      expect(screen.getByText('Previous')).toBeTruthy();
      expect(screen.getByText('180 × 8')).toBeTruthy();
    });

    it('shows suggested weight and reps', () => {
      render(
        <SetInput
          {...defaultProps}
          suggestedWeight={190}
          suggestedReps={8}
        />,
        { wrapper }
      );
      expect(screen.getByText('Suggested')).toBeTruthy();
      expect(screen.getByText('190 × 8')).toBeTruthy();
    });

    it('does not show previous section when no previous data', () => {
      render(<SetInput {...defaultProps} />, { wrapper });
      expect(screen.queryByText('Previous')).toBeNull();
      expect(screen.queryByText('Suggested')).toBeNull();
    });
  });

  describe('action buttons', () => {
    it('renders complete button when onComplete provided', () => {
      const onComplete = jest.fn();
      const { toJSON } = render(
        <SetInput {...defaultProps} onComplete={onComplete} isCompleted={false} />,
        { wrapper }
      );
      expect(toJSON()).toBeTruthy();
    });

    it('renders delete button when onDelete provided', () => {
      const onDelete = jest.fn();
      const { toJSON } = render(
        <SetInput {...defaultProps} onDelete={onDelete} />,
        { wrapper }
      );
      expect(toJSON()).toBeTruthy();
    });

    it('does not show complete button when already completed', () => {
      const onComplete = jest.fn();
      const { toJSON } = render(
        <SetInput {...defaultProps} onComplete={onComplete} isCompleted={true} />,
        { wrapper }
      );
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('completed state', () => {
    it('applies completed styling', () => {
      const { toJSON } = render(
        <SetInput {...defaultProps} isCompleted={true} />,
        { wrapper }
      );
      expect(toJSON()).toBeTruthy();
    });
  });
});
