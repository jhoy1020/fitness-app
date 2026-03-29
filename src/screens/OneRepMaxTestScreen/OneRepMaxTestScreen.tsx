// 1RM Test Day Screen
// Guides the user through a powerlifting-style 3-attempt max test

import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Text,
  Surface,
  useTheme,
  Button,
  TextInput,
  Divider,
  Chip,
} from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useUser } from '../../context/UserContext';
import { useTimer } from '../../context/TimerContext';
import { generate1RMTestProtocol, type OneRMTestProtocol, type AttemptSet } from '../../utils/formulas/formulas';
import { formatPlatesDisplay } from '../../utils/plateCalculator/plateCalculator';
import { withAlpha } from '../../theme';
import { AppIcons } from '../../theme/icons';

// ─── Supported exercises ──────────────────────────────────

const TESTABLE_EXERCISES = [
  { name: 'Barbell Bench Press', label: 'Bench Press', icon: 'weight-lifter' as const },
  { name: 'Barbell Back Squat', label: 'Squat', icon: 'human' as const },
  { name: 'Barbell Deadlift', label: 'Deadlift', icon: 'weight' as const },
  { name: 'Overhead Press', label: 'Strict Press', icon: 'arm-flex' as const },
] as const;

// ─── Component ────────────────────────────────────────────

interface OneRepMaxTestScreenProps {
  navigation: any;
  route?: { params?: { exerciseName?: string } };
}

