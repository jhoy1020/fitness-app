import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, useTheme, Surface } from 'react-native-paper';
import { BodyMeasurement } from '../types';

interface WeightGraphProps {
  data: BodyMeasurement[];
  height?: number;
  showBodyFat?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const WeightGraph: React.FC<WeightGraphProps> = ({ 
  data, 
  height = 200,
  showBodyFat = false,
}) => {
  const theme = useTheme();

  const chartData = useMemo(() => {
    if (data.length === 0) return null;

    // Filter entries with weight
    const validData = data.filter(d => d.weight !== undefined);
    if (validData.length === 0) return null;

    // Get min/max for scaling
    const weights = validData.map(d => d.weight!);
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);
    const range = maxWeight - minWeight || 10; // Prevent division by zero
    const padding = range * 0.1;

    // Calculate points for the graph
    const graphWidth = SCREEN_WIDTH - 80; // Account for padding
    const graphHeight = height - 60; // Account for labels

    const points = validData.map((entry, index) => {
      const x = validData.length > 1 
        ? (index / (validData.length - 1)) * graphWidth 
        : graphWidth / 2;
      const y = graphHeight - ((entry.weight! - minWeight + padding) / (range + padding * 2)) * graphHeight;
      return { x, y, date: entry.date, weight: entry.weight!, bodyFat: entry.bodyFatPercent };
    });

    // Calculate body fat points if requested
    const bodyFatData = validData.filter(d => d.bodyFatPercent !== undefined);
    let bodyFatPoints: { x: number; y: number; value: number }[] = [];
    
    if (showBodyFat && bodyFatData.length > 0) {
      const bfValues = bodyFatData.map(d => d.bodyFatPercent!);
      const minBF = Math.min(...bfValues);
      const maxBF = Math.max(...bfValues);
      const bfRange = maxBF - minBF || 5;
      const bfPadding = bfRange * 0.1;

      bodyFatPoints = bodyFatData.map((entry, index) => {
        const originalIndex = validData.findIndex(d => d.id === entry.id);
        const x = validData.length > 1 
          ? (originalIndex / (validData.length - 1)) * graphWidth 
          : graphWidth / 2;
        const y = graphHeight - ((entry.bodyFatPercent! - minBF + bfPadding) / (bfRange + bfPadding * 2)) * graphHeight;
        return { x, y, value: entry.bodyFatPercent! };
      });
    }

    // Create path for the line
    let path = '';
    points.forEach((point, index) => {
      if (index === 0) {
        path += `M ${point.x} ${point.y}`;
      } else {
        path += ` L ${point.x} ${point.y}`;
      }
    });

    // Create area fill path
    let areaPath = path;
    if (points.length > 0) {
      areaPath += ` L ${points[points.length - 1].x} ${graphHeight}`;
      areaPath += ` L ${points[0].x} ${graphHeight} Z`;
    }

    // Calculate weekly change
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentData = validData.filter(d => new Date(d.date) >= weekAgo);
    let weeklyChange = null;
    if (recentData.length >= 2) {
      const oldestRecent = recentData[0].weight!;
      const latestRecent = recentData[recentData.length - 1].weight!;
      weeklyChange = latestRecent - oldestRecent;
    }

    return {
      points,
      bodyFatPoints,
      path,
      areaPath,
      minWeight: minWeight - padding,
      maxWeight: maxWeight + padding,
      latest: validData[validData.length - 1],
      weeklyChange,
      graphWidth,
      graphHeight,
    };
  }, [data, height, showBodyFat]);

  if (!chartData || chartData.points.length === 0) {
    return (
      <Surface style={{ justifyContent: 'center', alignItems: 'center', borderRadius: 12, padding: 24, height }} elevation={1}>
        <Text style={{ fontSize: 48 }}>📊</Text>
        <Text variant="bodyLarge" style={{ marginTop: 8 }}>No weight data yet</Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          Add your first weight entry to see your progress
        </Text>
      </Surface>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const styles = StyleSheet.create({
    container: {
      padding: 16,
      borderRadius: 12,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 16,
    },
    currentWeight: {
      alignItems: 'flex-start',
    },
    weightLabel: {
      color: theme.colors.onSurfaceVariant,
    },
    weightValue: {
      fontWeight: 'bold',
      color: theme.colors.onSurface,
    },
    change: {
      alignItems: 'flex-end',
    },
    changeValue: {
      fontWeight: '600',
    },
    graphContainer: {
      height: chartData.graphHeight,
      marginLeft: 35,
    },
    yAxisLabels: {
      position: 'absolute',
      left: 0,
      top: 0,
      height: chartData.graphHeight,
      justifyContent: 'space-between',
      width: 30,
    },
    yLabel: {
      fontSize: 10,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'right',
    },
    xAxisLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
      marginLeft: 35,
    },
    xLabel: {
      fontSize: 10,
      color: theme.colors.onSurfaceVariant,
    },
    dot: {
      position: 'absolute',
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.primary,
      borderWidth: 2,
      borderColor: theme.colors.surface,
    },
    bodyFatDot: {
      position: 'absolute',
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.tertiary,
    },
    emptyContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 12,
      padding: 24,
    },
    legend: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 16,
      marginTop: 12,
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
  });

