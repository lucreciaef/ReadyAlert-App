/**
 * Inline error banner with an optional "Try again" retry button.
 * Used wherever an API call fails and the error should be shown inside a list/sheet.
 */

import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { getThemeColors } from '../styles/themeColors';

interface ErrorBannerProps {
  message: string;
  // If provided, renders a "Try again" button below the message
  onRetry?: () => void;
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);

  return (
    <View>
      <View
        className={`flex-row items-start gap-2 p-3 rounded-[10px] mt-1 ${
          isDark ? 'bg-red-600/[0.12]' : 'bg-red-100'
        }`}
      >
        <Ionicons name="warning-outline" size={16} color={isDark ? '#FCA5A5' : '#B91C1C'} />
        <Text
          className={`text-[13px] flex-1 leading-[18px] ${isDark ? 'text-red-300' : 'text-red-700'}`}
        >
          {message}
        </Text>
      </View>

      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          className="self-center mt-3 px-5 py-2 rounded-[10px]"
          style={{ backgroundColor: colors.primary }}
        >
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>Try again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

