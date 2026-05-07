// ProfileHeader — avatar + name input + quick stats row.

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Surface, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { withAlpha, spacing, borderRadius } from '../../../theme';
import { AppIcons } from '../../../theme/icons';
import { formatVolume, EMPTY_STAT } from '../useWorkoutStats';
import type { WorkoutStats } from '../useWorkoutStats';
import type { IdentitySlice } from '../useProfileForm';

const AVATAR_SIZE = 64;
const AVATAR_HALF = AVATAR_SIZE / 2;
const AVATAR_FONT = 28;
const AVATAR_ICON = 28;
const STREAK_ICON = 20;
const QUICK_STATS_BORDER_ALPHA = 0.2;

interface Props {
  identity: IdentitySlice;
  stats: WorkoutStats;
  weightUnit: 'lbs' | 'kg';
}

export function ProfileHeader({ identity, stats, weightUnit }: Props) {
  const theme = useTheme();
  const { name, setName } = identity;
  const initial = name ? name.charAt(0).toUpperCase() : null;

  return (
    <Surface style={styles.card} elevation={1}>
      <View style={styles.profileHeader}>
        <View
          style={[
            styles.avatarContainer,
            { backgroundColor: theme.colors.primary },
          ]}
          accessibilityLabel={
            name ? `Profile avatar for ${name}` : 'Profile avatar'
          }
        >
          {initial ? (
            <Text
              style={[styles.avatarText, { color: theme.colors.onPrimary }]}
            >
              {initial}
            </Text>
          ) : (
            <MaterialCommunityIcons
              name={AppIcons.profile}
              size={AVATAR_ICON}
              color={theme.colors.onPrimary}
            />
          )}
        </View>
        <View style={styles.profileInfo}>
          <TextInput
            mode="outlined"
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            style={styles.nameInput}
          />
        </View>
      </View>

      <View
        style={[
          styles.quickStats,
          {
            borderTopColor: withAlpha(
              theme.colors.outline,
              QUICK_STATS_BORDER_ALPHA,
            ),
          },
        ]}
      >
        <View style={styles.quickStatItem}>
          <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
            {stats.totalWorkouts}
          </Text>
          <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
            Workouts
          </Text>
        </View>
        <View style={styles.quickStatItem}>
          <View
            style={styles.streakRow}
            accessibilityLabel={`${stats.streak} day streak`}
          >
            <Text
              variant="headlineSmall"
              style={{ color: theme.colors.primary }}
            >
              {stats.streak}
            </Text>
            <MaterialCommunityIcons
              name={AppIcons.warmup}
              size={STREAK_ICON}
              color={theme.colors.primary}
            />
          </View>
          <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
            Day Streak
          </Text>
        </View>
        <View style={styles.quickStatItem}>
          <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
            {stats.thisWeekWorkouts}
          </Text>
          <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
            This Week
          </Text>
        </View>
        <View style={styles.quickStatItem}>
          {(() => {
            const display = formatVolume(stats.totalVolume);
            const isEmpty = display === EMPTY_STAT;
            return (
              <Text
                variant="headlineSmall"
                style={{
                  color: isEmpty
                    ? theme.colors.outline
                    : theme.colors.primary,
                }}
                accessibilityLabel={
                  isEmpty
                    ? 'No total volume recorded yet'
                    : `Total volume ${display} ${weightUnit}`
                }
              >
                {display}
              </Text>
            );
          })()}
          <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
            Total {weightUnit}
          </Text>
        </View>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarContainer: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_HALF,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: AVATAR_FONT,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  nameInput: {
    backgroundColor: 'transparent',
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.sm + spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'transparent',
  },
  quickStatItem: {
    alignItems: 'center',
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
});
