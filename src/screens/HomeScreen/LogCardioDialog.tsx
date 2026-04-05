/**
 * LogCardioDialog — form dialog for logging a cardio workout to history.
 * Manages its own form state; calls back with the saved workout data.
 */

import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, Dialog, Portal, Surface, Text, TextInput, useTheme } from 'react-native-paper';
import type { CardioType } from '../../types';

// Cardio type options with display names and emoji
export const CARDIO_OPTIONS: { type: CardioType; label: string; emoji: string }[] = [
  { type: 'running', label: 'Running', emoji: '🏃' },
  { type: 'cycling', label: 'Cycling', emoji: '🚴' },
  { type: 'walking', label: 'Walking', emoji: '🚶' },
  { type: 'swimming', label: 'Swimming', emoji: '🏊' },
  { type: 'rowing', label: 'Rowing', emoji: '🚣' },
  { type: 'elliptical', label: 'Elliptical', emoji: '⭕' },
  { type: 'stair_climber', label: 'Stair Climber', emoji: '🪜' },
  { type: 'hiit', label: 'HIIT', emoji: '⚡' },
  { type: 'jump_rope', label: 'Jump Rope', emoji: '🪢' },
  { type: 'other', label: 'Other', emoji: '🏋️' },
];

export interface CardioWorkoutData {
  type: CardioType;
  name: string;
  date: string;
  durationMinutes: number;
  distance?: number;
  calories?: number;
  avgHeartRate?: number;
  notes?: string;
}

interface LogCardioDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onSave: (data: CardioWorkoutData) => void;
}

function formatPace(minsPerMile: number): string {
  const min = Math.floor(minsPerMile);
  const sec = Math.round((minsPerMile - min) * 60);
  return `${min}:${sec.toString().padStart(2, '0')} /mi`;
}

export function LogCardioDialog({ visible, onDismiss, onSave }: LogCardioDialogProps) {
  const theme = useTheme();

  const [cardioType, setCardioType] = useState<CardioType>('running');
  const [name, setName] = useState('');
  const [date] = useState(() => new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const [calories, setCalories] = useState('');
  const [avgHR, setAvgHR] = useState('');
  const [notes, setNotes] = useState('');

  const resetAndDismiss = () => {
    setCardioType('running');
    setName('');
    setDuration('');
    setDistance('');
    setCalories('');
    setAvgHR('');
    setNotes('');
    onDismiss();
  };

  const handleSave = () => {
    const option = CARDIO_OPTIONS.find(c => c.type === cardioType);
    onSave({
      type: cardioType,
      name: name.trim() || `${option?.emoji} ${option?.label}`,
      date: date.trim() || new Date().toISOString().split('T')[0],
      durationMinutes: parseInt(duration, 10) || 0,
      distance: distance ? parseFloat(distance) : undefined,
      calories: calories ? parseInt(calories, 10) : undefined,
      avgHeartRate: avgHR ? parseInt(avgHR, 10) : undefined,
      notes: notes.trim() || undefined,
    });
    resetAndDismiss();
  };

  return (
    <Portal>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <Dialog visible={visible} onDismiss={resetAndDismiss} style={{ maxHeight: '85%' }}>
        <Dialog.Title>Log Cardio Workout</Dialog.Title>
        <Dialog.ScrollArea style={{ paddingHorizontal: 0 }}>
          <ScrollView style={{ paddingHorizontal: 24 }} keyboardShouldPersistTaps="handled">
            <Text variant="titleSmall" style={{ marginBottom: 8 }}>Cardio Type</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {CARDIO_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.type}
                  onPress={() => setCardioType(option.type)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 12,
                    borderRadius: 20,
                    minHeight: 44,
                    justifyContent: 'center',
                    backgroundColor: cardioType === option.type
                      ? theme.colors.primaryContainer
                      : theme.colors.surfaceVariant,
                    borderWidth: cardioType === option.type ? 2 : 0,
                    borderColor: theme.colors.primary,
                  }}
                >
                  <Text
                    variant="bodyMedium"
                    style={{
                      color: cardioType === option.type
                        ? theme.colors.onPrimaryContainer
                        : theme.colors.onSurfaceVariant,
                    }}
                  >
                    {option.emoji} {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              label="Workout Name (optional)"
              value={name}
              onChangeText={setName}
              mode="outlined"
              placeholder={`${CARDIO_OPTIONS.find(c => c.type === cardioType)?.emoji} ${CARDIO_OPTIONS.find(c => c.type === cardioType)?.label}`}
              style={{ marginBottom: 12 }}
            />

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingHorizontal: 4 }}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                📅 Today — {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
              <TextInput
                label="Duration (min) *"
                value={duration}
                onChangeText={setDuration}
                keyboardType="numeric"
                mode="outlined"
                placeholder="30"
                style={{ flex: 1 }}
              />
              <TextInput
                label="Distance (mi)"
                value={distance}
                onChangeText={setDistance}
                keyboardType="numeric"
                mode="outlined"
                placeholder="3.1"
                style={{ flex: 1 }}
              />
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
              <TextInput
                label="Calories Burned"
                value={calories}
                onChangeText={setCalories}
                keyboardType="numeric"
                mode="outlined"
                placeholder="250"
                style={{ flex: 1 }}
              />
              <TextInput
                label="Avg Heart Rate"
                value={avgHR}
                onChangeText={setAvgHR}
                keyboardType="numeric"
                mode="outlined"
                placeholder="145"
                style={{ flex: 1 }}
              />
            </View>

            <TextInput
              label="Notes (optional)"
              value={notes}
              onChangeText={setNotes}
              mode="outlined"
              placeholder="How did it feel?"
              multiline
              numberOfLines={3}
              style={{ marginBottom: 12 }}
            />

            {/* Calculated pace */}
            {duration && distance && parseFloat(distance) > 0 && (
              <Surface style={{ padding: 12, borderRadius: 8, marginBottom: 12 }} elevation={1}>
                <Text variant="bodySmall" style={{ color: theme.colors.outline }}>Calculated Pace</Text>
                <Text variant="titleMedium" style={{ color: theme.colors.primary }}>
                  {formatPace(parseFloat(duration) / parseFloat(distance))}
                </Text>
              </Surface>
            )}
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions>
          <Button onPress={resetAndDismiss}>Cancel</Button>
          <Button onPress={handleSave} disabled={!duration}>
            Save Cardio
          </Button>
        </Dialog.Actions>
      </Dialog>
      </KeyboardAvoidingView>
    </Portal>
  );
}
