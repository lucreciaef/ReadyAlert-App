import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type ToastType = 'error' | 'warning' | 'success' | 'info';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  /** Auto-dismiss duration in ms. Default 4000. Pass 0 to disable. */
  duration?: number;
  onHide?: () => void;
}

const CONFIG: Record<ToastType, { bg: string; icon: string; iconColor: string; textColor: string }> = {
  error:   { bg: '#3B0A0A', icon: 'alert-circle',      iconColor: '#F87171', textColor: '#FECACA' },
  warning: { bg: '#3B2800', icon: 'warning',            iconColor: '#FBBF24', textColor: '#FDE68A' },
  success: { bg: '#052E1A', icon: 'checkmark-circle',   iconColor: '#34D399', textColor: '#A7F3D0' },
  info:    { bg: '#0C1F3F', icon: 'information-circle', iconColor: '#60A5FA', textColor: '#BFDBFE' },
};

export function Toast({ visible, message, type = 'error', duration = 4000, onHide }: ToastProps) {
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;
  const cfg = CONFIG[type];

  useEffect(() => {
    if (visible) {
      // Slide in
      Animated.parallel([
        Animated.spring(opacity,     { toValue: 1, useNativeDriver: true, damping: 20 }),
        Animated.spring(translateY,  { toValue: 0, useNativeDriver: true, damping: 20 }),
      ]).start();

      // Auto-dismiss
      if (duration > 0 && onHide) {
        const timer = setTimeout(() => {
          dismiss();
        }, duration);
        return () => clearTimeout(timer);
      }
    } else {
      opacity.setValue(0);
      translateY.setValue(-20);
    }
  }, [visible]);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 0, duration: 250, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -20, duration: 250, useNativeDriver: true }),
    ]).start(() => onHide?.());
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { top: insets.top + 8, backgroundColor: cfg.bg, opacity, transform: [{ translateY }] },
      ]}
    >
      <Ionicons name={cfg.icon as any} size={20} color={cfg.iconColor} style={styles.icon} />
      <Text style={[styles.message, { color: cfg.textColor }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 12,
    zIndex: 999,
  },
  icon: {
    marginRight: 10,
    marginTop: 1,
  },
  message: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },
});


