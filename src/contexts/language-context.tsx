'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { dictionaries, LANGUAGE_COOKIE, type Language } from '@/i18n';
import type { Dictionary } from '@/i18n/fr';

interface LanguageContextValue {
  lang: Language;
  dir: 'ltr' | 'rtl';
  t: Dictionary;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  initialLang,
  children,
}: {
  initialLang: Language;
  children: ReactNode;
}) {
  const [lang, setLang] = useState<Language>(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const setLanguage = useCallback((next: Language) => {
    setLang(next);
    document.cookie = `${LANGUAGE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(lang === 'fr' ? 'ar' : 'fr');
  }, [lang, setLanguage]);

  const value: LanguageContextValue = {
    lang,
    dir: lang === 'ar' ? 'rtl' : 'ltr',
    t: dictionaries[lang],
    setLanguage,
    toggleLanguage,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage doit être utilisé dans un LanguageProvider');
  }
  return ctx;
}