  // Generate y-axis labels
  const yLabels = [
    chartData.maxWeight.toFixed(0),
    ((chartData.maxWeight + chartData.minWeight) / 2).toFixed(0),
    chartData.minWeight.toFixed(0),
  ];

  // Generate x-axis labels (first and last)
  const xLabels = chartData.points.length > 1 ? [
    formatDate(chartData.points[0].date),
    formatDate(chartData.points[chartData.points.length - 1].date),
  ] : [formatDate(chartData.points[0].date)];

  return (
    <Surface style={styles.container} elevation={1}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.currentWeight}>
          <Text variant="labelSmall" style={styles.weightLabel}>Current Weight</Text>
          <Text variant="headlineMedium" style={styles.weightValue}>
            {chartData.latest.weight} lbs
          </Text>
          {chartData.latest.bodyFatPercent && (
            <Text variant="labelMedium" style={{ color: theme.colors.tertiary }}>
              {chartData.latest.bodyFatPercent}% body fat
            </Text>
          )}
        </View>
        {chartData.weeklyChange !== null && (
          <View style={styles.change}>
            <Text variant="labelSmall" style={styles.weightLabel}>This Week</Text>
            <Text 
              variant="titleMedium" 
              style={[
                styles.changeValue,
                { 
                  color: chartData.weeklyChange < 0 
                    ? theme.colors.tertiary 
                    : chartData.weeklyChange > 0 
                      ? theme.colors.error 
                      : theme.colors.onSurface 
                }
              ]}
            >
              {chartData.weeklyChange > 0 ? '+' : ''}{chartData.weeklyChange.toFixed(1)} lbs
            </Text>
          </View>
        )}
      </View>

      {/* Y-axis labels */}
      <View style={styles.yAxisLabels}>
        {yLabels.map((label, i) => (
          <Text key={i} style={styles.yLabel}>{label}</Text>
        ))}
      </View>

      {/* Graph area */}
      <View style={styles.graphContainer}>
        {/* SVG-like line using absolute positioning */}
        <svg 
          width={chartData.graphWidth} 
          height={chartData.graphHeight}
          style={{ position: 'absolute', left: 0, top: 0 }}
        >
          {/* Gradient area fill */}
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={theme.colors.primary} stopOpacity="0.3" />
              <stop offset="100%" stopColor={theme.colors.primary} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={chartData.areaPath} fill="url(#areaGradient)" />
          <path 
            d={chartData.path} 
            fill="none" 
            stroke={theme.colors.primary} 
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Body fat line if enabled */}
          {showBodyFat && chartData.bodyFatPoints.length > 1 && (
            <path 
              d={chartData.bodyFatPoints.map((p, i) => 
                `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
              ).join(' ')}
              fill="none"
              stroke={theme.colors.tertiary}
              strokeWidth="2"
              strokeDasharray="4,4"
              strokeLinecap="round"
            />
          )}
        </svg>

        {/* Data points */}
        {chartData.points.map((point, i) => (
          <View 
            key={i}
            style={[
              styles.dot,
              { left: point.x - 4, top: point.y - 4 }
            ]}
          />
        ))}
        
        {/* Body fat points */}
        {showBodyFat && chartData.bodyFatPoints.map((point, i) => (
          <View 
            key={`bf-${i}`}
            style={[
              styles.bodyFatDot,
              { left: point.x - 3, top: point.y - 3, backgroundColor: theme.colors.tertiary }
            ]}
          />
        ))}
      </View>

      {/* X-axis labels */}
      <View style={styles.xAxisLabels}>
        {xLabels.map((label, i) => (
          <Text key={i} style={styles.xLabel}>{label}</Text>
        ))}
      </View>

      {/* Legend */}
      {showBodyFat && chartData.bodyFatPoints.length > 0 && (
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
            <Text variant="labelSmall">Weight</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.colors.tertiary }]} />
            <Text variant="labelSmall">Body Fat %</Text>
          </View>
        </View>
      )}
    </Surface>
  );
};

export default WeightGraph;
