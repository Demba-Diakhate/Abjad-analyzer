import { describe, it, expect } from 'vitest';
import { isArabicText, cn } from '@/lib/utils';

describe('isArabicText — détection de la direction', () => {
  it('détecte un texte arabe', () => {
    expect(isArabicText('بسم الله الرحمن الرحيم')).toBe(true);
  });

  it('détecte un texte mixte contenant de l’arabe', () => {
    expect(isArabicText('Hello الله 123')).toBe(true);
  });

  it('rejette le texte latin seul', () => {
    expect(isArabicText('Hello world')).toBe(false);
  });

  it('rejette un texte numérique seul', () => {
    expect(isArabicText('12345')).toBe(false);
  });

  it('rejette la chaîne vide', () => {
    expect(isArabicText('')).toBe(false);
  });
});

describe('cn', () => {
  it('joint les classes définies', () => {
    expect(cn('a', 'b', null, undefined, '', 'c')).toBe('a b c');
  });
});