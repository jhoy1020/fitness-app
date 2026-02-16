// Theme Context - Light/Dark theme toggle

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { Storage } from '../utils/storage';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (dark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(true); // Default to dark

  // Load saved preference
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await Storage.getItem('theme');
        if (saved) {
          setIsDark(saved === 'dark');
        } else {
          setIsDark(systemColorScheme === 'dark');
        }
      } catch (e) {
        console.log('Could not load theme preference');
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => {
      const newValue = !prev;
      Storage.setItem('theme', newValue ? 'dark' : 'light').catch(() => {});
      return newValue;
    });
  };

  const setTheme = (dark: boolean) => {
    setIsDark(dark);
    Storage.setItem('theme', dark ? 'dark' : 'light').catch(() => {});
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeMode() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within ThemeProvider');
  }
  return context;
}

export default ThemeContext;
