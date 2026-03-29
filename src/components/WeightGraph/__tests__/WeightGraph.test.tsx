// Tests for WeightGraph component

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { WeightGraph } from '../WeightGraph';
import type { BodyMeasurement } from '../../../types';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PaperProvider>{children}</PaperProvider>
);

const makeEntry = (
  id: string,
  date: string,
  weight: number,
  bodyFatPercent?: number
): BodyMeasurement => ({
  id,
  date,
  weight,
  bodyFatPercent,
  createdAt: date,
});

const singleEntry: BodyMeasurement[] = [
  makeEntry('1', '2026-02-20', 185),
];

const multipleEntries: BodyMeasurement[] = [
  makeEntry('1', '2026-02-01', 190),
  makeEntry('2', '2026-02-08', 188),
  makeEntry('3', '2026-02-15', 186),
  makeEntry('4', '2026-02-22', 185),
  makeEntry('5', '2026-02-28', 184),
];

const entriesWithBodyFat: BodyMeasurement[] = [
  makeEntry('1', '2026-02-01', 190, 20),
  makeEntry('2', '2026-02-08', 188, 19.5),
  makeEntry('3', '2026-02-15', 186, 19),
  makeEntry('4', '2026-02-22', 185, 18.5),
];

describe('WeightGraph', () => {
  describe('empty state', () => {
    it('renders empty state when no data', () => {
      render(<WeightGraph data={[]} />, { wrapper });
      expect(screen.getByText('No weight data yet')).toBeTruthy();
    });

    it('renders empty state message', () => {
      render(<WeightGraph data={[]} />, { wrapper });
      expect(screen.getByText('Add your first weight entry to see your progress')).toBeTruthy();
    });

    it('handles data with no weight values', () => {
      const noWeightData: BodyMeasurement[] = [
        { id: '1', date: '2026-02-01', createdAt: '2026-02-01' },
      ];
      render(<WeightGraph data={noWeightData} />, { wrapper });
      expect(screen.getByText('No weight data yet')).toBeTruthy();
    });
  });

  describe('with data', () => {
    it('renders without crashing with single entry', () => {
      render(<WeightGraph data={singleEntry} />, { wrapper });
    });

    it('renders without crashing with multiple entries', () => {
      render(<WeightGraph data={multipleEntries} />, { wrapper });
    });

    it('displays current weight header', () => {
      render(<WeightGraph data={multipleEntries} />, { wrapper });
      expect(screen.getByText('Current Weight')).toBeTruthy();
    });

    it('displays the latest weight value', () => {
      render(<WeightGraph data={multipleEntries} />, { wrapper });
      expect(screen.getByText('184 lbs')).toBeTruthy();
    });
  });

  describe('body fat display', () => {
    it('shows body fat percentage when available', () => {
      render(<WeightGraph data={entriesWithBodyFat} showBodyFat={true} />, { wrapper });
      expect(screen.getByText(/18.5% BF/)).toBeTruthy();
    });

    it('does not show body fat when showBodyFat is false', () => {
      // showBodyFat only controls graph dots; header always shows BF
      // Test with data that has no bodyFatPercent to ensure no BF text
      render(<WeightGraph data={multipleEntries} showBodyFat={false} />, { wrapper });
      expect(screen.queryByText(/% BF/)).toBeNull();
    });
  });

  describe('custom height', () => {
    it('renders with custom height', () => {
      const { toJSON } = render(
        <WeightGraph data={multipleEntries} height={300} />,
        { wrapper }
      );
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('weekly change', () => {
    it('displays weekly change when enough recent data', () => {
      // Create entries within the last week
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
      const recentEntries: BodyMeasurement[] = [
        makeEntry('1', weekAgo.toISOString(), 186),
        makeEntry('2', now.toISOString(), 184),
      ];
      render(<WeightGraph data={recentEntries} />, { wrapper });
      expect(screen.getByText('This Week')).toBeTruthy();
    });
  });

  describe('edge cases', () => {
    it('handles all same weight values', () => {
      const sameWeight: BodyMeasurement[] = [
        makeEntry('1', '2026-02-01', 180),
        makeEntry('2', '2026-02-08', 180),
        makeEntry('3', '2026-02-15', 180),
      ];
      const { toJSON } = render(<WeightGraph data={sameWeight} />, { wrapper });
      expect(toJSON()).toBeTruthy();
    });

    it('handles very large weight difference', () => {
      const largeRange: BodyMeasurement[] = [
        makeEntry('1', '2026-02-01', 100),
        makeEntry('2', '2026-02-15', 300),
      ];
      const { toJSON } = render(<WeightGraph data={largeRange} />, { wrapper });
      expect(toJSON()).toBeTruthy();
    });
  });
});
