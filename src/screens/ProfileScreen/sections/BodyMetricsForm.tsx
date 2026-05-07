// BodyMetricsForm — weight, height, age, body fat, gender, BMR override.

import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Text,
  TextInput,
  SegmentedButtons,
  Surface,
  Divider,
  HelperText,
  useTheme,
} from 'react-native-paper';
import { spacing, borderRadius } from '../../../theme';
import type { BodyMetricsSlice } from '../useProfileForm';
import type { ProfileFormErrors } from '../validateProfileForm';

interface Props {
  bodyMetrics: BodyMetricsSlice;
  /** Optional validation errors keyed by field. Surfaced in
   *  <HelperText type="error"> below the matching input. The Save
   *  button is intentionally never disabled — errors are populated by
   *  the parent on Save attempt and cleared as the user re-types. */
  errors?: ProfileFormErrors;
}

export function BodyMetricsForm({ bodyMetrics, errors = {} }: Props) {
  const theme = useTheme();
  const {
    weight,
    setWeight,
    height,
    setHeight,
    age,
    setAge,
    bodyFat,
    setBodyFat,
    bmrOverride,
    setBmrOverride,
    gender,
    setGender,
    weightUnit,
    heightUnit,
  } = bodyMetrics;

  return (
    <Surface style={styles.card} elevation={1}>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        Body Metrics
      </Text>

      <View style={styles.inputRow}>
        <View style={styles.halfInput}>
          <TextInput
            mode="outlined"
            label={`Weight (${weightUnit})`}
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
            error={!!errors.weight}
            accessibilityLabel={`Weight in ${weightUnit}`}
          />
          <HelperText type="error" visible={!!errors.weight}>
            {errors.weight ?? ' '}
          </HelperText>
        </View>
        <View style={styles.halfInput}>
          <TextInput
            mode="outlined"
            label={`Height (${heightUnit})`}
            value={height}
            onChangeText={setHeight}
            keyboardType="decimal-pad"
            error={!!errors.height}
            accessibilityLabel={`Height in ${heightUnit}`}
          />
          <HelperText type="error" visible={!!errors.height}>
            {errors.height ?? ' '}
          </HelperText>
        </View>
      </View>

      <View style={styles.inputRow}>
        <View style={styles.halfInput}>
          <TextInput
            mode="outlined"
            label="Age"
            value={age}
            onChangeText={setAge}
            keyboardType="number-pad"
            error={!!errors.age}
            accessibilityLabel="Age in years"
          />
          <HelperText type="error" visible={!!errors.age}>
            {errors.age ?? ' '}
          </HelperText>
        </View>
        <View style={styles.halfInput}>
          <TextInput
            mode="outlined"
            label="Body Fat %"
            value={bodyFat}
            onChangeText={setBodyFat}
            keyboardType="decimal-pad"
            error={!!errors.bodyFat}
            accessibilityLabel="Body fat percentage"
          />
          <HelperText type="error" visible={!!errors.bodyFat}>
            {errors.bodyFat ?? ' '}
          </HelperText>
        </View>
      </View>

      <Text
        variant="labelLarge"
        style={styles.label}
        nativeID="bodyMetrics-gender-label"
      >
        Gender
      </Text>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel="Gender"
      >
        <SegmentedButtons
          value={gender}
          onValueChange={(v) => setGender(v as 'male' | 'female' | 'other')}
          buttons={[
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
            { value: 'other', label: 'Other' },
          ]}
          style={styles.segmented}
        />
      </View>

      <Divider style={styles.divider} />

      <Text variant="labelLarge" style={styles.label}>
        Measured BMR (Optional)
      </Text>
      <Text
        variant="bodySmall"
        style={[styles.helperText, { color: theme.colors.outline }]}
      >
        If you know your BMR from a DEXA scan or metabolic test, enter it here
        to override the calculated value.
      </Text>
      <TextInput
        mode="outlined"
        label="BMR (calories/day)"
        value={bmrOverride}
        onChangeText={setBmrOverride}
        keyboardType="number-pad"
        placeholder="e.g., 1850"
        style={styles.input}
        error={!!errors.bmrOverride}
        accessibilityLabel="Measured BMR override in calories per day"
        right={
          bmrOverride ? (
            <TextInput.Icon icon="close" onPress={() => setBmrOverride('')} />
          ) : undefined
        }
      />
      <HelperText type="error" visible={!!errors.bmrOverride}>
        {errors.bmrOverride ?? ' '}
      </HelperText>
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
  input: {
    marginBottom: spacing.sm + spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.sm + spacing.xs,
  },
  halfInput: {
    flex: 1,
  },
  label: {
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  segmented: {
    marginBottom: spacing.sm + spacing.xs,
  },
  divider: {
    marginVertical: spacing.md,
  },
  helperText: {
    marginBottom: spacing.sm,
  },
});
