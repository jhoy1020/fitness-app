// Tests for ProgressBar component

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { ProgressBar, GoalProgress } from '../ProgressBar';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PaperProvider>{children}</PaperProvider>
);

describe('ProgressBar', () => {
  describe('basic rendering', () => {
    it('renders without crashing', () => {
      render(<ProgressBar progress={0.5} />, { wrapper });
    });

    it('shows percentage by default', () => {
      render(<ProgressBar progress={0.5} />, { wrapper });
      expect(screen.getByText('50%')).toBeTruthy();
    });

    it('shows label when provided', () => {
      render(<ProgressBar progress={0.5} label="Progress" />, { wrapper });
      expect(screen.getByText('Progress')).toBeTruthy();
    });

    it('hides percentage when showPercentage is false', () => {
      render(<ProgressBar progress={0.5} showPercentage={false} />, { wrapper });
      expect(screen.queryByText('50%')).toBeNull();
    });
  });

  describe('progress clamping', () => {
    it('clamps progress greater than 1 to 100%', () => {
      render(<ProgressBar progress={1.5} />, { wrapper });
      expect(screen.getByText('100%')).toBeTruthy();
    });

    it('clamps negative progress to 0%', () => {
      render(<ProgressBar progress={-0.5} />, { wrapper });
      expect(screen.getByText('0%')).toBeTruthy();
    });

    it('handles exact 0 progress', () => {
      render(<ProgressBar progress={0} />, { wrapper });
      expect(screen.getByText('0%')).toBeTruthy();
    });

    it('handles exact 1 progress', () => {
      render(<ProgressBar progress={1} />, { wrapper });
      expect(screen.getByText('100%')).toBeTruthy();
    });
  });

  describe('percentage calculation', () => {
    it('rounds to nearest integer', () => {
      render(<ProgressBar progress={0.333} />, { wrapper });
      expect(screen.getByText('33%')).toBeTruthy();
    });

    it('rounds 0.5 up', () => {
      render(<ProgressBar progress={0.555} />, { wrapper });
      expect(screen.getByText('56%')).toBeTruthy();
    });
  });

  describe('custom styling', () => {
    it('accepts custom height', () => {
      const { toJSON } = render(<ProgressBar progress={0.5} height={16} />, { wrapper });
      expect(toJSON()).toBeTruthy();
    });

    it('accepts custom color', () => {
      const { toJSON } = render(<ProgressBar progress={0.5} color="#FF0000" />, { wrapper });
      expect(toJSON()).toBeTruthy();
    });

    it('accepts custom background color', () => {
      const { toJSON } = render(<ProgressBar progress={0.5} backgroundColor="#CCCCCC" />, { wrapper });
      expect(toJSON()).toBeTruthy();
    });
  });
});

describe('GoalProgress', () => {
  describe('basic rendering', () => {
    it('renders without crashing', () => {
      render(<GoalProgress current={5} target={10} label="Sets" />, { wrapper });
    });

    it('displays label', () => {
      render(<GoalProgress current={5} target={10} label="Sets Completed" />, { wrapper });
      expect(screen.getByText('Sets Completed')).toBeTruthy();
    });

    it('displays current and target values', () => {
      render(<GoalProgress current={5} target={10} label="Sets" />, { wrapper });
      expect(screen.getByText('5 / 10')).toBeTruthy();
    });

    it('displays unit when provided', () => {
      render(<GoalProgress current={100} target={200} label="Volume" unit="lbs" />, { wrapper });
      expect(screen.getByText('100 / 200 lbs')).toBeTruthy();
    });
  });

  describe('goal completion', () => {
    it('shows completion message when goal achieved', () => {
      render(<GoalProgress current={10} target={10} label="Sets" />, { wrapper });
      expect(screen.getByText(/Goal achieved/)).toBeTruthy();
    });

    it('shows completion message when exceeding goal', () => {
      render(<GoalProgress current={15} target={10} label="Sets" />, { wrapper });
      expect(screen.getByText(/Goal achieved/)).toBeTruthy();
    });

    it('does not show completion message when goal not achieved', () => {
      render(<GoalProgress current={5} target={10} label="Sets" />, { wrapper });
      expect(screen.queryByText(/Goal achieved/)).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('handles zero target gracefully', () => {
      render(<GoalProgress current={5} target={0} label="Sets" />, { wrapper });
      // Should not crash and render
      expect(screen.getByText('Sets')).toBeTruthy();
    });

    it('hides values when showValues is false', () => {
      render(<GoalProgress current={5} target={10} label="Sets" showValues={false} />, { wrapper });
      expect(screen.queryByText('5 / 10')).toBeNull();
    });
  });
});
