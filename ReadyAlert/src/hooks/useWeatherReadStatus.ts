/**
 * Hook that manages the "Weather Emergency Tips" read status backed by SQLite.
 * The read flag is stored as a single checklist_item (id='wet_read', task_id='task_weather_tips').
 * Setting checked=1 counts as 100% task completion, contributing to the global Preparedness Score.
 */

import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

export function useWeatherReadStatus() {
  const db = useSQLiteContext();

  const [isRead, setIsRead] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // Resets to false whenever the user changes the checkbox before saving
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const row = await db.getFirstAsync<{ checked: number }>(
          `SELECT checked FROM checklist_items WHERE id = 'wet_read'`,
        );
        if (!cancelled) setIsRead((row?.checked ?? 0) === 1);
      } catch (err) {
        console.error('[useWeatherReadStatus] load error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [db]);

  const toggleRead = useCallback(() => {
    setIsRead((prev) => !prev);
    setSaved(false);
  }, []);

  const saveReadStatus = useCallback(async () => {
    setSaving(true);
    try {
      await db.runAsync(`UPDATE checklist_items SET checked = ? WHERE id = 'wet_read'`, [
        isRead ? 1 : 0,
      ]);
      setSaved(true);
    } catch (err) {
      console.error('[useWeatherReadStatus] save error:', err);
    } finally {
      setSaving(false);
    }
  }, [db, isRead]);

  return { isRead, loading, saving, saved, toggleRead, saveReadStatus };
}
