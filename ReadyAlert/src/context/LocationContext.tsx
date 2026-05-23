/**
 * LocationContext
 * Provides the real GPS location from useLocation, but also allows a debug
 * override so any screen downstream stays up-to-date automatically.
 */

import { createContext, ReactNode, useContext, useState } from 'react';
import { Coordinates, useLocation } from '../hooks/useLocation';

const LONDON: Coordinates = { latitude: 51.5074, longitude: -0.1278 };

interface LocationContextValue {
  coords: Coordinates | null;
  loading: boolean;
  error: string | null;
  requestPermission: () => Promise<void>;
  /** True when a debug location is active instead of real GPS */
  isDebugMode: boolean;
  /** Override with London coordinates for testing */
  setDebugLondon: () => void;
  /** Clear the override and go back to real GPS */
  clearDebugLocation: () => void;
}

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const gps = useLocation();
  const [debugCoords, setDebugCoords] = useState<Coordinates | null>(null);

  const value: LocationContextValue = {
    // When debug mode is active, override coords (loading/error come from GPS still)
    coords: debugCoords ?? gps.coords,
    loading: debugCoords ? false : gps.loading,
    error: gps.error,
    requestPermission: gps.requestPermission,
    isDebugMode: debugCoords !== null,
    setDebugLondon: () => {
      console.log('Debug: overriding location to London');
      setDebugCoords(LONDON);
    },
    clearDebugLocation: () => {
      console.log('Debug: cleared location override, back to GPS');
      setDebugCoords(null);
    },
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocationContext(): LocationContextValue {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocationContext must be used inside <LocationProvider>');
  return ctx;
}
