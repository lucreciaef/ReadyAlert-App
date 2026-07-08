/**
 * Expandable Air Quality Index card.
 * Collapsed: shows only the European AQI score
 * Expanded: shows all pollutant chips coloured by EU EEA thresholds
 */

import { useState } from 'react';
import { Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AirQualityData } from '../api';
import { useTheme } from '../theme/ThemeContext';
import { getThemeColours } from '../styles/themeColours';
import { ExpandableInfoCard } from './ExpandableInfoCard';

// EU EEA threshold bands (µg/m^3, hourly values from EEA 2024 revision)
// Levels: 0 = good/fair (default), 1 = moderate/poor (yellow), 2 = very poor+ (red)
type ThresholdLevel = 0 | 1 | 2;

interface Thresholds {
  yellow: number; // >= yellow -> level 1
  red: number;    // >= red -> level 2
}

const THRESHOLDS: Record<string, Thresholds> = {
  pm2_5:            { yellow: 16,   red: 51  },  // moderate >=16, poor >=51
  pm10:             { yellow: 46,   red: 121 },  // moderate >=46, poor >=121
  ozone:            { yellow: 101,  red: 161 },  // moderate >=101, very poor >=161
  nitrogen_dioxide: { yellow: 26,   red: 101 },  // moderate >=26, very poor >=101
  sulphur_dioxide:  { yellow: 41,   red: 191 },  // moderate >=41, very poor >=191
  carbon_monoxide:  { yellow: 4400, red: 9400 }, // CO: EU limit is 10 mg/m^3 = 10 000 µg/m^3; use proportional bands
  dust:             { yellow: 46,   red: 121 }, // Dust: no official EEA band. Use PM10-equivalent thresholds as proxy
  ammonia:          { yellow: 40,   red: 100 },  // Ammonia: no EEA AQI band. WHO reference ~100 µg/m^3 short-term
};

function getLevel(key: string, value: number): ThresholdLevel {
  const t = THRESHOLDS[key];
  if (!t) return 0;
  if (value >= t.red) return 2;
  if (value >= t.yellow) return 1;
  return 0;
}

// Level colours are resolved at render time from the theme
function getAqiColour(aqi: number, c: ReturnType<typeof import('../styles/themeColours').getThemeColours>): string {
  if (aqi <= 40) return c.success;   // Good + Fair
  if (aqi <= 60) return c.warning;   // Moderate
  if (aqi <= 100) return c.error;    // Poor + Very Poor
  return c.critical;                 // Extreme (worst tier)
}

function getAqiLabel(aqi: number): string {
  if (aqi <= 20) return 'Good';
  if (aqi <= 40) return 'Fair';
  if (aqi <= 60) return 'Moderate';
  if (aqi <= 80) return 'Poor';
  if (aqi <= 100) return 'Very Poor';
  return 'Extremely Poor';
}

interface Props {
  data: AirQualityData | null;
  loading: boolean;
  error: string | null;
}

export function APIAirQualityCard({ data, loading, error }: Props) {
  const { isDark } = useTheme();
  const colours = getThemeColours(isDark);
  const [expanded, setExpanded] = useState(false);

  const chipBgDefault = isDark ? colours.surfaceAlt : colours.surface;
  const LEVEL_COLOURS: Record<ThresholdLevel, string | null> = {
    0: null,
    1: colours.warning,
    2: colours.error,
  };

  const pollutants: { key: keyof AirQualityData; label: string; unit: string }[] = [
    { key: 'pm10',             label: 'PM10',  unit: 'µg/m³' },
    { key: 'pm2_5',            label: 'PM2.5', unit: 'µg/m³' },
    { key: 'carbon_monoxide',  label: 'CO',    unit: 'µg/m³' },
    { key: 'nitrogen_dioxide', label: 'NO₂',   unit: 'µg/m³' },
    { key: 'sulphur_dioxide',  label: 'SO₂',   unit: 'µg/m³' },
    { key: 'ozone',            label: 'O₃',    unit: 'µg/m³' },
    { key: 'dust',             label: 'Dust',  unit: 'µg/m³' },
    { key: 'ammonia',          label: 'NH₃',   unit: 'µg/m³' },
  ];

  return (
    <ExpandableInfoCard
      icon="air-filter"
      title="Air Quality Index"
      expanded={expanded}
      onToggle={() => setExpanded((v) => !v)}
      colours={colours}
      summary={
        <>
          {loading && !data && (
            <Text style={{ color: colours.textMuted, fontSize: 14, marginTop: 10 }}>
              Loading air quality data…
            </Text>
          )}
          {error && !data && (
            <Text style={{ color: colours.warning, fontSize: 14, marginTop: 10 }}>{error}</Text>
          )}
          {data && (
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 10 }}>
              <Text style={{ fontSize: 36, fontWeight: '700', color: getAqiColour(data.european_aqi, colours) }}>
                {Math.round(data.european_aqi)}
              </Text>
              <Text style={{ fontSize: 14, color: colours.textMuted }}>
                AQI · {getAqiLabel(data.european_aqi)}
              </Text>
            </View>
          )}
        </>
      }
    >
      {data && (
        <View style={{ marginTop: 12, gap: 8 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {pollutants.map(({ key, label, unit }) => {
              const value = data[key] as number;
              const level = getLevel(key as string, value);
              const levelColour = LEVEL_COLOURS[level];
              const chipBg = levelColour
                ? isDark
                  ? `${levelColour}33`   // 20% opacity tint in dark mode
                  : `${levelColour}22`   // 13% opacity tint in light mode
                : chipBgDefault;
              const valueColour = levelColour ?? colours.text;

              return (
                <View
                  key={label}
                  style={{
                    backgroundColor: chipBg,
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    minWidth: 80,
                    borderWidth: 1,
                    borderColor: colours.textMuted,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                    <Text style={{ fontSize: 11, color: colours.textMuted }}>{label}</Text>
                    {level > 0 && (
                      <MaterialCommunityIcons
                        name={level === 2 ? 'alert-circle' : 'alert'}
                        size={11}
                        color={levelColour!}
                      />
                    )}
                  </View>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: valueColour }}>
                    {value.toFixed(1)}{' '}
                    <Text style={{ fontSize: 10, color: colours.textMuted }}>{unit}</Text>
                  </Text>
                </View>
              );
            })}
          </View>
          <Text style={{ fontSize: 10, color: colours.textMuted, fontStyle: 'italic' }}>
            Thresholds based on EU EEA Air Quality Index bands
          </Text>
        </View>
      )}
    </ExpandableInfoCard>
  );
}
