import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, useTheme, Surface, Chip } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

// Define workout shape for calendar
interface CalendarWorkout {
  id: string;
  name: string;
  date: string;
  duration?: number;
  exercises?: {
    exerciseId: string;
    exerciseName: string;
    sets: { weight: number; targetReps: number; actualReps: number; completed: boolean }[];
  }[];
}

interface MonthCalendarProps {
  workouts: CalendarWorkout[];
  onDayPress?: (date: Date, workouts: CalendarWorkout[]) => void;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const MonthCalendar: React.FC<MonthCalendarProps> = ({ workouts, onDayPress }) => {
  const theme = useTheme();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const workoutsByDate = useMemo(() => {
    const map = new Map<string, CalendarWorkout[]>();
    workouts.forEach(workout => {
      const date = new Date(workout.date).toDateString();
      if (!map.has(date)) {
        map.set(date, []);
      }
      map.get(date)!.push(workout);
    });
    return map;
  }, [workouts]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: (Date | null)[] = [];
    
    // Add empty slots for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  }, [currentMonth]);

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  const handleDayPress = (date: Date) => {
    setSelectedDate(date);
    const dayWorkouts = workoutsByDate.get(date.toDateString()) || [];
    onDayPress?.(date, dayWorkouts);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate?.toDateString() === date.toDateString();
  };

  const getWorkoutCount = (date: Date) => {
    return workoutsByDate.get(date.toDateString())?.length || 0;
  };

  const selectedWorkouts = selectedDate 
    ? workoutsByDate.get(selectedDate.toDateString()) || []
    : [];

  // Calculate monthly stats
  const monthStats = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const monthWorkouts = workouts.filter(w => {
      const d = new Date(w.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });

    const totalSets = monthWorkouts.reduce((sum: number, w) => 
      sum + (w.exercises || []).reduce((eSum: number, e: any) => eSum + (e.sets || []).filter((s: any) => s.completed).length, 0), 0);
    
    const totalVolume = monthWorkouts.reduce((sum: number, w) => 
      sum + (w.exercises || []).reduce((eSum: number, e: any) => 
        eSum + (e.sets || []).reduce((sSum: number, s: any) => sSum + (s.completed ? (s.weight || 0) * (s.actualReps || s.targetReps || 0) : 0), 0), 0), 0);

    const uniqueDays = new Set(monthWorkouts.map(w => new Date(w.date).toDateString())).size;

    return {
      workouts: monthWorkouts.length,
      days: uniqueDays,
      sets: totalSets,
      volume: totalVolume,
    };
  }, [workouts, currentMonth]);

  const styles = StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 8,
      marginBottom: 16,
    },
    monthTitle: {
      fontWeight: 'bold',
    },
    navButton: {
      padding: 8,
    },
    weekHeader: {
      flexDirection: 'row',
      marginBottom: 8,
    },
    weekDay: {
      flex: 1,
      textAlign: 'center',
      fontWeight: '600',
      color: theme.colors.onSurfaceVariant,
    },
    calendarGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    dayCell: {
      width: '14.28%',
      aspectRatio: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 2,
    },
    dayButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
    },
    today: {
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    selected: {
      backgroundColor: theme.colors.primary,
    },
    hasWorkout: {
      backgroundColor: theme.colors.primaryContainer,
    },
    dayText: {
      fontSize: 14,
    },
    workoutDot: {
      position: 'absolute',
      bottom: 2,
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.primary,
    },
    multipleDots: {
      flexDirection: 'row',
      position: 'absolute',
      bottom: 2,
      gap: 2,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 12,
      marginTop: 16,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 12,
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontWeight: 'bold',
      fontSize: 18,
      color: theme.colors.primary,
    },
    statLabel: {
      fontSize: 11,
      color: theme.colors.onSurfaceVariant,
    },
    selectedSection: {
      marginTop: 16,
    },
    selectedHeader: {
      marginBottom: 8,
      fontWeight: '600',
    },
    workoutItem: {
      padding: 12,
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      marginBottom: 8,
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.primary,
    },
    workoutName: {
      fontWeight: '600',
      marginBottom: 4,
    },
    workoutDetails: {
      color: theme.colors.onSurfaceVariant,
    },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.navButton} onPress={goToPreviousMonth}>
          <MaterialCommunityIcons name="chevron-left" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <TouchableOpacity onPress={goToToday}>
          <Text variant="titleLarge" style={styles.monthTitle}>
            {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={goToNextMonth}>
          <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
      </View>

      {/* Week days header */}
      <View style={styles.weekHeader}>
        {DAYS_OF_WEEK.map(day => (
          <Text key={day} variant="labelSmall" style={styles.weekDay}>
            {day}
          </Text>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.calendarGrid}>
        {calendarDays.map((date, index) => (
          <View key={index} style={styles.dayCell}>
            {date ? (
              <TouchableOpacity
                style={[
                  styles.dayButton,
                  isToday(date) && styles.today,
                  isSelected(date) && styles.selected,
                  !isSelected(date) && getWorkoutCount(date) > 0 && styles.hasWorkout,
                ]}
                onPress={() => handleDayPress(date)}
              >
                <Text
                  style={[
                    styles.dayText,
                    { 
                      color: isSelected(date) 
                        ? theme.colors.onPrimary 
                        : theme.colors.onSurface 
                    },
                  ]}
                >
                  {date.getDate()}
                </Text>
                {getWorkoutCount(date) > 0 && !isSelected(date) && (
                  getWorkoutCount(date) > 1 ? (
                    <View style={styles.multipleDots}>
                      <View style={styles.workoutDot} />
                      <View style={[styles.workoutDot, { backgroundColor: theme.colors.tertiary }]} />
                    </View>
                  ) : (
                    <View style={styles.workoutDot} />
                  )
                )}
              </TouchableOpacity>
            ) : null}
          </View>
        ))}
      </View>

      {/* Monthly Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{monthStats.days}</Text>
          <Text style={styles.statLabel}>Days Active</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{monthStats.workouts}</Text>
          <Text style={styles.statLabel}>Workouts</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{monthStats.sets}</Text>
          <Text style={styles.statLabel}>Total Sets</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{(monthStats.volume / 1000).toFixed(0)}k</Text>
          <Text style={styles.statLabel}>Volume (lbs)</Text>
        </View>
      </View>

      {/* Selected date workouts */}
      {selectedDate && (
        <View style={styles.selectedSection}>
          <Text variant="titleMedium" style={styles.selectedHeader}>
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'short', 
              day: 'numeric' 
            })}
          </Text>
          {selectedWorkouts.length > 0 ? (
            selectedWorkouts.map(workout => (
              <Surface key={workout.id} style={styles.workoutItem} elevation={1}>
                <Text variant="bodyLarge" style={styles.workoutName}>
                  {workout.name}
                </Text>
                <Text variant="bodySmall" style={styles.workoutDetails}>
                  {(workout.exercises || []).length} exercises • {' '}
                  {(workout.exercises || []).reduce((sum: number, e: any) => sum + (e.sets || []).filter((s: any) => s.completed).length, 0)} sets • {' '}
                  {workout.duration ? Math.round(workout.duration / 60) : 0} min
                </Text>
              </Surface>
            ))
          ) : (
            <Text style={{ color: theme.colors.onSurfaceVariant }}>
              No workouts on this day
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

export default MonthCalendar;
