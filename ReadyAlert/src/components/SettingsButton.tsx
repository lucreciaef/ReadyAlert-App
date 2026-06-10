import { Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getThemeColors } from '../styles/themeColors';
import { useTheme } from '../theme/ThemeContext';

interface SettingsButtonProps {
  onPress: () => void;
}

export function SettingsButton({ onPress }: SettingsButtonProps) {
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: colors.ripple, borderless: true }}
      style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 24 }}
    >
      <MaterialCommunityIcons name="cog-outline" size={24} color={colors.textMuted} />
    </Pressable>
  );
}
