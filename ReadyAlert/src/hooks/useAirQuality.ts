/**
 * Custom hook for fetching Air Quality Index data from Open-Meteo.
 * Polls every 30 seconds when coordinates are available.
 */

import { useEffect, useState } from 'react';
import { fetchAirQuality, AirQualityData } from '../api';
import { Coordinates } from './useLocation';

export interface AirQualityState {
  data: AirQualityData | null;
  loading: boolean;
  error: string | null;
}

const POLL_INTERVAL_MS = 30000;

export function useAirQuality(coords: Coordinates | null): AirQualityState {
  const [data, setData] = useState<AirQualityData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async (latitude: number, longitude: number) => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchAirQuality(latitude, longitude);
      setData(result);
      console.log('Air quality data received:', result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch air quality data';
      console.error('Air quality fetch error:', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch when coords become available
  useEffect(() => {
    if (!coords) return;
    load(coords.latitude, coords.longitude);
  }, [coords?.latitude, coords?.longitude]);

  // Poll every 30 seconds
  useEffect(() => {
    if (!coords) return;
    const interval = setInterval(() => {
      load(coords.latitude, coords.longitude);
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [coords?.latitude, coords?.longitude]);

  return { data, loading, error };
}
