/**
 * Hook that manages the Emergency Go-Bag checklist backed by a local SQLite database.
 */

import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import type { ChecklistItem } from './usePharmacyChecklist';

// Canonical list of go-bag items
export const GO_BAG_ITEMS_SEED: Omit<ChecklistItem, 'checked'>[] = [
  // Clothing & shelter
  { id: 'gob_01', name: 'Jacket and raincoat', group: 'Clothing & shelter', quantity: null },
  { id: 'gob_02', name: 'Wool blanket / sleeping bag', group: 'Clothing & shelter', quantity: null },
  {
    id: 'gob_03',
    name: 'Hard-wearing, warm clothing',
    group: 'Clothing & shelter',
    quantity: null,
  },
  { id: 'gob_04', name: 'Underwear / socks', group: 'Clothing & shelter', quantity: null },
  {
    id: 'gob_05',
    name: 'Wellington boots, hiking shoes',
    group: 'Clothing & shelter',
    quantity: null,
  },
  { id: 'gob_06', name: 'Head covering', group: 'Clothing & shelter', quantity: null },
  { id: 'gob_07', name: 'Work gloves', group: 'Clothing & shelter', quantity: null },
  { id: 'gob_08', name: 'Protective face mask', group: 'Clothing & shelter', quantity: null },

  // Food, water & tools
  { id: 'gob_09', name: 'Crockery / cutlery', group: 'Food, water & tools', quantity: null },
  { id: 'gob_10', name: 'Thermos flask, cup', group: 'Food, water & tools', quantity: null },
  { id: 'gob_11', name: 'Can opener', group: 'Food, water & tools', quantity: null },
  { id: 'gob_12', name: 'Pocket knife', group: 'Food, water & tools', quantity: null },
  { id: 'gob_13', name: 'Torch (flashlight)', group: 'Food, water & tools', quantity: null },

  // Health & documents
  { id: 'gob_14', name: 'Personal medication', group: 'Health & documents', quantity: null },
  {
    id: 'gob_15',
    name: 'Materials for wound care',
    group: 'Health & documents',
    quantity: null,
  },
  {
    id: 'gob_16',
    name: 'Document folder with important documents',
    group: 'Health & documents',
    quantity: null,
  },
  { id: 'gob_17', name: 'Take pets with you', group: 'Health & documents', quantity: null },
];

type DbRow = {
  id: string;
  name: string;
  group_name: string;
  quantity: string | null;
  checked: number;
};

export function useGoBagChecklist() {
  // db is guaranteed to be fully initialised by SQLiteProvider before this hook runs
  const db = useSQLiteContext();

  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // True after a successful save; resets to false when the user toggles any item
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const rows = await db.getAllAsync<DbRow>(
          `SELECT id, name, group_name, quantity, checked
           FROM checklist_items
           WHERE task_id = 'task_go_bag'
           ORDER BY sort_order`,
        );

        const seedOrder = GO_BAG_ITEMS_SEED.map((s) => s.id);
        const rowMap = new Map(rows.map((r) => [r.id, r]));
        const ordered = seedOrder.map((id) => rowMap.get(id)).filter((r): r is DbRow => !!r);

        if (!cancelled) {
          setItems(
            ordered.map((r) => ({
              id: r.id,
              name: r.name,
              group: r.group_name,
              quantity: r.quantity,
              checked: r.checked === 1,
            })),
          );
        }
      } catch (err) {
        console.error('[useGoBagChecklist] load error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [db]);

  const toggleItem = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)),
    );
    setSaved(false);
  }, []);

  const saveChecklist = useCallback(async () => {
    setSaving(true);
    try {
      await db.withTransactionAsync(async () => {
        for (const item of items) {
          await db.runAsync('UPDATE checklist_items SET checked = ? WHERE id = ?', [
            item.checked ? 1 : 0,
            item.id,
          ]);
        }
      });
      setSaved(true);
    } catch (err) {
      console.error('[useGoBagChecklist] save error:', err);
    } finally {
      setSaving(false);
    }
  }, [db, items]);

  const checkedCount = items.filter((i) => i.checked).length;
  const totalCount = items.length;

  return { items, loading, saving, saved, checkedCount, totalCount, toggleItem, saveChecklist };
}
