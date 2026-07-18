/**
 * Expandable Weather card for the local (home) dashboard.
 * Collapsed: shows current temperature + today's min/max.
 * Expanded: shows precipitation, precipitation probability and humidity.
 */

import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { WeatherData } from '../api';
import { useTheme } from '../theme/ThemeContext';
import { getThemeColours } from '../styles/themeColours';
import { getWeatherIcon } from '../utils/weatherIcon';

interface Props {
  data: WeatherData | null;
  loading: boolean;
  error: string | null;
}

function formatTemp(value: number | undefined | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return '—';
  return `${Math.round(value)}°`;
}

export function APIWeatherCard({ data, loading, error }: Props) {
  const { isDark } = useTheme();
  const colours = getThemeColours(isDark);
  const [expanded, setExpanded] = useState(false);

  const cardBg = colours.surface;

  return (
    <View
      style={{
        marginTop: 16,
        borderRadius: 12,
        backgroundColor: cardBg,
        padding: 16,
        borderWidth: 1,
        borderColor: colours.textMuted,
      }}
    >
      <Pressable
        onPress={() => setExpanded((v) => !v)}
        android_ripple={{ color: colours.ripple }}
        style={{ borderRadius: 8, overflow: 'hidden' }}
      >
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <MaterialCommunityIcons
              name="weather-partly-cloudy"
              size={20}
              color={colours.primary}
            />
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                letterSpacing: 1.1,
                textTransform: 'uppercase',
                color: colours.textMuted,
              }}
            >
              Weather
            </Text>
          </View>
          <MaterialCommunityIcons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colours.textMuted}
          />
        </View>

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
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 12 }}>
                <MaterialCommunityIcons name={info.icon} size={44} color={colours.textMuted} />
                <Text style={{ fontSize: 36, fontWeight: '700', color: colours.textMuted }}>
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
      </Pressable>

      {expanded && data && (
        <View style={{ marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
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
    </View>
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
        borderWidth: 1,
        borderColor: colours.textMuted,
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
