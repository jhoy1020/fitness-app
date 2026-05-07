// ActivityAndGoalsSection — daily activity level + current goal +
// goal weight / body-fat targets.
//
// Activity level renders as a vertical RadioButton.Group so every option
// is visible without horizontal scrolling. Each row exposes a primary
// label and a one-line description so users don't have to guess what
// "Moderate" means relative to "Active".
//
// Gender / Goal type still use SegmentedButtons (3 short options each
// fit comfortably on a phone), but each is wrapped in an
// `accessibilityRole="radiogroup"` so screen-reader users hear the
// label context for the option they're focused on.

import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import {
  Text,
  TextInput,
  SegmentedButtons,
  Surface,
  RadioButton,
  useTheme,
} from 'react-native-paper';
import { spacing, borderRadius, MIN_TOUCH } from '../../../theme';
import type { ActivityLevel, GoalType } from '../../../types';
import type { ActivitySlice, GoalsSlice } from '../useProfileForm';

interface ActivityOption {
  value: ActivityLevel;
  label: string;
  description: string;
}

const ACTIVITY_OPTIONS: ActivityOption[] = [
  {
    value: 'sedentary',
    label: 'Sedentary',
    description: 'Desk job, little to no exercise',
  },
  {
    value: 'light',
    label: 'Light',
    description: 'Light exercise 1–3 days/week',
  },
  {
    value: 'moderate',
    label: 'Moderate',
    description: 'Moderate exercise 3–5 days/week',
  },
  {
    value: 'active',
    label: 'Active',
    description: 'Hard exercise 6–7 days/week',
  },
  {
    value: 'very_active',
    label: 'Very Active',
    description: 'Hard daily exercise + physical job',
  },
];

const GOAL_OPTIONS: { value: GoalType; label: string }[] = [
  { value: 'cut', label: 'Cut' },
  { value: 'maintain', label: 'Maintain' },
  { value: 'bulk', label: 'Bulk' },
];

interface Props {
  activity: ActivitySlice;
  goals: GoalsSlice;
}

export function ActivityAndGoalsSection({ activity, goals }: Props) {
  const theme = useTheme();
  const { activityLevel, setActivityLevel } = activity;
  const {
    goalType,
    setGoalType,
    goalWeight,
    setGoalWeight,
    goalBodyFat,
    setGoalBodyFat,
    weightUnit,
  } = goals;

  return (
    <Surface style={styles.card} elevation={1}>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        Activity &amp; Goals
      </Text>

      <Text variant="labelLarge" style={styles.label}>
        Daily Activity Level
      </Text>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel="Daily activity level"
        style={styles.activityList}
      >
        <RadioButton.Group
          value={activityLevel}
          onValueChange={(v) => setActivityLevel(v as ActivityLevel)}
        >
          {ACTIVITY_OPTIONS.map((opt) => {
            const selected = opt.value === activityLevel;
            return (
              <Pressable
                key={opt.value}
                onPress={() => setActivityLevel(opt.value)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={`${opt.label}. ${opt.description}`}
                style={({ pressed }) => [
                  styles.activityRow,
                  {
                    borderColor: selected
                      ? theme.colors.primary
                      : theme.colors.outlineVariant,
                    backgroundColor: selected
                      ? theme.colors.primaryContainer
                      : pressed
                      ? theme.colors.surfaceVariant
                      : theme.colors.surface,
                  },
                ]}
              >
                <RadioButton.Android
                  value={opt.value}
                  // The Pressable is the actual touch target; the radio
                  // is decorative. Disabling it prevents a double-tap
                  // race where the radio's own ripple swallows the row's
                  // press.
                  uncheckedColor={theme.colors.outline}
                  color={theme.colors.primary}
                />
                <View style={styles.activityTextWrap}>
                  <Text
                    variant="titleSmall"
                    style={{
                      color: selected
                        ? theme.colors.onPrimaryContainer
                        : theme.colors.onSurface,
                    }}
                  >
                    {opt.label}
                  </Text>
                  <Text
                    variant="bodySmall"
                    style={{
                      color: selected
                        ? theme.colors.onPrimaryContainer
                        : theme.colors.onSurfaceVariant,
                    }}
                  >
                    {opt.description}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </RadioButton.Group>
      </View>

      <Text variant="labelLarge" style={styles.label}>
        Current Goal
      </Text>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel="Goal type"
      >
        <SegmentedButtons
          value={goalType}
          onValueChange={(v) => setGoalType(v as GoalType)}
          buttons={GOAL_OPTIONS}
          style={styles.segmented}
        />
      </View>

      <View style={styles.inputRow}>
        <TextInput
          mode="outlined"
          label={`Goal Weight (${weightUnit})`}
          value={goalWeight}
          onChangeText={setGoalWeight}
          keyboardType="decimal-pad"
          style={[styles.input, styles.halfInput]}
        />
        <TextInput
          mode="outlined"
          label="Goal Body Fat %"
          value={goalBodyFat}
          onChangeText={setGoalBodyFat}
          keyboardType="decimal-pad"
          style={[styles.input, styles.halfInput]}
        />
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
  sectionTitle: {
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  segmented: {
    marginBottom: spacing.sm + spacing.xs,
  },
  activityList: {
    gap: spacing.sm,
    marginBottom: spacing.sm + spacing.xs,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm + spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    minHeight: MIN_TOUCH + spacing.sm,
    gap: spacing.sm,
  },
  activityTextWrap: {
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.sm + spacing.xs,
  },
  input: {
    marginBottom: spacing.sm + spacing.xs,
  },
  halfInput: {
    flex: 1,
  },
});
