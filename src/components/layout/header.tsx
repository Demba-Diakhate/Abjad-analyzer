'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpenText, History, Hash, SquarePen } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import type { Language } from '@/i18n';

export function Header() {
  const { t, lang, setLanguage } = useLanguage();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg text-lg font-semibold text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
        >
          <span
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-amber-500 text-white"
            aria-hidden="true"
          >
            <Hash className="h-4 w-4" />
          </span>
          <span>{t.appName}</span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/"
            aria-current={pathname === '/' ? 'page' : undefined}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
          >
            <SquarePen aria-hidden="true" className="h-4 w-4" />
            <span className="hidden sm:inline">{t.nav.home}</span>
          </Link>
          <Link
            href="/history"
            aria-current={pathname === '/history' ? 'page' : undefined}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
          >
            <History aria-hidden="true" className="h-4 w-4" />
            <span className="hidden sm:inline">{t.nav.history}</span>
          </Link>
          <Link
            href="/methodology"
            aria-current={pathname === '/methodology' ? 'page' : undefined}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
          >
            <BookOpenText aria-hidden="true" className="h-4 w-4" />
            <span className="hidden sm:inline">{t.nav.methodology}</span>
          </Link>

          <select
            value={lang}
            onChange={(event) => setLanguage(event.target.value as Language)}
            aria-label={t.header.languageLabel}
            className="ms-1 h-8 cursor-pointer rounded-lg border border-zinc-300 bg-white px-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
          >
            <option value="fr">FR</option>
            <option value="ar">AR</option>
            <option value="wo">WO</option>
          </select>
        </nav>
      </div>
    </header>
  );
}