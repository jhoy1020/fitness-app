// ProgramCard - Single unified program card for the dashboard
// Uses ONLY React Native primitives — no third-party components at all

import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { withAlpha, statusColors } from '../../theme';
import { AppIcons } from '../../theme/icons';

interface NextWorkout {
  name: string;
  dayNumber: number;
  totalDays: number;
  dayType: string;
}

interface PausedWorkout {
  workoutName: string;
  exercises: Array<any>;
  isProgramWorkout: boolean;
}

interface ActiveMesoCycle {
  id: string;
  name: string;
  currentWeek: number;
  totalWeeks: number;
  completedWorkouts: number;
  totalWorkouts: number;
  weeks?: Array<{ isDeload?: boolean }>;
}

interface ThemeColors {
  primary: string;
  secondary: string;
  tertiary: string;
  outline: string;
  surfaceVariant: string;
  onSurfaceVariant: string;
  onPrimary: string;
  onSurface: string;
  error: string;
  elevation: {
    level2: string;
  };
}

interface ProgramCardProps {
  activeMesoCycle: ActiveMesoCycle;
  nextWorkout: NextWorkout | null;
  pausedWorkout: PausedWorkout | null;
  theme: { colors: ThemeColors };
  onStartWorkout: () => void;
  onResumeWorkout: () => void;
  onDiscardPausedWorkout: () => void;
  onStopProgram: () => void;
}

/** Pure-View progress bar — zero third-party deps */
function SimpleBar({ progress, color, h = 6 }: { progress: number; color: string; h?: number }) {
  const p = Math.max(0, Math.min(1, progress));
  return (
    <View style={{ height: h, borderRadius: h / 2, backgroundColor: withAlpha('#FFFFFF', 0.1), overflow: 'hidden' }}>
      <View style={{ height: h, borderRadius: h / 2, backgroundColor: color, width: `${p * 100}%` }} />
    </View>
  );
}

export function ProgramCard({
  activeMesoCycle,
  nextWorkout,
  pausedWorkout,
  theme,
  onStartWorkout,
  onResumeWorkout,
  onDiscardPausedWorkout,
  onStopProgram,
}: ProgramCardProps) {
  const c = theme.colors;

  const isDeload =
    activeMesoCycle.weeks?.[activeMesoCycle.currentWeek - 1]?.isDeload ?? false;

  const weekProg = activeMesoCycle.currentWeek / activeMesoCycle.totalWeeks;
  const workoutProg =
    (activeMesoCycle.completedWorkouts || 0) / (activeMesoCycle.totalWorkouts || 1);

  const btnBg =
    nextWorkout?.dayType === 'rest' ? c.surfaceVariant
    : nextWorkout?.dayType === 'cardio' ? c.secondary
    : nextWorkout?.dayType === 'active_recovery' ? c.tertiary
    : c.primary;

  const btnText =
    nextWorkout?.dayType === 'rest' ? c.onSurfaceVariant : c.onPrimary;

  const btnLabel =
    nextWorkout?.dayType === 'rest' ? 'Rest Day'
    : nextWorkout?.dayType === 'cardio' ? 'Start Cardio'
    : nextWorkout?.dayType === 'active_recovery' ? 'Start Recovery'
    : 'Start Workout';

  const dayIcon =
    nextWorkout?.dayType === 'rest' ? AppIcons.rest
    : nextWorkout?.dayType === 'cardio' ? AppIcons.cardio
    : nextWorkout?.dayType === 'active_recovery' ? AppIcons.recovery
    : AppIcons.workout;

  const btnIcon =
    nextWorkout?.dayType === 'rest' ? AppIcons.rest
    : nextWorkout?.dayType === 'cardio' ? AppIcons.cardio
    : nextWorkout?.dayType === 'active_recovery' ? AppIcons.recovery
    : AppIcons.startWorkout;

  return (
    <View style={[styles.card, { backgroundColor: c.elevation.level2 }]}>
      {/* Header */}
      <View style={styles.row}>
        <Text style={[styles.title, { color: c.onSurface }]} numberOfLines={1}>
          {activeMesoCycle.name}
        </Text>
        <Pressable onPress={onStopProgram} hitSlop={8}>
          <Text style={{ fontSize: 12, color: c.outline }}>Stop Program</Text>
        </Pressable>
      </View>

      {/* Progress text */}
      <Text style={{ fontSize: 13, color: c.outline, marginBottom: 6 }}>
        Week {activeMesoCycle.currentWeek}/{activeMesoCycle.totalWeeks}
        {'  \u2022  '}
        Workouts {activeMesoCycle.completedWorkouts || 0}/{activeMesoCycle.totalWorkouts}
      </Text>

      {/* Progress bars — pure View, no Paper */}
      <SimpleBar progress={weekProg} color={c.primary} h={6} />
      <View style={{ height: 4 }} />
      <SimpleBar progress={workoutProg} color={c.secondary} h={4} />

      {/* Deload badge */}
      {isDeload && (
        <View style={styles.deload}>
          <MaterialCommunityIcons name={AppIcons.deload} size={16} color={statusColors.deload} />
          <Text style={{ color: statusColors.deload, fontSize: 13, fontWeight: '500', marginLeft: 8 }}>
            Deload Week
          </Text>
        </View>
      )}

      {/* Divider */}
      <View style={{ borderTopWidth: 1, borderTopColor: c.outline + '33', marginVertical: 10 }} />

      {/* Action area */}
      {pausedWorkout ? (
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
            <MaterialCommunityIcons name={AppIcons.pause} size={16} color={c.onSurface} style={{ marginRight: 4 }} />
            <Text style={{ fontSize: 14, fontWeight: '600', color: c.onSurface }}>
              {pausedWorkout.workoutName}
            </Text>
          </View>
          <Text style={{ fontSize: 12, color: c.outline, marginBottom: 8 }}>
            {pausedWorkout.exercises.length} exercise{pausedWorkout.exercises.length !== 1 ? 's' : ''} {'\u2022'} Paused
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable
              onPress={onResumeWorkout}
              style={[styles.btn, { backgroundColor: c.primary, flex: 1 }]}
            >
              <Text style={[styles.btnWhite, { color: c.onPrimary }]}>Resume Workout</Text>
            </Pressable>
            <Pressable
              onPress={onDiscardPausedWorkout}
              style={[styles.btn, { borderWidth: 1, borderColor: c.error, flex: 1 }]}
            >
              <Text style={[styles.btnLabel, { color: c.error }]}>Discard</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View>
          {nextWorkout && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <MaterialCommunityIcons name={dayIcon} size={16} color={c.outline} style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 13, color: c.outline, flex: 1 }}>
                Day {nextWorkout.dayNumber}/{nextWorkout.totalDays} — {nextWorkout.name}
              </Text>
            </View>
          )}
          <Pressable
            onPress={onStartWorkout}
            style={[styles.btn, { backgroundColor: btnBg, flexDirection: 'row', gap: 6 }]}
          >
            <MaterialCommunityIcons name={btnIcon} size={18} color={btnText} />
            <Text style={[styles.btnWhite, { color: btnText }]}>{btnLabel}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: withAlpha('#FFFFFF', 0.12),
    overflow: 'hidden' as const,
    ...(Platform.OS === 'web' ? { position: 'relative' as const, zIndex: 1 } : {}),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  deload: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: withAlpha(statusColors.deload, 0.2),
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
  },
  btn: {
    borderRadius: 8,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnWhite: {
    fontWeight: '700',
    fontSize: 14,
  },
  btnLabel: {
    fontWeight: '700',
    fontSize: 14,
  },
});
