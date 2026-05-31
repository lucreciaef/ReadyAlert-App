/**
 * Green "all good" card shown when an API call returns with no results.
 * Used inside bottom sheets after a successful but empty fetch
 */

import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  const { isDark } = useTheme();

  return (
    <View
      className={`items-center p-6 rounded-[14px] mt-1 gap-2.5 ${
        isDark ? 'bg-green-500/[0.12]' : 'bg-green-100'
      }`}
    >
      <Ionicons name="checkmark-circle" size={28} color={isDark ? '#86EFAC' : '#16A34A'} />
      <Text
        className={`text-sm font-medium text-center ${isDark ? 'text-green-300' : 'text-green-700'}`}
      >
        {message}
      </Text>
    </View>
  );
}

