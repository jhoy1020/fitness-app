// AppSettingsSection — units toggle + theme + sound effects. Set-once
// preferences grouped under one card. Calls `useThemeMode()` directly
// because theme is a global concern and prop-drilling it adds nothing.

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Text,
  SegmentedButtons,
  Surface,
  Switch,
  Divider,
  useTheme,
} from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useThemeMode } from '../../../context';
import { soundService } from '../../../services/SoundService/SoundService';
import { spacing, borderRadius } from '../../../theme';
import type { UnitsSlice } from '../useProfileForm';

const THEME_ICON_SIZE = 20;

interface Props {
  units: UnitsSlice;
}

export function AppSettingsSection({ units }: Props) {
  const theme = useTheme();
  const { isDark, toggleTheme } = useThemeMode();
  const [soundEnabled, setSoundEnabled] = useState(soundService.isEnabled());
  const { useMetric, setUseMetric } = units;

  const handleSoundToggle = (value: boolean) => {
    setSoundEnabled(value);
    soundService.setEnabled(value);
    if (value) soundService.playTap();
  };

  return (
    <Surface style={styles.card} elevation={1}>
      <Text variant="titleMedium" style={styles.sectionTitle}>
        App Settings
      </Text>

      <View style={styles.unitToggleRow}>
        <Text variant="bodyLarge">Units</Text>
        <SegmentedButtons
          value={useMetric ? 'metric' : 'imperial'}
          onValueChange={(v) => setUseMetric(v === 'metric')}
          buttons={[
            { value: 'imperial', label: 'Imperial' },
            { value: 'metric', label: 'Metric' },
          ]}
          style={styles.unitToggleButtons}
        />
      </View>

      <Divider style={styles.divider} />

      <View style={styles.settingRow}>
        <View style={styles.settingLabel}>
          <View style={styles.settingHeader}>
            <MaterialCommunityIcons
              name={isDark ? 'weather-night' : 'white-balance-sunny'}
              size={THEME_ICON_SIZE}
              color={theme.colors.onSurface}
            />
            <Text variant="bodyLarge">Theme</Text>
          </View>
          <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
            {isDark ? 'Dark mode' : 'Light mode'}
          </Text>
        </View>
        <Switch value={isDark} onValueChange={toggleTheme} />
      </View>

      <Divider style={styles.divider} />

      <View style={styles.settingRow}>
        <View style={styles.settingLabel}>
          <Text variant="bodyLarge">Sound Effects</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
            Timer alerts &amp; feedback sounds
          </Text>
        </View>
        <Switch value={soundEnabled} onValueChange={handleSoundToggle} />
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  unitToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unitToggleButtons: {
    flex: 1,
    marginLeft: spacing.md,
  },
  divider: {
    marginVertical: spacing.sm + spacing.xs,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLabel: {
    flex: 1,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
