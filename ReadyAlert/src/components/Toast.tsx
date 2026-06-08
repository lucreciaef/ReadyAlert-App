/**
 * Snackbar – appears at the BOTTOM of the screen, with Material 3 styling
 * Slides up from below with a spring animation and auto-dismisses
 */

import { useEffect, useRef } from 'react';
import { Animated, Pressable, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type ToastType = 'error' | 'warning' | 'success' | 'info';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  // Auto-dismiss duration in ms. Default 4000. Pass 0 to disable
  duration?: number;
  onHide?: () => void;
}

const CONFIG: Record<
  ToastType,
  { icon: string; iconColor: string }
> = {
  error: { icon: 'alert-circle', iconColor: '#FFB4AB' },
  warning: { icon: 'alert', iconColor: '#FBBF24' },
  success: { icon: 'check-circle', iconColor: '#34D399' },
  info: { icon: 'information', iconColor: '#90CAF9' },
};

export function Toast({ visible, message, type = 'info', duration = 4000, onHide }: ToastProps) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(80)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const cfg = CONFIG[type];

  useEffect(() => {
    if (visible) {
      // Slide up from bottom
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 22, stiffness: 300 }),
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

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: 80, duration: 200, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => onHide?.());
  };

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
        // Snackbar: Inverse Surface (#2E3037 light / #E4E2E9 dark)
        backgroundColor: '#2E3037',
        borderRadius: 4,
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 12,
        opacity,
        transform: [{ translateY }],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 6,
        zIndex: 999,
      }}
    >
      <MaterialCommunityIcons name={cfg.icon as any} size={20} color={cfg.iconColor} />

      <Text
        style={{
          flex: 1,
          fontSize: 14,
          lineHeight: 20,
          color: '#E4E2E9',
          fontWeight: '400',
        }}
      >
        {message}
      </Text>
      {onHide && (
        <Pressable
          onPress={dismiss}
          android_ripple={{ color: 'rgba(255,255,255,0.16)', borderless: true }}
        >
          <MaterialCommunityIcons name="close" size={18} color="#90CAF9" />
        </Pressable>
      )}
    </Animated.View>
  );
}
