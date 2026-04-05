/**
 * WeeklyVolumeCard — bar-style summary of sets per muscle group this week.
 * Pure presentational component.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

interface VolumeEntry {
  muscle: string;
  sets: number;
}

interface WeeklyVolumeCardProps {
  volume: VolumeEntry[];
}

export function WeeklyVolumeCard({ volume }: WeeklyVolumeCardProps) {
  const theme = useTheme();

  if (volume.length === 0) return null;

  return (
    <Surface style={styles.container} elevation={1}>
      <Text variant="titleMedium" style={{ marginBottom: 12 }}>
        <MaterialCommunityIcons name="chart-bar" size={18} color={theme.colors.onSurface} />{' '}This Week's Volume
      </Text>
      <View style={styles.grid}>
        {volume.map(({ muscle, sets }) => (
          <View key={muscle} style={styles.item}>
            <Text variant="titleLarge" style={{ color: theme.colors.primary }}>{sets}</Text>
            <Text variant="labelSmall" style={{ color: theme.colors.outline, textTransform: 'capitalize' }}>
              {muscle}
            </Text>
          </View>
        ))}
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  item: {
    alignItems: 'center',
    minWidth: 60,
  },
});
