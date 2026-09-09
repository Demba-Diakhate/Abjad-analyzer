import type { CalculationConfig } from '@/types';
import { DEFAULT_NORMALIZATION_CONFIG } from './normalizer';

export const DEFAULT_CALCULATION_CONFIG: CalculationConfig = {
  system: 'mashriqi',
  reduction: false,
  phoneticMode: false,
  normalization: { ...DEFAULT_NORMALIZATION_CONFIG },
};

export const PROFILES: Record<
  'standard' | 'strict' | 'phonetic' | 'custom',
  CalculationConfig
> = {
  standard: {
    system: 'mashriqi',
    reduction: false,
    phoneticMode: false,
    normalization: { ...DEFAULT_NORMALIZATION_CONFIG },
  },
  strict: {
    system: 'mashriqi',
    reduction: false,
    phoneticMode: false,
    normalization: {
      convertHamza: false,
      convertTamarbuta: false,
      convertAlifMaqsura: false,
      removeTashkeel: false,
      removeTatweel: false,
    },
  },
  phonetic: {
    system: 'mashriqi',
    reduction: false,
    phoneticMode: true,
    normalization: { ...DEFAULT_NORMALIZATION_CONFIG },
  },
  custom: {
    system: 'mashriqi',
    reduction: false,
    phoneticMode: false,
    normalization: { ...DEFAULT_NORMALIZATION_CONFIG },
  },
};