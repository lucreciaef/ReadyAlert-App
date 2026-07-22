/**
 * Expandable Weather Alerts card.
 * Collapsed: shows the count of active alerts
 * Expanded: shows individual SingleWeatherWarningCard items
 */

import { useState } from 'react';
import { Text, View } from 'react-native';
import { Warning } from '../api';
import { useTheme } from '../theme/ThemeContext';
import { getThemeColours } from '../styles/themeColours';
import { SingleWeatherWarningCard } from './SingleWeatherWarningCard';
import { ExpandableInfoCard } from './ExpandableInfoCard';
import { EmptyState } from './EmptyState';

interface Props {
  warnings: Warning[];
}

export function APIWeatherAlertsCard({ warnings }: Props) {
  const { isDark } = useTheme();
  const colors = getThemeColours(isDark);
  const [expanded, setExpanded] = useState(false);

  const count = warnings.length;

  return (
    <ExpandableInfoCard
      icon="weather-lightning-rainy"
      title="Weather Alerts"
      expanded={expanded}
      onToggle={() => setExpanded((v) => !v)}
      colours={colors}
      summary={
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
          <Text style={{ fontSize: 26, fontWeight: '700', color: count > 0 ? colors.warning : colors.success }}>
            {count}
          </Text>
          <Text style={{ fontSize: 14, color: colors.textMuted }}>
            {count === 1 ? 'active alert' : 'active alerts'}
          </Text>
        </View>
      }
    >
      {count === 0 ? (
        <EmptyState message="No active warnings in this area" />
      ) : (
        <View style={{ marginTop: 4 }}>
          {warnings.map((warning, index) => (
            <SingleWeatherWarningCard
              key={`${warning.properties.warnid}-${index}`}
              warning={warning}
            />
          ))}
        </View>
      )}
    </ExpandableInfoCard>
  );
}
