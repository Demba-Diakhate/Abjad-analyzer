import { describe, expect, it } from 'vitest';
import { fr } from '@/i18n/fr';
import { ar } from '@/i18n/ar';
import { dictionaries, isLanguage } from '@/i18n';

function flattenLeafs(
  value: unknown,
  prefix = ''
): Array<{ path: string; text: string }> {
  if (typeof value === 'string') return [{ path: prefix, text: value }];
  if (value === null || typeof value !== 'object') return [];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
    flattenLeafs(child, prefix ? `${prefix}.${key}` : key)
  );
}

describe('i18n — parité FR/AR', () => {
  it('expose les deux dictionnaires typés', () => {
    expect(dictionaries.fr).toBe(fr);
    expect(dictionaries.ar).toBe(ar);
  });

  it('fr et ar partagent exactement les mêmes clés', () => {
    const frKeys = flattenLeafs(fr)
      .map((leaf) => leaf.path)
      .sort();
    const arKeys = flattenLeafs(ar)
      .map((leaf) => leaf.path)
      .sort();
    expect(arKeys).toEqual(frKeys);
  });

  it('toutes les chaînes sont non vides dans les deux langues', () => {
    for (const leaf of flattenLeafs(fr)) {
      expect(leaf.text.trim().length, `fr:${leaf.path}`).toBeGreaterThan(0);
    }
    for (const leaf of flattenLeafs(ar)) {
      expect(leaf.text.trim().length, `ar:${leaf.path}`).toBeGreaterThan(0);
    }
  });

  it('gère les variables de substitution correctement', () => {
    expect(fr.history.items).toContain('{count}');
    expect(ar.history.items).toContain('{count}');
    expect(fr.home.charCount).toContain('{count}');
    expect(ar.home.charCount).toContain('{count}');
  });
});

describe('i18n — isLanguage', () => {
  it('accepte fr et ar', () => {
    expect(isLanguage('fr')).toBe(true);
    expect(isLanguage('ar')).toBe(true);
  });

  it('rejette les autres valeurs', () => {
    expect(isLanguage('en')).toBe(false);
    expect(isLanguage('')).toBe(false);
    expect(isLanguage(undefined)).toBe(false);
    expect(isLanguage(null)).toBe(false);
  });
});