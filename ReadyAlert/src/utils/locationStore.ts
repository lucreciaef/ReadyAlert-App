import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_COORDS_KEY = 'last_known_coords';

export interface StoredCoords {
  latitude: number;
  longitude: number;
}

export async function getLastKnownCoords(): Promise<StoredCoords | null> {
  try {
    const raw = await AsyncStorage.getItem(LAST_COORDS_KEY);
    return raw ? (JSON.parse(raw) as StoredCoords) : null;
  } catch {
    return null;
  }
}

export async function setLastKnownCoords(coords: StoredCoords): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_COORDS_KEY, JSON.stringify(coords));
  } catch {
    // Non-critical: background task will use stale coords on next run.
  }
}
