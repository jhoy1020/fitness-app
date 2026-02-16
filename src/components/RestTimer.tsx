// Rest Timer Component
// Circular countdown timer with controls

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Surface, useTheme, Button } from 'react-native-paper';
import { useTimer } from '../context';
import { formatDuration, TIMER } from '../utils';

interface RestTimerProps {
  compact?: boolean;
  onComplete?: () => void;
}

export function RestTimer({ compact = false, onComplete }: RestTimerProps) {
  const theme = useTheme();
  const { state, pauseTimer, resumeTimer, stopTimer, adjustTimer } = useTimer();

  const { isRunning, timeRemaining, totalTime } = state;
  const progress = totalTime > 0 ? timeRemaining / totalTime : 0;
  
  // Calculate circle properties
  const size = compact ? 80 : 200;
  const strokeWidth = compact ? 4 : 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  // Handle completion
  React.useEffect(() => {
    if (timeRemaining === 0 && totalTime > 0) {
      onComplete?.();
    }
  }, [timeRemaining, totalTime, onComplete]);

  if (!isRunning && timeRemaining === 0 && totalTime === 0) {
    return null;
  }

  const getTimerColor = () => {
    if (timeRemaining <= 5) return theme.colors.error;
    if (timeRemaining <= 10) return theme.colors.tertiary;
    return theme.colors.primary;
  };

  if (compact) {
    return (
      <Surface style={[styles.compactContainer, { backgroundColor: theme.colors.surfaceVariant }]} elevation={1}>
        <View style={styles.compactContent}>
          <View style={[styles.miniCircle, { borderColor: getTimerColor() }]}>
            <Text variant="labelLarge" style={{ color: getTimerColor() }}>
              {formatDuration(timeRemaining)}
            </Text>
          </View>
          <View style={styles.compactButtons}>
            <TouchableOpacity
              onPress={isRunning ? pauseTimer : resumeTimer}
              style={{ padding: 8 }}
            >
              <Text style={{ fontSize: 18 }}>{isRunning ? '⏸' : '▶'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={stopTimer}
              style={{ padding: 8 }}
            >
              <Text style={{ fontSize: 18 }}>⏹</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Surface>
    );
  }

  return (
    <Surface style={styles.container} elevation={2}>
      <View style={styles.timerCircle}>
        <svg width={size} height={size} style={styles.svg}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={theme.colors.surfaceVariant}
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={getTimerColor()}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        <View style={styles.timerText}>
          <Text variant="displayMedium" style={{ color: getTimerColor() }}>
            {formatDuration(timeRemaining)}
          </Text>
          <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Rest Time
          </Text>
        </View>
      </View>

      {/* Quick adjust buttons */}
      <View style={styles.adjustButtons}>
        {TIMER.quickAdjustments.map((seconds) => (
          <TouchableOpacity
            key={seconds}
            onPress={() => adjustTimer(seconds)}
            style={{ padding: 12, borderWidth: 1, borderColor: theme.colors.outline, borderRadius: 20, marginHorizontal: 4 }}
          >
            <Text>{seconds < 0 ? `${seconds}s` : `+${seconds}s`}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Control buttons */}
      <View style={styles.controlButtons}>
        <TouchableOpacity
          onPress={() => adjustTimer(totalTime - timeRemaining)}
          style={{ padding: 12, borderWidth: 1, borderColor: theme.colors.outline, borderRadius: 24 }}
        >
          <Text style={{ fontSize: 20 }}>🔄</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={isRunning ? pauseTimer : resumeTimer}
          style={{ padding: 16, backgroundColor: theme.colors.primary, borderRadius: 32, marginHorizontal: 16 }}
        >
          <Text style={{ fontSize: 28, color: '#fff' }}>{isRunning ? '⏸' : '▶'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={stopTimer}
          style={{ padding: 12, borderWidth: 1, borderColor: theme.colors.outline, borderRadius: 24 }}
        >
          <Text style={{ fontSize: 20 }}>⏭</Text>
        </TouchableOpacity>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  timerCircle: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    transform: [{ rotateZ: '0deg' }],
  },
  timerText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjustButtons: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
  controlButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 16,
  },
  compactContainer: {
    borderRadius: 12,
    padding: 8,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compactButtons: {
    flexDirection: 'row',
  },
  miniCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default RestTimer;
