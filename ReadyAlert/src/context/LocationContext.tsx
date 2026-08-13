/**
 * LocationContext
 * Provides the real GPS location from useLocation, plus a user-selected saved
 * location override (custom city/district from SavedLocationsContext).
 *
 * Precedence: saved-location > GPS. Downstream hooks/screens read `coords`
 * and stay in sync automatically. `debugMode` is exposed as a signal for
 * simulation flows but does not override coords.
 */

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Coordinates, useLocation } from '../hooks/useLocation';
import { useSavedLocations } from './SavedLocationsContext';
import { setLastKnownCoords } from '../utils/locationStore';

export type DebugMode = 'danger' | '503' | null;

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
  /** Activate the Austria-wide danger alert simulation */
  setDebugDanger: () => void;
  /** Activate the 503 server unavailable simulation */
  setDebug503: () => void;
  /** Clear the active debug mode */
  clearDebugLocation: () => void;
}

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const gps = useLocation();
  const { selectedLocation } = useSavedLocations();
  const [debugMode, setDebugMode] = useState<DebugMode>(null);

  const savedCoords: Coordinates | null = selectedLocation
    ? { latitude: selectedLocation.latitude, longitude: selectedLocation.longitude }
    : null;

  // A user-picked saved location wins over real GPS.
  const effectiveCoords = savedCoords ?? gps.coords;

  // Persist latest coords so background tasks can fetch location-aware APIs
  // (e.g. Geosphere weather warnings) without needing a live GPS fix.
  useEffect(() => {
    if (effectiveCoords) {
      setLastKnownCoords(effectiveCoords).catch(() => {});
    }
  }, [effectiveCoords?.latitude, effectiveCoords?.longitude]);

  const value: LocationContextValue = {
    coords: effectiveCoords,
    loading: savedCoords ? false : gps.loading,
    error: gps.error,
    requestPermission: gps.requestPermission,
    isDebugMode: debugMode !== null,
    debugMode,
    isCustomLocation: !!savedCoords,
    setDebugDanger: () => {
      console.log('Debug: simulating local danger alert');
      setDebugMode('danger');
    },
    setDebug503: () => {
      console.log('Debug: simulating 503 server unavailable');
      setDebugMode('503');
    },
    clearDebugLocation: () => {
      console.log('Debug: cleared debug mode, back to GPS');
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
