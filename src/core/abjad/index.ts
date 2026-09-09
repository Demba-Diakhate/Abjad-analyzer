export {
  ABJAD_VALUES,
  ABJAD_MAGHRIBI,
  ABJAD_TABLES,
  ABJAD_LETTERS,
  isAbjadLetter,
  getAbjadValue,
  getElement,
  FIRE_LETTERS,
  EARTH_LETTERS,
  AIR_LETTERS,
  WATER_LETTERS,
} from './alphabet';

export {
  normalizeText,
  DEFAULT_NORMALIZATION_CONFIG,
  HAMZA_MAP,
  TAMARBUTA_MAP,
  ALIF_MAQSURA_MAP,
  TASHKEEL_MARKS,
  TATWEEL_CHAR,
} from './normalizer';
export type { NormalizationChange, NormalizationResult } from './normalizer';

export { parseGraphemes, SHADDA_CHAR } from './grapheme-parser';
export type { GraphemeToken } from './grapheme-parser';

export { reduceValue, toSmallAbjad } from './reducer';

export { calculateAbjad, METHODS } from './calculator';
export type { CalculateOptions } from './calculator';

export {
  hasShadda,
  expandShadda,
  shaddaMultiplier,
  analyzeLine,
  countPhoneticLetters,
  hasShaddaOnAbjadLetter,
} from './shadda';

export { DEFAULT_CALCULATION_CONFIG, PROFILES } from './config';

export * from '@/types';
