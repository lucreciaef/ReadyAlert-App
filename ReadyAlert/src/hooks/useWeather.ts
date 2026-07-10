/**
 * Custom hooks for fetching Open-Meteo weather data.
 * Polls every 30 seconds when coordinates are available.
 */

import { useEffect, useState } from 'react';
import { fetchWeather, fetchWeatherBatch, WeatherData } from '../api';
import { Coordinates } from './useLocation';

export interface WeatherState {
  data: WeatherData | null;
  loading: boolean;
  error: string | null;
}

export interface WeatherBatchState {
  data: WeatherData[] | null;
  loading: boolean;
  error: string | null;
}

const POLL_INTERVAL_MS = 30000;

export function useWeather(coords: Coordinates | null): WeatherState {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async (latitude: number, longitude: number) => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchWeather(latitude, longitude);
      setData(result);
      console.log('Weather data received:', result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch weather data';
      console.error('Weather fetch error:', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!coords) return;
    load(coords.latitude, coords.longitude);
  }, [coords?.latitude, coords?.longitude]);

  useEffect(() => {
    if (!coords) return;
    const interval = setInterval(() => {
      load(coords.latitude, coords.longitude);
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [coords?.latitude, coords?.longitude]);

  return { data, loading, error };
}

export function useWeatherBatch(locations: Coordinates[] | null): WeatherBatchState {
  const [data, setData] = useState<WeatherData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stable key so effect only refires when the coordinate set actually changes.
  const key = locations ? locations.map((l) => `${l.latitude},${l.longitude}`).join('|') : '';

  const load = async (locs: Coordinates[]) => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchWeatherBatch(locs);
      setData(result);
      console.log('Weather batch data received:', result.length, 'locations');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch weather data';
      console.error('Weather batch fetch error:', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!locations || locations.length === 0) return;
    load(locations);
  }, [key]);

  useEffect(() => {
    if (!locations || locations.length === 0) return;
    const interval = setInterval(() => {
      load(locations);
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [key]);

  return { data, loading, error };
}
