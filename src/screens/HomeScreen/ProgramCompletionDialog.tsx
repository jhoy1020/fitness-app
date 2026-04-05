/**
 * ProgramCompletionDialog — celebratory modal shown when a training program is
 * completed. Displays stats and offers next actions.
 * Fully self-contained dialog component.
 */

import React from 'react';
import { View } from 'react-native';
import { Button, Dialog, Divider, Portal, Surface, Text, useTheme } from 'react-native-paper';

export interface CompletedProgramStats {
  name: string;
  totalWorkouts: number;
  totalWeeks: number;
  startDate: string;
  endDate: string;
  totalSets: number;
  totalVolume: number;
}

interface ProgramCompletionDialogProps {
  visible: boolean;
  stats: CompletedProgramStats | null;
  onDismiss: () => void;
  onViewHistory: () => void;
  onStartNewProgram: () => void;
}

export function ProgramCompletionDialog({
  visible,
  stats,
  onDismiss,
  onViewHistory,
  onStartNewProgram,
}: ProgramCompletionDialogProps) {
  const theme = useTheme();

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title style={{ textAlign: 'center' }}>Program Complete!</Dialog.Title>
        <Dialog.Content>
          {stats && (
            <View style={{ alignItems: 'center' }}>
              <Text variant="headlineSmall" style={{ marginBottom: 16, color: theme.colors.primary }}>
                {stats.name}
              </Text>

              <Surface style={{ padding: 16, borderRadius: 12, width: '100%', marginBottom: 16 }} elevation={1}>
                <Text variant="titleMedium" style={{ marginBottom: 12, textAlign: 'center' }}>Your Progress</Text>

                <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 }}>
                  <View style={{ alignItems: 'center' }}>
                    <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
                      {stats.totalWeeks}
                    </Text>
                    <Text variant="labelSmall">Weeks</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text variant="headlineMedium" style={{ color: theme.colors.secondary }}>
                      {stats.totalWorkouts}
                    </Text>
                    <Text variant="labelSmall">Workouts</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text variant="headlineMedium" style={{ color: theme.colors.tertiary }}>
                      {stats.totalSets}
                    </Text>
                    <Text variant="labelSmall">Sets</Text>
                  </View>
                </View>

                <Divider style={{ marginVertical: 8 }} />

                <View style={{ alignItems: 'center' }}>
                  <Text variant="bodyMedium" style={{ color: theme.colors.outline }}>
                    Total Volume Lifted
                  </Text>
                  <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
                    {stats.totalVolume.toLocaleString()} lbs
                  </Text>
                </View>
              </Surface>

              <Text variant="bodyMedium" style={{ textAlign: 'center', color: theme.colors.outline, marginBottom: 8 }}>
                Great job completing your program! Ready for the next challenge?
              </Text>
            </View>
          )}
        </Dialog.Content>
        <Dialog.Actions style={{ justifyContent: 'center', gap: 12 }}>
          <Button mode="outlined" onPress={onViewHistory}>
            View History
          </Button>
          <Button mode="contained" onPress={onStartNewProgram}>
            Start New Program
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
