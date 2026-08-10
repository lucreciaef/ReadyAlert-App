/**
 * Versioned database migration runner.
 */

import { type SQLiteDatabase } from 'expo-sqlite';
import { PHARMACY_ITEMS_SEED } from '../hooks/usePharmacyChecklist';
import { GO_BAG_ITEMS_SEED } from '../hooks/useGoBagChecklist';
import { STOCKPILE_ITEMS_SEED } from '../hooks/useOneWeekStockpileChecklist';

const CURRENT_SCHEMA_VERSION = 1;

export async function migrateDbIfNeeded(db: SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const version = row?.user_version ?? 0;

  if (version >= CURRENT_SCHEMA_VERSION) return;

  await migration_v1(db);

  await db.runAsync(`PRAGMA user_version = ${CURRENT_SCHEMA_VERSION}`);
}

async function migration_v1(db: SQLiteDatabase): Promise<void> {
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS tasks (
      id                  TEXT PRIMARY KEY,
      title               TEXT NOT NULL,
      category            TEXT NOT NULL,
      description         TEXT,
      sort_order          INTEGER NOT NULL DEFAULT 0,
      expiry_duration_days INTEGER NOT NULL DEFAULT 180,
      completed_at        TEXT,
      expires_at          TEXT
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

  // Home Pharmacy Kit: expires every 9 months (270 days)
  await db.runAsync(
    `INSERT OR IGNORE INTO tasks (id, title, category, description, sort_order, expiry_duration_days) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      'task_pharmacy_kit',
      'Home Pharmacy Kit',
      'Home Preparedness',
      'What you should always have at home for basic emergencies and an emergency kit.',
      1,
      270,
    ],
  );
  for (let i = 0; i < PHARMACY_ITEMS_SEED.length; i++) {
    const item = PHARMACY_ITEMS_SEED[i];
    await db.runAsync(
      `INSERT OR IGNORE INTO checklist_items (id, task_id, name, group_name, quantity, checked, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [item.id, 'task_pharmacy_kit', item.name, item.group, item.quantity ?? null, 0, i],
    );
  }

  // Weather Emergency Tips: expires every 6 months (180 days)
  await db.runAsync(
    `INSERT OR IGNORE INTO tasks (id, title, category, description, sort_order, expiry_duration_days) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      'task_weather_tips',
      'Weather Emergency Tips',
      'Knowledge',
      'How to prepare for and stay safe during extreme weather events.',
      2,
      180,
    ],
  );
  await db.runAsync(
    `INSERT OR IGNORE INTO checklist_items (id, task_id, name, group_name, quantity, checked, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      'wet_read',
      'task_weather_tips',
      'I have read and understood the weather emergency tips',
      null,
      null,
      0,
      0,
    ],
  );

  // Emergency Go-Bag: expires every 9 months (270 days)
  await db.runAsync(
    `INSERT OR IGNORE INTO tasks (id, title, category, description, sort_order, expiry_duration_days) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      'task_go_bag',
      'Emergency Go-Bag',
      'Home Preparedness',
      'What to pack in a go-bag so you can leave your home quickly in an emergency.',
      3,
      270,
    ],
  );
  for (let i = 0; i < GO_BAG_ITEMS_SEED.length; i++) {
    const item = GO_BAG_ITEMS_SEED[i];
    await db.runAsync(
      `INSERT OR IGNORE INTO checklist_items (id, task_id, name, group_name, quantity, checked, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [item.id, 'task_go_bag', item.name, item.group, item.quantity ?? null, 0, i],
    );
  }

  // One-Week Food Stockpile: expires every 3 months (90 days)
  await db.runAsync(
    `INSERT OR IGNORE INTO tasks (id, title, category, description, sort_order, expiry_duration_days) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      'task_stockpile',
      'One-Week Food Stockpile',
      'Home Preparedness',
      'Essential food and water supplies for a family of 4 for seven days.',
      4,
      90,
    ],
  );
  for (let i = 0; i < STOCKPILE_ITEMS_SEED.length; i++) {
    const item = STOCKPILE_ITEMS_SEED[i];
    await db.runAsync(
      `INSERT OR IGNORE INTO checklist_items (id, task_id, name, group_name, quantity, checked, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [item.id, 'task_stockpile', item.name, item.group, item.quantity ?? null, 0, i],
    );
  }

  // Helping an Unresponsive Person: expires every 6 months (180 days)
  await db.runAsync(
    `INSERT OR IGNORE INTO tasks (id, title, category, description, sort_order, expiry_duration_days) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      'task_no_reaction_person_tips',
      'Helping an Unresponsive Person',
      'Knowledge',
      'How to assess and assist a person who is not reacting to external stimuli.',
      5,
      180,
    ],
  );
  await db.runAsync(
    `INSERT OR IGNORE INTO checklist_items (id, task_id, name, group_name, quantity, checked, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      'nrp_read',
      'task_no_reaction_person_tips',
      'I have read and understood how to help an unresponsive person',
      null,
      null,
      0,
      0,
    ],
  );

  // Poisoning Dangers at Home: expires every 6 months (180 days)
  await db.runAsync(
    `INSERT OR IGNORE INTO tasks (id, title, category, description, sort_order, expiry_duration_days) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      'task_poisoning_tips',
      'Poisoning Dangers at Home',
      'Knowledge',
      'How to recognise and respond to accidental poisoning from common household products.',
      6,
      180,
    ],
  );
  await db.runAsync(
    `INSERT OR IGNORE INTO checklist_items (id, task_id, name, group_name, quantity, checked, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      'pdah_read',
      'task_poisoning_tips',
      'I have read and understood the poisoning dangers at home',
      null,
      null,
      0,
      0,
    ],
  );
}
