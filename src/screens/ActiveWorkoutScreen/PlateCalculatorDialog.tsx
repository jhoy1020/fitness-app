/**
 * PlateCalculatorDialog — input target weight → get plates per side.
 * Self-contained dialog with own form state.
 */

import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { Button, Dialog, Portal, Surface, Text, TextInput, useTheme } from 'react-native-paper';
import { calculatePlates, formatPlatesDisplay } from '../../utils/plateCalculator/plateCalculator';

interface PlateCalculatorDialogProps {
  visible: boolean;
  onDismiss: () => void;
  initialWeight?: string;
  initialBarWeight?: string;
}

export function PlateCalculatorDialog({
  visible,
  onDismiss,
  initialWeight = '',
  initialBarWeight = '45',
}: PlateCalculatorDialogProps) {
  const theme = useTheme();
  const [weight, setWeight] = useState(initialWeight);
  const [barWeight, setBarWeight] = useState(initialBarWeight);

  // Reset when dialog re-opens so user can enter a new value
  React.useEffect(() => {
    if (visible) {
      setWeight(initialWeight);
      setBarWeight(initialBarWeight);
    }
  }, [visible, initialWeight, initialBarWeight]);

  const plates = weight && parseFloat(weight) > 0
    ? calculatePlates(parseFloat(weight), parseFloat(barWeight) || 45, false)
    : null;

  return (
    <Portal>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>Plate Calculator</Dialog.Title>
        <Dialog.Content>
          <TextInput
            label="Target Weight (lbs)"
            mode="outlined"
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
            style={{ marginBottom: 12 }}
          />
          <TextInput
            label="Bar Weight (lbs)"
            mode="outlined"
            keyboardType="numeric"
            value={barWeight}
            onChangeText={setBarWeight}
            style={{ marginBottom: 16 }}
          />
          {plates && (
            <Surface style={{ padding: 16, borderRadius: 12 }} elevation={1}>
              <Text variant="titleMedium" style={{ marginBottom: 8 }}>Each Side:</Text>
              <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
                {formatPlatesDisplay(plates, false)}
              </Text>
              {!plates.achievable && (
                <Text variant="bodySmall" style={{ color: theme.colors.error, marginTop: 8 }}>
                  Can't hit exact weight. Closest: {plates.totalWeight} lbs
                </Text>
              )}
            </Surface>
          )}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Close</Button>
        </Dialog.Actions>
      </Dialog>
      </KeyboardAvoidingView>
    </Portal>
  );
}
