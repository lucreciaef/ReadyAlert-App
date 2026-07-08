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
    trigger: null, // fire immediately
  });
}

/**
 * Send a local push notification for RTR Austria national alerts.
 */
export async function sendRtrNotification(
  alertCount: number,
  highestLevel: string,
): Promise<void> {
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
    trigger: null, // fire immediately
  });
}
