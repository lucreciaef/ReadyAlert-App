/**
 * Versioned database migration runner.
 */

import { type SQLiteDatabase } from 'expo-sqlite';
import { PHARMACY_ITEMS_SEED } from '../hooks/usePharmacyChecklist';
import { GO_BAG_ITEMS_SEED } from '../hooks/useGoBagChecklist';
import { STOCKPILE_ITEMS_SEED } from '../hooks/useOneWeekStockpileChecklist';

const CURRENT_SCHEMA_VERSION = 4;

export async function migrateDbIfNeeded(db: SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let version = row?.user_version ?? 0;

  if (version < 1) {
    await migration_v1(db);
    await db.runAsync('PRAGMA user_version = 1');
    version = 1;
  }

  if (version < 2) {
    await migration_v2(db);
    await db.runAsync('PRAGMA user_version = 2');
    version = 2;
  }

  if (version < 3) {
    await migration_v3(db);
    await db.runAsync('PRAGMA user_version = 3');
    version = 3;
  }

  if (version < 4) {
    await migration_v4(db);
    await db.runAsync('PRAGMA user_version = 4');
  }
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

async function migration_v2(db: SQLiteDatabase): Promise<void> {
  // Extend checklist_items with quiz question columns.
  // Non-quiz rows leave these NULL; quiz rows populate all five.
  await db.runAsync(`ALTER TABLE checklist_items ADD COLUMN option_a TEXT`);
  await db.runAsync(`ALTER TABLE checklist_items ADD COLUMN option_b TEXT`);
  await db.runAsync(`ALTER TABLE checklist_items ADD COLUMN option_c TEXT`);
  await db.runAsync(`ALTER TABLE checklist_items ADD COLUMN option_d TEXT`);
  await db.runAsync(`ALTER TABLE checklist_items ADD COLUMN correct_option TEXT`);

  // Carry forward the checked state from the old "I have read" rows so that
  // users who had already completed an article keep their completion.
  const wetRow = await db.getFirstAsync<{ checked: number }>(
    `SELECT checked FROM checklist_items WHERE id = 'wet_read'`,
  );
  const nrpRow = await db.getFirstAsync<{ checked: number }>(
    `SELECT checked FROM checklist_items WHERE id = 'nrp_read'`,
  );
  const pdahRow = await db.getFirstAsync<{ checked: number }>(
    `SELECT checked FROM checklist_items WHERE id = 'pdah_read'`,
  );

  const wetChecked = wetRow?.checked ?? 0;
  const nrpChecked = nrpRow?.checked ?? 0;
  const pdahChecked = pdahRow?.checked ?? 0;

  await db.runAsync(
    `DELETE FROM checklist_items WHERE id IN ('wet_read', 'nrp_read', 'pdah_read')`,
  );

  // Weather Emergency Tips
  await db.runAsync(
    `INSERT OR IGNORE INTO checklist_items
       (id, task_id, name, group_name, quantity, checked, sort_order,
        option_a, option_b, option_c, option_d, correct_option)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'wet_q1',
      'task_weather_tips',
      'When lightning strikes outdoors and you cannot get inside, what is the correct protective position?',
      null,
      null,
      wetChecked,
      0,
      'Lie flat on the ground with arms spread',
      'Stand upright away from tall trees',
      'Crouch down with feet together and stay on your tiptoes',
      'Climb to the highest nearby shelter',
      'c',
    ],
  );
  await db.runAsync(
    `INSERT OR IGNORE INTO checklist_items
       (id, task_id, name, group_name, quantity, checked, sort_order,
        option_a, option_b, option_c, option_d, correct_option)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'wet_q2',
      'task_weather_tips',
      'Which of the following actions is advised when a severe weather warning is issued?',
      null,
      null,
      wetChecked,
      1,
      'Open windows to ventilate your home',
      'Secure garden furniture and park your car in a safe place',
      'Wait for the storm to pass before taking any action',
      'Take a walk to observe the storm from a safe distance',
      'b',
    ],
  );

  // Helping an Unresponsive Person
  await db.runAsync(
    `INSERT OR IGNORE INTO checklist_items
       (id, task_id, name, group_name, quantity, checked, sort_order,
        option_a, option_b, option_c, option_d, correct_option)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'nrp_q1',
      'task_no_reaction_person_tips',
      'For how long should you check whether an unresponsive person is breathing?',
      null,
      null,
      nrpChecked,
      0,
      'At least one full minute',
      'No longer than 10 seconds',
      'About 30 seconds',
      'Until emergency services arrive',
      'b',
    ],
  );
  await db.runAsync(
    `INSERT OR IGNORE INTO checklist_items
       (id, task_id, name, group_name, quantity, checked, sort_order,
        option_a, option_b, option_c, option_d, correct_option)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'nrp_q2',
      'task_no_reaction_person_tips',
      'If you are unsure whether an unresponsive person is breathing normally, what should you do?',
      null,
      null,
      nrpChecked,
      1,
      'Wait and monitor for 5 more minutes',
      'Place them in the recovery position and call for help',
      'Begin resuscitation immediately — do not wait',
      'Give them small sips of water to stimulate a response',
      'c',
    ],
  );

  // Poisoning Dangers at Home
  await db.runAsync(
    `INSERT OR IGNORE INTO checklist_items
       (id, task_id, name, group_name, quantity, checked, sort_order,
        option_a, option_b, option_c, option_d, correct_option)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'pdah_q1',
      'task_poisoning_tips',
      'When someone has swallowed a household product, should you induce vomiting?',
      null,
      null,
      pdahChecked,
      0,
      'Yes, always — it removes the substance quickly',
      'Only if the product is a liquid cleaner',
      'Only if emergency services are more than 30 minutes away',
      'No, never — it can worsen burns to the mouth and throat',
      'd',
    ],
  );
  await db.runAsync(
    `INSERT OR IGNORE INTO checklist_items
       (id, task_id, name, group_name, quantity, checked, sort_order,
        option_a, option_b, option_c, option_d, correct_option)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'pdah_q2',
      'task_poisoning_tips',
      'What is the Austrian Poison Control Centre emergency number?',
      null,
      null,
      pdahChecked,
      1,
      '144',
      '01 406 43 43',
      '122',
      '112',
      'b',
    ],
  );
}

