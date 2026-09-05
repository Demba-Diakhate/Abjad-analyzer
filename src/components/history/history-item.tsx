'use client';

import { useRouter } from 'next/navigation';
import { ExternalLink, Star, Trash2 } from 'lucide-react';
import type { HistoryRecord } from '@/types';
import { useHistory } from '@/hooks/use-history';
import { useLanguage } from '@/contexts/language-context';
import { cn, formatNumber } from '@/lib/utils';
import { Card } from '@/components/ui/card';

const OPEN_RECORD_KEY = 'abjad:open-record';

function DateLabel({ iso, lang }: { iso: string; lang: 'fr' | 'ar' }) {
  try {
    return new Intl.DateTimeFormat(lang === 'ar' ? 'ar' : 'fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function HistoryItem({ record }: { record: HistoryRecord }) {
  const { t, lang } = useLanguage();
  const { remove, toggleFavorite } = useHistory();
  const router = useRouter();

  const sourceKey =
    record.source === 'manual'
      ? t.history.sourceManual
      : record.source === 'ocr'
        ? t.history.sourceOcr
        : t.history.sourceCamera;

  const handleOpen = () => {
    try {
      sessionStorage.setItem(
        OPEN_RECORD_KEY,
        JSON.stringify({
          text: record.result.originalText,
          config: record.calculationConfig,
        })
      );
    } catch {
      /* sessionStorage indisponible : ignorer */
    }
    router.push('/');
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="font-arabic truncate text-lg font-semibold text-zinc-900">
            {record.title}
          </h4>
          <p className="font-arabic mt-0.5 truncate text-sm text-zinc-500">
            {record.result.originalText}
          </p>
        </div>
        <span className="font-arabic shrink-0 text-2xl font-bold tabular-nums text-amber-600">
          {formatNumber(record.result.totalValue)}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
        <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 font-medium">
          {sourceKey}
        </span>
        <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5">
          {t.results.methods[record.result.methodDetails.id as keyof typeof t.results.methods] ??
            record.result.methodDetails.name}
        </span>
        <span>
          <DateLabel iso={record.createdAt} lang={lang} />
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={toggleFavorite && (() => void toggleFavorite(record.id))}
          aria-label={record.favorite ? t.history.unfavorite : t.history.favorite}
          aria-pressed={record.favorite}
          className={cn(
            'grid h-8 w-8 place-items-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500',
            record.favorite
              ? 'bg-amber-100 text-amber-600'
              : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600'
          )}
        >
          <Star
            aria-hidden="true"
            className={cn('h-4 w-4', record.favorite && 'fill-current')}
          />
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleOpen}
            aria-label={t.history.openLabel}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
          >
            <ExternalLink aria-hidden="true" className="h-4 w-4" />
            {t.history.open}
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm(t.history.deleteConfirm)) void remove(record.id);
            }}
            aria-label={t.history.delete}
            className="grid h-8 w-8 place-items-center rounded-lg text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
          >
            <Trash2 aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}