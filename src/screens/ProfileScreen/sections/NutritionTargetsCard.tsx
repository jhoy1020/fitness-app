// NutritionTargetsCard — read-only computed BMR / TDEE / target calories
// and macro breakdown. The visual treatment (surfaceVariant background +
// "calculated from your inputs above" caption) is intentional: this is the
// only card on the screen the user can't directly edit, and the styling
// telegraphs that without an extra label.

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Surface, Divider, useTheme } from 'react-native-paper';
import { ProgressBar, InfoTooltip, ABBREVIATIONS } from '../../../components';
import { spacing, borderRadius } from '../../../theme';
import type { NutritionCalculation } from '../../../types';

const KCAL_PER_GRAM_PROTEIN = 4;
const KCAL_PER_GRAM_CARB = 4;
const KCAL_PER_GRAM_FAT = 9;

interface Props {
  nutrition: NutritionCalculation;
  /** When set, the BMR tile shows a "measured" annotation. */
  hasBmrOverride: boolean;
}

export function NutritionTargetsCard({ nutrition, hasBmrOverride }: Props) {
  const theme = useTheme();

  const targetCalories = nutrition.targetCalories || 1; // guard against /0
  const proteinShare = (nutrition.protein * KCAL_PER_GRAM_PROTEIN) / targetCalories;
  const carbShare = (nutrition.carbs * KCAL_PER_GRAM_CARB) / targetCalories;
  const fatShare = (nutrition.fat * KCAL_PER_GRAM_FAT) / targetCalories;

  return (
    <Surface
      style={[
        styles.card,
        { backgroundColor: theme.colors.surfaceVariant },
      ]}
      elevation={0}
    >
      <Text variant="titleMedium" style={styles.sectionTitle}>
        Your Daily Targets
      </Text>
      <Text
        variant="bodySmall"
        style={[styles.caption, { color: theme.colors.onSurfaceVariant }]}
      >
        Calculated from your inputs above. Edit Body Metrics or Goals to
        update.
      </Text>

      <View style={styles.resultsGrid}>
        <View style={styles.resultItem}>
          <Text variant="displaySmall" style={{ color: theme.colors.primary }}>
            {nutrition.bmr}
          </Text>
          <View style={styles.tileLabelRow}>
            <Text variant="labelMedium">
              BMR {hasBmrOverride ? '✓' : ''}
            </Text>
            <InfoTooltip {...ABBREVIATIONS.BMR} />
          </View>
          {hasBmrOverride && (
            <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
              measured
            </Text>
          )}
        </View>
        <View style={styles.resultItem}>
          <Text
            variant="displaySmall"
            style={{ color: theme.colors.secondary }}
          >
            {nutrition.tdee}
          </Text>
          <View style={styles.tileLabelRow}>
            <Text variant="labelMedium">TDEE</Text>
            <InfoTooltip {...ABBREVIATIONS.TDEE} />
          </View>
        </View>
        <View style={styles.resultItem}>
          <Text variant="displaySmall" style={{ color: theme.colors.tertiary }}>
            {nutrition.targetCalories}
          </Text>
          <Text variant="labelMedium">Target Calories</Text>
        </View>
      </View>

      <Divider style={styles.divider} />

      <Text variant="titleSmall" style={styles.macroTitle}>
        Macro Breakdown
      </Text>
      <View style={styles.macrosGrid}>
        <View style={styles.macroItem}>
          <Text variant="headlineMedium">{nutrition.protein}g</Text>
          <Text variant="labelSmall">Protein</Text>
          <ProgressBar
            progress={proteinShare}
            color={theme.colors.primary}
            showPercentage={false}
          />
        </View>
        <View style={styles.macroItem}>
          <Text variant="headlineMedium">{nutrition.carbs}g</Text>
          <Text variant="labelSmall">Carbs</Text>
          <ProgressBar
            progress={carbShare}
            color={theme.colors.secondary}
            showPercentage={false}
          />
        </View>
        <View style={styles.macroItem}>
          <Text variant="headlineMedium">{nutrition.fat}g</Text>
          <Text variant="labelSmall">Fat</Text>
          <ProgressBar
            progress={fatShare}
            color={theme.colors.tertiary}
            showPercentage={false}
          />
        </View>
      </View>

      {(nutrition.deficit || nutrition.surplus) && (
        <Text
          variant="bodySmall"
          style={[styles.deltaText, { color: theme.colors.outline }]}
        >
          {nutrition.deficit
            ? `Daily deficit: ${nutrition.deficit} calories`
            : `Daily surplus: ${nutrition.surplus} calories`}
        </Text>
      )}
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
    marginBottom: spacing.xs,
  },
  caption: {
    marginBottom: spacing.md,
    fontStyle: 'italic',
  },
  resultsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  resultItem: {
    alignItems: 'center',
  },
  tileLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    marginVertical: spacing.md,
  },
  macroTitle: {
    marginBottom: spacing.sm + spacing.xs,
  },
  macrosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macroItem: {
    alignItems: 'center',
    flex: 1,
  },
  deltaText: {
    marginTop: spacing.sm + spacing.xs,
    textAlign: 'center',
  },
});
