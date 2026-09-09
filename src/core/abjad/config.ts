import type { CalculationConfig } from '@/types';
import { DEFAULT_NORMALIZATION_CONFIG } from './normalizer';

export const DEFAULT_CALCULATION_CONFIG: CalculationConfig = {
  method: 'classic',
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
    method: 'classic',
    system: 'mashriqi',
    reduction: false,
    phoneticMode: false,
    normalization: { ...DEFAULT_NORMALIZATION_CONFIG },
  },
  strict: {
    method: 'classic',
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
    method: 'classic',
    system: 'mashriqi',
    reduction: false,
    phoneticMode: true,
    normalization: { ...DEFAULT_NORMALIZATION_CONFIG },
  },
  custom: {
    method: 'classic',
    system: 'mashriqi',
    reduction: false,
    phoneticMode: false,
    normalization: { ...DEFAULT_NORMALIZATION_CONFIG },
  },
};
