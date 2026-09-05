'use client';

import { Search } from 'lucide-react';
import type { HistoryFilter } from '@/hooks/use-history';
import { useLanguage } from '@/contexts/language-context';
import type { Dictionary } from '@/i18n/fr';
import { cn } from '@/lib/utils';

const FILTER_KEYS: Array<{ key: HistoryFilter; labelKey: keyof Dictionary['history'] }> = [
  { key: 'all', labelKey: 'all' },
  { key: 'favorites', labelKey: 'favorites' },
  { key: 'ocr', labelKey: 'ocr' },
  { key: 'manual', labelKey: 'manual' },
  { key: 'camera', labelKey: 'camera' },
];

export function HistoryFilters({
  filter,
  onFilterChange,
  query,
  onQueryChange,
}: {
  filter: HistoryFilter;
  onFilterChange: (filter: HistoryFilter) => void;
  query: string;
  onQueryChange: (query: string) => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
        />
        <label htmlFor="history-search" className="sr-only">
          {t.history.searchLabel}
        </label>
        <input
          id="history-search"
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={t.history.search}
          className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 ps-9 pe-3 text-sm text-zinc-900 shadow-sm outline-none transition-shadow placeholder:text-zinc-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30"
        />
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label={t.history.title}>
        {FILTER_KEYS.map(({ key, labelKey }) => {
          const selected = filter === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onFilterChange(key)}
              aria-pressed={selected}
              className={cn(
                'inline-flex h-8 items-center rounded-full border px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500',
                selected
                  ? 'border-amber-500 bg-amber-50 text-amber-800'
                  : 'border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-100'
              )}
            >
              {t.history[labelKey]}
            </button>
          );
        })}
      </div>
    </div>
  );
}