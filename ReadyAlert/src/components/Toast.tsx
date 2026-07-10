/**
 * Snackbar – appears at the BOTTOM of the screen, with Material 3 styling
 * Slides up from below with a spring animation and auto-dismisses
 */

import { useEffect, useRef } from 'react';
import { Animated, Pressable, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { getThemeColours } from '../styles/themeColours';

export type ToastType = 'error' | 'warning' | 'success' | 'info';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  // Auto-dismiss duration in ms. Default 4000. Pass 0 to disable
  duration?: number;
  onHide?: () => void;
}

const CONFIG: Record<ToastType, { icon: string }> = {
  error: { icon: 'alert-circle' },
  warning: { icon: 'alert' },
  success: { icon: 'check-circle' },
  info: { icon: 'information' },
};

export function Toast({ visible, message, type = 'info', duration = 4000, onHide }: ToastProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const colors = getThemeColours(isDark);
  const translateY = useRef(new Animated.Value(80)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const cfg = CONFIG[type];
  const iconColor =
    type === 'error'
      ? colors.error
      : type === 'warning'
        ? colors.warning
        : type === 'success'
          ? colors.success
          : colors.primary;

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: 80, duration: 200, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => onHide?.());
  };

  useEffect(() => {
    if (visible) {
      // Slide up from bottom
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 22,
          stiffness: 300,
        }),
        Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();

      if (duration > 0 && onHide) {
        const timer = setTimeout(dismiss, duration);
        return () => clearTimeout(timer);
      }
    } else {
      translateY.setValue(80);
      opacity.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: 16,
        right: 16,
        bottom: insets.bottom + 8, // Sits just above the navigation bar (bottom safe area + 8dp gap)
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.inverseSurface,
        borderRadius: 4,
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 12,
        opacity,
        transform: [{ translateY }],
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 6,
        zIndex: 999,
      }}
    >
      <MaterialCommunityIcons name={cfg.icon as any} size={20} color={iconColor} />

      <Text
        style={{
          flex: 1,
          fontSize: 14,
          lineHeight: 20,
          color: colors.inverseOnSurface,
          fontWeight: '400',
        }}
      >
        {message}
      </Text>
      {onHide && (
        <Pressable
          onPress={dismiss}
          android_ripple={{ color: colors.rippleOnPrimary, borderless: true }}
        >
          <MaterialCommunityIcons name="close" size={18} color={colors.primary} />
        </Pressable>
      )}
    </Animated.View>
  );
}
