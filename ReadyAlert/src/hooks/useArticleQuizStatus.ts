import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

export function useArticleQuizStatus(questionIds: readonly string[]) {
  const db = useSQLiteContext();
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (questionIds.length === 0) return;
    const placeholders = questionIds.map(() => '?').join(',');
    const rows = await db.getAllAsync<{ id: string; checked: number }>(
      `SELECT id, checked FROM checklist_items WHERE id IN (${placeholders})`,
      questionIds as string[],
    );
    const map: Record<string, boolean> = {};
    for (const row of rows) {
      map[row.id] = row.checked === 1;
    }
    setCheckedMap(map);
  }, [db, questionIds]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await load();
      } catch (err) {
        console.error('[useArticleQuizStatus] load error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const markAnswered = useCallback(
    async (questionId: string) => {
      await db.runAsync(`UPDATE checklist_items SET checked = 1 WHERE id = ?`, [questionId]);
      setCheckedMap((prev) => ({ ...prev, [questionId]: true }));
    },
    [db],
  );

  const reload = useCallback(async () => {
    await load();
  }, [load]);

  const isAnswered = useCallback((id: string) => checkedMap[id] === true, [checkedMap]);
  const isComplete =
    questionIds.length > 0 && questionIds.every((id) => checkedMap[id] === true);

  return { loading, isAnswered, isComplete, markAnswered, reload };
}
