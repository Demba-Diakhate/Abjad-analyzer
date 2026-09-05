import { describe, it, expect } from 'vitest';
import { normalizeText } from '@/core/abjad';

describe('Normalisation — Hamza', () => {
  it.each([
    ['أ', 'ا'],
    ['إ', 'ا'],
    ['آ', 'ا'],
    ['ء', 'ا'],
    ['ئ', 'ا'],
    ['ؤ', 'ا'],
  ])('convertit %s en %s', (input, expected) => {
    const { normalized } = normalizeText(input);
    expect(normalized).toBe(expected);
  });

  it('conserve la conversion lorsque activée', () => {
    const { normalized } = normalizeText('أ', { convertHamza: true });
    expect(normalized).toBe('ا');
  });

  it('ne convertit pas la hamza lorsque désactivée', () => {
    const { normalized } = normalizeText('أ', { convertHamza: false });
    expect(normalized).toBe('أ');
  });
});

describe('Normalisation — Tā\' Marbūṭa', () => {
  it('convertit ة en ه', () => {
    const { normalized } = normalizeText('ة');
    expect(normalized).toBe('ه');
  });

  it('ne convertit pas lorsque désactivée', () => {
    const { normalized } = normalizeText('ة', { convertTamarbuta: false });
    expect(normalized).toBe('ة');
  });
});

describe('Normalisation — Alif Maqṣūrah', () => {
  it('convertit ى en ي', () => {
    const { normalized } = normalizeText('ى');
    expect(normalized).toBe('ي');
  });

  it('ne convertit pas lorsque désactivée', () => {
    const { normalized } = normalizeText('ى', { convertAlifMaqsura: false });
    expect(normalized).toBe('ى');
  });
});

describe('Normalisation — Tashkeel', () => {
  it.each(['\u064E', '\u064F', '\u0650', '\u064B', '\u064C', '\u064D', '\u0670'])(
    'supprime le diacritique U+%s',
    (mark) => {
      const { normalized } = normalizeText(`ل${mark}`, { removeTashkeel: true });
      expect(normalized).toBe('ل');
    }
  );

  it('conserve les diacritiques lorsque désactivée', () => {
    const { normalized } = normalizeText('لَ', { removeTashkeel: false });
    expect(normalized).toBe('لَ');
  });

  it('supprime la Shadda lorsque le mode phonétique est désactivé', () => {
    const { normalized } = normalizeText('لّ', { removeTashkeel: true });
    expect(normalized).toBe('ل');
  });

  it('préserve la Shadda lorsque preserveShadda est actif', () => {
    const { normalized } = normalizeText('لّ', {
      config: { removeTashkeel: true },
      preserveShadda: true,
    });
    expect(normalized).toBe('لّ');
  });
});

describe('Normalisation — Tatweel', () => {
  it('supprime le tatweel U+0640', () => {
    const { normalized } = normalizeText('اللــــه');
    expect(normalized).toBe('الله');
  });

  it('conserve le tatweel lorsque désactivé', () => {
    const { normalized } = normalizeText('اللــــه', { removeTatweel: false });
    expect(normalized).toBe('اللــــه');
  });
});

describe('Normalisation — combinaisons', () => {
  it('normalise un texte complet (diacritiques + hamza)', () => {
    const { normalized } = normalizeText('اللَّهُ');
    expect(normalized).toBe('الله');
  });

  it('gère les règles indépendamment', () => {
    const { normalized } = normalizeText('أَلَمْ', {
      convertHamza: false,
      removeTashkeel: true,
    });
    expect(normalized).toBe('ألم');
  });

  it('retourne les changements effectués', () => {
    const { changes } = normalizeText('مكة');
    expect(changes.length).toBeGreaterThan(0);
    expect(changes.some((c) => c.reason === 'tamarbuta')).toBe(true);
  });
});
