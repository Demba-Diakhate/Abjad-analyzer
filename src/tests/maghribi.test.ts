import { describe, expect, it } from 'vitest';
import { calculateAbjad, getAbjadValue } from '@/core/abjad';
import { DEFAULT_CALCULATION_CONFIG } from '@/core/abjad';
import type { CalculationConfig } from '@/types';

function config(overrides: Partial<CalculationConfig> = {}): CalculationConfig {
  return { ...DEFAULT_CALCULATION_CONFIG, ...overrides };
}

const DIFFS: Array<[string, number, number]> = [
  ['س', 60, 300],
  ['ص', 90, 60],
  ['ش', 300, 1000],
  ['ض', 800, 90],
  ['ظ', 900, 800],
  ['غ', 1000, 900],
];

describe('Système Maghribi — valeurs des 6 lettres modifiées', () => {
  it.each(DIFFS)(
    'la lettre %s vaut %d en Mashriqi et %d en Maghribi',
    (letter, mashriqi, maghribi) => {
      expect(getAbjadValue(letter, 'mashriqi')).toBe(mashriqi);
      expect(getAbjadValue(letter, 'maghribi')).toBe(maghribi);
    }
  );
});

describe('Système Maghribi — calcul', () => {
  it('sélectionne la table via la configuration', () => {
    expect(calculateAbjad({ text: 'سلم', config: config() }).totalValue).toBe(130);
    expect(
      calculateAbjad({ text: 'سلم', config: config({ system: 'maghribi' }) }).totalValue
    ).toBe(370);
  });

  it('retranscrit la valeur Maghribi dans la décomposition', () => {
    const result = calculateAbjad({
      text: 'سلم',
      config: config({ system: 'maghribi' }),
    });
    expect(result.breakdown.map((b) => b.value)).toEqual([300, 30, 40]);
  });

  it('laisse inchangée la réduction théosophique du choix du système', () => {
    const mashriqi = calculateAbjad({
      text: 'سلم',
      config: config({ reduction: true }),
    });
    const maghribi = calculateAbjad({
      text: 'سلم',
      config: config({ system: 'maghribi', reduction: true }),
    });
    expect(mashriqi.totalValue).toBe(130);
    expect(maghribi.totalValue).toBe(370);
    expect(maghribi.reducedValue).toBe(1);
  });

  it('le mode phonétique reste cohérent avec le système choisi', () => {
    const result = calculateAbjad({
      text: 'بِّ',
      config: config({ system: 'maghribi', phoneticMode: true }),
    });
    expect(result.totalValue).toBe(4);
  });
});