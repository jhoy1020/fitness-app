import React, { useMemo, useState } from 'react';
import { View, LayoutChangeEvent } from 'react-native';
import { Text, useTheme, Surface } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { BodyMeasurement } from '../../types';

interface WeightGraphProps {
  data: BodyMeasurement[];
  height?: number;
  showBodyFat?: boolean;
}

const Y_LABEL_WIDTH = 40;
const GRAPH_PADDING_TOP = 8;
const GRAPH_PADDING_BOTTOM = 8;
const DOT_SIZE = 8;
const BF_DOT_SIZE = 6;

export const WeightGraph: React.FC<WeightGraphProps> = ({
  data,
  height = 200,
  showBodyFat = false,
}) => {
  const theme = useTheme();
  const [measuredWidth, setMeasuredWidth] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0) setMeasuredWidth(w);
  };

  const chartData = useMemo(() => {
    const validData = data.filter(d => d.weight !== undefined);
    if (validData.length === 0) return null;

    const weights = validData.map(d => d.weight!);
    const minW = Math.min(...weights);
    const maxW = Math.max(...weights);
    const range = maxW - minW || 10;
    // Add 10% padding above and below so dots aren't clipped at edges
    const scaleMin = minW - range * 0.1;
    const scaleMax = maxW + range * 0.1;
    const scaleRange = scaleMax - scaleMin;

    // graphWidth = surface inner width (measuredWidth − 2*16 padding) − y-axis label width
    const surfacePad = 32; // 16 each side
    const graphWidth = Math.max(measuredWidth - surfacePad - Y_LABEL_WIDTH, 50);
    const graphHeight = height - 40; // room for x-labels below

    const points = validData.map((entry, i) => {
      const x = validData.length > 1
        ? (i / (validData.length - 1)) * graphWidth
        : graphWidth / 2;
      // y: 0 = top of graph area, graphHeight = bottom
      const y = GRAPH_PADDING_TOP +
        (1 - (entry.weight! - scaleMin) / scaleRange) *
        (graphHeight - GRAPH_PADDING_TOP - GRAPH_PADDING_BOTTOM);
      return { x, y, date: entry.date, weight: entry.weight!, bodyFat: entry.bodyFatPercent };
    });

    // Body fat points (separate scale)
    const bfData = validData.filter(d => d.bodyFatPercent !== undefined);
    let bfPoints: { x: number; y: number; value: number }[] = [];
    if (showBodyFat && bfData.length > 0) {
      const bfVals = bfData.map(d => d.bodyFatPercent!);
      const bfMin = Math.min(...bfVals);
      const bfMax = Math.max(...bfVals);
      const bfRange = bfMax - bfMin || 5;
      const bfScaleMin = bfMin - bfRange * 0.1;
      const bfScaleMax = bfMax + bfRange * 0.1;
      const bfScaleRange = bfScaleMax - bfScaleMin;

      bfPoints = bfData.map(entry => {
        const origIdx = validData.findIndex(d => d.id === entry.id);
        const x = validData.length > 1
          ? (origIdx / (validData.length - 1)) * graphWidth
          : graphWidth / 2;
        const y = GRAPH_PADDING_TOP +
          (1 - (entry.bodyFatPercent! - bfScaleMin) / bfScaleRange) *
          (graphHeight - GRAPH_PADDING_TOP - GRAPH_PADDING_BOTTOM);
        return { x, y, value: entry.bodyFatPercent! };
      });
    }

    // SVG path for weight line
    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    // area fill
    const areaPath = linePath +
      ` L ${points[points.length - 1].x} ${graphHeight}` +
      ` L ${points[0].x} ${graphHeight} Z`;

    // Weekly change
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recent = validData.filter(d => new Date(d.date) >= weekAgo);
    let weeklyChange: number | null = null;
    if (recent.length >= 2) {
      weeklyChange = recent[recent.length - 1].weight! - recent[0].weight!;
    }

    // Y-axis: 3 nice labels at top, middle, bottom of actual plotted area
    const yTopVal = scaleMax;
    const yMidVal = (scaleMax + scaleMin) / 2;
    const yBotVal = scaleMin;
    // corresponding y pixel positions (for alignment)
    const yTopPx = GRAPH_PADDING_TOP;
    const yMidPx = GRAPH_PADDING_TOP + (graphHeight - GRAPH_PADDING_TOP - GRAPH_PADDING_BOTTOM) / 2;
    const yBotPx = graphHeight - GRAPH_PADDING_BOTTOM;

    return {
      points, bfPoints, linePath, areaPath,
      graphWidth, graphHeight,
      latest: validData[validData.length - 1],
      weeklyChange,
      yLabels: [
        { text: yTopVal.toFixed(0), y: yTopPx },
        { text: yMidVal.toFixed(0), y: yMidPx },
        { text: yBotVal.toFixed(0), y: yBotPx },
      ],
    };
  }, [data, height, showBodyFat, measuredWidth]);

  // Empty state
  if (!chartData || chartData.points.length === 0) {
    return (
      <Surface style={{ justifyContent: 'center', alignItems: 'center', borderRadius: 12, padding: 24, height }} elevation={1}>
        <MaterialCommunityIcons name="chart-line" size={48} color={theme.colors.onSurfaceVariant} />
        <Text variant="bodyLarge" style={{ marginTop: 8 }}>No weight data yet</Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          Add your first weight entry to see your progress
        </Text>
      </Surface>
    );
  }

  const fmtDate = (s: string) => {
    const d = new Date(s);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const { points, bfPoints, linePath, areaPath, graphWidth, graphHeight, latest, weeklyChange, yLabels } = chartData;

  // X-axis: first & last date
  const xLabels = points.length > 1
    ? [fmtDate(points[0].date), fmtDate(points[points.length - 1].date)]
    : [fmtDate(points[0].date)];

  const bfLinePath = bfPoints.length > 1
    ? bfPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    : '';

  return (
    <Surface style={{ padding: 16, borderRadius: 12 }} elevation={1} onLayout={onLayout}>
      {/* ── Header ── */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <View style={{ flex: 1 }}>
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>Current Weight</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>
              {latest.weight} lbs
            </Text>
            {latest.bodyFatPercent != null && (
              <Text variant="bodySmall" style={{ color: theme.colors.tertiary }}>
                {latest.bodyFatPercent}% BF
              </Text>
            )}
          </View>
        </View>
        {weeklyChange !== null && (
          <View style={{ alignItems: 'flex-end' }}>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>This Week</Text>
            <Text
              variant="titleMedium"
              style={{
                fontWeight: '600',
                color: weeklyChange < 0
                  ? theme.colors.tertiary
                  : weeklyChange > 0
                    ? theme.colors.error
                    : theme.colors.onSurface,
              }}
            >
              {weeklyChange > 0 ? '+' : ''}{weeklyChange.toFixed(1)} lbs
            </Text>
          </View>
        )}
      </View>

      {/* ── Chart area (y-labels + graph side by side) ── */}
      <View style={{ flexDirection: 'row', height: graphHeight }}>
        {/* Y-axis labels — absolutely position each label at its pixel y */}
        <View style={{ width: Y_LABEL_WIDTH, position: 'relative' }}>
          {yLabels.map((lbl, i) => (
            <Text
              key={i}
              style={{
                position: 'absolute',
                right: 4,
                top: lbl.y - 6, // center the ~12px text on the y position
                fontSize: 10,
                color: theme.colors.onSurfaceVariant,
              }}
            >
              {lbl.text}
            </Text>
          ))}
        </View>

        {/* Graph plot */}
        <View style={{ flex: 1, height: graphHeight, overflow: 'hidden' }}>
          {/* Grid lines */}
          {yLabels.map((lbl, i) => (
            <View
              key={`grid-${i}`}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: lbl.y,
                height: 1,
                backgroundColor: theme.colors.outlineVariant,
                opacity: 0.4,
              }}
            />
          ))}

          {/* SVG lines */}
          <svg
            width={graphWidth}
            height={graphHeight}
            viewBox={`0 0 ${graphWidth} ${graphHeight}`}
            style={{ position: 'absolute', left: 0, top: 0 }}
          >
            <defs>
              <linearGradient id="weightGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={theme.colors.primary} stopOpacity="0.25" />
                <stop offset="100%" stopColor={theme.colors.primary} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={areaPath} fill="url(#weightGrad)" />
            <path d={linePath} fill="none" stroke={theme.colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {bfLinePath ? (
              <path d={bfLinePath} fill="none" stroke={theme.colors.tertiary} strokeWidth="2" strokeDasharray="4,4" strokeLinecap="round" />
            ) : null}
          </svg>

          {/* Weight dots */}
          {points.map((p, i) => (
            <View
              key={i}
              style={{
                position: 'absolute',
                left: p.x - DOT_SIZE / 2,
                top: p.y - DOT_SIZE / 2,
                width: DOT_SIZE,
                height: DOT_SIZE,
                borderRadius: DOT_SIZE / 2,
                backgroundColor: theme.colors.primary,
                borderWidth: 2,
                borderColor: theme.colors.surface,
              }}
            />
          ))}

          {/* Body fat dots */}
          {showBodyFat && bfPoints.map((p, i) => (
            <View
              key={`bf-${i}`}
              style={{
                position: 'absolute',
                left: p.x - BF_DOT_SIZE / 2,
                top: p.y - BF_DOT_SIZE / 2,
                width: BF_DOT_SIZE,
                height: BF_DOT_SIZE,
                borderRadius: BF_DOT_SIZE / 2,
                backgroundColor: theme.colors.tertiary,
              }}
            />
          ))}
        </View>
      </View>

      {/* ── X-axis labels ── */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, marginLeft: Y_LABEL_WIDTH }}>
        {xLabels.map((lbl, i) => (
          <Text key={i} style={{ fontSize: 10, color: theme.colors.onSurfaceVariant }}>{lbl}</Text>
        ))}
      </View>

      {/* ── Legend ── */}
      {showBodyFat && bfPoints.length > 0 && (
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.primary }} />
            <Text variant="labelSmall">Weight</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.tertiary }} />
            <Text variant="labelSmall">Body Fat %</Text>
          </View>
        </View>
      )}
    </Surface>
  );
};

export default WeightGraph;
