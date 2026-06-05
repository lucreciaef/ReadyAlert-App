/**
 * PreparednessContext
 *
 * Computes and caches the user's overall "Preparedness Level" by aggregating
 * the completion score of every task stored in the local SQLite database.
 */

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

export interface TaskScore {
  taskId: string;
  title: string;
  checkedCount: number;
  totalCount: number;
  /** 0–100 */
  score: number;
}

export interface PreparednessLevel {
  score: number;
  label: string;
  color: string;
  taskScores: TaskScore[];
}

interface PreparednessContextType {
  preparedness: PreparednessLevel;
  refresh: () => Promise<void>; // call after any checklist save to re-compute the score
  loading: boolean;
}

function getLevelInfo(score: number): { label: string; color: string } {
  if (score === 0) return { label: 'Not Started', color: '#9CA3AF' };
  if (score <= 25) return { label: 'Unprepared', color: '#EF4444' };
  if (score <= 50) return { label: 'Getting Ready', color: '#F97316' };
  if (score <= 75) return { label: 'Prepared', color: '#F59E0B' };
  if (score < 100) return { label: 'Well Prepared', color: '#3B82F6' };
  return { label: 'Fully Prepared', color: '#22C55E' };
}

const defaultPreparedness: PreparednessLevel = {
  score: 0,
  label: 'Not Started',
  color: '#9CA3AF',
  taskScores: [],
};

const PreparednessContext = createContext<PreparednessContextType>({
  preparedness: defaultPreparedness,
  refresh: async () => {},
  loading: true,
});

export function PreparednessProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const [preparedness, setPreparedness] = useState<PreparednessLevel>(defaultPreparedness);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const tasks = await db.getAllAsync<{ id: string; title: string }>(
        'SELECT id, title FROM tasks ORDER BY sort_order',
      );

      if (tasks.length === 0) {
        setPreparedness(defaultPreparedness);
        return;
      }

      const taskScores: TaskScore[] = [];

      for (const task of tasks) {
        const result = await db.getFirstAsync<{ total: number; checked: number }>(
          `SELECT COUNT(*) AS total, COALESCE(SUM(checked), 0) AS checked
           FROM checklist_items WHERE task_id = ?`,
          [task.id],
        );
        const total = result?.total ?? 0;
        const checked = result?.checked ?? 0;
        const score = total > 0 ? (checked / total) * 100 : 0;
        taskScores.push({ taskId: task.id, title: task.title, checkedCount: checked, totalCount: total, score });
      }

      const overallScore =
        taskScores.reduce((sum, t) => sum + t.score, 0) / taskScores.length;
      const rounded = Math.round(overallScore * 10) / 10;
      const { label, color } = getLevelInfo(Math.round(overallScore));

      setPreparedness({ score: rounded, label, color, taskScores });
    } catch (err) {
      console.error('[PreparednessContext] refresh error:', err);
    } finally {
      setLoading(false);
    }
  }, [db]);

  // Load on mount (DB is guaranteed ready because SQLiteProvider ran onInit first)
  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <PreparednessContext.Provider value={{ preparedness, refresh, loading }}>
      {children}
    </PreparednessContext.Provider>
  );
}

export function usePreparedness() {
  return useContext(PreparednessContext);
}

