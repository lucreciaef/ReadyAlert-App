/**
 * SavedLocationsContext
 * Stores up to MAX_SAVED_LOCATIONS user-picked cities/districts and tracks which one
 * (if any) is currently the active override for the home dashboard.
 * Persisted via AsyncStorage so the list survives app restarts.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { Coordinates } from '../hooks/useLocation';

export const MAX_SAVED_LOCATIONS = 3;

const STORAGE_KEY_LIST = 'savedLocations.v1.list';
const STORAGE_KEY_SELECTED = 'savedLocations.v1.selectedId';

export interface SavedLocation {
  id: string;
  name: string;
  subtitle: string;
  latitude: number;
  longitude: number;
}

interface SavedLocationsContextValue {
  savedLocations: SavedLocation[];
  selectedId: string | null;
  selectedLocation: SavedLocation | null;
  addLocation: (loc: Omit<SavedLocation, 'id'>) => SavedLocation | null;
  removeLocation: (id: string) => void;
  selectLocation: (id: string | null) => void;
  canAddMore: boolean;
}

const SavedLocationsContext = createContext<SavedLocationsContextValue | null>(null);

function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function SavedLocationsProvider({ children }: { children: ReactNode }) {
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Rehydrate from AsyncStorage on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [listRaw, selRaw] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY_LIST),
          AsyncStorage.getItem(STORAGE_KEY_SELECTED),
        ]);
        if (cancelled) return;
        if (listRaw) {
          const parsed = JSON.parse(listRaw) as SavedLocation[];
          if (Array.isArray(parsed)) setSavedLocations(parsed.slice(0, MAX_SAVED_LOCATIONS));
        }
        if (selRaw) setSelectedId(selRaw);
      } catch (err) {
        console.warn('Failed to hydrate saved locations:', err);
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY_LIST, JSON.stringify(savedLocations)).catch((err) =>
      console.warn('Failed to persist saved locations list:', err),
    );
  }, [savedLocations, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (selectedId === null) {
      AsyncStorage.removeItem(STORAGE_KEY_SELECTED).catch(() => {});
    } else {
      AsyncStorage.setItem(STORAGE_KEY_SELECTED, selectedId).catch(() => {});
    }
  }, [selectedId, hydrated]);

  const addLocation = useCallback((loc: Omit<SavedLocation, 'id'>): SavedLocation | null => {
    let created: SavedLocation | null = null;
    setSavedLocations((prev) => {
      if (prev.length >= MAX_SAVED_LOCATIONS) return prev;
      // Skip duplicates by coordinates within ~100m
      const isDup = prev.some(
        (p) =>
          Math.abs(p.latitude - loc.latitude) < 0.001 &&
          Math.abs(p.longitude - loc.longitude) < 0.001,
      );
      if (isDup) return prev;
      created = { id: makeId(), ...loc };
      return [...prev, created];
    });
    return created;
  }, []);

  const removeLocation = useCallback((id: string) => {
    setSavedLocations((prev) => prev.filter((p) => p.id !== id));
    setSelectedId((prev) => (prev === id ? null : prev));
  }, []);

  const selectLocation = useCallback((id: string | null) => {
    setSelectedId(id);
  }, []);

  const selectedLocation = (selectedId && savedLocations.find((l) => l.id === selectedId)) || null;

  const value: SavedLocationsContextValue = {
    savedLocations,
    selectedId,
    selectedLocation,
    addLocation,
    removeLocation,
    selectLocation,
    canAddMore: savedLocations.length < MAX_SAVED_LOCATIONS,
  };

  return <SavedLocationsContext.Provider value={value}>{children}</SavedLocationsContext.Provider>;
}

export function useSavedLocations(): SavedLocationsContextValue {
  const ctx = useContext(SavedLocationsContext);
  if (!ctx) throw new Error('useSavedLocations must be used inside <SavedLocationsProvider>');
  return ctx;
}

export function savedLocationCoords(loc: SavedLocation): Coordinates {
  return { latitude: loc.latitude, longitude: loc.longitude };
}
