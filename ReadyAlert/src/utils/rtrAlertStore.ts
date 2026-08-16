import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_SEEN_KEY = 'rtr_last_seen_ids';

export async function getLastSeenAlertIds(): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(LAST_SEEN_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

export async function setLastSeenAlertIds(ids: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_SEEN_KEY, JSON.stringify(ids));
  } catch {
    // Non-critical: deduplication may re-notify on next background run, but no crash.
  }
}
