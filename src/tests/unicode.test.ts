import { describe, it, expect } from 'vitest';
import { calculateAbjad, parseGraphemes, DEFAULT_CALCULATION_CONFIG } from '@/core/abjad';

function config(overrides: Partial<typeof DEFAULT_CALCULATION_CONFIG> = {}) {
  return { ...DEFAULT_CALCULATION_CONFIG, ...overrides } as typeof DEFAULT_CALCULATION_CONFIG;
}

describe('Unicode — séquences combinées', () => {
  it('groupe une lettre et ses diacritiques en un seul token', () => {
    const tokens = parseGraphemes('كَ'); // ك + fatha
    expect(tokens).toHaveLength(1);
    expect(tokens[0].base).toBe('ك');
  });

  it('groupe lettre + shadda + voyelle', () => {
    const tokens = parseGraphemes('بِّ');
    expect(tokens).toHaveLength(1);
    expect(tokens[0].base).toBe('ب');
    expect(tokens[0].diacritics.sort()).toEqual(['\u0650', '\u0651']);
  });

  it('traite des formes contextuelles différentes sans casser', () => {
    // ك, ـك, كـ, ـكـ — varie selon le contexte, le code point de base reste ك
    const tokens = parseGraphemes('كـ');
    expect(tokens[0].base).toBe('ك');
  });

  it('isole une lettre nue', () => {
    const tokens = parseGraphemes('ل');
    expect(tokens).toHaveLength(1);
    expect(tokens[0].diacritics).toHaveLength(0);
  });
});

describe('Unicode — calcul avec diacritiques', () => {
  it('mots avec fatha/kasra ne changent pas la valeur', () => {
    const plain = calculateAbjad({ text: 'بسم', config: config() });
    const diacritic = calculateAbjad({ text: 'بِسْمِ', config: config() });
    expect(plain.totalValue).toBe(diacritic.totalValue);
  });

  it('le tatweel n\'ajoute aucune valeur', () => {
    const plain = calculateAbjad({ text: 'الله', config: config() });
    const tatweel = calculateAbjad({ text: 'اللــــه', config: config() });
    expect(tatweel.totalValue).toBe(plain.totalValue);
  });

  it('Normalisation combinée : texte avec hamza et diacritiques', () => {
    const result = calculateAbjad({
      text: 'أَلَمْ',
      config: config({ normalization: DEFAULT_CALCULATION_CONFIG.normalization }),
    });
    expect(result.normalizedText).toBe('الم');
  });
});
