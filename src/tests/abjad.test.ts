import { describe, it, expect } from 'vitest';
import { calculateAbjad, DEFAULT_CALCULATION_CONFIG } from '@/core/abjad';

function config(overrides: Partial<typeof DEFAULT_CALCULATION_CONFIG> = {}) {
  return { ...DEFAULT_CALCULATION_CONFIG, ...overrides } as typeof DEFAULT_CALCULATION_CONFIG;
}

describe('Valeurs de référence', () => {
  it('الله = 66', () => {
    const result = calculateAbjad({ text: 'الله', config: config() });
    expect(result.totalValue).toBe(66);
  });

  it('بسم الله الرحمن الرحيم = 786', () => {
    const result = calculateAbjad({ text: 'بسم الله الرحمن الرحيم', config: config() });
    expect(result.totalValue).toBe(786);
  });

  it('بسم الله الرحمن الرحيم = 3 en réduction', () => {
    const result = calculateAbjad({
      text: 'بسم الله الرحمن الرحيم',
      config: config({ reduction: true }),
    });
    expect(result.reducedValue).toBe(3);
  });
});

describe('Méthodes de calcul', () => {
  it('Grand Abjad : somme brute', () => {
    const result = calculateAbjad({ text: 'بسم', config: config() });
    expect(result.totalValue).toBe(102);
    expect(result.methodDetails.id).toBe('classic');
  });

  it('Petit Abjad : valeurs ramenées', () => {
    const result = calculateAbjad({
      text: 'بسم',
      config: config({ method: 'reduced' }),
    });
    expect(result.totalValue).toBe(2 + 6 + 4);
  });

  it('la réduction est distincte du calcul', () => {
    const withoutReduction = calculateAbjad({ text: 'الله', config: config({ reduction: false }) });
    const withReduction = calculateAbjad({ text: 'الله', config: config({ reduction: true }) });
    expect(withoutReduction.totalValue).toBe(66);
    expect(withoutReduction.reducedValue).toBeUndefined();
    expect(withReduction.reducedValue).toBe(3);
  });
});

describe('Décomposition lettre par lettre', () => {
  it('produit une entrée par lettre', () => {
    const result = calculateAbjad({ text: 'بسم', config: config() });
    expect(result.breakdown).toHaveLength(3);
    expect(result.breakdown.map((b) => b.char)).toEqual(['ب', 'س', 'م']);
    expect(result.breakdown.map((b) => b.value)).toEqual([2, 60, 40]);
  });

  it('marque les caractères ignorés', () => {
    const result = calculateAbjad({ text: 'ب س', config: config() });
    const ignored = result.breakdown.filter((b) => b.ignored);
    expect(ignored.length).toBe(1);
    expect(ignored[0].char).toBe(' ');
    expect(ignored[0].explanation).toBe('caractère non Abjad');
  });

  it('assigne les positions', () => {
    const result = calculateAbjad({ text: 'بسم', config: config() });
    expect(result.breakdown.map((b) => b.position)).toEqual([0, 1, 2]);
  });
});

describe('Distribution élémentaire', () => {
  it('calcule la répartition des éléments', () => {
    const result = calculateAbjad({ text: 'بسم الله', config: config() });
    expect(result.elementDistribution).toBeDefined();
    const total = Object.values(result.elementDistribution!).reduce((a, b) => a + b, 0);
    expect(total).toBe(6); // ا n'a pas d'élément assigné
  });
});

describe('Caractères non pris en charge', () => {
  it('gère les chiffres, ponctuation et caractères latins sans erreur', () => {
    const result = calculateAbjad({ text: 'Hello الله 123 !', config: config() });
    expect(result.totalValue).toBe(66);
    expect(result.breakdown.filter((b) => b.ignored).length).toBeGreaterThan(0);
  });

  it('gère les emojis sans erreur', () => {
    const result = calculateAbjad({ text: 'الله 😀', config: config() });
    expect(result.totalValue).toBe(66);
  });

  it('ignore les caractères non Abjad avec explication', () => {
    const result = calculateAbjad({ text: 'ا1', config: config() });
    const item = result.breakdown[1];
    expect(item.ignored).toBe(true);
    expect(item.explanation).toBe('caractère non Abjad');
  });
});

describe('Texte vide', () => {
  it('retourne un résultat cohérent sans erreur', () => {
    const result = calculateAbjad({ text: '', config: config() });
    expect(result.totalValue).toBe(0);
    expect(result.breakdown).toHaveLength(0);
    expect(result.normalizedText).toBe('');
  });

  it('texte composé uniquement d\'espaces', () => {
    const result = calculateAbjad({ text: '   ', config: config() });
    expect(result.totalValue).toBe(0);
    expect(result.breakdown.filter((b) => !b.ignored)).toHaveLength(0);
  });
});
