/**
 * Background fetch task that checks for new Geosphere Austria weather warnings.
 * Uses the last known coordinates stored by LocationContext to fetch warnings for the user's area, even when the app is closed.
 * TaskManager.defineTask must be called at module level (before React mounts).
 */

import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { fetchWarningsForLocation, filterWarningsInWindow, getLocationName } from '../api';
import { sendGeosphereNotification } from '../utils/notifications';
import { getLastKnownCoords } from '../utils/locationStore';
import { getLastSeenWarningIds, setLastSeenWarningIds } from '../utils/geosphereWarningStore';

export const GEOSPHERE_TASK_NAME = 'READYALERT_GEOSPHERE_CHECK';
const WARNING_WINDOW_HOURS = 48;

try {
  TaskManager.defineTask(GEOSPHERE_TASK_NAME, async () => {
    try {
      const coords = await getLastKnownCoords();
      if (!coords) return BackgroundFetch.BackgroundFetchResult.NoData;

      const result = await fetchWarningsForLocation(coords.longitude, coords.latitude, 'en');
      const inWindow = filterWarningsInWindow(
        result?.properties?.warnings ?? [],
        WARNING_WINDOW_HOURS,
      );
      const currentIds = inWindow.map((w) => w.properties.warnid);

      const lastSeen = await getLastSeenWarningIds();
      const hasNewWarnings = currentIds.some((id) => !lastSeen.has(id));

      await setLastSeenWarningIds(currentIds); // updates stored IDs so the next run has an accurate baseline.

      if (hasNewWarnings && inWindow.length > 0) {
        await sendGeosphereNotification(inWindow.length, getLocationName(result));
      }

      return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch {
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  });
} catch {
  // Background tasks don't work on Expo Go, so ignore in this case
}

export async function registerGeosphereBackgroundTask(): Promise<void> {
  try {
    const status = await BackgroundFetch.getStatusAsync();
    if (
      status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
      status === BackgroundFetch.BackgroundFetchStatus.Denied
    ) {
      return;
    }

    const isRegistered = await TaskManager.isTaskRegisteredAsync(GEOSPHERE_TASK_NAME);
    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(GEOSPHERE_TASK_NAME, {
        minimumInterval: 3600, // 1 hour
        stopOnTerminate: false,
        startOnBoot: true,
      });
    }
  } catch {
    // Background tasks don't work on Expo Go, so ignore in this case
  }
}
