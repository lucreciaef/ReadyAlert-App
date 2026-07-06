/**
 * Empty state – shown when an API call returns no results.
 */

import { Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { getThemeColors } from '../styles/themeColors';

interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);

  return (
    <View
      style={{
        alignItems: 'center',
        padding: 24,
        borderRadius: 12,
        marginTop: 8,
        gap: 10,
        backgroundColor: colors.successMuted,
      }}
    >
      <MaterialCommunityIcons
        name="check-circle"
        size={32}
        color={colors.successOn}
      />
      <Text
        style={{
          fontSize: 14,
          fontWeight: '400',
          textAlign: 'center',
          color: colors.successOn,
          lineHeight: 20,
        }}
      >
        {message}
      </Text>
    </View>
  );
}

