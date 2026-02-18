// Tests for ThemeContext

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { ThemeProvider, useThemeMode } from '../ThemeContext';
import { Storage } from '../../utils/storage';

// Mock Storage
jest.mock('../../utils/storage', () => ({
  Storage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
  },
}));

const mockStorage = Storage as jest.Mocked<typeof Storage>;

describe('ThemeContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStorage.getItem.mockResolvedValue(null);
    mockStorage.setItem.mockResolvedValue(undefined);
  });

  describe('ThemeProvider', () => {
    it('provides default dark theme', async () => {
      const { result } = renderHook(() => useThemeMode(), {
        wrapper: ThemeProvider,
      });

      expect(result.current.isDark).toBe(true);
    });

    it('loads saved theme preference', async () => {
      mockStorage.getItem.mockResolvedValue('light');

      const { result } = renderHook(() => useThemeMode(), {
        wrapper: ThemeProvider,
      });

      await waitFor(() => {
        expect(result.current.isDark).toBe(false);
      });
    });

    it('loads dark theme from storage', async () => {
      mockStorage.getItem.mockResolvedValue('dark');

      const { result } = renderHook(() => useThemeMode(), {
        wrapper: ThemeProvider,
      });

      await waitFor(() => {
        expect(result.current.isDark).toBe(true);
      });
    });
  });

  describe('toggleTheme', () => {
    it('toggles from dark to light', async () => {
      const { result } = renderHook(() => useThemeMode(), {
        wrapper: ThemeProvider,
      });

      expect(result.current.isDark).toBe(true);

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.isDark).toBe(false);
    });

    it('toggles from light to dark', async () => {
      mockStorage.getItem.mockResolvedValue('light');

      const { result } = renderHook(() => useThemeMode(), {
        wrapper: ThemeProvider,
      });

      await waitFor(() => {
        expect(result.current.isDark).toBe(false);
      });

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.isDark).toBe(true);
    });

    it('saves theme preference to storage', async () => {
      const { result } = renderHook(() => useThemeMode(), {
        wrapper: ThemeProvider,
      });

      act(() => {
        result.current.toggleTheme();
      });

      expect(mockStorage.setItem).toHaveBeenCalledWith('theme', 'light');
    });
  });

  describe('setTheme', () => {
    it('sets theme to dark', async () => {
      mockStorage.getItem.mockResolvedValue('light');

      const { result } = renderHook(() => useThemeMode(), {
        wrapper: ThemeProvider,
      });

      await waitFor(() => {
        expect(result.current.isDark).toBe(false);
      });

      act(() => {
        result.current.setTheme(true);
      });

      expect(result.current.isDark).toBe(true);
      expect(mockStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
    });

    it('sets theme to light', async () => {
      const { result } = renderHook(() => useThemeMode(), {
        wrapper: ThemeProvider,
      });

      act(() => {
        result.current.setTheme(false);
      });

      expect(result.current.isDark).toBe(false);
      expect(mockStorage.setItem).toHaveBeenCalledWith('theme', 'light');
    });
  });

  describe('error handling', () => {
    it('throws when useThemeMode is used outside provider', () => {
      // Suppress console error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        renderHook(() => useThemeMode());
      }).toThrow('useThemeMode must be used within ThemeProvider');

      consoleSpy.mockRestore();
    });

    it('handles storage errors gracefully', async () => {
      mockStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const { result } = renderHook(() => useThemeMode(), {
        wrapper: ThemeProvider,
      });

      // Should still render with default dark theme
      expect(result.current.isDark).toBe(true);
    });
  });
});
