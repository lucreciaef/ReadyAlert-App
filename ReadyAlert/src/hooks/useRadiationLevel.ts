/**
 * Custom hook for fetching and filtering Austrian radiation monitoring data.
 *
 * - Fetches all stations once when coordinates become available.
 * - Polls every 5 minutes (data is updated infrequently).
 * - Exposes the closest station within 100 km and all nearby stations.
 */

import { useEffect, useState } from 'react';
import { fetchRadiationData, haversineKm, RadiationStation } from '../api';
import { Coordinates } from './useLocation';

const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_DISTANCE_KM = 100;

export interface RadiationState {
  /** All stations within MAX_DISTANCE_KM of the user */
  nearbyStations: RadiationStation[];
  /** The single closest station within MAX_DISTANCE_KM, or null */
  closestStation: RadiationStation | null;
  /** Timestamp of the measurement */
  measurementTime: Date | null;
  loading: boolean;
  error: string | null;
}

export function useRadiationLevel(coords: Coordinates | null): RadiationState {
  const [nearbyStations, setNearbyStations] = useState<RadiationStation[]>([]);
  const [closestStation, setClosestStation] = useState<RadiationStation | null>(null);
  const [measurementTime, setMeasurementTime] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async (latitude: number, longitude: number) => {
    try {
      setLoading(true);
      setError(null);

      const { time, stations } = await fetchRadiationData();

      // Enrich each station with its distance from the user
      const enriched: RadiationStation[] = stations
        .map((s) => ({
          ...s,
          distanceKm: haversineKm(latitude, longitude, s.latitude, s.longitude),
        }))
        .filter((s) => s.distanceKm <= MAX_DISTANCE_KM)
        .sort((a, b) => a.distanceKm - b.distanceKm);

      setNearbyStations(enriched);
      setClosestStation(enriched[0] ?? null);
      setMeasurementTime(time);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch radiation data';
      console.error('Radiation fetch error:', message);
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

  // Poll every 5 minutes
  useEffect(() => {
    if (!coords) return;
    const interval = setInterval(() => {
      load(coords.latitude, coords.longitude);
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [coords?.latitude, coords?.longitude]);

  return { nearbyStations, closestStation, measurementTime, loading, error };
}

