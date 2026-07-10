/**
 * Map an Open-Meteo WMO weather interpretation code (0-99) + is_day flag
 * to a MaterialCommunityIcons icon name and a short human-readable label
 *
 * WMO codes reference (Open-Meteo docs):
 * 0        Clear sky
 * 1,2,3    Mainly clear, partly cloudy, overcast
 * 45,48    Fog / depositing rime fog
 * 51,53,55 Drizzle (light / moderate / dense)
 * 56,57    Freezing drizzle (light / dense)
 * 61,63,65 Rain (slight / moderate / heavy)
 * 66,67    Freezing rain (light / heavy)
 * 71,73,75 Snowfall (slight / moderate / heavy)
 * 77       Snow grains
 * 80,81,82 Rain showers (slight / moderate / violent)
 * 85,86    Snow showers (slight / heavy)
 * 95       Thunderstorm (slight or moderate)
 * 96,99    Thunderstorm with hail (slight / heavy)
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';

export type MdiName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export interface WeatherIconInfo {
  icon: MdiName;
  label: string;
}

export function getWeatherIcon(code: number | null | undefined, isDay: boolean = true): WeatherIconInfo {
  if (code === null || code === undefined || Number.isNaN(code)) {
    return { icon: 'weather-cloudy', label: 'Unknown' };
  }

  // Clear
  if (code === 0) {
    return isDay ? { icon: 'weather-sunny', label: 'Clear' } : { icon: 'weather-night', label: 'Clear' };
  }
  // Mainly clear
  if (code === 1) {
    return isDay
      ? { icon: 'weather-sunny', label: 'Mainly clear' }
      : { icon: 'weather-night', label: 'Mainly clear' };
  }
  // Partly cloudy
  if (code === 2) {
    return isDay
      ? { icon: 'weather-partly-cloudy', label: 'Partly cloudy' }
      : { icon: 'weather-night-partly-cloudy', label: 'Partly cloudy' };
  }
  // Overcast
  if (code === 3) return { icon: 'weather-cloudy', label: 'Overcast' };

  // Fog
  if (code === 45 || code === 48) return { icon: 'weather-fog', label: 'Fog' };

  // Drizzle
  if (code === 51 || code === 53 || code === 55) {
    return { icon: 'weather-partly-rainy', label: 'Drizzle' };
  }
  // Freezing drizzle
  if (code === 56 || code === 57) return { icon: 'weather-snowy-rainy', label: 'Freezing drizzle' };

  // Rain
  if (code === 61 || code === 63) return { icon: 'weather-rainy', label: 'Rain' };
  if (code === 65) return { icon: 'weather-pouring', label: 'Heavy rain' };
  if (code === 66 || code === 67) return { icon: 'weather-snowy-rainy', label: 'Freezing rain' };

  // Snow
  if (code === 71 || code === 73) return { icon: 'weather-snowy', label: 'Snow' };
  if (code === 75) return { icon: 'weather-snowy-heavy', label: 'Heavy snow' };
  if (code === 77) return { icon: 'weather-snowy', label: 'Snow grains' };

  // Rain showers
  if (code === 80 || code === 81) return { icon: 'weather-partly-rainy', label: 'Rain showers' };
  if (code === 82) return { icon: 'weather-pouring', label: 'Violent rain showers' };

  // Snow showers
  if (code === 85 || code === 86) return { icon: 'weather-snowy', label: 'Snow showers' };

  // Thunderstorm
  if (code === 95) return { icon: 'weather-lightning-rainy', label: 'Thunderstorm' };
  if (code === 96 || code === 99) return { icon: 'weather-hail', label: 'Thunderstorm with hail' };

  return { icon: 'weather-cloudy', label: 'Unknown' };
}
