import { describe, it, expect } from 'vitest';
import {
  calculateAbjad,
  expandShadda,
  parseGraphemes,
  DEFAULT_CALCULATION_CONFIG,
} from '@/core/abjad';

function config(overrides: Partial<typeof DEFAULT_CALCULATION_CONFIG> = {}) {
  return { ...DEFAULT_CALCULATION_CONFIG, ...overrides };
}

function baseConfig(overrides: Partial<typeof DEFAULT_CALCULATION_CONFIG> = {}) {
  return config(overrides) as typeof DEFAULT_CALCULATION_CONFIG;
}

describe('Shadda — parser Unicode', () => {
  it('détecte la shadda dans une séquence combinée', () => {
    const tokens = parseGraphemes('لّ');
    expect(tokens).toHaveLength(1);
    expect(tokens[0].base).toBe('ل');
    expect(tokens[0].hasShadda).toBe(true);
  });

  it('détecte une shadda seule (lettre + shadda + voyelle)', () => {
    const tokens = parseGraphemes('لِّ');
    expect(tokens).toHaveLength(1);
    expect(tokens[0].hasShadda).toBe(true);
  });

  it('n\'attribue pas de shadda à une lettre nue', () => {
    const tokens = parseGraphemes('ل');
    expect(tokens[0].hasShadda).toBe(false);
  });

  it('gère plusieurs lettres avec des shaddas', () => {
    const tokens = parseGraphemes('لّبّ');
    expect(tokens).toHaveLength(2);
    expect(tokens[0].hasShadda).toBe(true);
    expect(tokens[1].hasShadda).toBe(true);
  });
});

describe('Shadda — expansion phonétique', () => {
  it('étend une lettre avec shadda en deux occurrences', () => {
    const [token] = parseGraphemes('لّ');
    expect(expandShadda(token)).toEqual(['ل', 'ل']);
  });

  it('n\'étend pas une lettre sans shadda', () => {
    const [token] = parseGraphemes('ل');
    expect(expandShadda(token)).toEqual(['ل']);
  });
});

describe('Shadda — calcul phonétique (Grand Abjad)', () => {
  it('comptabilise لّ deux fois : 30 + 30 = 60', () => {
    const result = calculateAbjad({
      text: 'لّ',
      config: baseConfig({ phoneticMode: true }),
    });
    expect(result.totalValue).toBe(60);
  });

  it('donne 30 (une seule fois) sans mode phonétique', () => {
    const result = calculateAbjad({
      text: 'لّ',
      config: baseConfig({ phoneticMode: false }),
    });
    expect(result.totalValue).toBe(30);
  });

  it('traite correctement une shadda au début, milieu et fin', () => {
    const result = calculateAbjad({
      text: 'بِّب',
      config: baseConfig({ phoneticMode: true }),
    });
    expect(result.totalValue).toBe(4 + 2);
  });
});

describe('Shadda — calcul phonétique (Petit Abjad)', () => {
  it('comptabilise لّ comme 3 + 3 = 6 en petit Abjad', () => {
    const result = calculateAbjad({
      text: 'لّ',
      config: baseConfig({ method: 'reduced', phoneticMode: true }),
    });
    expect(result.totalValue).toBe(6);
  });

  it('comptabilise بّ comme 2 + 2 = 4 en petit Abjad', () => {
    const result = calculateAbjad({
      text: 'بّ',
      config: baseConfig({ method: 'reduced', phoneticMode: true }),
    });
    expect(result.totalValue).toBe(4);
  });
});
