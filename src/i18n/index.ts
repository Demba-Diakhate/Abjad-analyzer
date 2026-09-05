import { fr } from './fr';
import { ar } from './ar';

export type { Dictionary } from './fr';

export type Language = 'fr' | 'ar';

export const LANGUAGE_COOKIE = 'abjad-lang';

export const dictionaries: Record<Language, typeof fr> = { fr, ar };

export function isLanguage(value: unknown): value is Language {
  return value === 'fr' || value === 'ar';
}