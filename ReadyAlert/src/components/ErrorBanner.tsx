/**
 * Inline error banner with an optional "Try again" Text Button.
 */

import { Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { getThemeColours } from '../styles/themeColours';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  const { isDark } = useTheme();
  const colors = getThemeColours(isDark);

  return (
    <View style={{ marginTop: 8 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 10,
          padding: 14,
          borderRadius: 12,
          backgroundColor: colors.errorContainer,
        }}
      >
        <MaterialCommunityIcons name="alert-outline" size={18} color={colors.errorOnContainer} />
        <Text
          style={{
            flex: 1,
            fontSize: 14,
            lineHeight: 20,
            color: colors.errorOnContainer,
          }}
        >
          {message}
        </Text>
      </View>

      {onRetry && (
        <Pressable
          onPress={onRetry}
          android_ripple={{ color: colors.ripple, borderless: false }}
          style={{
            alignSelf: 'center',
            marginTop: 12,
            borderRadius: 20,
            overflow: 'hidden',
          }}
        >
          <View style={{ paddingHorizontal: 20, paddingVertical: 10 }}>
            <Text
              style={{
                color: colors.primary,
                fontWeight: '500',
                fontSize: 14,
                letterSpacing: 0.1,
              }}
            >
              Try again
            </Text>
          </View>
        </Pressable>
      )}
    </View>
  );
}
