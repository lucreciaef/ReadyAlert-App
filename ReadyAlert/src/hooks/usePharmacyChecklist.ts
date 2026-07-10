/**
 * Hook that manages the Home Pharmacy Kit checklist backed by a local SQLite database.
 */

import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

export interface ChecklistItem {
  id: string;
  name: string;
  group: string;
  quantity: string | null;
  checked: boolean;
}

// Canonical list of pharmacy kit items
export const PHARMACY_ITEMS_SEED: Omit<ChecklistItem, 'checked'>[] = [
  // Medicines
  { id: 'med_01', name: 'Pain-relieving tablets or powder', group: 'Medicines', quantity: null },
  {
    id: 'med_02',
    name: 'Disinfectant for skin and wound disinfection',
    group: 'Medicines',
    quantity: null,
  },
  { id: 'med_03', name: 'Tablets for diarrhoea', group: 'Medicines', quantity: null },
  { id: 'med_04', name: 'Tablets for sore throat', group: 'Medicines', quantity: null },
  { id: 'med_05', name: 'Laxatives', group: 'Medicines', quantity: null },
  { id: 'med_06', name: 'Hydrogen peroxide 3%', group: 'Medicines', quantity: null },
  { id: 'med_07', name: 'Alcohol 70%', group: 'Medicines', quantity: null },
  {
    id: 'med_08',
    name: 'Wound cleansing solvent / wound benzine',
    group: 'Medicines',
    quantity: null,
  },
  { id: 'med_09', name: 'Wound and healing ointment', group: 'Medicines', quantity: null },

  // Other items
  { id: 'oth_01', name: 'Fever thermometer', group: 'Other items', quantity: null },
  { id: 'oth_02', name: 'Blunt bandage scissors', group: 'Other items', quantity: null },
  { id: 'oth_03', name: 'Tweezers', group: 'Other items', quantity: null },
  { id: 'oth_04', name: 'Leather finger cot', group: 'Other items', quantity: null },

  // First-aid dressing packs
  {
    id: 'fad_01',
    name: 'Dressing pack, size M (medium), sterile, non-adherent to the wound',
    group: 'First-aid dressing packs',
    quantity: '2',
  },
  {
    id: 'fad_02',
    name: 'Dressing pack, size G (large), sterile, non-adherent to the wound',
    group: 'First-aid dressing packs',
    quantity: '2',
  },
  {
    id: 'fad_03',
    name: 'Alumed wound dressing, 10 cm × 10 cm, individually packed, sterile',
    group: 'First-aid dressing packs',
    quantity: '6',
  },
  {
    id: 'fad_04',
    name: 'Quick adhesive dressing, standard, 6 cm × 10 cm',
    group: 'First-aid dressing packs',
    quantity: '6',
  },
  {
    id: 'fad_05',
    name: 'Plaster strips with wound pad, 1.9 cm × 6 cm, individually packed',
    group: 'First-aid dressing packs',
    quantity: '20',
  },
  {
    id: 'fad_06',
    name: 'Elastic gauze bandage, 6 cm × 4 m, individually packed, standard packaging',
    group: 'First-aid dressing packs',
    quantity: '2',
  },
  {
    id: 'fad_07',
    name: 'Elastic gauze bandage, 8 cm × 4 m, individually packed, standard packaging',
    group: 'First-aid dressing packs',
    quantity: '2',
  },
  {
    id: 'fad_08',
    name: 'Elastic gauze bandage, 10 cm × 4 m, individually packed, standard packaging',
    group: 'First-aid dressing packs',
    quantity: '2',
  },
  {
    id: 'fad_09',
    name: 'Elastic self-adhesive fixing bandage, 8 cm × 4 m',
    group: 'First-aid dressing packs',
    quantity: '1',
  },
  {
    id: 'fad_10',
    name: 'Hygon finger bandage + clips',
    group: 'First-aid dressing packs',
    quantity: '2',
  },
  {
    id: 'fad_11',
    name: 'Leather finger cots, assorted sizes',
    group: 'First-aid dressing packs',
    quantity: '2',
  },
  {
    id: 'fad_12',
    name: 'Adhesive tape on roll with protective cover, 2.5 cm × 5 m',
    group: 'First-aid dressing packs',
    quantity: '1',
  },
  {
    id: 'fad_13',
    name: 'Metallised dressing cloth, 40 cm × 60 cm, sterile',
    group: 'First-aid dressing packs',
    quantity: '1',
  },
  {
    id: 'fad_14',
    name: 'Triangular bandage, according to ÖNORM K 2122',
    group: 'First-aid dressing packs',
    quantity: '2',
  },
  {
    id: 'fad_15',
    name: 'First-aid scissors, according to ÖNORM K 2121',
    group: 'First-aid dressing packs',
    quantity: '1',
  },
  {
    id: 'fad_16',
    name: 'Stainless splinter tweezers — Feilchenfeld',
    group: 'First-aid dressing packs',
    quantity: '1',
  },
  {
    id: 'fad_17',
    name: 'Protective gloves, large, made of latex',
    group: 'First-aid dressing packs',
    quantity: '6',
  },
  {
    id: 'fad_18',
    name: 'Aluminium emergency blanket, 160 cm × 220 cm',
    group: 'First-aid dressing packs',
    quantity: '1',
  },
  { id: 'fad_19', name: 'Resuscitation aid', group: 'First-aid dressing packs', quantity: '1' },
];

type DbRow = {
  id: string;
  name: string;
  group_name: string;
  quantity: string | null;
  checked: number;
};

export function usePharmacyChecklist() {
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
           WHERE task_id = 'task_pharmacy_kit'
           ORDER BY sort_order`,
        );

        const seedOrder = PHARMACY_ITEMS_SEED.map((s) => s.id);
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
        console.error('[usePharmacyChecklist] load error:', err);
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
      console.error('[usePharmacyChecklist] save error:', err);
    } finally {
      setSaving(false);
    }
  }, [db, items]);

  const checkedCount = items.filter((i) => i.checked).length;
  const totalCount = items.length;

  return { items, loading, saving, saved, checkedCount, totalCount, toggleItem, saveChecklist };
}
