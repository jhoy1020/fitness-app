// Info Tooltip Component
// Shows a small info icon that reveals an explanation when tapped

import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';

interface InfoTooltipProps {
  title: string;
  description: string;
  size?: 'small' | 'medium';
}

export function InfoTooltip({ title, description, size = 'small' }: InfoTooltipProps) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);

  const iconSize = size === 'small' ? 14 : 18;
  const fontSize = size === 'small' ? 10 : 12;

  return (
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={[
          styles.iconContainer,
          { 
            width: iconSize + 4,
            height: iconSize + 4,
            backgroundColor: theme.colors.surfaceVariant,
          }
        ]}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={[styles.icon, { fontSize, color: theme.colors.outline }]}>?</Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <Surface style={[styles.tooltip, { backgroundColor: theme.colors.surface }]} elevation={4}>
            <Text variant="titleMedium" style={{ marginBottom: 8, color: theme.colors.primary }}>
              {title}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, lineHeight: 22 }}>
              {description}
            </Text>
            <TouchableOpacity 
              onPress={() => setVisible(false)}
              style={[styles.closeButton, { backgroundColor: theme.colors.primaryContainer }]}
            >
              <Text style={{ color: theme.colors.onPrimaryContainer }}>Got it</Text>
            </TouchableOpacity>
          </Surface>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  icon: {
    fontWeight: '600',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  tooltip: {
    padding: 20,
    borderRadius: 16,
    maxWidth: 320,
    width: '100%',
  },
  closeButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
});

// Common abbreviation definitions
export const ABBREVIATIONS = {
  BMR: {
    title: 'BMR - Basal Metabolic Rate',
    description: 'The number of calories your body burns at complete rest just to maintain basic functions like breathing, circulation, and cell production. This is your baseline energy expenditure.',
  },
  TDEE: {
    title: 'TDEE - Total Daily Energy Expenditure',
    description: 'The total calories you burn in a day, including BMR plus all physical activity (exercise, walking, daily tasks). This is calculated by multiplying your BMR by an activity factor.',
  },
  RIR: {
    title: 'RIR - Reps In Reserve',
    description: 'How many more reps you could have done before failure. RIR 2 means you stopped with 2 reps "left in the tank." Lower RIR = closer to failure = more intensity.',
  },
  MEV: {
    title: 'MEV - Minimum Effective Volume',
    description: 'The minimum amount of training volume (sets per muscle per week) needed to make progress. Training below MEV typically results in no gains.',
  },
  MAV: {
    title: 'MAV - Maximum Adaptive Volume',
    description: 'The optimal range of training volume where you make the best gains. This is the sweet spot between MEV (minimum) and MRV (maximum).',
  },
  MRV: {
    title: 'MRV - Maximum Recoverable Volume',
    description: 'The maximum training volume you can recover from. Training above MRV leads to accumulated fatigue and performance decline.',
  },
  '1RM': {
    title: '1RM - One Rep Max',
    description: 'The maximum weight you can lift for exactly one repetition with proper form. This is used to calculate training weights at various percentages.',
  },
};

export default InfoTooltip;
