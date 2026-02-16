// Progress Bar Component
// Visual progress indicator for goals

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

interface ProgressBarProps {
  progress: number; // 0 to 1
  label?: string;
  showPercentage?: boolean;
  height?: number;
  color?: string;
  backgroundColor?: string;
}

export function ProgressBar({
  progress,
  label,
  showPercentage = true,
  height = 8,
  color,
  backgroundColor,
}: ProgressBarProps) {
  const theme = useTheme();
  
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const percentage = Math.round(clampedProgress * 100);
  
  const progressColor = color || theme.colors.primary;
  const bgColor = backgroundColor || theme.colors.surfaceVariant;

  return (
    <View style={styles.container}>
      {(label || showPercentage) && (
        <View style={styles.labelContainer}>
          {label && (
            <Text variant="labelMedium" style={{ color: theme.colors.onSurface }}>
              {label}
            </Text>
          )}
          {showPercentage && (
            <Text variant="labelMedium" style={{ color: theme.colors.outline }}>
              {percentage}%
            </Text>
          )}
        </View>
      )}
      <View style={[styles.track, { height, backgroundColor: bgColor }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${percentage}%`,
              backgroundColor: progressColor,
              height,
            },
          ]}
        />
      </View>
    </View>
  );
}

interface GoalProgressProps {
  current: number;
  target: number;
  label: string;
  unit?: string;
  showValues?: boolean;
}

export function GoalProgress({
  current,
  target,
  label,
  unit = '',
  showValues = true,
}: GoalProgressProps) {
  const theme = useTheme();
  const progress = target > 0 ? current / target : 0;
  const isComplete = current >= target;

  return (
    <View style={styles.goalContainer}>
      <View style={styles.goalHeader}>
        <Text variant="titleSmall">{label}</Text>
        {showValues && (
          <Text variant="bodyMedium" style={{ color: isComplete ? theme.colors.primary : theme.colors.onSurface }}>
            {current} / {target} {unit}
          </Text>
        )}
      </View>
      <ProgressBar
        progress={progress}
        showPercentage={false}
        color={isComplete ? '#4CAF50' : theme.colors.primary}
      />
      {isComplete && (
        <Text variant="labelSmall" style={{ color: '#4CAF50', marginTop: 4 }}>
          🎉 Goal achieved!
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  track: {
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 4,
  },
  goalContainer: {
    marginVertical: 8,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
});

export default ProgressBar;
