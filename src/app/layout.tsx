import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Inter, Noto_Naskh_Arabic } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/contexts/language-context';
import { Header } from '@/components/layout/header';
import { dictionaries, isLanguage, LANGUAGE_COOKIE, type Language } from '@/i18n';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const notoNaskh = Noto_Naskh_Arabic({
  subsets: ['arabic'],
  variable: '--font-noto-naskh',
});

export const metadata: Metadata = {
  title: { default: 'Abjad Analyzer', template: '%s — Abjad Analyzer' },
  description: 'Analyse et calcul numérique de textes arabes (Abjad).',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const langValue = cookieStore.get(LANGUAGE_COOKIE)?.value;
  const lang: Language = isLanguage(langValue) ? langValue : 'fr';
  const dir: 'ltr' | 'rtl' = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <html
      lang={lang}
      dir={dir}
      className={`${inter.variable} ${notoNaskh.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:start-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-amber-500 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-amber-950 focus:outline-2 focus:outline-offset-2 focus:outline-amber-500"
        >
          {dictionaries[lang].common.skipToContent}
        </a>
        <LanguageProvider initialLang={lang}>
          <Header />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}