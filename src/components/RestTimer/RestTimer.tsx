// Rest Timer Component
// Circular countdown timer with controls

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Text, Surface, useTheme, Button } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTimer } from '../../context';
import { formatDuration, TIMER } from '../../utils';

interface RestTimerProps {
  compact?: boolean;
  onComplete?: () => void;
}

/**
 * View-based circular progress ring.
 * Uses two masked half-circles rotated by the progress value.
 */
function CircleProgress({ size, strokeWidth, progress, color, bgColor }: {
  size: number; strokeWidth: number; progress: number; color: string; bgColor: string;
}) {
  const half = size / 2;
  const clampedProgress = Math.max(0, Math.min(1, progress));

  // Each half rotates from 0° (empty) to 180° (full)
  const firstHalfDeg = Math.min(clampedProgress * 360, 180);
  const secondHalfDeg = Math.max((clampedProgress * 360) - 180, 0);

  const baseCircle = {
    width: size,
    height: size,
    borderRadius: half,
    borderWidth: strokeWidth,
  };

  const halfClip = {
    position: 'absolute' as const,
    width: half,
    height: size,
    overflow: 'hidden' as const,
  };

  const innerArc = {
    width: size,
    height: size,
    borderRadius: half,
    borderWidth: strokeWidth,
    borderColor: color,
    position: 'absolute' as const,
  };

  return (
    <View style={{ width: size, height: size }}>
      {/* Background ring */}
      <View style={[baseCircle, { borderColor: bgColor, position: 'absolute' }]} />
      {/* Right half (0–180°) */}
      <View style={[halfClip, { left: half }]}>
        <View style={[innerArc, { left: -half, transform: [{ rotate: `${firstHalfDeg}deg` }] }]} />
      </View>
      {/* Left half (180–360°) */}
      <View style={[halfClip, { left: 0 }]}>
        <View style={[innerArc, { left: 0, transform: [{ rotate: `${secondHalfDeg}deg` }] }]} />
      </View>
    </View>
  );
}

export function RestTimer({ compact = false, onComplete }: RestTimerProps) {
  const theme = useTheme();
  const { state, pauseTimer, resumeTimer, stopTimer, adjustTimer } = useTimer();

  const { isRunning, timeRemaining, totalTime } = state;
  const progress = totalTime > 0 ? timeRemaining / totalTime : 0;

  const size = compact ? 80 : 200;
  const strokeWidth = compact ? 4 : 8;

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
              style={styles.compactBtn}
              accessibilityLabel={isRunning ? 'Pause timer' : 'Resume timer'}
              accessibilityRole="button"
              testID={isRunning ? 'pause-button' : 'play-button'}
            >
              <MaterialCommunityIcons name={isRunning ? 'pause' : 'play'} size={18} color={theme.colors.onSurfaceVariant} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={stopTimer}
              style={styles.compactBtn}
              accessibilityLabel="Stop timer"
              accessibilityRole="button"
              testID="stop-button"
            >
              <MaterialCommunityIcons name="stop" size={18} color={theme.colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>
        </View>
      </Surface>
    );
  }

  return (
    <Surface style={styles.container} elevation={2}>
      <View style={styles.timerCircle}>
        <CircleProgress
          size={size}
          strokeWidth={strokeWidth}
          progress={progress}
          color={getTimerColor()}
          bgColor={theme.colors.surfaceVariant}
        />
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
            style={[styles.adjustBtn, { borderColor: theme.colors.outline }]}
            accessibilityLabel={`Adjust timer ${seconds > 0 ? '+' : ''}${seconds} seconds`}
            accessibilityRole="button"
          >
            <Text>{seconds < 0 ? `${seconds}s` : `+${seconds}s`}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Control buttons */}
      <View style={styles.controlButtons}>
        <TouchableOpacity
          onPress={() => adjustTimer(totalTime - timeRemaining)}
          style={[styles.controlBtn, { borderColor: theme.colors.outline }]}
          accessibilityLabel="Reset timer"
          accessibilityRole="button"
        >
          <MaterialCommunityIcons name="refresh" size={20} color={theme.colors.onSurfaceVariant} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={isRunning ? pauseTimer : resumeTimer}
          style={[styles.playPauseBtn, { backgroundColor: theme.colors.primary }]}
          accessibilityLabel={isRunning ? 'Pause timer' : 'Resume timer'}
          accessibilityRole="button"
        >
          <MaterialCommunityIcons name={isRunning ? 'pause' : 'play'} size={28} color={theme.colors.onPrimary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={stopTimer}
          style={[styles.controlBtn, { borderColor: theme.colors.outline }]}
          accessibilityLabel="Skip rest timer"
          accessibilityRole="button"
        >
          <MaterialCommunityIcons name="skip-next" size={20} color={theme.colors.onSurfaceVariant} />
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjustButtons: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
  adjustBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 20,
    minHeight: 44,
    minWidth: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 16,
  },
  controlBtn: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 24,
    minHeight: 48,
    minWidth: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playPauseBtn: {
    padding: 16,
    borderRadius: 32,
    minHeight: 56,
    minWidth: 56,
    alignItems: 'center',
    justifyContent: 'center',
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
  compactBtn: {
    padding: 10,
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
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
