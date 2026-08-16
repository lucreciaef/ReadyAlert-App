/**
 * Background fetch task that checks for new RTR national alerts.
 * Only sends a notification when alerts appear whose IDs were not seen in the previous run.
 * TaskManager.defineTask must be called at module level (before React mounts).
 */

import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { fetchRtrAlerts, sortAlertsBySeverity, ALL_ALERT_LEVELS } from '../api';
import { sendRtrNotification } from '../utils/notifications';
import { getLastSeenAlertIds, setLastSeenAlertIds } from '../utils/rtrAlertStore';

export const RTR_TASK_NAME = 'READYALERT_RTR_CHECK';

try {
  TaskManager.defineTask(RTR_TASK_NAME, async () => {
    try {
      const result = await fetchRtrAlerts({ alertLevels: ALL_ALERT_LEVELS });
      const alerts = result.alerts;
      const currentIds = alerts.map((a) => a.consolidation_identifier);

      const lastSeen = await getLastSeenAlertIds();
      const hasNewAlerts = currentIds.some((id) => !lastSeen.has(id));

      await setLastSeenAlertIds(currentIds); // updates stored IDs so the next run has an accurate baseline.

      if (hasNewAlerts && alerts.length > 0) {
        const sorted = sortAlertsBySeverity(alerts);
        const highestLevel = sorted[0]?.alert_level ?? 'AlertLevel4';
        await sendRtrNotification(alerts.length, highestLevel);
      }

      return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch {
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  });
} catch {
  // Background tasks don't work on Expo Go, so ignore in this case
}

export async function registerRtrBackgroundTask(): Promise<void> {
  try {
    const status = await BackgroundFetch.getStatusAsync();
    if (
      status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
      status === BackgroundFetch.BackgroundFetchStatus.Denied
    ) {
      return;
    }

    const isRegistered = await TaskManager.isTaskRegisteredAsync(RTR_TASK_NAME);
    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(RTR_TASK_NAME, {
        minimumInterval: 3600, // 1 hour
        stopOnTerminate: false,
        startOnBoot: true,
      });
    }
  } catch {
    // Background tasks don't work on Expo Go, so ignore in this case
  }
}
