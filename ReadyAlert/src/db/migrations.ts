/**
 * Versioned database migration runner.
 */

import { type SQLiteDatabase } from 'expo-sqlite';
import { PHARMACY_ITEMS_SEED } from '../hooks/usePharmacyChecklist';

/**
 * Schema v1:
 *   tasks: one row per learning-centre task / module
 *   checklist_items: individual checklist items belonging to a task
 */
const CURRENT_SCHEMA_VERSION = 1;

export async function migrateDbIfNeeded(db: SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const version = row?.user_version ?? 0;

  if (version >= CURRENT_SCHEMA_VERSION) return;

  if (version < 1) await migration_v1(db);

  // Set PRAGMA outside any transaction — it modifies the file header directly.
  await db.runAsync(`PRAGMA user_version = ${CURRENT_SCHEMA_VERSION}`);
}

async function migration_v1(db: SQLiteDatabase): Promise<void> {
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS tasks (
      id          TEXT PRIMARY KEY,
      title       TEXT NOT NULL,
      category    TEXT NOT NULL,
      description TEXT,
      sort_order  INTEGER NOT NULL DEFAULT 0
    )
  `);

  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS checklist_items (
      id         TEXT PRIMARY KEY,
      task_id    TEXT NOT NULL,
      name       TEXT NOT NULL,
      group_name TEXT,
      quantity   TEXT,
      checked    INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (task_id) REFERENCES tasks(id)
    )
  `);

  await db.runAsync(
    `INSERT OR IGNORE INTO tasks (id, title, category, description, sort_order)
     VALUES (?, ?, ?, ?, ?)`,
    [
      'task_pharmacy_kit',
      'Home Pharmacy Kit',
      'Home Preparedness',
      'What you should always have at home for basic emergencies and an emergency kit.',
      1,
    ],
  );

  // Check whether the old pharmacy_checklist table still exists so we can carry the user's previous checked state
    // forward instead of losing it.
  const oldTableExists = await db.getFirstAsync<{ name: string }>(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='pharmacy_checklist'`,
  );

  for (let i = 0; i < PHARMACY_ITEMS_SEED.length; i++) {
    const item = PHARMACY_ITEMS_SEED[i];

    let oldChecked = 0;
    if (oldTableExists) {
      try {
        const oldRow = await db.getFirstAsync<{ checked: number }>(
          'SELECT checked FROM pharmacy_checklist WHERE id = ?',
          [item.id],
        );
        oldChecked = oldRow?.checked ?? 0;
      } catch {
        // old table might have a different shape — ignore and default to 0
      }
    }

    await db.runAsync(
      `INSERT OR IGNORE INTO checklist_items
         (id, task_id, name, group_name, quantity, checked, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [item.id, 'task_pharmacy_kit', item.name, item.group, item.quantity ?? null, oldChecked, i],
    );
  }

  // Drop the old table now that data is migrated
  await db.runAsync('DROP TABLE IF EXISTS pharmacy_checklist');
}