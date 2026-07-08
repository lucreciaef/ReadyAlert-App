/**
 * loading state – centred progress indicator with a status message.
 */

import { ActivityIndicator, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { getThemeColours } from '../styles/themeColours';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading…' }: LoadingStateProps) {
  const { isDark } = useTheme();
  const colors = getThemeColours(isDark);

  return (
    <View style={{ alignItems: 'center', paddingVertical: 32 }}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={{
        marginTop: 16,
        fontSize: 14,
        lineHeight: 20,
        color: colors.textMuted,
      }}>
        {message}
      </Text>
    </View>
  );
}
