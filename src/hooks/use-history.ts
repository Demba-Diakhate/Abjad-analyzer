'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { historyStorage } from '@/core/storage/history-storage';
import type { HistoryRecord, HistorySource } from '@/types';

export type HistoryFilter = 'all' | 'favorites' | 'ocr' | 'manual' | 'camera';

export function useHistory() {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<HistoryFilter>('all');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const all = await historyStorage.getAll();
        if (cancelled) return;
        const sorted = [...all].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setRecords(sorted);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Erreur de stockage.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const addRecord = useCallback(
    async (input: {
      title: string;
      result: HistoryRecord['result'];
      calculationConfig: HistoryRecord['calculationConfig'];
      source: HistorySource;
    }) => {
      const now = new Date().toISOString();
      const record: HistoryRecord = {
        id:
          typeof crypto !== 'undefined' ? crypto.randomUUID() : `${Date.now()}`,
        title: input.title,
        result: input.result,
        createdAt: now,
        updatedAt: now,
        tags: [],
        favorite: false,
        source: input.source,
        calculationConfig: input.calculationConfig,
      };
      await historyStorage.save(record);
      setRecords((prev) => [record, ...prev]);
    },
    []
  );

  const remove = useCallback(async (id: string) => {
    await historyStorage.delete(id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const toggleFavorite = useCallback(async (id: string) => {
    const record = await historyStorage.getById(id);
    if (!record) return;
    const updated = { ...record, favorite: !record.favorite, updatedAt: new Date().toISOString() };
    await historyStorage.update(updated);
    setRecords((prev) => prev.map((r) => (r.id === id ? updated : r)));
  }, []);

  const updateTags = useCallback(async (id: string, tags: string[]) => {
    const record = await historyStorage.getById(id);
    if (!record) return;
    const updated = { ...record, tags, updatedAt: new Date().toISOString() };
    await historyStorage.update(updated);
    setRecords((prev) => prev.map((r) => (r.id === id ? updated : r)));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return records.filter((record) => {
      if (filter === 'favorites' && !record.favorite) return false;
      if (filter !== 'all' && filter !== 'favorites' && record.source !== filter) {
        return false;
      }
      if (!q) return true;
      return (
        record.title.toLowerCase().includes(q) ||
        record.result.originalText.toLowerCase().includes(q) ||
        String(record.result.totalValue).includes(q) ||
        record.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    });
  }, [records, query, filter]);

  return {
    records,
    loading,
    error,
    query,
    setQuery,
    filter,
    setFilter,
    filtered,
    addRecord,
    remove,
    toggleFavorite,
    updateTags,
  };
}