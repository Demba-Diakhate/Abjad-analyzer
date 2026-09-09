import type { AbjadResult, AbjadSystem, CalculationConfig, LetterBreakdown } from '@/types';
import { getAbjadValue, getElement } from './alphabet';
import { normalizeText } from './normalizer';
import { parseGraphemes, type GraphemeToken } from './grapheme-parser';
import { reduceValue } from './reducer';

export interface CalculateOptions {
  text: string;
  config: CalculationConfig;
}

function computeTokenValue(token: GraphemeToken, system: AbjadSystem): number {
  const baseValue = getAbjadValue(token.base, system);
  if (baseValue === undefined) {
    return 0;
  }

  if (token.hasShadda) {
    return baseValue * 2;
  }

  return baseValue;
}

function buildBreakdown(
  tokens: GraphemeToken[],
  normalizedText: string,
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
      value = computeTokenValue(token, system);
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
  const { system, reduction, phoneticMode, normalization } = config;

  const { normalized } = normalizeText(text, {
    config: normalization,
    preserveShadda: phoneticMode,
  });

  const tokens = parseGraphemes(normalized);

  const breakdown = buildBreakdown(tokens, normalized, system);

  const totalValue = breakdown.reduce((acc, item) => acc + item.value, 0);

  const elementDistribution = computeElementDistribution(tokens);

  const result: AbjadResult = {
    originalText: text,
    normalizedText: normalized,
    totalValue,
    breakdown,
    elementDistribution,
    timestamp: Date.now(),
  };

  if (reduction) {
    result.reducedValue = reduceValue(totalValue);
  }

  return result;
}