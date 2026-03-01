// Stub for expo vector icons on web
// Renders Unicode / emoji fallbacks for every MaterialCommunityIcons glyph used in the app.

import React from 'react';
import { Text } from 'react-native';

// Map of icon names → unicode / emoji fallbacks
const iconMap = {
  // Tab bar
  'home': '⌂',
  'home-outline': '⌂',
  'clipboard-text': '📋',
  'clipboard-text-outline': '📋',
  'clipboard-text-search': '📋',
  'clipboard-list': '📋',
  'history': '↺',
  'chart-line': '📈',
  'chart-line-variant': '📈',
  'account': '●',
  'account-outline': '○',
  'account-circle': '●',

  // Workout actions
  'dumbbell': '🏋',
  'power-sleep': '☾',
  'yoga': '🧘',
  'run-fast': '🏃',
  'play-circle': '▶',
  'play-circle-outline': '▶',
  'pause': '⏸',
  'pause-circle': '⏸',
  'pause-circle-outline': '⏸',
  'stop': '⏹',
  'stop-circle': '⏹',
  'skip-next': '⏭',
  'heart-pulse': '💓',
  'party-popper': '🎉',
  'delete-outline': '✕',
  'check-circle': '✓',
  'check-circle-outline': '✓',

  // Exercise / set actions
  'plus': '+',
  'plus-circle-outline': '⊕',
  'minus': '−',
  'minus-circle': '⊖',
  'trash-can-outline': '🗑',
  'trash-can': '🗑',
  'drag-horizontal-variant': '⇔',
  'swap-horizontal': '⇄',
  'link-variant': '🔗',
  'fire': '🔥',
  'alert-circle-outline': '⚠',
  'alert-circle': '⚠',
  'lightbulb-outline': '💡',
  'timer-outline': '⏱',
  'timer-sand': '⏳',

  // Navigation
  'menu': '☰',
  'arrow-left': '←',
  'arrow-right': '→',
  'close': '✕',
  'chevron-left': '‹',
  'chevron-right': '›',
  'chevron-down': '▼',
  'chevron-up': '▲',
  'magnify': '🔍',
  'filter-variant': '⫯',
  'sort': '↕',
  'dots-vertical': '⋮',
  'pencil-outline': '✏',
  'pencil': '✏',
  'content-save': '💾',
  'refresh': '↻',
  'share-variant': '↗',

  // Status
  'check': '✓',
  'check-bold': '✓',
  'alert': '⚠',
  'information-outline': 'ℹ',
  'information': 'ℹ',
  'trophy': '🏆',
  'leaf': '🌿',
  'calendar': '📅',
  'calendar-text': '📅',
  'format-list-bulleted': '☰',

  // Settings / profile
  'cog': '⚙',
  'cog-outline': '⚙',
  'settings': '⚙',
  'brightness-6': '☀',
  'volume-high': '🔊',
  'volume-off': '🔇',
  'ruler': '📏',
  'scale-bathroom': '⚖',
  'human-male-height': '📏',
  'food-apple': '🍎',
  'cup-water': '💧',
  'weather-night': '☾',

  // Misc
  'play': '▶',
  'repeat': '🔁',
  'circle-slice-8': '◑',
  'play-box-outline': '▶',
  'text-box-outline': '📝',
  'target': '◎',
  'arm-flex': '💪',
  'content-cut': '✂',
  'chart-bar': '📊',
  'rocket-launch': '🚀',
  'diamond-stone': '💎',
  'hand-front-right': '✋',
  'shield-star': '🛡',
  'lightning-bolt': '⚡',
  'run': '🏃',
  'bike': '🚲',
  'walk': '🚶',
  'swim': '🏊',
  'rowing': '🚣',
  'stairs': '🪜',
  'jump-rope': '🪢',
  'auto-fix': '✨',
  'book-open-variant': '📖',
  'skip-forward': '⏭',
  'flag-checkered': '🏁',
  'scale-bathroom': '⚖',
  'ruler': '📏',
  'white-balance-sunny': '☀',
  'clipboard-list': '📋',

  // Legacy (still referenced by Paper internals)
  'checkbox-marked': '☑',
  'checkbox-blank-outline': '☐',
  'checkbox-marked-outline': '☑',
  'checkbox-blank': '☐',
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
  'star': '⭐',
  'star-outline': '☆',
  'heart': '❤',
  'close-circle': '⊗',
  'sync': '↻',
  'delete': '✕',
  'clock': '⏱',
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
