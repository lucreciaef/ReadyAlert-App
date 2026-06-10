/**
 * LocationContext
 * Provides the real GPS location from useLocation, but also allows a debug
 * override so any screen downstream stays up-to-date automatically.
 */

import { createContext, ReactNode, useContext, useState } from 'react';
import { Coordinates, useLocation } from '../hooks/useLocation';

const LONDON: Coordinates = { latitude: 51.5074, longitude: -0.1278 };

export type DebugMode = 'london' | 'danger' | '503' | null;

interface LocationContextValue {
  coords: Coordinates | null;
  loading: boolean;
  error: string | null;
  requestPermission: () => Promise<void>;
  /** True when a debug location is active instead of real GPS */
  isDebugMode: boolean;
  /** Active debug mode, or null when not in debug mode */
  debugMode: DebugMode;
  /** Override with London coordinates for testing */
  setDebugLondon: () => void;
  /** Activate the local danger alert simulation */
  setDebugDanger: () => void;
  /** Activate the 503 server unavailable simulation */
  setDebug503: () => void;
  /** Clear the override and go back to real GPS */
  clearDebugLocation: () => void;
}

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const gps = useLocation();
  const [debugCoords, setDebugCoords] = useState<Coordinates | null>(null);
  const [debugMode, setDebugMode] = useState<DebugMode>(null);

  const value: LocationContextValue = {
    // When debug mode is active, override coords (loading/error come from GPS still)
    coords: debugCoords ?? gps.coords,
    loading: debugCoords ? false : gps.loading,
    error: gps.error,
    requestPermission: gps.requestPermission,
    isDebugMode: debugMode !== null,
    debugMode,
    setDebugLondon: () => {
      console.log('Debug: overriding location to London');
      setDebugCoords(LONDON);
      setDebugMode('london');
    },
    setDebugDanger: () => {
      console.log('Debug: simulating local danger alert');
      setDebugCoords(gps.coords);
      setDebugMode('danger');
    },
    setDebug503: () => {
      console.log('Debug: simulating 503 server unavailable');
      setDebugCoords(gps.coords);
      setDebugMode('503');
    },
    clearDebugLocation: () => {
      console.log('Debug: cleared debug mode, back to GPS');
      setDebugCoords(null);
      setDebugMode(null);
    },
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocationContext(): LocationContextValue {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocationContext must be used inside <LocationProvider>');
  return ctx;
}
