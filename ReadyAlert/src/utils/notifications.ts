/**
 * Push notification utilities for ReadyAlert.
 * Handles permission registration and sending local notifications
 * when new alerts are detected from RTR Austria or Geosphere Austria APIs.
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications are presented when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions from the user.
 * On Android 13+ this is required at runtime.
 * Returns true if permissions were granted.
 */
export async function registerForPushNotifications(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('alerts', {
      name: 'Emergency Alerts',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#DC2626',
      sound: 'default',
    });
    await Notifications.setNotificationChannelAsync('preparedness-expiry', {
      name: 'Preparedness Expiry',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#DC2626',
      sound: 'default',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

/**
 * Send a local push notification for a Geosphere weather warning.
 */
export async function sendGeosphereNotification(
  warningCount: number,
  locationName: string,
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `⚠️ Weather Warning${warningCount > 1 ? 's' : ''} – ${locationName}`,
      body:
        warningCount === 1
          ? 'There is 1 active weather warning for your area. Tap to view details.'
          : `There are ${warningCount} active weather warnings for your area. Tap to view details.`,
      sound: 'default',
      data: { source: 'geosphere', warningCount, locationName },
    },
    trigger: { channelId: 'alerts' },
  });
}

/**
 * Schedule a local notification to fire at the exact moment a preparedness task expires.
 * Returns the notification identifier so it can be cancelled if the task is reset.
 */
export async function scheduleTaskExpiryNotification(
  taskTitle: string,
  expiresAt: Date,
): Promise<string> {
  return await Notifications.scheduleNotificationAsync({
    content: {
      title: '⏰ Learning Centre task expired',
      body: `Your "${taskTitle}" task has expired. Review it to keep your preparedness score up to date.`,
      sound: 'default',
      data: { source: 'preparedness-expiry', taskTitle },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: expiresAt,
      channelId: 'preparedness-expiry',
    },
  });
}

/**
 * Cancel a previously scheduled task-expiry notification.
 * Safe to call if the notification has already fired or was never registered.
 */
export async function cancelScheduledTaskExpiryNotification(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // Already fired or removed — nothing to cancel.
  }
}

/**
 * Send an immediate local notification when a preparedness task has expired.
 * Used as a fallback for tasks that expired before scheduled notifications were introduced.
 */
export async function sendTaskExpiryNotification(taskTitle: string): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '⏰ Learning Centre task expired',
      body: `Your "${taskTitle}" task has expired. Review it to keep your preparedness score up to date.`,
      sound: 'default',
      data: { source: 'preparedness-expiry', taskTitle },
    },
    trigger: { channelId: 'preparedness-expiry' },
  });
}

/**
 * Schedule a debug RTR notification to fire in 1 minute.
 * Used by the debug settings to test background notification delivery.
 */
export async function scheduleRtrTestNotification(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🚨 Emergency Alert – Austria',
      body: 'There are 3 active national alerts. Tap to view details.',
      sound: 'default',
      data: { source: 'rtr', alertCount: 3, highestLevel: 'AlertLevel3' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(Date.now() + 60 * 1000),
      channelId: 'alerts',
    },
  });
}

/**
 * Send a local push notification for RTR Austria national alerts.
 */
export async function sendRtrNotification(alertCount: number, highestLevel: string): Promise<void> {
  const levelLabels: Record<string, string> = {
    AlertLevel1: 'Emergency Alert',
    AlertLevel2: 'Extreme Threat',
    AlertLevel3: 'Severe Threat',
    AlertLevel4: 'Threat Information',
    Amber: 'Other Alert',
  };
  const levelLabel = levelLabels[highestLevel] ?? 'Alert';

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `🚨 ${levelLabel} – Austria`,
      body:
        alertCount === 1
          ? 'There is 1 active national alert. Tap to view details.'
          : `There are ${alertCount} active national alerts. Tap to view details.`,
      sound: 'default',
      data: { source: 'rtr', alertCount, highestLevel },
    },
    trigger: { channelId: 'alerts' },
  });
}
