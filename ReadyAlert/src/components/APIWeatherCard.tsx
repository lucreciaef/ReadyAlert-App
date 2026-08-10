/**
 * Expandable Weather card for the local (home) dashboard.
 * Collapsed: shows current temperature + today's min/max.
 * Expanded: shows precipitation, precipitation probability and humidity.
 */

import { useState } from 'react';
import { Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { WeatherData } from '../api';
import { useTheme } from '../theme/ThemeContext';
import { getThemeColours } from '../styles/themeColours';
import { getWeatherIcon } from '../utils/weatherIcon';
import { ExpandableInfoCard } from './ExpandableInfoCard';

interface Props {
  data: WeatherData | null;
  loading: boolean;
  error: string | null;
  isFirst?: boolean;
}

function formatTemp(value: number | undefined | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return '—';
  return `${Math.round(value)}°`;
}

export function APIWeatherCard({ data, loading, error, isFirst }: Props) {
  const { isDark } = useTheme();
  const colours = getThemeColours(isDark);
  const [expanded, setExpanded] = useState(false);

  return (
    <ExpandableInfoCard
      icon="weather-partly-cloudy"
      title="Weather"
      expanded={expanded}
      onToggle={() => setExpanded((v) => !v)}
      colours={colours}
      isFirst={isFirst}
      summary={
        <>
          {loading && !data && (
            <Text style={{ color: colours.textMuted, fontSize: 14, marginTop: 10 }}>
              Loading weather data…
            </Text>
          )}
          {error && !data && (
            <Text style={{ color: colours.warning, fontSize: 14, marginTop: 10 }}>{error}</Text>
          )}
          {data &&
            (() => {
              const info = getWeatherIcon(data.daily.weatherCode, data.current.isDay);
              return (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 }}>
                  <MaterialCommunityIcons name={info.icon} size={28} color={colours.textMuted} />
                  <Text style={{ fontSize: 22, fontWeight: '500', color: colours.text }}>
                    {formatTemp(data.current.temperature)}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, color: colours.textMuted, marginBottom: 2 }}>
                      {info.label}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <MaterialCommunityIcons name="arrow-up" size={12} color={colours.error} />
                      <Text style={{ fontSize: 13, color: colours.textMuted }}>
                        {formatTemp(data.daily.temperatureMax)}
                      </Text>
                      <MaterialCommunityIcons
                        name="arrow-down"
                        size={12}
                        color={colours.info}
                        style={{ marginLeft: 6 }}
                      />
                      <Text style={{ fontSize: 13, color: colours.textMuted }}>
                        {formatTemp(data.daily.temperatureMin)}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })()}
        </>
      }
    >
      {data && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <WeatherChip
            icon="water-percent"
            label="Humidity"
            value={
              Number.isNaN(data.current.humidity) ? '—' : `${Math.round(data.current.humidity)}%`
            }
            colours={colours}
            isDark={isDark}
          />
          <WeatherChip
            icon="weather-pouring"
            label="Precipitation"
            value={
              Number.isNaN(data.current.precipitation)
                ? '—'
                : `${data.current.precipitation.toFixed(1)} mm`
            }
            colours={colours}
            isDark={isDark}
          />
          <WeatherChip
            icon="weather-rainy"
            label="Rain chance"
            value={
              data.daily.precipitationProbabilityMax === null
                ? '—'
                : `${Math.round(data.daily.precipitationProbabilityMax)}%`
            }
            colours={colours}
            isDark={isDark}
          />
        </View>
      )}
    </ExpandableInfoCard>
  );
}

interface ChipProps {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
  value: string;
  colours: ReturnType<typeof getThemeColours>;
  isDark: boolean;
}

function WeatherChip({ icon, label, value, colours }: ChipProps) {
  return (
    <View
      style={{
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        minWidth: 100,
        backgroundColor: colours.surface,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 }}>
        <MaterialCommunityIcons name={icon} size={11} color={colours.textMuted} />
        <Text style={{ fontSize: 11, color: colours.textMuted }}>{label}</Text>
      </View>
      <Text style={{ fontSize: 13, fontWeight: '600', color: colours.text }}>{value}</Text>
    </View>
  );
}
