import { parseGraphemes, type GraphemeToken } from './grapheme-parser';
import { getAbjadValue } from './alphabet';
import { toSmallAbjad } from './reducer';

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

export function shaddaMultiplier(method: 'classic' | 'reduced', baseValue: number): number {
  const doubled = baseValue * 2;
  if (method === 'reduced') {
    return toSmallAbjad(doubled);
  }
  return doubled;
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

export function hasShaddaOnAbjadLetter(token: GraphemeToken): boolean {
  return token.hasShadda && getAbjadValue(token.base) !== undefined;
}

export { parseGraphemes };
