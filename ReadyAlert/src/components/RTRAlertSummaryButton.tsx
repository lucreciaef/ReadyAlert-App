/**
 * Filled Card / List Item – tappable summary row showing the live alert count.
 */

import { Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { getThemeColours } from '../styles/themeColours';

interface RTRAlertSummaryButtonProps {
  loading: boolean;
  hasAlerts: boolean;
  totalCount: number;
  onPress: () => void;
  isUnavailable?: boolean;
}

export function RTRAlertSummaryButton({
  loading,
  hasAlerts,
  totalCount,
  onPress,
  isUnavailable = false,
}: RTRAlertSummaryButtonProps) {
  const { isDark } = useTheme();
  const colors = getThemeColours(isDark);

  const bgColor = isUnavailable
    ? colors.warningContainer
    : hasAlerts
      ? colors.errorContainer
      : colors.surface;

  const iconName = isUnavailable
    ? 'alert'
    : loading
      ? 'timer-sand'
      : hasAlerts
        ? 'alert-circle'
        : 'check-circle';

  const iconColor = isUnavailable ? colors.warning : hasAlerts ? colors.error : colors.success;

  return (
    // Pressable only owns geometry + ripple clipping; backgroundColor/border live
    // on the inner View so Android's ripple layer doesn't cache the old colour.
    <Pressable
      onPress={onPress}
      android_ripple={{ color: colors.ripple }}
      style={{ borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 14,
          paddingHorizontal: 16,
          borderRadius: 12,
          backgroundColor: bgColor,
          borderWidth: 1,
          borderColor: colors.textMuted,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <MaterialCommunityIcons name={iconName as any} size={24} color={iconColor} />
          <View>
            <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text }}>
              {isUnavailable ? 'Service Unavailable' : 'Austria disaster alerts'}
            </Text>
            <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
              {isUnavailable
                ? 'Warning data could not be loaded'
                : loading
                  ? 'Loading…'
                  : hasAlerts
                    ? `${totalCount} active alert${totalCount !== 1 ? 's' : ''} across Austria`
                    : 'No active alerts in Austria'}
            </Text>
          </View>
        </View>

        {!isUnavailable && !loading && totalCount > 0 && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              backgroundColor: colors.error,
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 20,
            }}
          >
            <Text style={{ color: colors.onPrimary, fontSize: 12, fontWeight: '700' }}>
              {totalCount}
            </Text>
            <MaterialCommunityIcons name="chevron-right" size={14} color={colors.onPrimary} />
          </View>
        )}

        {!isUnavailable && !loading && totalCount === 0 && (
          <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} />
        )}

        {isUnavailable && (
          <MaterialCommunityIcons name="refresh" size={20} color={colors.textMuted} />
        )}
      </View>
    </Pressable>
  );
}
