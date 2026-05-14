/**
 * Custom hook for getting user's current location
 */

import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationState {
  coords: Coordinates | null;
  loading: boolean;
  error: string | null;
  requestPermission: () => Promise<void>;
}

const DEFAULT_COORDS: Coordinates = {
  latitude: 48.248611,
  longitude: 16.356388,
};

export function useLocation(): LocationState {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestPermission = async () => {
    try {
      setLoading(true);
      setError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setError('Location permission denied. Using default location.');
        setCoords(DEFAULT_COORDS);
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setCoords({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      console.log('✅ Location obtained:', location.coords);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location';
      console.error('❌ Location error:', errorMessage);
      setError(errorMessage);
      setCoords(DEFAULT_COORDS);
    } finally {
      setLoading(false);
    }
  };

  // Request location on component mount
  useEffect(() => {
    requestPermission();
  }, []);

  return {
    coords,
    loading,
    error,
    requestPermission,
  };
}

