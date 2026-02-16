// Stub for expo vector icons on web
// This provides a simple fallback when running on web

import React from 'react';
import { Text } from 'react-native';

// Map of commonly used icon names to unicode/emoji alternatives
const iconMap = {
  'home': '🏠',
  'dumbbell': '🏋️',
  'plus': '+',
  'check': '✓',
  'check-bold': '✓',
  'checkbox-marked': '☑',
  'checkbox-blank-outline': '☐',
  'checkbox-marked-outline': '☑',
  'checkbox-blank': '☐',
  'close': '✕',
  'delete': '🗑',
  'play': '▶',
  'pause': '⏸',
  'stop': '⏹',
  'timer': '⏱',
  'account': '👤',
  'account-circle': '👤',
  'cog': '⚙',
  'settings': '⚙',
  'magnify': '🔍',
  'search': '🔍',
  'pencil': '✏',
  'edit': '✏',
  'chevron-right': '›',
  'chevron-left': '‹',
  'chevron-down': '▼',
  'chevron-up': '▲',
  'arrow-left': '←',
  'arrow-right': '→',
  'menu': '☰',
  'dots-vertical': '⋮',
  'calendar': '📅',
  'chart-line': '📈',
  'fire': '🔥',
  'heart': '❤',
  'star': '⭐',
  'trophy': '🏆',
  'weight-lifter': '🏋️',
  'run': '🏃',
  'bike': '🚴',
  'swim': '🏊',
  'walk': '🚶',
  'food': '🍎',
  'water': '💧',
  'sleep': '😴',
  'clock': '🕐',
  'history': '📜',
  'content-save': '💾',
  'trash-can': '🗑',
  'information': 'ℹ',
  'alert': '⚠',
  'check-circle': '✅',
  'close-circle': '❌',
  'plus-circle': '⊕',
  'minus-circle': '⊖',
  'refresh': '🔄',
  'sync': '🔄',
  'radiobox-marked': '●',
  'radiobox-blank': '○',
  'circle': '○',
  'circle-outline': '○',
  'menu-down': '▼',
  'menu-up': '▲',
  'eye': '👁',
  'eye-off': '🙈',
  'eye-outline': '👁',
  'eye-off-outline': '🙈',
  'filter': '🔍',
  'sort': '↕',
  'repeat': '🔁',
};

// Create a simple Icon component that renders text
const Icon = ({ name, size = 24, color = '#000', style, ...props }) => {
  const icon = iconMap[name] || iconMap[name?.toLowerCase()] || '○';
  
  return (
    <Text
      style={[
        {
          fontSize: size * 0.8,
          color: color,
          textAlign: 'center',
          width: size,
          height: size,
          lineHeight: size,
        },
        style
      ]}
      {...props}
    >
      {icon}
    </Text>
  );
};

// Default export for @expo/vector-icons
const MaterialCommunityIcons = Icon;

// Named exports
export { MaterialCommunityIcons };
export default Icon;

// Provide a createIconSet function for compatibility
export const createIconSet = () => Icon;
export const createIconSetFromIcoMoon = () => Icon;
export const createIconSetFromFontello = () => Icon;
