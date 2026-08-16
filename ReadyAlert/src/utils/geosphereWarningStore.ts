import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_SEEN_KEY = 'geosphere_last_seen_ids';

export async function getLastSeenWarningIds(): Promise<Set<number>> {
  try {
    const raw = await AsyncStorage.getItem(LAST_SEEN_KEY);
    return raw ? new Set(JSON.parse(raw) as number[]) : new Set();
  } catch {
    return new Set();
  }
}

export async function setLastSeenWarningIds(ids: number[]): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_SEEN_KEY, JSON.stringify(ids));
  } catch {
    // Non-critical: deduplication may re-notify on next run.
  }
}
