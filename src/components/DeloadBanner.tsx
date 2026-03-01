// DeloadBanner - Shows deload recommendation on the dashboard

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Text, Surface, Button, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { withAlpha, statusColors } from '../theme';
import { useWorkout } from '../context/WorkoutContext';
import { useMesoCycle } from '../context/MesoCycleContext';
import { analyzeDeloadNeed, DeloadRecommendation } from '../utils/deloadDetection';
import type { WorkoutFeedback } from '../types';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function DeloadBanner() {
  const theme = useTheme();
  const { state: workoutState, startDeloadWeek, endDeloadWeek, dismissDeload } = useWorkout();
  const { state: mesoState } = useMesoCycle();
  const [recommendation, setRecommendation] = useState<DeloadRecommendation | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (workoutState.workoutHistory.length < 4) return;

    const feedbackHistory: WorkoutFeedback[] = mesoState.workoutFeedback || [];
    const rec = analyzeDeloadNeed(workoutState.workoutHistory, feedbackHistory);
    setRecommendation(rec);

    if (rec.needsDeload && !workoutState.deloadState.isDismissed) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [workoutState.workoutHistory, mesoState.workoutFeedback]);

  // Auto-end deload week after 7 days
  useEffect(() => {
    if (workoutState.deloadState.isInDeloadWeek && workoutState.deloadState.deloadStartDate) {
      const startDate = new Date(workoutState.deloadState.deloadStartDate);
      const now = new Date();
      const daysSinceStart = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceStart >= 7) {
        endDeloadWeek();
      }
    }
  }, [workoutState.deloadState]);

  if (!recommendation) return null;

  // Active deload state
  if (workoutState.deloadState.isInDeloadWeek) {
    const startDate = workoutState.deloadState.deloadStartDate
      ? new Date(workoutState.deloadState.deloadStartDate)
      : new Date();
    const daysIn = Math.floor(
      (new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;
    const daysRemaining = Math.max(0, 7 - daysIn);
    const progress = daysIn / 7;

    return (
      <Surface style={[styles.container, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <View style={styles.headerRow}>
          <View style={[styles.iconContainer, { backgroundColor: withAlpha(statusColors.beginner, 0.15) }]}>
            <MaterialCommunityIcons name="leaf" size={18} color={statusColors.beginner} />
          </View>
          <View style={styles.headerText}>
            <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>
              Deload Week Active
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Day {daysIn} of 7 — {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining
            </Text>
          </View>
          <Button
            mode="text"
            compact
            onPress={() => endDeloadWeek()}
            textColor={theme.colors.error}
          >
            End
          </Button>
        </View>

        <Surface 
          style={[styles.tipBox, { backgroundColor: theme.colors.primaryContainer }]} 
          elevation={0}
        >
          <Text variant="bodySmall" style={{ color: theme.colors.onPrimaryContainer }}>
            Reduce weight by ~35% and sets by ~50%. Focus on form and recovery.
          </Text>
        </Surface>

        {/* Progress bar */}
        <View style={[styles.progressBarBg, { backgroundColor: theme.colors.surfaceVariant }]}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${progress * 100}%`, backgroundColor: statusColors.beginner },
            ]}
          />
        </View>
      </Surface>
    );
  }

  // Don't show if no deload needed or dismissed
  if (!recommendation.needsDeload || workoutState.deloadState.isDismissed) return null;

  const severityColor =
    recommendation.confidence >= 70
      ? theme.colors.error
      : recommendation.confidence >= 55
      ? statusColors.intermediate
      : (theme.colors as any).warning;

  const severityIcon =
    recommendation.confidence >= 70
      ? 'alert'
      : recommendation.confidence >= 55
      ? 'alert-circle'
      : 'lightbulb-outline';

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <Surface
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.surface,
            borderLeftWidth: 4,
            borderLeftColor: severityColor,
          },
        ]}
        elevation={1}
      >
        <TouchableOpacity onPress={toggleExpand} activeOpacity={0.8}>
          <View style={styles.headerRow}>
            <View style={[styles.iconContainer, { backgroundColor: withAlpha(severityColor, 0.12) }]}>
              <MaterialCommunityIcons name={severityIcon as any} size={18} color={severityColor} />
            </View>
            <View style={styles.headerText}>
              <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>
                Deload Recommended
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {recommendation.confidence}% confidence — {recommendation.signals.length} signal
                {recommendation.signals.length !== 1 ? 's' : ''} detected
              </Text>
            </View>
            <MaterialCommunityIcons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={theme.colors.onSurfaceVariant}
            />
          </View>
        </TouchableOpacity>

        {/* Summary always visible */}
        <Text
          variant="bodySmall"
          style={{ color: theme.colors.onSurfaceVariant, marginTop: 10, lineHeight: 18 }}
        >
          {recommendation.summary}
        </Text>

        {/* Expanded details */}
        {expanded && (
          <View style={styles.expandedContent}>
            <Text
              variant="labelLarge"
              style={{ color: theme.colors.onSurface, marginBottom: 10 }}
            >
              Detection Signals
            </Text>

            {recommendation.signals.map((signal, index) => (
              <View key={index} style={styles.signalRow}>
                <View
                  style={[
                    styles.signalDot,
                    {
                      backgroundColor:
                        signal.severity === 'high'
                          ? theme.colors.error
                          : signal.severity === 'medium'
                          ? statusColors.intermediate
                          : (theme.colors as any).warning,
                    },
                  ]}
                />
                <View style={{ flex: 1 }}>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, fontWeight: '600' }}>
                    {signal.signal}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
                    {signal.description}
                  </Text>
                </View>
              </View>
            ))}

            {/* Suggestion */}
            <Surface
              style={[styles.suggestionBox, { backgroundColor: theme.colors.surfaceVariant }]}
              elevation={0}
            >
              <Text variant="labelMedium" style={{ color: theme.colors.onSurface, marginBottom: 6 }}>
                Suggested Deload Protocol
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, lineHeight: 20 }}>
                {`• Reduce volume by ${Math.round(recommendation.suggestedVolumeReduction * 100)}%\n• Reduce weight by ${Math.round(recommendation.suggestedIntensityReduction * 100)}%\n• Duration: ${recommendation.suggestedDuration} days\n• Keep the same exercises, focus on form`}
              </Text>
            </Surface>
          </View>
        )}

        {/* Action buttons */}
        <View style={styles.buttonRow}>
          <Button
            mode="contained"
            onPress={() => startDeloadWeek()}
            style={{ flex: 1 }}
            icon="leaf"
            buttonColor={statusColors.beginner}
            textColor={theme.colors.onPrimary}
            compact
          >
            Start Deload Week
          </Button>
          <Button
            mode="outlined"
            onPress={() => dismissDeload()}
            style={{ flex: 1 }}
            compact
          >
            Dismiss
          </Button>
        </View>
      </Surface>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  expandedContent: {
    marginTop: 16,
  },
  signalRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  signalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
    marginRight: 10,
  },
  suggestionBox: {
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 10,
  },
  tipBox: {
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
  },
  progressBarBg: {
    height: 4,
    borderRadius: 2,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
});
