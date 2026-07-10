/**
 * National weather widget: min/max temperature per Austrian capital city.
 * Data is fetched by the parent page so the map markers can share it.
 */

import { Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { getThemeColours } from '../styles/themeColours';
import { getNationalStatusPageStyles } from '../styles/appStyles';
import { WeatherData } from '../api';
import { AUSTRIAN_CAPITALS } from '../utils/austrianCapitals';
import { getWeatherIcon } from '../utils/weatherIcon';

interface Props {
  data: WeatherData[] | null;
  loading: boolean;
  error: string | null;
}

function formatTemp(value: number | undefined | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return '—';
  return `${Math.round(value)}°`;
}

export function StateWeatherOverview({ data, loading, error }: Props) {
  const { isDark } = useTheme();
  const colors = getThemeColours(isDark);
  const styles = getNationalStatusPageStyles(isDark);

  return (
    <View className={styles.weatherContainer}>
      <View className={styles.weatherHeaderRow}>
        <MaterialCommunityIcons name="weather-partly-cloudy" size={18} color={colors.primary} />
        <Text className={styles.weatherHeaderText}>Weather in Austria</Text>
      </View>

      {loading && !data && (
        <Text style={{ color: colors.textMuted, fontSize: 13, paddingVertical: 4 }}>
          Loading weather…
        </Text>
      )}
      {error && !data && (
        <Text style={{ color: colors.warning, fontSize: 13, paddingVertical: 4 }}>{error}</Text>
      )}

      {AUSTRIAN_CAPITALS.map((city, idx) => {
        const cityData = data ? data[idx] : null;
        const iconInfo = cityData
          ? getWeatherIcon(cityData.daily.weatherCode, cityData.current.isDay)
          : null;
        return (
          <View key={city.state} className={styles.weatherStateRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 }}>
              {iconInfo && (
                <MaterialCommunityIcons name={iconInfo.icon} size={22} color={colors.text} />
              )}
              <View style={{ flex: 1 }}>
                <Text className={styles.weatherStateText}>{city.state}</Text>
                <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 1 }}>
                  {city.capital}
                  {iconInfo ? ` · ${iconInfo.label}` : ''}
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                <MaterialCommunityIcons name="arrow-up" size={12} color={colors.error} />
                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text, minWidth: 32, textAlign: 'right' }}>
                  {formatTemp(cityData?.daily.temperatureMax)}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                <MaterialCommunityIcons name="arrow-down" size={12} color={colors.info} />
                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text, minWidth: 32, textAlign: 'right' }}>
                  {formatTemp(cityData?.daily.temperatureMin)}
                </Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}
