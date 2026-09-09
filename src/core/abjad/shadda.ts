import { parseGraphemes, type GraphemeToken } from './grapheme-parser';
import { getAbjadValue } from './alphabet';
import type { AbjadSystem } from '@/types';

export const SHADDA_CHAR = '\u0651';

export interface ShaddaExpansion {
  original: string;
  count: number;
  repeatedChars: string[];
}

export function hasShadda(token: GraphemeToken): boolean {
  return token.hasShadda;
}

export function expandShadda(token: GraphemeToken): string[] {
  if (!token.hasShadda) {
    return [token.base];
  }
  return [token.base, token.base];
}

export function shaddaMultiplier(baseValue: number): number {
  return baseValue * 2;
}

export function analyzeLine(token: GraphemeToken): ShaddaExpansion {
  const expanded = expandShadda(token);
  return {
    original: token.raw,
    count: expanded.length,
    repeatedChars: expanded,
  };
}

export function countPhoneticLetters(tokens: GraphemeToken[]): number {
  return tokens.reduce((acc, t) => acc + expandShadda(t).length, 0);
}

export function hasShaddaOnAbjadLetter(
  token: GraphemeToken,
  system: AbjadSystem = 'mashriqi'
): boolean {
  return token.hasShadda && getAbjadValue(token.base, system) !== undefined;
}

export { parseGraphemes };