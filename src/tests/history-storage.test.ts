import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { vi } from 'vitest';
import {
  LocalStorageHistoryStorage,
  createRecord,
} from '@/core/storage/history-storage';
import { StorageError } from '@/core/storage/types';
import { calculateAbjad, DEFAULT_CALCULATION_CONFIG } from '@/core/abjad';
import type { HistoryRecord } from '@/types';

const STORAGE_KEY = 'abjad:history';

class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }

  seed(key: string, value: string): void {
    this.store.set(key, value);
  }
}

class ThrowingStorage extends MemoryStorage {
  override setItem(): void {
    throw new Error('Quota dépassé');
  }
}

function makeRecord(source: HistoryRecord['source'] = 'manual'): HistoryRecord {
  const result = calculateAbjad({ text: 'الله', config: DEFAULT_CALCULATION_CONFIG });
  return createRecord({
    title: 'الله',
    result,
    calculationConfig: DEFAULT_CALCULATION_CONFIG,
    source,
  });
}

describe('createRecord', () => {
  it('construit un enregistrement cohérent', () => {
    const record = makeRecord('ocr');
    expect(record.id.length).toBeGreaterThan(0);
    expect(record.favorite).toBe(false);
    expect(record.tags).toEqual([]);
    expect(record.source).toBe('ocr');
    expect(record.createdAt).toBe(record.updatedAt);
    expect(record.result.totalValue).toBe(66);
  });
});

describe('LocalStorageHistoryStorage', () => {
  let storage: MemoryStorage;

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    vi.useRealTimers();
    storage = new MemoryStorage();
    vi.stubGlobal('localStorage', storage);
  });

  it('sauvegarde et relit un enregistrement', async () => {
    const repository = new LocalStorageHistoryStorage();
    const record = makeRecord();
    await repository.save(record);
    const all = await repository.getAll();
    expect(all).toHaveLength(1);
    expect(all[0]).toEqual(record);
  });

  it('retrouve par identifiant', async () => {
    const repository = new LocalStorageHistoryStorage();
    const record = makeRecord();
    await repository.save(record);
    await expect(repository.getById(record.id)).resolves.toEqual(record);
    await expect(repository.getById('inconnu')).resolves.toBeNull();
  });

  it('met à jour un enregistrement existant', async () => {
    const repository = new LocalStorageHistoryStorage();
    const record = makeRecord();
    await repository.save(record);
    const updated = { ...record, favorite: true };
    await repository.update(updated);
    const all = await repository.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].favorite).toBe(true);
  });

  it('rejette la mise à jour d’un enregistrement absent', async () => {
    const repository = new LocalStorageHistoryStorage();
    await expect(repository.update(makeRecord())).rejects.toBeInstanceOf(StorageError);
  });

  it('supprime un enregistrement', async () => {
    const repository = new LocalStorageHistoryStorage();
    const a = makeRecord();
    const b = makeRecord();
    await repository.save(a);
    await repository.save(b);
    await repository.delete(a.id);
    const all = await repository.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe(b.id);
  });

  it('retourne une liste vide si rien n’est stocké', async () => {
    const repository = new LocalStorageHistoryStorage();
    await expect(repository.getAll()).resolves.toEqual([]);
  });

  it('retourne une liste vide si la donnée n’est pas un tableau', async () => {
    storage.seed(STORAGE_KEY, JSON.stringify({ id: 'x' }));
    const repository = new LocalStorageHistoryStorage();
    await expect(repository.getAll()).resolves.toEqual([]);
  });

  it('filtre les entrées invalides du tableau stocké', async () => {
    const valid = makeRecord();
    storage.seed(
      STORAGE_KEY,
      JSON.stringify([{ bruit: true }, valid, { id: 42 }])
    );
    const repository = new LocalStorageHistoryStorage();
    const all = await repository.getAll();
    expect(all).toEqual([valid]);
  });

  it('lève StorageError sur des données JSON corrompues', async () => {
    storage.seed(STORAGE_KEY, '{pas du json');
    const repository = new LocalStorageHistoryStorage();
    await expect(repository.getAll()).rejects.toBeInstanceOf(StorageError);
  });

  it('lève StorageError si l’écriture échoue', async () => {
    vi.stubGlobal('localStorage', new ThrowingStorage());
    const repository = new LocalStorageHistoryStorage();
    await expect(repository.save(makeRecord())).rejects.toBeInstanceOf(StorageError);
  });
});