import { TASHKEEL_MARKS, TATWEEL_CHAR } from './normalizer';

export const SHADDA_CHAR = '\u0651';

export interface GraphemeToken {
  id: number;
  base: string;
  diacritics: string[];
  hasShadda: boolean;
  raw: string;
  startIndex: number;
}

function isCombiningMark(char: string): boolean {
  return TASHKEEL_MARKS.has(char) || char === TATWEEL_CHAR;
}

export function parseGraphemes(input: string): GraphemeToken[] {
  const tokens: GraphemeToken[] = [];
  let id = 0;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (isCombiningMark(ch)) {
      const prev = tokens[tokens.length - 1];
      if (prev) {
        prev.diacritics.push(ch);
        prev.raw += ch;
        if (ch === SHADDA_CHAR) {
          prev.hasShadda = true;
        }
      }
      continue;
    }

    tokens.push({
      id: id++,
      base: ch,
      diacritics: [],
      hasShadda: false,
      raw: ch,
      startIndex: i,
    });
  }

  return tokens;
}
