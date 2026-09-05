import type { HistoryRecord } from '@/types';

export interface HistoryStorage {
  getAll(): Promise<HistoryRecord[]>;
  getById(id: string): Promise<HistoryRecord | null>;
  save(record: HistoryRecord): Promise<void>;
  update(record: HistoryRecord): Promise<void>;
  delete(id: string): Promise<void>;
}

export class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'STORAGE_ERROR';
  }
}