/**
 * Expandable Weather Alerts card.
 * Collapsed: shows the count of active alerts
 * Expanded: shows individual SingleWeatherWarningCard items
 */

import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Warning } from '../api';
import { useTheme } from '../theme/ThemeContext';
import { getThemeColours } from '../styles/themeColours';
import { SingleWeatherWarningCard } from './SingleWeatherWarningCard';
import { LoadingState } from './LoadingState';
import { EmptyState } from './EmptyState';

interface Props {
  warnings: Warning[];
  loading?: boolean;
}

export function WeatherAlertsCard({ warnings, loading = false }: Props) {
  const { isDark } = useTheme();
  const colors = getThemeColours(isDark);
  const [expanded, setExpanded] = useState(false);

  const cardBg = colors.surface;
  const count = warnings.length;

  return (
    <View
      style={{
        marginTop: 16,
        borderRadius: 12,
        backgroundColor: cardBg,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.textMuted,
      }}
    >
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        android_ripple={{ color: colors.ripple }}
        style={{ borderRadius: 8, overflow: 'hidden' }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <MaterialCommunityIcons name="weather-lightning-rainy" size={20} color={colors.primary} />
            <Text style={{ fontSize: 13, fontWeight: '600', letterSpacing: 1.1, textTransform: 'uppercase', color: colors.textMuted }}>
              Weather Alerts
            </Text>
          </View>
          <MaterialCommunityIcons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.textMuted}
          />
        </View>

        {!loading && (
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 10 }}>
            <Text style={{ fontSize: 36, fontWeight: '700', color: count > 0 ? colors.warning : colors.success }}>
              {count}
            </Text>
            <Text style={{ fontSize: 14, color: colors.textMuted }}>
              {count === 1 ? 'active alert' : 'active alerts'}
            </Text>
          </View>
        )}
      </Pressable>

      {expanded && loading && <LoadingState message="Loading warnings…" />}

      {expanded && !loading && count === 0 && <EmptyState message="No active warnings in this area" />}

      {expanded && !loading && (
        <View style={{ marginTop: 4 }}>
          {warnings.map((warning, index) => (
            <SingleWeatherWarningCard
              key={`${warning.properties.warnid}-${index}`}
              warning={warning}
            />
          ))}
        </View>
      )}
    </View>
  );
}
