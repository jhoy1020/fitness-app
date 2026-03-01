// PausedWorkoutCard - Shown when a standalone (non-program) workout is paused
// Uses ONLY React Native primitives — no third-party components (web-safe)

import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { withAlpha } from '../../theme';

interface ThemeColors {
  primary: string;
  onPrimary: string;
  outline: string;
  onSurface: string;
  error: string;
  elevation: {
    level2: string;
  };
}

interface PausedWorkoutCardProps {
  workoutName: string;
  exerciseCount: number;
  pausedAt: string; // ISO date string
  theme: { colors: ThemeColors };
  onResume: () => void;
  onDiscard: () => void;
}

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function PausedWorkoutCard({
  workoutName,
  exerciseCount,
  pausedAt,
  theme,
  onResume,
  onDiscard,
}: PausedWorkoutCardProps) {
  const c = theme.colors;

  return (
    <View style={[styles.card, { backgroundColor: c.elevation.level2 }]}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="pause" size={16} color={c.onSurface} style={{ marginRight: 8 }} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: c.onSurface }]} numberOfLines={1}>
            {workoutName}
          </Text>
          <Text style={{ fontSize: 12, color: c.outline }}>
            {exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''} {'\u2022'} Paused {timeAgo(pausedAt)}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={onResume}
          style={[styles.btn, { backgroundColor: c.primary, flex: 1 }]}
        >
          <Text style={[styles.btnLabel, { color: c.onPrimary, fontWeight: '700' }]}>Resume Workout</Text>
        </Pressable>
        <Pressable
          onPress={onDiscard}
          style={[styles.btn, { borderWidth: 1, borderColor: c.error, flex: 1 }]}
        >
          <Text style={[styles.btnLabel, { color: c.error }]}>Discard</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: withAlpha('#FFFFFF', 0.12),
    overflow: 'hidden' as const,
    ...(Platform.OS === 'web' ? { position: 'relative' as const, zIndex: 1 } : {}),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  btn: {
    borderRadius: 8,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  btnLabel: {
    fontWeight: '600',
    fontSize: 14,
  },
});

export default PausedWorkoutCard;
