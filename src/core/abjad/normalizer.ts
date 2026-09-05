import type { NormalizationConfig } from '@/types';

export interface NormalizationChange {
  index: number;
  original: string;
  replacement: string;
  reason: 'hamza' | 'tamarbuta' | 'alifmaqsura' | 'tashkeel' | 'tatweel';
  from?: string;
  to?: string;
}

export interface NormalizationResult {
  normalized: string;
  changes: NormalizationChange[];
}

export const DEFAULT_NORMALIZATION_CONFIG: NormalizationConfig = {
  convertHamza: true,
  convertTamarbuta: true,
  convertAlifMaqsura: true,
  removeTashkeel: true,
  removeTatweel: true,
};

export const HAMZA_MAP: Record<string, string> = {
  أ: 'ا',
  إ: 'ا',
  آ: 'ا',
  ء: 'ا',
  ئ: 'ا',
  ؤ: 'ا',
};

export const TAMARBUTA_MAP: Record<string, string> = {
  ة: 'ه',
};

export const ALIF_MAQSURA_MAP: Record<string, string> = {
  ى: 'ي',
};

export const TASHKEEL_MARKS = new Set([
  '\u064E',
  '\u064F',
  '\u0650',
  '\u0651',
  '\u0652',
  '\u064B',
  '\u064C',
  '\u064D',
  '\u0670',
]);

export const TATWEEL_CHAR = '\u0640';

const SHADDA_CHAR_LOCAL = '\u0651';

function appendChange(
  changes: NormalizationChange[],
  index: number,
  original: string,
  replacement: string,
  reason: NormalizationChange['reason'],
  from?: string,
  to?: string
): void {
  changes.push({ index, original, replacement, reason, from, to });
}

export interface NormalizeOptions {
  config?: Partial<NormalizationConfig>;
  preserveShadda?: boolean;
}

export function normalizeText(
  input: string,
  configOrOptions: Partial<NormalizationConfig> | NormalizeOptions = {}
): NormalizationResult {
  const options: NormalizeOptions =
    typeof configOrOptions === 'object' &&
    'config' in configOrOptions &&
    configOrOptions.config !== undefined &&
    Object.keys(configOrOptions).every((k) =>
      ['config', 'preserveShadda'].includes(k)
    )
      ? (configOrOptions as NormalizeOptions)
      : { config: configOrOptions as Partial<NormalizationConfig> };

  const cfg: NormalizationConfig = {
    ...DEFAULT_NORMALIZATION_CONFIG,
    ...options.config,
  };

  const preserveShadda = options.preserveShadda ?? false;

  const changes: NormalizationChange[] = [];
  const out: string[] = [];

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    let replaced: string | null = null;
    let reason: NormalizationChange['reason'] | null = null;
    let from: string | undefined;
    let to: string | undefined;

    if (cfg.convertHamza && ch in HAMZA_MAP) {
      replaced = HAMZA_MAP[ch];
      reason = 'hamza';
      from = ch;
      to = HAMZA_MAP[ch];
    } else if (cfg.convertTamarbuta && ch in TAMARBUTA_MAP) {
      replaced = TAMARBUTA_MAP[ch];
      reason = 'tamarbuta';
      from = ch;
      to = TAMARBUTA_MAP[ch];
    } else if (cfg.convertAlifMaqsura && ch in ALIF_MAQSURA_MAP) {
      replaced = ALIF_MAQSURA_MAP[ch];
      reason = 'alifmaqsura';
      from = ch;
      to = ALIF_MAQSURA_MAP[ch];
    } else if (cfg.removeTashkeel && TASHKEEL_MARKS.has(ch) && !(preserveShadda && ch === SHADDA_CHAR_LOCAL)) {
      replaced = '';
      reason = 'tashkeel';
    } else if (cfg.removeTatweel && ch === TATWEEL_CHAR) {
      replaced = '';
      reason = 'tatweel';
    }

    if (replaced !== null) {
      appendChange(changes, i, ch, replaced, reason as NormalizationChange['reason'], from, to);
      out.push(replaced);
    } else {
      out.push(ch);
    }
  }

  return { normalized: out.join(''), changes };
}
