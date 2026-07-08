/**
 * Empty state – shown when an API call returns no results.
 */

import { Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { getThemeColours } from '../styles/themeColours';

interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  const { isDark } = useTheme();
  const colors = getThemeColours(isDark);

  return (
    <View
      style={{
        alignItems: 'center',
        padding: 24,
        borderRadius: 12,
        marginTop: 8,
        gap: 10,
        backgroundColor: colors.successContainer,
      }}
    >
      <MaterialCommunityIcons
        name="check-circle"
        size={32}
        color={colors.successOnContainer}
      />
      <Text
        style={{
          fontSize: 14,
          fontWeight: '400',
          textAlign: 'center',
          color: colors.successOnContainer,
          lineHeight: 20,
        }}
      >
        {message}
      </Text>
    </View>
  );
}

