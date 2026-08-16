/**
 * Background fetch task that checks for expired preparedness tasks.
 * TaskManager.defineTask must be called at module level (before React mounts)
 * so that the task is available when the system wakes the app in the background.
 */

import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as SQLite from 'expo-sqlite';
import { checkAndExpireTasks } from '../utils/taskExpiry';

export const EXPIRY_TASK_NAME = 'READYALERT_EXPIRY_CHECK';

try {
  TaskManager.defineTask(EXPIRY_TASK_NAME, async () => {
    try {
      const db = await SQLite.openDatabaseAsync('readyalert.db');
      await checkAndExpireTasks(db);
      return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch {
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  });
} catch {
  // Background tasks don't work on Expo Go, so ignore in this case
}

/**
 * Registers the background fetch task with the OS.
 * Safe to call multiple times — re-registration is a no-op.
 * Minimum interval is ~15 min on iOS (OS-controlled); Android honours it more strictly.
 */
export async function registerExpiryBackgroundTask(): Promise<void> {
  try {
    const status = await BackgroundFetch.getStatusAsync();
    if (
      status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
      status === BackgroundFetch.BackgroundFetchStatus.Denied
    ) {
      return;
    }

    const isRegistered = await TaskManager.isTaskRegisteredAsync(EXPIRY_TASK_NAME);
    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(EXPIRY_TASK_NAME, {
        minimumInterval: 3600, // 1 hour minimum
        stopOnTerminate: false,
        startOnBoot: true,
      });
    }
  } catch {
    // Background tasks don't work on Expo Go, so ignore in this case
  }
}
