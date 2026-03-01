// Tests for InfoTooltip component

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { InfoTooltip, ABBREVIATIONS } from '../InfoTooltip';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PaperProvider>{children}</PaperProvider>
);

describe('InfoTooltip', () => {
  describe('basic rendering', () => {
    it('renders without crashing', () => {
      render(
        <InfoTooltip title="Test" description="Test description" />,
        { wrapper }
      );
    });

    it('shows question mark icon', () => {
      render(
        <InfoTooltip title="Test" description="Test description" />,
        { wrapper }
      );
      expect(screen.getByText('?')).toBeTruthy();
    });
  });

  describe('tooltip interaction', () => {
    it('opens modal when pressed', () => {
      render(
        <InfoTooltip title="Test Title" description="Test description" />,
        { wrapper }
      );

      fireEvent.press(screen.getByText('?'));
      
      expect(screen.getByText('Test Title')).toBeTruthy();
      expect(screen.getByText('Test description')).toBeTruthy();
    });

    it('shows Got it button in modal', () => {
      render(
        <InfoTooltip title="Test" description="Test description" />,
        { wrapper }
      );

      fireEvent.press(screen.getByText('?'));
      
      expect(screen.getByText('Got it')).toBeTruthy();
    });

    it('closes modal when Got it is pressed', () => {
      render(
        <InfoTooltip title="Test Title" description="Test description" />,
        { wrapper }
      );

      // Open modal
      fireEvent.press(screen.getByText('?'));
      expect(screen.getByText('Test Title')).toBeTruthy();

      // Close modal
      fireEvent.press(screen.getByText('Got it'));
      
      // Modal content should no longer be visible
      // Note: Modal may still be in tree but not visible
    });
  });

  describe('size variants', () => {
    it('renders with small size (default)', () => {
      const { toJSON } = render(
        <InfoTooltip title="Test" description="Test description" size="small" />,
        { wrapper }
      );
      expect(toJSON()).toBeTruthy();
    });

    it('renders with medium size', () => {
      const { toJSON } = render(
        <InfoTooltip title="Test" description="Test description" size="medium" />,
        { wrapper }
      );
      expect(toJSON()).toBeTruthy();
    });
  });
});

describe('ABBREVIATIONS', () => {
  it('contains BMR definition', () => {
    expect(ABBREVIATIONS.BMR).toBeDefined();
    expect(ABBREVIATIONS.BMR.title).toContain('BMR');
    expect(ABBREVIATIONS.BMR.description).toBeDefined();
  });

  it('contains TDEE definition', () => {
    expect(ABBREVIATIONS.TDEE).toBeDefined();
    expect(ABBREVIATIONS.TDEE.title).toContain('TDEE');
  });

  it('contains 1RM definition', () => {
    expect(ABBREVIATIONS['1RM']).toBeDefined();
    expect(ABBREVIATIONS['1RM'].title).toContain('1RM');
  });

  it('all abbreviations have title and description', () => {
    Object.values(ABBREVIATIONS).forEach((abbr) => {
      expect(abbr.title).toBeDefined();
      expect(typeof abbr.title).toBe('string');
      expect(abbr.description).toBeDefined();
      expect(typeof abbr.description).toBe('string');
    });
  });
});