export function OneRepMaxTestScreen({ navigation, route }: OneRepMaxTestScreenProps) {
  const theme = useTheme();
  const { state: userState, addOneRepMax, getOneRepMax } = useUser();
  const { startTimer } = useTimer();

  const isMetric = userState.units === 'metric';
  const unit = isMetric ? 'kg' : 'lbs';

  // ── Setup state ─────────────────────────────────────────
  const [selectedExercise, setSelectedExercise] = useState<string>(
    route?.params?.exerciseName ?? ''
  );
  const [currentInput, setCurrentInput] = useState('');
  const [goalInput, setGoalInput] = useState('');
  const [protocol, setProtocol] = useState<OneRMTestProtocol | null>(null);
  const [attemptResults, setAttemptResults] = useState<('hit' | 'miss' | null)[]>([null, null, null]);
  const [saved, setSaved] = useState(false);

  // Pre-fill current 1RM when exercise changes
  const handleExerciseSelect = useCallback((exerciseName: string) => {
    setSelectedExercise(exerciseName);
    setProtocol(null);
    setSaved(false);
    setAttemptResults([null, null, null]);

    const record = getOneRepMax(exerciseName);
    if (record) {
      setCurrentInput(String(record.weight));
    } else {
      setCurrentInput('');
    }
    setGoalInput('');
  }, [getOneRepMax]);

  // ── Validation ──────────────────────────────────────────
  const validationError = useMemo(() => {
    if (!selectedExercise) return 'Select an exercise';
    const current = parseFloat(currentInput);
    const goal = parseFloat(goalInput);
    if (!current || current <= 0) return 'Enter your current 1RM';
    if (!goal || goal <= 0) return 'Enter your goal 1RM';
    if (goal <= current) return 'Goal must be higher than current 1RM';
    return null;
  }, [selectedExercise, currentInput, goalInput]);

  // ── Generate protocol ───────────────────────────────────
  const handleGenerate = useCallback(() => {
    if (validationError) return;
    const result = generate1RMTestProtocol(
      selectedExercise,
      parseFloat(currentInput),
      parseFloat(goalInput),
      undefined,
      isMetric,
    );
    setProtocol(result);
    setAttemptResults([null, null, null]);
    setSaved(false);
  }, [selectedExercise, currentInput, goalInput, isMetric, validationError]);

  // ── Mark attempt result ─────────────────────────────────
  const markAttempt = useCallback((index: number, result: 'hit' | 'miss') => {
    setAttemptResults(prev => {
      const next = [...prev];
      next[index] = next[index] === result ? null : result; // toggle
      return next;
    });
  }, []);

  // ── Best successful attempt ─────────────────────────────
  const bestHit = useMemo<AttemptSet | null>(() => {
    if (!protocol) return null;
    let best: AttemptSet | null = null;
    attemptResults.forEach((r, i) => {
      if (r === 'hit') {
        const attempt = protocol.attempts[i];
        if (!best || attempt.weight > best.weight) best = attempt;
      }
    });
    return best;
  }, [protocol, attemptResults]);

  // ── Save new 1RM ───────────────────────────────────────
  const handleSave = useCallback(() => {
    if (!bestHit || !protocol) return;
    addOneRepMax(protocol.exerciseName, bestHit.weight, 'tested', '1RM Test Day');
    setSaved(true);
  }, [bestHit, protocol, addOneRepMax]);

  // ── Start rest timer ────────────────────────────────────
  const handleStartTimer = useCallback((seconds: number) => {
    startTimer(seconds);
  }, [startTimer]);

  // ── Render helpers ──────────────────────────────────────

  const renderSetup = () => (
    <>
      {/* Exercise Selection */}
      <Surface style={styles.card} elevation={1}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Choose Exercise</Text>
        <View style={styles.chipRow}>
          {TESTABLE_EXERCISES.map((ex) => (
            <Chip
              key={ex.name}
              selected={selectedExercise === ex.name}
              onPress={() => handleExerciseSelect(ex.name)}
              style={styles.chip}
              showSelectedOverlay
              icon={ex.icon}
            >
              {ex.label}
            </Chip>
          ))}
        </View>
      </Surface>

      {/* Weight Inputs */}
      <Surface style={styles.card} elevation={1}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Enter Your Numbers</Text>

        <TextInput
          label={`Current 1RM (${unit})`}
          mode="outlined"
          keyboardType="numeric"
          value={currentInput}
          onChangeText={setCurrentInput}
          style={styles.input}
          dense
          left={<TextInput.Icon icon={() => <MaterialCommunityIcons name="weight-lifter" size={20} color={theme.colors.onSurfaceVariant} />} />}
        />
        <TextInput
          label={`Goal 1RM (${unit})`}
          mode="outlined"
          keyboardType="numeric"
          value={goalInput}
          onChangeText={setGoalInput}
          style={styles.input}
          dense
          left={<TextInput.Icon icon={() => <MaterialCommunityIcons name={AppIcons.target} size={20} color={theme.colors.onSurfaceVariant} />} />}
        />

        {validationError && currentInput !== '' && goalInput !== '' && (
          <Text variant="bodySmall" style={{ color: theme.colors.error, marginTop: 4 }}>
            {validationError}
          </Text>
        )}

        <Button
          mode="contained"
          onPress={handleGenerate}
          disabled={!!validationError}
          style={styles.generateButton}
          icon={() => <MaterialCommunityIcons name="clipboard-list" size={20} color={theme.colors.onPrimary} />}
        >
          Generate Test Plan
        </Button>
      </Surface>
    </>
  );

  const renderProtocol = () => {
    if (!protocol) return null;

    return (
      <>
        {/* Summary banner */}
        <Surface
          style={[styles.card, { backgroundColor: withAlpha(theme.colors.primary, 0.08) }]}
          elevation={0}
        >
          <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 4 }}>
            {protocol.exerciseName}
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Current 1RM: {protocol.current1RM} {protocol.unit}{'  →  '}Goal: {protocol.goal1RM} {protocol.unit}
          </Text>
        </Surface>

        {/* Warm-up sets */}
        <Surface style={styles.card} elevation={1}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name={AppIcons.warmup} size={20} color={theme.colors.tertiary} />
            <Text variant="titleMedium" style={[styles.sectionTitle, { marginBottom: 0, marginLeft: 8 }]}>
              Warm-Up Sets
            </Text>
          </View>
          <Divider style={{ marginBottom: 12 }} />

          {protocol.warmupSets.map((ws, i) => (
            <View key={i} style={styles.setRow}>
              <View style={styles.setNumber}>
                <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  W{i + 1}
                </Text>
              </View>
              <View style={styles.setDetails}>
                <Text variant="bodyLarge" style={{ fontWeight: '600' }}>
                  {ws.weight} {protocol.unit} × {ws.reps} reps
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {formatPlatesDisplay(ws.plates, isMetric)} per side
                </Text>
              </View>
              <View style={styles.setMeta}>
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {ws.percentage}%
                </Text>
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Rest {ws.rest}s
                </Text>
              </View>
            </View>
          ))}
        </Surface>

        {/* Attempts */}
        <Surface style={styles.card} elevation={1}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name={AppIcons.pr} size={20} color={theme.colors.primary} />
            <Text variant="titleMedium" style={[styles.sectionTitle, { marginBottom: 0, marginLeft: 8 }]}>
              Attempts
            </Text>
          </View>
          <Divider style={{ marginBottom: 12 }} />

          {protocol.attempts.map((attempt, i) => {
            const result = attemptResults[i];
            const isGoal = i === 2;
            return (
              <View
                key={i}
                style={[
                  styles.attemptCard,
                  {
                    backgroundColor: result === 'hit'
                      ? withAlpha(theme.colors.tertiary, 0.1)
                      : result === 'miss'
                        ? withAlpha(theme.colors.error, 0.08)
                        : withAlpha(theme.colors.surfaceVariant, 0.5),
                    borderColor: isGoal
                      ? withAlpha(theme.colors.primary, 0.4)
                      : 'transparent',
                    borderWidth: isGoal ? 2 : 0,
                  },
                ]}
              >
                {/* Header */}
                <View style={styles.attemptHeader}>
                  <View>
                    <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                      {attempt.label}
                    </Text>
                    <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>
                      {attempt.weight} {protocol.unit}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      {attempt.percentage}% of 1RM
                    </Text>
                    <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      RPE {attempt.rpe}
                    </Text>
                  </View>
                </View>

                {/* Plate loading */}
                <View style={[styles.plateRow, { backgroundColor: withAlpha(theme.colors.surface, 0.7) }]}>
                  <MaterialCommunityIcons name={AppIcons.plateCalc} size={16} color={theme.colors.onSurfaceVariant} />
                  <Text variant="bodySmall" style={{ marginLeft: 6, color: theme.colors.onSurfaceVariant }}>
                    {formatPlatesDisplay(attempt.plates, isMetric)} per side
                  </Text>
                </View>

                {/* Actions */}
                <View style={styles.attemptActions}>
                  <Button
                    mode={result === 'hit' ? 'contained' : 'contained-tonal'}
                    onPress={() => markAttempt(i, 'hit')}
                    compact
                    style={styles.actionBtn}
                    buttonColor={result === 'hit' ? theme.colors.tertiary : undefined}
                    icon={() => (
                      <MaterialCommunityIcons
                        name={AppIcons.checkCircle}
                        size={18}
                        color={result === 'hit' ? theme.colors.onTertiary : theme.colors.onSurfaceVariant}
                      />
                    )}
                  >
                    Hit
                  </Button>
                  <Button
                    mode={result === 'miss' ? 'contained' : 'contained-tonal'}
                    onPress={() => markAttempt(i, 'miss')}
                    compact
                    style={styles.actionBtn}
                    buttonColor={result === 'miss' ? theme.colors.error : undefined}
                    icon={() => (
                      <MaterialCommunityIcons
                        name={AppIcons.close}
                        size={18}
                        color={result === 'miss' ? theme.colors.onError : theme.colors.onSurfaceVariant}
                      />
                    )}
                  >
                    Miss
                  </Button>

                  {attempt.restSeconds > 0 && (
                    <Button
                      mode="text"
                      compact
                      onPress={() => handleStartTimer(attempt.restSeconds)}
                      icon={() => (
                        <MaterialCommunityIcons
                          name={AppIcons.timer}
                          size={18}
                          color={theme.colors.primary}
                        />
                      )}
                    >
                      {Math.floor(attempt.restSeconds / 60)}m rest
                    </Button>
                  )}
                </View>
              </View>
            );
          })}
        </Surface>

        {/* Result summary */}
        {bestHit && (
          <Surface
            style={[styles.card, { backgroundColor: withAlpha(theme.colors.tertiary, 0.1) }]}
            elevation={0}
          >
            <View style={{ alignItems: 'center' }}>
              <MaterialCommunityIcons name={AppIcons.pr} size={36} color={theme.colors.tertiary} />
              <Text variant="titleLarge" style={{ fontWeight: 'bold', marginTop: 8 }}>
                New 1RM: {bestHit.weight} {protocol.unit}
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 16 }}>
                {bestHit.weight > protocol.current1RM
                  ? `+${bestHit.weight - protocol.current1RM} ${protocol.unit} PR!`
                  : 'Matched current 1RM'}
              </Text>

              {!saved ? (
                <Button mode="contained" onPress={handleSave} icon={AppIcons.save}>
                  Save New 1RM
                </Button>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialCommunityIcons name={AppIcons.checkCircle} size={20} color={theme.colors.tertiary} />
                  <Text variant="bodyMedium" style={{ marginLeft: 6, color: theme.colors.tertiary, fontWeight: '600' }}>
                    Saved!
                  </Text>
                </View>
              )}
            </View>
          </Surface>
        )}

        {/* Reset / New test */}
        <Button
          mode="outlined"
          onPress={() => {
            setProtocol(null);
            setAttemptResults([null, null, null]);
            setSaved(false);
          }}
          style={{ marginBottom: 32 }}
        >
          Start New Test
        </Button>
      </>
    );
  };

  // ── Main render ─────────────────────────────────────────
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Title */}
      <View style={styles.header}>
        <MaterialCommunityIcons name={AppIcons.pr} size={28} color={theme.colors.primary} />
        <Text variant="headlineSmall" style={[styles.headerTitle, { color: theme.colors.onBackground }]}>
          1RM Test Day
        </Text>
      </View>
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 16 }}>
        Follow the protocol below to safely test your one-rep max with a 3-attempt system.
      </Text>

      {protocol ? renderProtocol() : renderSetup()}
    </ScrollView>
  );
}

// ─── Styles ──────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitle: {
    fontWeight: 'bold',
    marginLeft: 8,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 4,
  },
  input: {
    marginBottom: 12,
  },
  generateButton: {
    marginTop: 8,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  setNumber: {
    width: 32,
    alignItems: 'center',
  },
  setDetails: {
    flex: 1,
    marginLeft: 8,
  },
  setMeta: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  attemptCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  attemptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  plateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  attemptActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    minWidth: 80,
  },
});

export default OneRepMaxTestScreen;
