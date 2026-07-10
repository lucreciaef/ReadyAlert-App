/**
 * Service layer for the Open-Meteo Weather Forecast API.
 * Fetches current temperature, humidity, precipitation and daily min/max temperature for one or more coordinates.
 */

import { fetchWeatherApi } from 'openmeteo';

export interface WeatherData {
  latitude: number;
  longitude: number;
  time: Date;
  current: {
    temperature: number;
    humidity: number;
    precipitation: number;
    isDay: boolean;
  };
  daily: {
    temperatureMax: number;
    temperatureMin: number;
    precipitationProbabilityMax: number | null;
    weatherCode: number | null;
  };
}

const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

const CURRENT_VARS = ['temperature_2m', 'relative_humidity_2m', 'precipitation', 'is_day'];
const DAILY_VARS = [
  'temperature_2m_max',
  'temperature_2m_min',
  'precipitation_probability_max',
  'weather_code',
];

function parseResponse(response: any): WeatherData {
  const utcOffsetSeconds = response.utcOffsetSeconds();
  const current = response.current()!;
  const daily = response.daily()!;

  const dailyMax = daily.variables(0)!.valuesArray();
  const dailyMin = daily.variables(1)!.valuesArray();
  const dailyPrecipProb = daily.variables(2)!.valuesArray();
  const dailyWeatherCode = daily.variables(3)!.valuesArray();

  return {
    latitude: response.latitude(),
    longitude: response.longitude(),
    time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
    current: {
      temperature: current.variables(0)!.value(),
      humidity: current.variables(1)!.value(),
      precipitation: current.variables(2)!.value(),
      isDay: current.variables(3)!.value() === 1,
    },
    daily: {
      temperatureMax: dailyMax ? dailyMax[0] : NaN,
      temperatureMin: dailyMin ? dailyMin[0] : NaN,
      precipitationProbabilityMax:
        dailyPrecipProb && !Number.isNaN(dailyPrecipProb[0]) ? dailyPrecipProb[0] : null,
      weatherCode:
        dailyWeatherCode && !Number.isNaN(dailyWeatherCode[0]) ? dailyWeatherCode[0] : null,
    },
  };
}

/**
 * Fetch current + daily weather data for a single location.
 */
export async function fetchWeather(latitude: number, longitude: number): Promise<WeatherData> {
  const responses = await fetchWeatherApi(WEATHER_URL, {
    latitude,
    longitude,
    current: CURRENT_VARS,
    daily: DAILY_VARS,
    timezone: 'auto',
    forecast_days: 1,
  });
  return parseResponse(responses[0]);
}

/**
 * Fetch weather for multiple locations in a single API call.
 * Open-Meteo returns one response per coordinate in the same order.
 */
export async function fetchWeatherBatch(
  locations: { latitude: number; longitude: number }[],
): Promise<WeatherData[]> {
  if (!locations.length) return [];
  const responses = await fetchWeatherApi(WEATHER_URL, {
    latitude: locations.map((l) => l.latitude),
    longitude: locations.map((l) => l.longitude),
    current: CURRENT_VARS,
    daily: DAILY_VARS,
    timezone: 'auto',
    forecast_days: 1,
  });
  return responses.map(parseResponse);
}
