export const ABJAD_VALUES: Record<string, number> = {
  ا: 1,
  ب: 2,
  ج: 3,
  د: 4,
  ه: 5,
  و: 6,
  ز: 7,
  ح: 8,
  ط: 9,
  ي: 10,
  ك: 20,
  ل: 30,
  م: 40,
  ن: 50,
  س: 60,
  ع: 70,
  ف: 80,
  ص: 90,
  ق: 100,
  ر: 200,
  ش: 300,
  ت: 400,
  ث: 500,
  خ: 600,
  ذ: 700,
  ض: 800,
  ظ: 900,
  غ: 1000,
};

export const ABJAD_LETTERS: string[] = Object.keys(ABJAD_VALUES);

export function isAbjadLetter(char: string): boolean {
  return Object.prototype.hasOwnProperty.call(ABJAD_VALUES, char);
}

export function getAbjadValue(char: string): number | undefined {
  return ABJAD_VALUES[char];
}

export const FIRE_LETTERS = new Set(['أ', 'ه', 'ط', 'م', 'ف', 'ش', 'ذ']);
export const EARTH_LETTERS = new Set(['ب', 'و', 'ي', 'ن', 'ص', 'ت', 'ض']);
export const AIR_LETTERS = new Set(['ج', 'ز', 'ك', 'س', 'ق', 'ث', 'ظ']);
export const WATER_LETTERS = new Set(['د', 'ح', 'ل', 'ع', 'ر', 'خ', 'غ']);

export function getElement(letter: string): 'fire' | 'earth' | 'air' | 'water' | null {
  if (FIRE_LETTERS.has(letter)) return 'fire';
  if (EARTH_LETTERS.has(letter)) return 'earth';
  if (AIR_LETTERS.has(letter)) return 'air';
  if (WATER_LETTERS.has(letter)) return 'water';
  return null;
}
