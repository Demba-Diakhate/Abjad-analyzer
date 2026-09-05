import { describe, it, expect } from 'vitest';
import { ABJAD_VALUES, isAbjadLetter, getAbjadValue, getElement } from '@/core/abjad';

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
