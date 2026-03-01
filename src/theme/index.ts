// Theme configuration for React Native Paper
// Material Design 3 color scheme

import { MD3DarkTheme, MD3LightTheme, configureFonts } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';

// ─── Color utilities ─────────────────────────────────────────────
/** Convert a hex color + 0‑1 alpha into an rgba() string.
 *  Replaces all ad-hoc `rgba(…)` literals and fragile `hex + '20'` tricks. */
export function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ─── Semantic status / category colors (shared across themes) ────
// These are "fixed" colors that stay the same in light & dark so
// status meaning is always recognisable.
export const statusColors = {
  beginner: '#4CAF50',
  intermediate: '#FF9800',
  advanced: '#F44336',
  pr: '#FFD700',         // personal record gold
  paused: '#FFB340',     // amber for paused workouts
  rest: '#78909C',       // muted blue-gray for rest days
  cardio: '#FF6B35',     // orange
  recovery: '#4DB6AC',   // teal
  deload: '#FFC107',     // amber-yellow
} as const;

// Muscle-group colour map (consistent across themes)
export const muscleGroupColors: Record<string, string> = {
  chest: '#E91E63',
  back: '#2196F3',
  shoulders: '#9C27B0',
  biceps: '#FF5722',
  triceps: '#FF9800',
  forearms: '#795548',
  quads: '#4CAF50',
  hamstrings: '#8BC34A',
  glutes: '#CDDC39',
  calves: '#009688',
  core: '#00BCD4',
  other: '#607D8B',
} as const;

const fontConfig = {
  fontFamily: 'System',
};

// ─── Extended color type used by both themes ─────────────────────
type ExtendedColors = MD3Theme['colors'] & {
  success: string;
  successContainer: string;
  warning: string;
  warningContainer: string;
  scrim: string;
};

export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
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
    scrim: 'rgba(0,0,0,0.5)',
    elevation: {
      level0: 'transparent',
      level1: '#F8FAFC',
      level2: '#F1F5F9',
      level3: '#E2E8F0',
      level4: '#CBD5E1',
      level5: '#94A3B8',
    },
  } as ExtendedColors,
  fonts: configureFonts({ config: fontConfig }),
};

export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
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
    scrim: 'rgba(0,0,0,0.6)',
    elevation: {
      level0: 'transparent',
      level1: '#1B2838',
      level2: '#253546',
      level3: '#324559',
      level4: '#3F566B',
      level5: '#4D6780',
    },
  } as ExtendedColors,
  fonts: configureFonts({ config: fontConfig }),
};

// Spacing constants (4dp grid — Material Design 3)
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

// ─── Shared responsive breakpoint ────────────────────────────────
/** Below this width the app switches to narrow / hamburger layout. */
export const NARROW_SCREEN_WIDTH = 400;

// ─── Typography scale (for RN-primitive components) ──────────────
// Mirrors MD3 type roles so ProgramCard, PausedWorkoutCard, etc.
// stay consistent with Paper screens without importing Paper <Text>.
export const typography = {
  displaySmall:  { fontSize: 36, fontWeight: '400' as const, lineHeight: 44 },
  headlineLarge: { fontSize: 32, fontWeight: '400' as const, lineHeight: 40 },
  headlineMedium:{ fontSize: 28, fontWeight: '400' as const, lineHeight: 36 },
  headlineSmall: { fontSize: 24, fontWeight: '400' as const, lineHeight: 32 },
  titleLarge:    { fontSize: 22, fontWeight: '500' as const, lineHeight: 28 },
  titleMedium:   { fontSize: 16, fontWeight: '600' as const, lineHeight: 24 },
  titleSmall:    { fontSize: 14, fontWeight: '600' as const, lineHeight: 20 },
  bodyLarge:     { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyMedium:    { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  bodySmall:     { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  labelLarge:    { fontSize: 14, fontWeight: '600' as const, lineHeight: 20 },
  labelMedium:   { fontSize: 12, fontWeight: '600' as const, lineHeight: 16 },
  labelSmall:    { fontSize: 11, fontWeight: '600' as const, lineHeight: 16 },
} as const;

// ─── Minimum touch target (MD3: 48 dp, Apple HIG: 44 pt) ────────
export const MIN_TOUCH = 44;

