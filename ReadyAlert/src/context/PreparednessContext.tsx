/**
 * PreparednessContext
 *
 * Scoring model:
 *   - Each task in the DB corresponds to one LearningCentreCard.
 *   - Every task carries equal weight: taskWeight = 100 / totalTasks.
 *   - A task's contribution = (checkedItems / totalItems) * taskWeight.
 *   - Overall score = sum of contributions (0 – 100).
 *
 * Example with 2 tasks:
 *   taskWeight = 50 each.
 *   Pharmacy kit 10/19 done -> contributes 10/19 * 50 = aprox 26.3 pts
 *   Weather tips 0/1 done -> contributes 0.
 *   Overall = aprox 26.3 / 100
 */

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { getThemeColours } from '../styles/themeColours';

export interface TaskScore {
  taskId: string;
  title: string;
  checkedCount: number;
  totalCount: number;
  score: number;
  contribution: number;
  weight: number;
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

function getLevelInfo(score: number, isDark: boolean): { label: string; color: string } {
  const c = getThemeColours(isDark);
  if (score === 0) return { label: 'Not Started', color: c.textMuted };
  if (score <= 25) return { label: 'Unprepared', color: c.error };
  if (score <= 50) return { label: 'Getting Ready', color: c.warning };
  if (score <= 75) return { label: 'Prepared', color: c.warning };
  if (score < 100) return { label: 'Well Prepared', color: c.info };
  return { label: 'Fully Prepared', color: c.success };
}

const defaultPreparedness: PreparednessLevel = {
  score: 0,
  label: 'Not Started',
  color: getThemeColours(false).textMuted,
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

      const taskWeight = 100 / tasks.length;
      const taskScores: TaskScore[] = [];

      for (const task of tasks) {
        const result = await db.getFirstAsync<{ total: number; checked: number }>(
          `SELECT COUNT(*) AS total, COALESCE(SUM(checked), 0) AS checked
           FROM checklist_items WHERE task_id = ?`,
          [task.id],
        );
        const total = result?.total ?? 0;
        const checked = result?.checked ?? 0;
        const completionRatio = total > 0 ? checked / total : 0;
        const score = completionRatio * 100;
        const contribution = completionRatio * taskWeight;
        taskScores.push({
          taskId: task.id,
          title: task.title,
          checkedCount: checked,
          totalCount: total,
          score,
          contribution,
          weight: taskWeight,
        });
      }

      const overallScore = taskScores.reduce((sum, t) => sum + t.contribution, 0);

      const rounded = Math.round(overallScore * 10) / 10;
      const { label, color } = getLevelInfo(Math.round(overallScore), false);

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
