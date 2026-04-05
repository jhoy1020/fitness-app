/**
 * RecentPRsCard — shows personal records achieved in the last week.
 * Pure presentational component.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { withAlpha, statusColors } from '../../theme';
import { AppIcons } from '../../theme/icons';

export interface PREntry {
  exercise: string;
  weight: number;
  reps: number;
  e1rm: number;
  date: string;
}

interface RecentPRsCardProps {
  prs: PREntry[];
}

export function RecentPRsCard({ prs }: RecentPRsCardProps) {
  const theme = useTheme();

  if (prs.length === 0) return null;

  return (
    <Surface style={styles.container} elevation={1}>
      <View style={styles.header}>
        <MaterialCommunityIcons name={AppIcons.pr} size={22} color={statusColors.pr} />
        <Text variant="titleMedium" style={{ marginLeft: 8 }}>Recent PRs</Text>
      </View>
      {prs.slice(0, 3).map((pr, index) => (
        <View key={index} style={[styles.item, { borderTopColor: withAlpha(theme.colors.outline, 0.2) }]}>
          <Text variant="bodyMedium" style={{ flex: 1 }} numberOfLines={1}>
            {pr.exercise}
          </Text>
          <Text variant="titleSmall" style={{ color: theme.colors.primary }}>
            {pr.weight} × {pr.reps}
          </Text>
        </View>
      ))}
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
  },
});
