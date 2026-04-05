/**
 * QuickStatsRow — top-of-dashboard workout/rest/recovery counts for the week.
 * Pure presentational component.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { AppIcons } from '../../theme/icons';

export interface ActivityStats {
  workoutDays: number;
  restDays: number;
  recoveryDays: number;
  consecutiveWorkoutDays: number;
  recommendation: {
    type: 'workout' | 'rest' | 'recovery';
    message: string;
    icon: string;
  } | null;
}

interface QuickStatsRowProps {
  stats: ActivityStats;
}

export function QuickStatsRow({ stats }: QuickStatsRowProps) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      <Surface style={styles.card} elevation={2}>
        <MaterialCommunityIcons name={AppIcons.warmup} size={28} color={theme.colors.primary} />
        <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
          {stats.workoutDays}
        </Text>
        <Text variant="labelSmall" style={{ color: theme.colors.outline }}>Workouts</Text>
      </Surface>
      <Surface style={styles.card} elevation={2}>
        <MaterialCommunityIcons name={AppIcons.rest} size={28} color={theme.colors.secondary} />
        <Text variant="headlineSmall" style={{ color: theme.colors.secondary }}>
          {stats.restDays}
        </Text>
        <Text variant="labelSmall" style={{ color: theme.colors.outline }}>Rest Days</Text>
      </Surface>
      <Surface style={styles.card} elevation={2}>
        <MaterialCommunityIcons name={AppIcons.recovery} size={28} color={theme.colors.tertiary} />
        <Text variant="headlineSmall" style={{ color: theme.colors.tertiary }}>
          {stats.recoveryDays}
        </Text>
        <Text variant="labelSmall" style={{ color: theme.colors.outline }}>Recovery</Text>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  card: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 2,
  },
});
