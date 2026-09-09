import { describe, it, expect } from 'vitest';
import { ABJAD_VALUES, ABJAD_MAGHRIBI, isAbjadLetter, getAbjadValue, getElement } from '@/core/abjad';

describe('Table Abjad — les 28 lettres', () => {
  it('contient exactement 28 lettres', () => {
    expect(Object.keys(ABJAD_VALUES)).toHaveLength(28);
  });

  it.each([
    ['ا', 1],
    ['ب', 2],
    ['ج', 3],
    ['د', 4],
    ['ه', 5],
    ['و', 6],
    ['ز', 7],
    ['ح', 8],
    ['ط', 9],
    ['ي', 10],
    ['ك', 20],
    ['ل', 30],
    ['م', 40],
    ['ن', 50],
    ['س', 60],
    ['ع', 70],
    ['ف', 80],
    ['ص', 90],
    ['ق', 100],
    ['ر', 200],
    ['ش', 300],
    ['ت', 400],
    ['ث', 500],
    ['خ', 600],
    ['ذ', 700],
    ['ض', 800],
    ['ظ', 900],
    ['غ', 1000],
  ] as const)('la lettre %s vaut %d', (letter, expected) => {
    expect(getAbjadValue(letter)).toBe(expected);
  });

  it('reconnaît une lettre Abjad valide', () => {
    expect(isAbjadLetter('ب')).toBe(true);
    expect(isAbjadLetter('غ')).toBe(true);
  });

  it('rejette les caractères non Abjad', () => {
    expect(isAbjadLetter('a')).toBe(false);
    expect(isAbjadLetter('1')).toBe(false);
    expect(isAbjadLetter(' ')).toBe(false);
    expect(isAbjadLetter('😀')).toBe(false);
  });

  it('retourne undefined pour une valeur absente', () => {
    expect(getAbjadValue('x')).toBeUndefined();
  });
});

describe('Table Maghribi', () => {
  it('contient exactement 28 lettres', () => {
    expect(Object.keys(ABJAD_MAGHRIBI)).toHaveLength(28);
  });

  it.each([
    ['ا', 1],
    ['ج', 3],
    ['ن', 50],
    ['ص', 60],
    ['ق', 100],
    ['ر', 200],
    ['ظ', 800],
    ['غ', 900],
    ['س', 300],
    ['ش', 1000],
  ] as const)('en Maghribi la lettre %s vaut %d', (letter, expected) => {
    expect(getAbjadValue(letter, 'maghribi')).toBe(expected);
  });

  it('ne change que 6 valeurs par rapport au Mashriqi', () => {
    const diffs = Object.keys(ABJAD_VALUES).filter(
      (letter) => ABJAD_VALUES[letter] !== ABJAD_MAGHRIBI[letter]
    );
    expect(diffs).toEqual(['س', 'ص', 'ش', 'ض', 'ظ', 'غ']);
    expect(diffs).toHaveLength(6);
  });

  it('adopte le système mashriqi par défaut', () => {
    expect(getAbjadValue('س')).toBe(60);
    expect(getAbjadValue('س', 'mashriqi')).toBe(60);
    expect(getAbjadValue('س', 'maghribi')).toBe(300);
  });
});

describe('Classification élémentaire', () => {
  it.each([
    ['أ', 'fire'],
    ['ه', 'fire'],
    ['ط', 'fire'],
    ['ب', 'earth'],
    ['ي', 'earth'],
    ['ج', 'air'],
    ['س', 'air'],
    ['د', 'water'],
    ['غ', 'water'],
    ['م', 'fire'],
  ] as const)('la lettre %s appartient à %s', (letter, element) => {
    expect(getElement(letter)).toBe(element);
  });

  it('retourne null pour un caractère non classifié', () => {
    expect(getElement('a')).toBeNull();
  });
});
