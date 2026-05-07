// AccountSection — guest / signed-in account block. Calls `useAuth()`
// directly because the auth state is its only dependency and prop-drilling
// the same three fields through the parent adds nothing.

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Surface, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../../context/AuthContext';
import { spacing, borderRadius } from '../../../theme';

const PROVIDER_ICON_SIZE = 32;

type ProviderIcon = 'google' | 'apple' | 'account-question' | 'account-circle';

function providerIconName(
  provider: 'email' | 'google' | 'apple' | 'guest' | undefined,
): ProviderIcon {
  switch (provider) {
    case 'google':
      return 'google';
    case 'apple':
      return 'apple';
    case 'guest':
      return 'account-question';
    default:
      return 'account-circle';
  }
}

export function AccountSection() {
  const theme = useTheme();
  const { user, isAuthenticated, isGuest, logout } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <Surface style={styles.card} elevation={1}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Account
        </Text>
      </Surface>
    );
  }

  return (
    <Surface style={styles.card} elevation={1}>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        Account
      </Text>
      <View style={styles.userRow}>
        <MaterialCommunityIcons
          name={providerIconName(user.authProvider)}
          size={PROVIDER_ICON_SIZE}
          color={theme.colors.primary}
          style={styles.providerIcon}
        />
        <View style={styles.userText}>
          <Text variant="bodyLarge">{user.displayName}</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
            {isGuest
              ? 'Guest session — data stays on this device'
              : user.email}
          </Text>
        </View>
      </View>
      {isGuest && (
        <Text
          variant="bodySmall"
          style={[styles.guestNudge, { color: theme.colors.outline }]}
        >
          Sign in or create an account to sync workouts, share programs, and
          back up your data.
        </Text>
      )}
      <Button
        mode={isGuest ? 'contained' : 'outlined'}
        onPress={() => logout()}
        icon={isGuest ? 'login' : 'logout'}
      >
        {isGuest ? 'Sign in or create account' : 'Sign out'}
      </Button>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm + spacing.xs,
  },
  providerIcon: {
    marginRight: spacing.sm + spacing.xs,
  },
  userText: {
    flex: 1,
  },
  guestNudge: {
    marginBottom: spacing.sm + spacing.xs,
  },
});
