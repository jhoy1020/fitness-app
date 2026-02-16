// Volume Tracker Screen - Shows sets per muscle with MEV/MAV/MRV zones

import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Surface, useTheme, SegmentedButtons } from 'react-native-paper';
import { useMesoCycle } from '../context/MesoCycleContext';
import { VOLUME_LANDMARKS, MUSCLE_GROUP_LABELS } from '../utils/constants';
import { InfoTooltip, ABBREVIATIONS } from '../components';
import type { MuscleGroup, MuscleVolumeTracker } from '../types';

interface VolumeTrackerScreenProps {
  navigation: any;
}

export function VolumeTrackerScreen({ navigation }: VolumeTrackerScreenProps) {
  const theme = useTheme();
  const { state: mesoState, getVolumeStatus, getVolumeRecommendation } = useMesoCycle();
  const [timeframe, setTimeframe] = useState<'week' | 'meso'>('week');

  // Get all muscle groups with volume
  const muscleGroups = Object.keys(VOLUME_LANDMARKS) as MuscleGroup[];

  // Calculate volume for current timeframe
  const volumeData = useMemo(() => {
    const data: Array<{
      muscle: MuscleGroup;
      sets: number;
      mev: number;
      mavLow: number;
      mavHigh: number;
      mrv: number;
      status: MuscleVolumeTracker['status'];
      recommendation: number;
      percentOfMRV: number;
    }> = [];

    muscleGroups.forEach(muscle => {
      const volumeStatus = getVolumeStatus(muscle);
      const landmarks = VOLUME_LANDMARKS[muscle];
      const recommendation = getVolumeRecommendation(muscle);
      
      data.push({
        muscle,
        sets: volumeStatus.setsCompleted,
        mev: landmarks.MEV,
        mavLow: landmarks.MAV[0],
        mavHigh: landmarks.MAV[1],
        mrv: landmarks.MRV,
        status: volumeStatus.status,
        recommendation,
        percentOfMRV: volumeStatus.percentOfMRV,
      });
    });

    // Sort by status priority (at_mrv first, then by volume)
    const statusOrder = { 'at_mrv': 0, 'near_mrv': 1, 'in_mav': 2, 'at_mev': 3, 'below_mev': 4 };
    return data.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
  }, [muscleGroups, getVolumeStatus, getVolumeRecommendation]);

  // Get status color
  const getStatusColor = (status: MuscleVolumeTracker['status']) => {
    switch (status) {
      case 'below_mev': return theme.colors.outline;
      case 'at_mev': return '#FF9800';
      case 'in_mav': return '#4CAF50';
      case 'near_mrv': return '#FF9800';
      case 'at_mrv': return '#F44336';
      default: return theme.colors.outline;
    }
  };

  // Get status label
  const getStatusLabel = (status: MuscleVolumeTracker['status']) => {
    switch (status) {
      case 'below_mev': return 'Below MEV';
      case 'at_mev': return 'At MEV';
      case 'in_mav': return 'Optimal';
      case 'near_mrv': return 'Near MRV';
      case 'at_mrv': return 'At MRV';
      default: return 'Unknown';
    }
  };

  // Get recommendation text
  const getRecommendationText = (item: typeof volumeData[0]) => {
    if (item.status === 'below_mev') {
      return `Add ${item.mev - item.sets} more sets to reach MEV`;
    } else if (item.status === 'at_mev') {
      return `On track! Target ${item.mavLow}-${item.mavHigh} sets for optimal`;
    } else if (item.status === 'in_mav') {
      return `Perfect! You're in the optimal volume range`;
    } else if (item.status === 'near_mrv') {
      return `Approaching max recoverable volume. Consider maintaining.`;
    } else if (item.status === 'at_mrv') {
      return `At maximum! Any more volume may impair recovery.`;
    }
    return '';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Timeframe Selector */}
      <View style={styles.selectorContainer}>
        <SegmentedButtons
          value={timeframe}
          onValueChange={(value) => setTimeframe(value as 'week' | 'meso')}
          buttons={[
            { value: 'week', label: 'This Week' },
            { value: 'meso', label: 'Mesocycle Total' },
          ]}
        />
      </View>

      {/* Summary Card */}
      <Surface style={styles.summaryCard} elevation={1}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text variant="headlineMedium" style={{ color: '#4CAF50' }}>
              {volumeData.filter(d => d.status === 'in_mav').length}
            </Text>
            <Text variant="labelSmall">Optimal</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text variant="headlineMedium" style={{ color: '#FF9800' }}>
              {volumeData.filter(d => ['near_mrv', 'at_mev'].includes(d.status)).length}
            </Text>
            <Text variant="labelSmall">Caution</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text variant="headlineMedium" style={{ color: '#F44336' }}>
              {volumeData.filter(d => d.status === 'at_mrv').length}
            </Text>
            <Text variant="labelSmall">At Max</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text variant="headlineMedium" style={{ color: theme.colors.outline }}>
              {volumeData.filter(d => d.status === 'below_mev').length}
            </Text>
            <Text variant="labelSmall">Low</Text>
          </View>
        </View>
      </Surface>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.outline }]} />
          <Text variant="labelSmall">MEV</Text>
          <InfoTooltip {...ABBREVIATIONS.MEV} size="small" />
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
          <Text variant="labelSmall">MAV</Text>
          <InfoTooltip {...ABBREVIATIONS.MAV} size="small" />
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F44336' }]} />
          <Text variant="labelSmall">MRV</Text>
          <InfoTooltip {...ABBREVIATIONS.MRV} size="small" />
        </View>
      </View>

      {/* Volume List */}
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {volumeData.map(item => {
          // Calculate positions for markers
          const mevPosition = (item.mev / item.mrv) * 100;
          const mavLowPosition = (item.mavLow / item.mrv) * 100;
          const mavHighPosition = (item.mavHigh / item.mrv) * 100;
          const progress = Math.min(item.sets / item.mrv, 1.2);
          
          return (
            <Surface key={item.muscle} style={styles.muscleCard} elevation={1}>
              <View style={styles.muscleHeader}>
                <Text variant="titleMedium">{MUSCLE_GROUP_LABELS[item.muscle]}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                  <Text variant="labelSmall" style={{ color: getStatusColor(item.status) }}>
                    {getStatusLabel(item.status)}
                  </Text>
                </View>
              </View>

              {/* Volume Bar */}
              <View style={styles.volumeBarContainer}>
                <View style={styles.volumeBar}>
                  {/* MEV marker */}
                  <View style={[styles.marker, { left: `${mevPosition}%` }]}>
                    <View style={[styles.markerLine, { backgroundColor: theme.colors.outline }]} />
                  </View>
                  
                  {/* MAV range indicator */}
                  <View 
                    style={[
                      styles.mavRange, 
                      { 
                        left: `${mavLowPosition}%`, 
                        width: `${mavHighPosition - mavLowPosition}%`,
                        backgroundColor: '#4CAF50' + '30',
                      }
                    ]} 
                  />
                  
                  {/* MRV marker */}
                  <View style={[styles.marker, { left: '100%' }]}>
                    <View style={[styles.markerLine, { backgroundColor: '#F44336' }]} />
                  </View>

                  {/* Progress fill */}
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${Math.min(progress * 100, 100)}%`,
                        backgroundColor: getStatusColor(item.status),
                      }
                    ]} 
                  />
                </View>
                
                {/* Current sets label */}
                <Text variant="titleLarge" style={[styles.setsLabel, { color: getStatusColor(item.status) }]}>
                  {item.sets}
                </Text>
              </View>

              {/* Volume markers labels */}
              <View style={styles.markersLabels}>
                <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
                  {item.mev}
                </Text>
                <Text variant="labelSmall" style={{ color: '#4CAF50' }}>
                  {item.mavLow}-{item.mavHigh}
                </Text>
                <Text variant="labelSmall" style={{ color: '#F44336' }}>
                  {item.mrv}
                </Text>
              </View>

              {/* Recommendation */}
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
                {getRecommendationText(item)}
              </Text>
            </Surface>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  selectorContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  summaryCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  muscleCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  muscleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  volumeBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  volumeBar: {
    flex: 1,
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  marker: {
    position: 'absolute',
    top: -2,
    transform: [{ translateX: -1 }],
    alignItems: 'center',
    zIndex: 10,
  },
  markerLine: {
    width: 2,
    height: 16,
    borderRadius: 1,
  },
  mavRange: {
    position: 'absolute',
    top: 0,
    height: '100%',
  },
  markersLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  setsLabel: {
    fontWeight: 'bold',
    minWidth: 40,
    textAlign: 'right',
  },
});

export default VolumeTrackerScreen;