async function migration_v3(db: SQLiteDatabase): Promise<void> {
  // Store the Expo notification identifier for the pre-scheduled expiry notification
  // so it can be cancelled if the task is reset or its duration changes.
  await db.runAsync(`ALTER TABLE tasks ADD COLUMN expiry_notification_id TEXT`);
}

async function migration_v4(db: SQLiteDatabase): Promise<void> {
  // Guard: fresh installs already have these columns from v1. Only add them for
  // users who ran the pre-expiry v1 schema (tasks table without expiry columns).
  const columns = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(tasks)`);
  const existing = new Set(columns.map((c) => c.name));

  if (!existing.has('expiry_duration_days')) {
    await db.runAsync(
      `ALTER TABLE tasks ADD COLUMN expiry_duration_days INTEGER NOT NULL DEFAULT 180`,
    );
    // Correct the per-task defaults (ALTER TABLE defaults all rows to 180).
    await db.runAsync(
      `UPDATE tasks SET expiry_duration_days = 270 WHERE id IN ('task_pharmacy_kit', 'task_go_bag')`,
    );
    await db.runAsync(`UPDATE tasks SET expiry_duration_days = 90 WHERE id = 'task_stockpile'`);
  }
  if (!existing.has('completed_at')) {
    await db.runAsync(`ALTER TABLE tasks ADD COLUMN completed_at TEXT`);
  }
  if (!existing.has('expires_at')) {
    await db.runAsync(`ALTER TABLE tasks ADD COLUMN expires_at TEXT`);
  }
}
