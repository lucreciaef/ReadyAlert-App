/**
 * Settings screen for user preferences.
 * Currently exposes a light/dark theme toggle.
 */

import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { getCardStyles, getLayoutStyles, getTypographyStyles } from '../styles/appStyles';
import { getThemeColors } from '../styles/themeColors';

export function SettingsPage() {
  const { isDark, theme, toggleTheme } = useTheme();
  const layout = getLayoutStyles(isDark);
  const typography = getTypographyStyles(isDark);
  const card = getCardStyles(isDark);
  const colors = getThemeColors(isDark);

  return (
    <View className={layout.content}>
      <Text className={typography.title}>Settings</Text>

      <View className={card.container}>
        <Text className={typography.cardTitle}>Appearance</Text>

        <View className="flex flex-row items-center justify-between py-4">
          <View className="flex flex-row items-center gap-3">
            <Ionicons name={isDark ? 'moon' : 'sunny'} size={24} color={colors.primary} />
            <Text className={`text-lg ${isDark ? 'text-text-dark' : 'text-text'}`}>
              Current mode:
            </Text>
          </View>
          <Text className={`font-bold ${isDark ? 'text-text-dark' : 'text-text'}`}>
            {theme.charAt(0).toUpperCase() + theme.slice(1)}
          </Text>
        </View>

        <TouchableOpacity
          className={`mt-4 py-3 px-4 rounded-lg items-center ${
            isDark ? 'bg-primary-dark' : 'bg-primary'
          }`}
          onPress={toggleTheme}
        >
          <Text className="text-white font-bold">Switch to {isDark ? 'Light' : 'Dark'} Mode</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
