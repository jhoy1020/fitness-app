/**
 * QuickStartTemplates — Single quick-start button for a blank workout.
 * Pure presentational component.
 */

import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { withAlpha } from '../../theme';
import { AppIcons } from '../../theme/icons';
import type { TemplateWorkoutParam } from '../../navigation';

interface QuickStartTemplatesProps {
  onStartWorkout: (template?: TemplateWorkoutParam) => void;
}

export function QuickStartTemplates({ onStartWorkout }: QuickStartTemplatesProps) {
  const theme = useTheme();

  return (
    <TouchableOpacity onPress={() => onStartWorkout()} activeOpacity={0.7}>
      <Surface style={[styles.container, { borderColor: withAlpha(theme.colors.primary, 0.3), borderWidth: 1 }]} elevation={1}>
        <MaterialCommunityIcons name={AppIcons.workout as any} size={24} color={theme.colors.primary} />
        <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: '600', flex: 1 }}>
          Quick Start Workout
        </Text>
        <MaterialCommunityIcons name={AppIcons.chevronRight as any} size={20} color={theme.colors.primary} />
      </Surface>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
});
