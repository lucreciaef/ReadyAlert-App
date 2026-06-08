/**
 * Filled Card / List Item – tappable summary row showing the live alert count.
 */

import { Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { getThemeColors } from '../styles/themeColors';

interface APIResultButtonProps {
  loading: boolean;
  hasAlerts: boolean;
  totalCount: number;
  onPress: () => void;
  isUnavailable?: boolean;
}

export function APIResultButton({
  loading,
  hasAlerts,
  totalCount,
  onPress,
  isUnavailable = false,
}: APIResultButtonProps) {
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);

  const bgColor = isUnavailable
    ? isDark ? 'rgba(245,158,11,0.10)' : '#FFFBEB'
    : hasAlerts
      ? isDark ? 'rgba(239,83,80,0.10)' : '#FFF8F7'
      : isDark ? colors.surfaceContainer : '#F1F3FF';

  const borderColor = isUnavailable
    ? isDark ? 'rgba(245,158,11,0.28)' : '#FDE68A'
    : hasAlerts
      ? isDark ? 'rgba(239,83,80,0.25)' : 'rgba(229,115,115,0.4)'
      : isDark ? colors.border : colors.border;

  const iconName = isUnavailable
    ? 'alert'
    : loading
      ? 'timer-sand'
      : hasAlerts
        ? 'alert-circle'
        : 'check-circle';

  const iconColor = isUnavailable
    ? '#F59E0B'
    : hasAlerts ? '#EF5350' : '#4CAF50';

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: colors.ripple }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 12,
        backgroundColor: bgColor,
        borderWidth: 1,
        borderColor,
        overflow: 'hidden',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <MaterialCommunityIcons name={iconName as any} size={24} color={iconColor} />
        <View>
          <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text }}>
            {isUnavailable ? 'Service Unavailable' : 'All Alerts'}
          </Text>
          <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
            {isUnavailable
              ? 'Warning data could not be loaded'
              : loading
                ? 'Loading…'
                : hasAlerts
                  ? `${totalCount} active alert${totalCount !== 1 ? 's' : ''} across Austria`
                  : 'No active alerts'}
          </Text>
        </View>
      </View>

      {!isUnavailable && !loading && totalCount > 0 && (
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          backgroundColor: '#EF5350',
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 20,
        }}>
          <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>{totalCount}</Text>
          <MaterialCommunityIcons name="chevron-right" size={14} color="#fff" />
        </View>
      )}

      {!isUnavailable && !loading && totalCount === 0 && (
        <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
      )}

      {isUnavailable && (
        <MaterialCommunityIcons name="refresh" size={20} color={colors.textMuted} />
      )}
    </Pressable>
  );
}
