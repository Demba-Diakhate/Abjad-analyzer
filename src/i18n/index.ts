import { fr } from './fr';
import { ar } from './ar';
import { wo } from './wo';

export type { Dictionary } from './fr';

export type Language = 'fr' | 'ar' | 'wo';

export const LANGUAGE_COOKIE = 'abjad-lang';

export const dictionaries: Record<Language, typeof fr> = { fr, ar, wo };

export function isLanguage(value: unknown): value is Language {
  return value === 'fr' || value === 'ar' || value === 'wo';
}