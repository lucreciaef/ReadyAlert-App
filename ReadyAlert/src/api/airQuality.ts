/**
 * Service layer for the Open-Meteo Air Quality API.
 * Fetches current AQI and pollutant data for given coordinates.
 */

import { fetchWeatherApi } from 'openmeteo';

export interface AirQualityData {
  time: Date;
  european_aqi: number;
  pm10: number;
  pm2_5: number;
  carbon_monoxide: number;
  nitrogen_dioxide: number;
  sulphur_dioxide: number;
  ozone: number;
  dust: number;
  ammonia: number;
}

const AIR_QUALITY_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';

/**
 * Fetch current air quality data for a specific location.
 * @param latitude - Latitude of the location
 * @param longitude - Longitude of the location
 * @returns Promise with AirQualityData
 */
export async function fetchAirQuality(
  latitude: number,
  longitude: number,
): Promise<AirQualityData> {
  const params = {
    latitude,
    longitude,
    current: [
      'european_aqi',
      'pm10',
      'pm2_5',
      'carbon_monoxide',
      'nitrogen_dioxide',
      'sulphur_dioxide',
      'ozone',
      'dust',
      'ammonia',
    ],
    forecast_days: 1,
  };

  const responses = await fetchWeatherApi(AIR_QUALITY_URL, params);
  const response = responses[0];

  const utcOffsetSeconds = response.utcOffsetSeconds();
  const current = response.current()!;

  return {
    time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
    european_aqi: current.variables(0)!.value(),
    pm10: current.variables(1)!.value(),
    pm2_5: current.variables(2)!.value(),
    carbon_monoxide: current.variables(3)!.value(),
    nitrogen_dioxide: current.variables(4)!.value(),
    sulphur_dioxide: current.variables(5)!.value(),
    ozone: current.variables(6)!.value(),
    dust: current.variables(7)!.value(),
    ammonia: current.variables(8)!.value(),
  };
}
