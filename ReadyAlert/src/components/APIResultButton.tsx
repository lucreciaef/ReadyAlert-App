/**
 * Tappable summary row that shows a live alert count and navigates into the full alert list.
 * Used in the National Status bottom sheet main view.
 */

import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { getThemeColors } from '../styles/themeColors';

interface APIResultButtonProps {
  loading: boolean;
  hasAlerts: boolean;
  totalCount: number;
  onPress: () => void;
}

export function APIResultButton({ loading, hasAlerts, totalCount, onPress }: APIResultButtonProps) {
  const { isDark } = useTheme();
  const colors = getThemeColors(isDark);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 13,
        paddingHorizontal: 14,
        borderRadius: 12,
        marginBottom: 14,
        backgroundColor: isDark
          ? hasAlerts ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.05)'
          : hasAlerts ? '#FEF2F2' : '#F3F4F6',
        borderWidth: 1,
        borderColor: isDark
          ? hasAlerts ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.08)'
          : hasAlerts ? '#FECACA' : '#E5E7EB',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Ionicons
          name={loading ? 'hourglass-outline' : hasAlerts ? 'alert-circle' : 'checkmark-circle'}
          size={22}
          color={hasAlerts ? '#EF4444' : '#22C55E'}
        />
        <View>
          <Text style={{ fontSize: 14, fontWeight: '700', color: isDark ? '#f5f5f5' : '#111' }}>
            All Alerts
          </Text>
          <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 1 }}>
            {loading
              ? 'Loading…'
              : hasAlerts
                ? `${totalCount} active alert${totalCount !== 1 ? 's' : ''} across Austria`
                : 'No active alerts'}
          </Text>
        </View>
      </View>

      {!loading && totalCount > 0 && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            backgroundColor: '#EF4444',
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>{totalCount}</Text>
          <Ionicons name="chevron-forward" size={12} color="#fff" />
        </View>
      )}

      {!loading && totalCount === 0 && (
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      )}
    </TouchableOpacity>
  );
}

