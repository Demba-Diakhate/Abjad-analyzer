import { describe, it, expect } from 'vitest';
import { reduceValue, toSmallAbjad } from '@/core/abjad';

describe('Réduction théosophique', () => {
  it('réduit 786 à 3', () => {
    expect(reduceValue(786)).toBe(3);
  });

  it('réduit 21 à 3', () => {
    expect(reduceValue(21)).toBe(3);
  });

  it('renvoie 0 pour zéro', () => {
    expect(reduceValue(0)).toBe(0);
  });

  it('renvoie la valeur si < 10', () => {
    expect(reduceValue(7)).toBe(7);
  });

  it('réduit une valeur à un seul chiffre', () => {
    for (let i = 0; i < 2000; i++) {
      const r = reduceValue(i);
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThan(10);
    }
  });
});

describe('Petit Abjad', () => {
  it('ramène ك (20) à 2', () => {
    expect(toSmallAbjad(20)).toBe(2);
  });

  it('ramène ق (100) à 1', () => {
    expect(toSmallAbjad(100)).toBe(1);
  });

  it('ramène غ (1000) à 1', () => {
    expect(toSmallAbjad(1000)).toBe(1);
  });

  it('conserve 30 → 3', () => {
    expect(toSmallAbjad(30)).toBe(3);
  });

  it('conserve 5 → 5', () => {
    expect(toSmallAbjad(5)).toBe(5);
  });
});
