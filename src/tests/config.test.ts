import { describe, expect, it } from 'vitest';
import {
  DEFAULT_CALCULATION_CONFIG,
  DEFAULT_NORMALIZATION_CONFIG,
  PROFILES,
} from '@/core/abjad';

describe('DEFAULT_CALCULATION_CONFIG', () => {
  it('repose sur le Grand Abjad sans réduction ni phonétique', () => {
    expect(DEFAULT_CALCULATION_CONFIG.method).toBe('classic');
    expect(DEFAULT_CALCULATION_CONFIG.system).toBe('mashriqi');
    expect(DEFAULT_CALCULATION_CONFIG.reduction).toBe(false);
    expect(DEFAULT_CALCULATION_CONFIG.phoneticMode).toBe(false);
  });

  it('active les 5 filtres de normalisation par défaut', () => {
    for (const active of Object.values(DEFAULT_NORMALIZATION_CONFIG)) {
      expect(active).toBe(true);
    }
  });
});

describe('PROFILES', () => {
  it('déclare les quatre profils attendus', () => {
    expect(Object.keys(PROFILES).sort()).toEqual(['custom', 'phonetic', 'standard', 'strict']);
  });

  it('standard est identique à la configuration par défaut', () => {
    expect(PROFILES.standard).toEqual(DEFAULT_CALCULATION_CONFIG);
  });

  it('custom est identique à la configuration par défaut', () => {
    expect(PROFILES.custom).toEqual(DEFAULT_CALCULATION_CONFIG);
  });

  it('strict désactive tous les filtres et le phonétique', () => {
    expect(PROFILES.strict.phoneticMode).toBe(false);
    for (const active of Object.values(PROFILES.strict.normalization)) {
      expect(active).toBe(false);
    }
  });

  it('phonetic active uniquement le mode phonétique', () => {
    expect(PROFILES.phonetic.phoneticMode).toBe(true);
    expect(PROFILES.phonetic.method).toBe('classic');
    expect(PROFILES.phonetic.system).toBe('mashriqi');
    expect(PROFILES.phonetic.normalization).toEqual(DEFAULT_NORMALIZATION_CONFIG);
  });

  it('les profils utilisent le système mashriqi', () => {
    for (const profile of Object.values(PROFILES)) {
      expect(profile.system).toBe('mashriqi');
    }
  });
});