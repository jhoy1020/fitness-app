// OneRepMaxSection — display + delete-confirm for the saved 1RM list.
// Adding a record is owned by AddOneRepMaxDialog (separate component);
// this component just shows the list and exposes "+ Add 1RM" + delete.

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Text,
  Button,
  Surface,
  useTheme,
} from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {
  InfoTooltip,
  ABBREVIATIONS,
  ConfirmDialog,
} from '../../../components';
import { spacing, borderRadius } from '../../../theme';
import { AppIcons } from '../../../theme/icons';
import type { OneRepMaxRecord } from '../../../types';

const DELETE_ICON_SIZE = 20;
const TOUCH_TARGET = 44;

interface Props {
  records: OneRepMaxRecord[];
  onAdd: () => void;
  onDelete: (id: string) => void;
}

export function OneRepMaxSection({ records, onAdd, onDelete }: Props) {
  const theme = useTheme();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      onDelete(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  return (
    <>
      <Surface style={styles.card} elevation={1}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text variant="titleMedium">1RM Records</Text>
            <InfoTooltip {...ABBREVIATIONS['1RM']} />
          </View>
          <Button mode="contained-tonal" compact onPress={onAdd}>
            + Add 1RM
          </Button>
        </View>

        <Text
          variant="bodySmall"
          style={[styles.helperText, { color: theme.colors.outline }]}
        >
          Track your one-rep max for key exercises. These values will be used
          to suggest weights during workouts.
        </Text>

        {records.length === 0 ? (
          <View style={styles.emptyState}>
            <Text
              variant="bodyMedium"
              style={[styles.emptyStateText, { color: theme.colors.outline }]}
            >
              No 1RM records yet. Add your tested or estimated one-rep max
              values.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {records.map((record) => (
              <View
                key={record.id}
                style={[
                  styles.recordRow,
                  { backgroundColor: theme.colors.surfaceVariant },
                ]}
              >
                <View style={styles.recordInfo}>
                  <Text variant="titleSmall">{record.exerciseName}</Text>
                  <Text
                    variant="bodySmall"
                    style={{ color: theme.colors.outline }}
                  >
                    {record.method === 'tested' ? '✓ Tested' : 'Calculated'} •{' '}
                    {new Date(record.testedDate).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.recordWeight}>
                  <Text
                    variant="headlineSmall"
                    style={{ color: theme.colors.primary }}
                  >
                    {record.weight} {record.unit}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setDeleteConfirmId(record.id)}
                  style={styles.deleteButton}
                  accessibilityLabel="Delete record"
                  accessibilityRole="button"
                >
                  <MaterialCommunityIcons
                    name={AppIcons.close}
                    size={DELETE_ICON_SIZE}
                    color={theme.colors.error}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </Surface>

      <ConfirmDialog
        visible={!!deleteConfirmId}
        title="Delete 1RM Record?"
        message="Are you sure you want to delete this 1RM record? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onDismiss={() => setDeleteConfirmId(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm + spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helperText: {
    marginBottom: spacing.sm + spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.md,
  },
  emptyStateText: {
    textAlign: 'center',
  },
  list: {
    gap: spacing.sm,
  },
  recordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.sm + spacing.xs,
    borderRadius: borderRadius.md,
  },
  recordInfo: {
    flex: 1,
  },
  recordWeight: {
    alignItems: 'flex-end',
  },
  deleteButton: {
    marginLeft: spacing.sm + spacing.xs,
    padding: spacing.sm + spacing.xs,
    minWidth: TOUCH_TARGET,
    minHeight: TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
