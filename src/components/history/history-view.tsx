'use client';

import { History as HistoryIcon } from 'lucide-react';
import { useHistory } from '@/hooks/use-history';
import { useLanguage } from '@/contexts/language-context';
import { HistoryFilters } from './history-filters';
import { HistoryItem } from './history-item';
import { Card } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';

export function HistoryView() {
  const { t } = useLanguage();
  const history = useHistory();

  return (
    <main id="main-content" className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
          {t.history.title}
        </h1>
        <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm font-medium text-zinc-500">
          {t.history.items.replace('{count}', formatNumber(history.filtered.length))}
        </span>
      </div>

      <div className="mb-6">
        <HistoryFilters
          filter={history.filter}
          onFilterChange={history.setFilter}
          query={history.query}
          onQueryChange={history.setQuery}
        />
      </div>

      {history.error && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {history.error}
        </p>
      )}

      {history.loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl border border-zinc-200 bg-zinc-100"
            />
          ))}
        </div>
      ) : history.filtered.length === 0 ? (
        <Card className="flex min-h-[180px] flex-col items-center justify-center gap-2 p-8 text-center">
          <HistoryIcon
            aria-hidden="true"
            className="h-8 w-8 text-zinc-300"
          />
          <p className="text-lg font-medium text-zinc-700">{t.history.empty}</p>
          <p className="text-sm text-zinc-500">{t.history.emptyHint}</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {history.filtered.map((record) => (
            <HistoryItem key={record.id} record={record} />
          ))}
        </div>
      )}
    </main>
  );
}