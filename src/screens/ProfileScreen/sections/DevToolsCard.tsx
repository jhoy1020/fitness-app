// DevToolsCard — `__DEV__`-gated tools for seeding test data and signing
// in as the canned test account. Visual treatment (dashed border, muted
// background, "DEV" chip) matches LoginScreen's developer card so the two
// always read as the same kind of UI surface.
//
// This component owns the seeding side-effect plumbing because the parent
// has no other reason to know about it.

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Text,
  Button,
  Surface,
  Chip,
  useTheme,
  Snackbar,
  Portal,
} from 'react-native-paper';
import { useDatabase } from '../../../context/DatabaseProvider';
import { useUser, useWorkout } from '../../../context';
import { useAuth } from '../../../context/AuthContext';
import { seedTestData } from '../../../db/seedTestData';
import { spacing, borderRadius, withAlpha } from '../../../theme';

const SNACKBAR_DURATION_MS = 6_000;
const DEV_BG_ALPHA = 0.06;
const DEV_CHIP_BG_ALPHA = 0.12;
const DEV_CHIP_HEIGHT = 24;
const DEV_CHIP_FONT_SIZE = 10;
const DEV_CHIP_LINE_HEIGHT = 14;

export function DevToolsCard() {
  const theme = useTheme();
  const { db, repos } = useDatabase();
  const { loadProfile, loadWeightHistory } = useUser();
  const { loadHistory } = useWorkout();
  const { loginAsTestUser } = useAuth();
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  const handleLoadTestData = async () => {
    setIsSeeding(true);
    try {
      const summary = await seedTestData(db, repos);
      await Promise.all([
        loadHistory(),
        loadProfile(),
        loadWeightHistory(),
      ]);
      setSeedMessage(
        `Seeded ${summary.workouts} workouts, ${summary.sets} sets, ${summary.measurements} measurements, ${summary.oneRepMaxRecords} 1RM records. Reload to see 1RM & mesocycle.`,
      );
    } catch (err) {
      console.error('[seedTestData] failed:', err);
      setSeedMessage(
        `Seed failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setIsSeeding(false);
    }
  };

  const handleTestUserLogin = async () => {
    try {
      await loginAsTestUser();
      setSeedMessage('Signed in as test user.');
    } catch (e) {
      setSeedMessage(
        `Sign-in failed: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  };

  const devChipBg = withAlpha(theme.colors.outline, DEV_CHIP_BG_ALPHA);
  const devCardBg = withAlpha(theme.colors.outline, DEV_BG_ALPHA);

  return (
    <>
      <Surface
        style={[
          styles.card,
          {
            borderColor: theme.colors.outline,
            backgroundColor: devCardBg,
          },
        ]}
        elevation={0}
      >
        <View style={styles.header}>
          <Text variant="titleMedium">Developer</Text>
          <Chip
            compact
            style={[styles.chip, { backgroundColor: devChipBg }]}
            textStyle={styles.chipText}
          >
            DEV
          </Chip>
        </View>
        <Text
          variant="bodySmall"
          style={[styles.helper, { color: theme.colors.outline }]}
        >
          Load a fixture of 8 weeks of workouts, measurements, 1RMs, and an
          active mesocycle for manual testing.
        </Text>
        <Button
          mode="outlined"
          onPress={handleLoadTestData}
          loading={isSeeding}
          disabled={isSeeding}
          icon="database-import"
          style={styles.actionSpacing}
        >
          {isSeeding ? 'Loading…' : 'Load Test Data'}
        </Button>
        <Button
          mode="outlined"
          onPress={handleTestUserLogin}
          disabled={isSeeding}
          icon="flask"
        >
          Sign in as test user
        </Button>
      </Surface>

      {/* Snackbar must live inside a Portal so it anchors to the
          screen's safe-area bottom rather than the (possibly-scrolled)
          ScrollView this card is rendered inside. Without the Portal
          the toast can render off-screen when the user has scrolled. */}
      <Portal>
        <Snackbar
          visible={!!seedMessage}
          onDismiss={() => setSeedMessage(null)}
          duration={SNACKBAR_DURATION_MS}
          action={{ label: 'OK', onPress: () => setSeedMessage(null) }}
        >
          {seedMessage ?? ''}
        </Snackbar>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  chip: {
    height: DEV_CHIP_HEIGHT,
  },
  chipText: {
    fontSize: DEV_CHIP_FONT_SIZE,
    fontWeight: '700',
    lineHeight: DEV_CHIP_LINE_HEIGHT,
    marginVertical: 0,
  },
  helper: {
    marginBottom: spacing.sm + spacing.xs,
  },
  actionSpacing: {
    marginBottom: spacing.sm,
  },
});
