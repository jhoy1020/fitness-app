// TrainingExperienceSection — beginner / intermediate / advanced selector
// with a one-line subtitle that reflects the current selection.

import React from 'react';
import { StyleSheet } from 'react-native';
import {
  Text,
  SegmentedButtons,
  Surface,
  useTheme,
} from 'react-native-paper';
import { spacing, borderRadius } from '../../../theme';
import type { TrainingExperience } from '../../../types';
import type { TrainingSlice } from '../useProfileForm';

interface Props {
  training: TrainingSlice;
}

const SUBTITLES: Record<TrainingExperience, string> = {
  beginner: '< 1 year of consistent training',
  intermediate: '1-3 years of consistent training',
  advanced: '3+ years of consistent training',
};

export function TrainingExperienceSection({ training }: Props) {
  const theme = useTheme();
  const { trainingExperience, setTrainingExperience } = training;

  return (
    <Surface style={styles.card} elevation={1}>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        Training Experience
      </Text>
      <SegmentedButtons
        value={trainingExperience}
        onValueChange={(v) => setTrainingExperience(v as TrainingExperience)}
        buttons={[
          { value: 'beginner', label: 'Beginner' },
          { value: 'intermediate', label: 'Intermediate' },
          { value: 'advanced', label: 'Advanced' },
        ]}
        style={styles.segmented}
      />
      <Text
        variant="bodySmall"
        style={[styles.subtitle, { color: theme.colors.outline }]}
      >
        {SUBTITLES[trainingExperience]}
      </Text>
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
  segmented: {
    marginBottom: spacing.sm + spacing.xs,
  },
  subtitle: {
    marginTop: spacing.sm,
  },
});
