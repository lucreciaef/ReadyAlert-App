/**
 * LocationContext
 * Provides the real GPS location from useLocation, plus:
 *  - a debug override (for testing outside Austria, forced Graz, 503 sim, etc.)
 *  - a user-selected saved location override (custom city/district from SavedLocationsContext)
 *
 * Precedence: debug > saved-location > GPS. Downstream hooks/screens read `coords`
 * and stay in sync automatically.
 */

import { createContext, ReactNode, useContext, useState } from 'react';
import { Coordinates, useLocation } from '../hooks/useLocation';
import { useSavedLocations } from './SavedLocationsContext';

const LONDON: Coordinates = { latitude: 51.5074, longitude: -0.1278 };
const GRAZ: Coordinates = { latitude: 47.0679, longitude: 15.4417 };

export type DebugMode = 'london' | 'graz' | 'danger' | '503' | null;

interface LocationContextValue {
  coords: Coordinates | null;
  loading: boolean;
  error: string | null;
  requestPermission: () => Promise<void>;
  /** True when a debug location is active instead of real GPS */
  isDebugMode: boolean;
  /** Active debug mode, or null when not in debug mode */
  debugMode: DebugMode;
  /** True when the user's selected saved location is providing the coords */
  isCustomLocation: boolean;
  /** Override with London coordinates for testing */
  setDebugLondon: () => void;
  /** Override with Graz coordinates for testing */
  setDebugGraz: () => void;
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
  const { selectedLocation } = useSavedLocations();
  const [debugCoords, setDebugCoords] = useState<Coordinates | null>(null);
  const [debugMode, setDebugMode] = useState<DebugMode>(null);

  const savedCoords: Coordinates | null = selectedLocation
    ? { latitude: selectedLocation.latitude, longitude: selectedLocation.longitude }
    : null;

  // Debug takes precedence, then a user-picked saved location, then real GPS.
  const effectiveCoords = debugCoords ?? savedCoords ?? gps.coords;

  const value: LocationContextValue = {
    coords: effectiveCoords,
    loading: debugCoords || savedCoords ? false : gps.loading,
    error: gps.error,
    requestPermission: gps.requestPermission,
    isDebugMode: debugMode !== null,
    debugMode,
    isCustomLocation: !debugCoords && !!savedCoords,
    setDebugLondon: () => {
      console.log('Debug: overriding location to London');
      setDebugCoords(LONDON);
      setDebugMode('london');
    },
    setDebugGraz: () => {
      console.log('Debug: overriding location to Graz');
      setDebugCoords(GRAZ);
      setDebugMode('graz');
    },
    setDebugDanger: () => {
      console.log('Debug: simulating local danger alert');
      setDebugCoords(null);
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
