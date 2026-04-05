/**
 * WarmupSetsDialog — displays recommended warm-up progression for an exercise.
 * Pure presentational dialog.
 */

import React from 'react';
import { View, ScrollView } from 'react-native';
import { Button, Dialog, Portal, Surface, Text, useTheme } from 'react-native-paper';
import { formatPlatesDisplay } from '../../utils/plateCalculator/plateCalculator';
import type { WarmupSet } from '../../utils/plateCalculator/plateCalculator';

interface WarmupSetsDialogProps {
  visible: boolean;
  warmupSets: WarmupSet[];
  onDismiss: () => void;
  onComplete: () => void;
}

export function WarmupSetsDialog({
  visible,
  warmupSets,
  onDismiss,
  onComplete,
}: WarmupSetsDialogProps) {
  const theme = useTheme();

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>Warm-up Sets</Dialog.Title>
        <Dialog.ScrollArea style={{ maxHeight: 400 }}>
          <ScrollView style={{ padding: 16 }}>
            <Text variant="bodySmall" style={{ color: theme.colors.outline, marginBottom: 16 }}>
              Recommended warm-up progression:
            </Text>
            {warmupSets.map((warmup, idx) => (
              <Surface key={idx} style={{ padding: 12, borderRadius: 8, marginBottom: 8 }} elevation={1}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text variant="titleMedium">{warmup.weight} lbs × {warmup.reps}</Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                      {warmup.percentage}% • Rest {warmup.rest}s
                    </Text>
                  </View>
                  <Text variant="bodySmall" style={{ color: theme.colors.primary }}>
                    {formatPlatesDisplay(warmup.plates, false)}
                  </Text>
                </View>
              </Surface>
            ))}
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Close</Button>
          <Button mode="contained" onPress={onComplete}>Done Warming Up</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
