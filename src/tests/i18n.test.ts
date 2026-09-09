import { describe, expect, it } from 'vitest';
import { fr } from '@/i18n/fr';
import { ar } from '@/i18n/ar';
import { wo } from '@/i18n/wo';
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

describe('i18n — parité FR/AR/WO', () => {
  it('expose les trois dictionnaires typés', () => {
    expect(dictionaries.fr).toBe(fr);
    expect(dictionaries.ar).toBe(ar);
    expect(dictionaries.wo).toBe(wo);
  });

  it('ar et wo partagent exactement les mêmes clés que fr', () => {
    const frKeys = flattenLeafs(fr)
      .map((leaf) => leaf.path)
      .sort();
    const arKeys = flattenLeafs(ar)
      .map((leaf) => leaf.path)
      .sort();
    const woKeys = flattenLeafs(wo)
      .map((leaf) => leaf.path)
      .sort();
    expect(arKeys).toEqual(frKeys);
    expect(woKeys).toEqual(frKeys);
  });

  it('toutes les chaînes sont non vides dans les trois langues', () => {
    for (const leaf of flattenLeafs(fr)) {
      expect(leaf.text.trim().length, `fr:${leaf.path}`).toBeGreaterThan(0);
    }
    for (const leaf of flattenLeafs(ar)) {
      expect(leaf.text.trim().length, `ar:${leaf.path}`).toBeGreaterThan(0);
    }
    for (const leaf of flattenLeafs(wo)) {
      expect(leaf.text.trim().length, `wo:${leaf.path}`).toBeGreaterThan(0);
    }
  });

  it('gère les variables de substitution correctement', () => {
    expect(fr.history.items).toContain('{count}');
    expect(ar.history.items).toContain('{count}');
    expect(wo.history.items).toContain('{count}');
    expect(fr.home.charCount).toContain('{count}');
    expect(ar.home.charCount).toContain('{count}');
    expect(wo.home.charCount).toContain('{count}');
  });
});

describe('i18n — isLanguage', () => {
  it('accepte fr, ar et wo', () => {
    expect(isLanguage('fr')).toBe(true);
    expect(isLanguage('ar')).toBe(true);
    expect(isLanguage('wo')).toBe(true);
  });

  it('rejette les autres valeurs', () => {
    expect(isLanguage('en')).toBe(false);
    expect(isLanguage('')).toBe(false);
    expect(isLanguage(undefined)).toBe(false);
    expect(isLanguage(null)).toBe(false);
  });
});