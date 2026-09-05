import type { AbjadResult, CalculationConfig, HistoryRecord, HistorySource } from '@/types';
import { StorageError, type HistoryStorage } from './types';

const STORAGE_KEY = 'abjad:history';

function isRecord(value: unknown): value is HistoryRecord {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Partial<HistoryRecord>;
  return (
    typeof record.id === 'string' &&
    typeof record.title === 'string' &&
    typeof record.createdAt === 'string' &&
    Array.isArray(record.tags) &&
    typeof record.favorite === 'boolean' &&
    record.result !== undefined &&
    typeof record.result === 'object' &&
    typeof (record.result as AbjadResult).totalValue === 'number'
  );
}

export class LocalStorageHistoryStorage implements HistoryStorage {
  async getAll(): Promise<HistoryRecord[]> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(isRecord);
    } catch {
      throw new StorageError('Impossible de lire l’historique local.');
    }
  }

  async getById(id: string): Promise<HistoryRecord | null> {
    const all = await this.getAll();
    return all.find((record) => record.id === id) ?? null;
  }

  async save(record: HistoryRecord): Promise<void> {
    const all = await this.getAll();
    all.push(record);
    await this.write(all);
  }

  async update(record: HistoryRecord): Promise<void> {
    const all = await this.getAll();
    const index = all.findIndex((r) => r.id === record.id);
    if (index === -1) {
      throw new StorageError('Analyse introuvable dans l’historique.');
    }
    all[index] = record;
    await this.write(all);
  }

  async delete(id: string): Promise<void> {
    const all = await this.getAll();
    await this.write(all.filter((record) => record.id !== id));
  }

  private async write(records: HistoryRecord[]): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch {
      throw new StorageError('Impossible d’écrire dans le stockage local.');
    }
  }
}

export const historyStorage = new LocalStorageHistoryStorage();

export function createRecord(input: {
  title: string;
  result: AbjadResult;
  calculationConfig: CalculationConfig;
  source: HistorySource;
  tags?: string[];
}): HistoryRecord {
  const now = new Date().toISOString();
  return {
    id: typeof crypto !== 'undefined' ? crypto.randomUUID() : `${Date.now()}`,
    title: input.title,
    result: input.result,
    createdAt: now,
    updatedAt: now,
    tags: input.tags ?? [],
    favorite: false,
    source: input.source,
    calculationConfig: input.calculationConfig,
  };
}