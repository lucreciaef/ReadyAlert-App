/**
 * Core task-expiry logic.
 * No React dependencies — safe to call from background tasks and React contexts alike.
 */

import { type SQLiteDatabase } from 'expo-sqlite';
import { sendTaskExpiryNotification } from './notifications';

type TaskExpiryRow = {
  id: string;
  title: string;
  expiry_duration_days: number;
  completed_at: string | null;
  expires_at: string | null;
};

/**
 * Marks all items in expired tasks as unchecked, clears their timestamps,
 * sends a push notification per expired task, and returns the expired task IDs.
 * Safe to call on every app foreground event and from background fetch tasks.
 */
export async function checkAndExpireTasks(db: SQLiteDatabase): Promise<string[]> {
  const now = new Date().toISOString();

  const expiredTasks = await db.getAllAsync<TaskExpiryRow>(
    `SELECT id, title, expiry_duration_days, completed_at, expires_at
     FROM tasks
     WHERE expires_at IS NOT NULL AND expires_at <= ?`,
    [now],
  );

  if (expiredTasks.length === 0) return [];

  const expiredIds: string[] = [];

  for (const task of expiredTasks) {
    await db.withTransactionAsync(async () => {
      await db.runAsync(`UPDATE checklist_items SET checked = 0 WHERE task_id = ?`, [task.id]);
      await db.runAsync(
        `UPDATE tasks SET completed_at = NULL, expires_at = NULL WHERE id = ?`,
        [task.id],
      );
    });

    await sendTaskExpiryNotification(task.title);
    expiredIds.push(task.id);
  }

  return expiredIds;
}

/**
 * Called after every checklist save. For each task:
 * - If all items are checked and completed_at is not yet set → record completion + schedule expiry.
 * - If not all items are checked but completed_at is set → clear the timestamps.
 */
export async function updateTaskCompletionTimestamps(db: SQLiteDatabase): Promise<void> {
  const tasks = await db.getAllAsync<TaskExpiryRow>(
    `SELECT id, title, expiry_duration_days, completed_at, expires_at FROM tasks`,
  );

  const now = new Date();

  for (const task of tasks) {
    const counts = await db.getFirstAsync<{ total: number; checked: number }>(
      `SELECT COUNT(*) AS total, COALESCE(SUM(checked), 0) AS checked
       FROM checklist_items WHERE task_id = ?`,
      [task.id],
    );

    const total = counts?.total ?? 0;
    const checked = counts?.checked ?? 0;
    const isComplete = total > 0 && checked === total;

    if (isComplete && task.completed_at === null) {
      const completedAt = now.toISOString();
      const expiresAt = new Date(
        now.getTime() + task.expiry_duration_days * 24 * 60 * 60 * 1000,
      ).toISOString();

      await db.runAsync(
        `UPDATE tasks SET completed_at = ?, expires_at = ? WHERE id = ?`,
        [completedAt, expiresAt, task.id],
      );
    } else if (!isComplete && task.completed_at !== null) {
      await db.runAsync(
        `UPDATE tasks SET completed_at = NULL, expires_at = NULL WHERE id = ?`,
        [task.id],
      );
    }
  }
}

/**
 * Persists a new expiry duration for a task.
 * If the task already has a completed_at, the expires_at is recalculated from that date.
 */
export async function updateTaskExpiryDuration(
  db: SQLiteDatabase,
  taskId: string,
  days: number,
): Promise<void> {
  const task = await db.getFirstAsync<{ completed_at: string | null }>(
    `SELECT completed_at FROM tasks WHERE id = ?`,
    [taskId],
  );

  if (task?.completed_at) {
    const expiresAt = new Date(
      new Date(task.completed_at).getTime() + days * 24 * 60 * 60 * 1000,
    ).toISOString();
    await db.runAsync(
      `UPDATE tasks SET expiry_duration_days = ?, expires_at = ? WHERE id = ?`,
      [days, expiresAt, taskId],
    );
  } else {
    await db.runAsync(`UPDATE tasks SET expiry_duration_days = ? WHERE id = ?`, [days, taskId]);
  }
}
