/**
 * LearningMarkAsReadCheckbox – "I have read and understood…" confirmation row
 * for learning/reading pages. Toggles a single boolean read state.
 */

import { Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { getThemeColours } from '../styles/themeColours';

export interface LearningMarkAsReadCheckboxProps {
  label: string;
  isRead: boolean;
  onToggle: () => void;
}

export function LearningMarkAsReadCheckbox({
  label,
  isRead,
  onToggle,
}: LearningMarkAsReadCheckboxProps) {
  const { isDark } = useTheme();
  const colors = getThemeColours(isDark);

  return (
    <Pressable
      onPress={onToggle}
      android_ripple={{ color: colors.ripple }}
      style={{
        borderRadius: 12, marginTop: 4, marginBottom: 8,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          flexDirection: 'row', alignItems: 'center', gap: 14,
          padding: 16, borderRadius: 12,
          backgroundColor: isDark ? colors.surfaceAlt : colors.surface,
          borderWidth: 1.5,
          borderColor: isRead ? colors.primary : colors.outline,
        }}
      >
        <View style={{
          width: 24, height: 24, borderRadius: 12, overflow: 'hidden',
          alignItems: 'center', justifyContent: 'center',
          borderWidth: 2, flexShrink: 0,
          borderColor: isRead ? colors.primary : colors.outline,
          backgroundColor: isRead ? colors.primary : 'transparent',
        }}>
          {isRead && <MaterialCommunityIcons name="check" size={14} color={colors.onPrimary} />}
        </View>
        <Text style={{ flex: 1, fontSize: 14, fontWeight: '500', color: colors.text, lineHeight: 20 }}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
