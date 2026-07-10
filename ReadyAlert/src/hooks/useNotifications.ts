/**
 * Hook that registers for push notifications on mount and exposes
 * helpers to send notifications for Geosphere and RTR alerts.
 */

import { useEffect } from 'react';
import {
  registerForPushNotifications,
  sendGeosphereNotification,
  sendRtrNotification,
} from '../utils/notifications';

// Module-level so permission state survives tab navigation (unmount/remount)
let _permissionGranted = false;
let _permissionRequested = false;

export function useNotifications() {
  useEffect(() => {
    if (_permissionRequested) return;
    _permissionRequested = true;
    registerForPushNotifications()
      .then((granted) => {
        _permissionGranted = granted;
        if (!granted) {
          console.warn(
            '[Notifications] Permission not granted – notifications will be suppressed.',
          );
        }
      })
      .catch((err) => console.error('[Notifications] Failed to register:', err));
  }, []);

  const notifyGeosphereWarnings = async (warningCount: number, locationName: string) => {
    if (!_permissionGranted || warningCount === 0) return;
    try {
      await sendGeosphereNotification(warningCount, locationName);
    } catch (err) {
      console.error('[Notifications] Failed to send Geosphere notification:', err);
    }
  };

  const notifyRtrAlerts = async (alertCount: number, highestLevel: string) => {
    if (!_permissionGranted || alertCount === 0) return;
    try {
      await sendRtrNotification(alertCount, highestLevel);
    } catch (err) {
      console.error('[Notifications] Failed to send RTR notification:', err);
    }
  };

  return { notifyGeosphereWarnings, notifyRtrAlerts };
}
