/**
 * Custom hook for fetching Geosphere Austria weather warnings.
 * Reads debugMode from LocationContext
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  fetchWarningsForLocation,
  filterWarningsInWindow,
  GeosphereResponse,
  getLocationName,
  OutsideAustriaError,
  ServiceUnavailableError,
} from '../api';
import { Coordinates } from './useLocation';
import { useLocationContext } from '../context/LocationContext';
import { useNotifications } from './useNotifications';

const POLL_INTERVAL_MS = 30_000;
const WARNING_WINDOW_HOURS = 48;

export interface GeosphereWarningsState {
  data: GeosphereResponse | null;
  visibleWarnings: ReturnType<typeof filterWarningsInWindow>;
  loading: boolean;
  error: string | null;
  serviceUnavailable: boolean;
  outsideAustria: boolean;
  outsideAustriaMessage: string | null;
  refresh: () => void;
}

export function useGeosphereWarnings(coords: Coordinates | null): GeosphereWarningsState {
  const { debugMode } = useLocationContext();
  const { notifyGeosphereWarnings } = useNotifications();

  // Track latest debugMode
  const debugModeRef = useRef(debugMode);
  useEffect(() => { debugModeRef.current = debugMode; }, [debugMode]);

  const prevWarningCountRef = useRef(0);

  const [data, setData] = useState<GeosphereResponse | null>(null);
  const [visibleWarnings, setVisibleWarnings] = useState<ReturnType<typeof filterWarningsInWindow>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serviceUnavailable, setServiceUnavailable] = useState(false);
  const [outsideAustria, setOutsideAustria] = useState(false);
  const [outsideAustriaMessage, setOutsideAustriaMessage] = useState<string | null>(null);

  const load = useCallback(async (lon: number, lat: number) => {
    try {
      setLoading(true);
      setError(null);
      setServiceUnavailable(false);
      setOutsideAustria(false);
      setOutsideAustriaMessage(null);
      setData(null);
      setVisibleWarnings([]);

      if (debugModeRef.current === '503') {
        await new Promise((resolve) => setTimeout(resolve, 600));
        throw new ServiceUnavailableError();
      }

      const result = await fetchWarningsForLocation(lon, lat, 'en');
      const inWindow = filterWarningsInWindow(result?.properties?.warnings ?? [], WARNING_WINDOW_HOURS);

      setData(result);
      setVisibleWarnings(inWindow);

      const newCount = inWindow.length;
      if (newCount > 0 && newCount !== prevWarningCountRef.current) {
        notifyGeosphereWarnings(newCount, getLocationName(result));
      }
      prevWarningCountRef.current = newCount;
    } catch (err) {
      if (err instanceof ServiceUnavailableError) {
        setServiceUnavailable(true);
      } else if (err instanceof OutsideAustriaError) {
        setOutsideAustria(true);
        setOutsideAustriaMessage(err.message);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch warnings');
      }
    } finally {
      setLoading(false);
    }
  }, [notifyGeosphereWarnings]);

  // Initial fetch, also re-fires when debugMode changes
  useEffect(() => {
    if (!coords) return;
    load(coords.longitude, coords.latitude);
  }, [coords?.latitude, coords?.longitude, debugMode]);

  // Poll every 30 seconds; reset interval when coords or debugMode change.
  useEffect(() => {
    if (!coords) return;
    const interval = setInterval(() => {
      load(coords.longitude, coords.latitude);
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [coords?.latitude, coords?.longitude, debugMode]);

  const refresh = useCallback(() => {
    if (coords) load(coords.longitude, coords.latitude);
  }, [coords, load]);

  return {
    data,
    visibleWarnings,
    loading,
    error,
    serviceUnavailable,
    outsideAustria,
    outsideAustriaMessage,
    refresh,
  };
}