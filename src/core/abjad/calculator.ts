import type { AbjadResult, AbjadSystem, CalculationConfig, LetterBreakdown } from '@/types';
import { getAbjadValue, getElement } from './alphabet';
import { normalizeText } from './normalizer';
import { parseGraphemes, type GraphemeToken } from './grapheme-parser';
import { reduceValue, toSmallAbjad } from './reducer';
import { shaddaMultiplier } from './shadda';

export const METHODS = {
  classic: {
    id: 'classic',
    name: 'Grand Abjad',
    description: 'Somme brute des valeurs des lettres selon la table Abjad.',
  },
  reduced: {
    id: 'reduced',
    name: 'Petit Abjad',
    description: 'Chaque valeur est ramenée entre 1 et 9 avant la somme.',
  },
} as const;

export interface CalculateOptions {
  text: string;
  config: CalculationConfig;
}

function computeTokenValue(
  token: GraphemeToken,
  method: CalculationConfig['method'],
  system: AbjadSystem
): number {
  const baseValue = getAbjadValue(token.base, system);
  if (baseValue === undefined) {
    return 0;
  }

  if (method === 'reduced') {
    return token.hasShadda ? toSmallAbjad(baseValue * 2) : toSmallAbjad(baseValue);
  }

  if (token.hasShadda) {
    return shaddaMultiplier('classic', baseValue);
  }

  return baseValue;
}

function buildBreakdown(
  tokens: GraphemeToken[],
  normalizedText: string,
  method: CalculationConfig['method'],
  system: AbjadSystem
): LetterBreakdown[] {
  const breakdown: LetterBreakdown[] = [];
  let position = 0;

  for (const token of tokens) {
    const hasAbjad = getAbjadValue(token.base, system) !== undefined;
    const isTatweel = token.base === '\u0640';

    let ignored = false;
    let value = 0;
    let explanation: string | undefined;

    if (!hasAbjad) {
      ignored = true;
      explanation = isTatweel ? 'Tatweel supprimé' : 'caractère non Abjad';
    } else {
      value = computeTokenValue(token, method, system);
    }

    breakdown.push({
      id: `tok-${token.id}`,
      char: token.raw,
      normalizedChar: normalizedText[token.startIndex] ?? token.base,
      value,
      position: position++,
      ignored,
      explanation,
    });
  }

  return breakdown;
}

function computeElementDistribution(tokens: GraphemeToken[]): {
  fire: number;
  earth: number;
  air: number;
  water: number;
} {
  const distribution = { fire: 0, earth: 0, air: 0, water: 0 };
  for (const token of tokens) {
    const element = getElement(token.base);
    if (element) {
      distribution[element] += 1;
    }
  }
  return distribution;
}

export function calculateAbjad(options: CalculateOptions): AbjadResult {
  const { text, config } = options;
  const { method, system, reduction, phoneticMode, normalization } = config;

  const { normalized } = normalizeText(text, {
    config: normalization,
    preserveShadda: phoneticMode,
  });

  const tokens = parseGraphemes(normalized);

  const breakdown = buildBreakdown(tokens, normalized, method, system);

  const totalValue = breakdown.reduce((acc, item) => acc + item.value, 0);

  const elementDistribution = computeElementDistribution(tokens);

  const result: AbjadResult = {
    originalText: text,
    normalizedText: normalized,
    totalValue,
    breakdown,
    methodDetails: METHODS[method],
    elementDistribution,
    timestamp: Date.now(),
  };

  if (reduction) {
    result.reducedValue = reduceValue(totalValue);
  }

  return result;
}
