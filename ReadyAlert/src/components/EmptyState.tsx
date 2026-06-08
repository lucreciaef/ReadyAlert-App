/**
 * Empty state – shown when an API call returns no results.
 */

import { Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  const { isDark } = useTheme();

  return (
    <View
      style={{
        alignItems: 'center',
        padding: 24,
        borderRadius: 12,
        marginTop: 8,
        gap: 10,
        backgroundColor: isDark ? 'rgba(76,175,80,0.10)' : '#F1F8F1',
      }}
    >
      <MaterialCommunityIcons
        name="check-circle"
        size={32}
        color={isDark ? '#A5D6A7' : '#2E7D32'}
      />
      <Text
        style={{
          fontSize: 14,
          fontWeight: '400',
          textAlign: 'center',
          color: isDark ? '#A5D6A7' : '#2E7D32',
          lineHeight: 20,
        }}
      >
        {message}
      </Text>
    </View>
  );
}

