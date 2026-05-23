import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getThemeColors } from '../styles/themeColors';
import { getBottomMenuStyles } from '../styles/appStyles';
import { useTheme } from '../theme/ThemeContext';

interface MenuButtonProps {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  active: boolean;
  onPress: () => void;
}

export function MenuButton({ label, icon, active, onPress }: MenuButtonProps) {
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);
  const bottomMenu = getBottomMenuStyles(isDark);

  return (
    <TouchableOpacity className={bottomMenu.button} onPress={onPress}>
      <Ionicons name={icon} size={24} color={active ? colors.primary : colors.textMuted} />
      <Text className={`${bottomMenu.label} ${active ? bottomMenu.labelActive : ''}`}>{label}</Text>
    </TouchableOpacity>
  );
}
