// Theme configuration for React Native Paper
// Material Design 3 color scheme

import { MD3DarkTheme, MD3LightTheme, configureFonts } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';

// Electric Blue Fitness Theme
// Primary: Electric Blue - energetic, modern, motivating
// Secondary: Electric Orange/Coral - energy, power
// Tertiary: Lime Green - success, energy, growth
const customColors = {
  // Primary - Electric Blue
  primary: '#00D4FF',
  primaryContainer: '#004D5C',
  onPrimary: '#003544',
  onPrimaryContainer: '#B8EAFF',
  
  // Secondary - Electric Orange/Coral for energy
  secondary: '#FF6B35',
  secondaryContainer: '#5C2500',
  onSecondary: '#FFFFFF',
  onSecondaryContainer: '#FFE0D4',
  
  // Tertiary - Electric Lime for energy/success
  tertiary: '#ADFF2F',
  tertiaryContainer: '#2D4700',
  onTertiary: '#1A2E00',
  onTertiaryContainer: '#D4FF8A',
  
  // Error - Bright Red
  error: '#FF4757',
  errorContainer: '#5C0011',
  onError: '#FFFFFF',
  onErrorContainer: '#FFDAD9',
  
  // Success - Bright Green
  success: '#00E676',
  successContainer: '#004D26',
  
  // Warning - Electric Orange
  warning: '#FF9500',
  warningContainer: '#5C3600',
};

const fontConfig = {
  fontFamily: 'System',
};

export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    // Override with light mode versions (darker for contrast)
    primary: '#0099CC',
    primaryContainer: '#CCF2FF',
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#003544',
    secondary: '#E85A2C',
    secondaryContainer: '#FFE0D4',
    onSecondary: '#FFFFFF',
    onSecondaryContainer: '#5C2500',
    tertiary: '#6B8E23',
    tertiaryContainer: '#E8F5C8',
    onTertiary: '#FFFFFF',
    onTertiaryContainer: '#1A2E00',
    error: '#D32F2F',
    errorContainer: '#FFEBEE',
    onError: '#FFFFFF',
    onErrorContainer: '#5C0011',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceVariant: '#E2E8F0',
    onBackground: '#0F172A',
    onSurface: '#0F172A',
    onSurfaceVariant: '#475569',
    outline: '#64748B',
    outlineVariant: '#CBD5E1',
    success: '#00C853',
    successContainer: '#E8F5E9',
    warning: '#FF9500',
    warningContainer: '#FFF3E0',
    elevation: {
      level0: 'transparent',
      level1: '#F8FAFC',
      level2: '#F1F5F9',
      level3: '#E2E8F0',
      level4: '#CBD5E1',
      level5: '#94A3B8',
    },
  } as MD3Theme['colors'] & { success: string; successContainer: string; warning: string; warningContainer: string },
  fonts: configureFonts({ config: fontConfig }),
};

export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    // Electric Blue palette for dark mode (vibrant!)
    primary: '#00D4FF',
    primaryContainer: '#004D5C',
    onPrimary: '#003544',
    onPrimaryContainer: '#B8EAFF',
    secondary: '#FF6B35',
    secondaryContainer: '#5C2500',
    onSecondary: '#3D1500',
    onSecondaryContainer: '#FFE0D4',
    tertiary: '#ADFF2F',
    tertiaryContainer: '#2D4700',
    onTertiary: '#1A2E00',
    onTertiaryContainer: '#D4FF8A',
    error: '#FF6B7A',
    errorContainer: '#5C0011',
    onError: '#3D000A',
    onErrorContainer: '#FFDAD9',
    // Deep blue-gray backgrounds (no black!)
    background: '#0D1B2A',
    surface: '#1B2838',
    surfaceVariant: '#253546',
    onBackground: '#E8EEF4',
    onSurface: '#E8EEF4',
    onSurfaceVariant: '#A8B8C8',
    outline: '#6B8299',
    outlineVariant: '#3D5266',
    success: '#00E676',
    successContainer: '#004D26',
    warning: '#FFB340',
    warningContainer: '#5C3600',
    elevation: {
      level0: 'transparent',
      level1: '#1B2838',
      level2: '#253546',
      level3: '#324559',
      level4: '#3F566B',
      level5: '#4D6780',
    },
  } as MD3Theme['colors'] & { success: string; successContainer: string; warning: string; warningContainer: string },
  fonts: configureFonts({ config: fontConfig }),
};

// Spacing constants
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// Border radius constants
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;
