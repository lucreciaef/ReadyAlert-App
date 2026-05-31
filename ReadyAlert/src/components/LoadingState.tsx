/**
 * Centred loading spinner with a status message.
 * Used inside bottom sheets while API calls are in progress
 */

import { ActivityIndicator, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { getThemeColors } from '../styles/themeColors';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading…' }: LoadingStateProps) {
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);

  return (
    <View className="items-center py-6">
      <ActivityIndicator size="large" color={colors.primary} />
      <Text className={`mt-3 text-sm ${isDark ? 'text-text-muted-dark' : 'text-text-muted'}`}>
        {message}
      </Text>
    </View>
  );
}

