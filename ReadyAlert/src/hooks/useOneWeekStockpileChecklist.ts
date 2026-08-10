/**
 * Hook that manages the One-Week Food Stockpile checklist backed by a local SQLite database.
 */

import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import type { ChecklistItem } from './usePharmacyChecklist';

export const STOCKPILE_ITEMS_SEED: Omit<ChecklistItem, 'checked'>[] = [
  // Water & drinks
  { id: 'stk_01', name: 'Water (1.5 L bottles)', group: 'Water & drinks', quantity: '24 bottles' },
  { id: 'stk_02', name: 'Fruit or vegetable juice', group: 'Water & drinks', quantity: '6 packs (1 L)' },

  // Fruit & vegetables
  { id: 'stk_03', name: 'Fruit purée or preserved fruit (low sugar)', group: 'Fruit & vegetables', quantity: '6 cans/jars' },
  { id: 'stk_04', name: 'Dried fruit or vegetables', group: 'Fruit & vegetables', quantity: '3 packs (200 g)' },
  { id: 'stk_05', name: 'Vegetables — canned or jarred (peas, corn, tomatoes…)', group: 'Fruit & vegetables', quantity: '23 cans/jars' },

  // Carbohydrates
  { id: 'stk_06', name: 'Long-life bread, crispbread or Pumpernickel', group: 'Carbohydrates', quantity: '8 packs (450 g)' },
  { id: 'stk_07', name: 'Muesli, porridge or cereal flakes', group: 'Carbohydrates', quantity: '3 packs (500 g)' },
  { id: 'stk_08', name: 'Pasta, dried (spaghetti, penne…)', group: 'Carbohydrates', quantity: '1 kg' },
  { id: 'stk_09', name: 'Rice, couscous or dried grains', group: 'Carbohydrates', quantity: '2 packs (500 g)' },
  { id: 'stk_10', name: 'Potatoes, raw — store cool, dry and dark', group: 'Carbohydrates', quantity: '2 kg' },
  { id: 'stk_11', name: 'OR: Preserved potatoes — jarred/canned', group: 'Carbohydrates', quantity: '3 jars (500 g)' },
  { id: 'stk_12', name: 'OR: Instant mashed potato flakes', group: 'Carbohydrates', quantity: '1 pack (240 g)' },

  // Legumes & protein
  { id: 'stk_13', name: 'Legumes — canned/jarred (lentils, chickpeas, beans…)', group: 'Legumes & protein', quantity: '8 cans (400 g)' },
  { id: 'stk_14', name: 'OR: Legumes, dried', group: 'Legumes & protein', quantity: '2 packs (500 g)' },

  // Meat & fish
  { id: 'stk_15', name: 'Fish, canned (tuna, sardines, mackerel)', group: 'Meat & fish', quantity: '7 cans (100 g)' },
  { id: 'stk_16', name: 'Ready meals with meat, canned (goulash, chilli…)', group: 'Meat & fish', quantity: '10 cans (400 g)' },
  { id: 'stk_17', name: 'OR: Preserved sausages — jarred/canned (also vegetarian)', group: 'Meat & fish', quantity: '4 jars (300 g)' },
  { id: 'stk_18', name: 'OR: Meat spreads, canned (liver, smoked meat…)', group: 'Meat & fish', quantity: '7 cans (150 g)' },

  // Dairy & fats
  { id: 'stk_19', name: 'UHT milk (regular or lactose-free)', group: 'Dairy & fats', quantity: '10 packs (1 L)' },
  { id: 'stk_20', name: 'OR: Plant-based drink (soy, oat, almond, rice…)', group: 'Dairy & fats', quantity: '10 packs (1 L)' },
  { id: 'stk_21', name: 'Cooking oil (rapeseed, olive, sunflower…)', group: 'Dairy & fats', quantity: '1 bottle (0.5 L)' },
  { id: 'stk_22', name: 'Nuts or seeds (walnuts, almonds, pumpkin seeds…)', group: 'Dairy & fats', quantity: '2 packs (200 g)' },
];

type DbRow = {
  id: string;
  name: string;
  group_name: string;
  quantity: string | null;
  checked: number;
};

export function useOneWeekStockpileChecklist() {
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
           WHERE task_id = 'task_stockpile'
           ORDER BY sort_order`,
        );

        const seedOrder = STOCKPILE_ITEMS_SEED.map((s) => s.id);
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
        console.error('[useOneWeekStockpileChecklist] load error:', err);
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
      console.error('[useOneWeekStockpileChecklist] save error:', err);
    } finally {
      setSaving(false);
    }
  }, [db, items]);

  const checkedCount = items.filter((i) => i.checked).length;
  const totalCount = items.length;

  return { items, loading, saving, saved, checkedCount, totalCount, toggleItem, saveChecklist };
}
