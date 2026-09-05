'use client';

import type { AbjadResult } from '@/types';
import { useLanguage } from '@/contexts/language-context';
import { formatNumber } from '@/lib/utils';

const ELEMENTS = ['fire', 'earth', 'air', 'water'] as const;

const ELEMENT_STYLES: Record<
  (typeof ELEMENTS)[number],
  { bar: string; icon: string }
> = {
  fire: { bar: 'bg-amber-500', icon: 'bg-amber-100 text-amber-700' },
  earth: { bar: 'bg-emerald-500', icon: 'bg-emerald-100 text-emerald-700' },
  air: { bar: 'bg-sky-500', icon: 'bg-sky-100 text-sky-700' },
  water: { bar: 'bg-teal-500', icon: 'bg-teal-100 text-teal-700' },
};

export function ElementDistribution({ result }: { result: AbjadResult }) {
  const { t } = useLanguage();
  const distribution = result.elementDistribution;

  if (!distribution) {
    return null;
  }

  const total = ELEMENTS.reduce((acc, e) => acc + distribution[e], 0);

  return (
    <div>
      <h3 className="mb-1 text-sm font-semibold text-zinc-800">
        {t.results.elementDistribution}
      </h3>
      <p className="mb-4 text-xs text-zinc-500">{t.results.elementNote}</p>

      <div className="grid grid-cols-2 gap-2">
        {ELEMENTS.map((element) => {
          const count = distribution[element];
          const percent = total > 0 ? Math.round((count / total) * 100) : 0;
          const styles = ELEMENT_STYLES[element];
          return (
            <div
              key={element}
              className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`inline-flex h-6 w-6 place-items-center items-center justify-center rounded-full text-xs font-bold ${styles.icon}`}
                  aria-hidden="true"
                >
                  {element === 'fire'
                    ? 'F'
                    : element === 'earth'
                      ? 'T'
                      : element === 'air'
                        ? 'A'
                        : 'E'}
                </span>
                <span className="text-sm font-medium text-zinc-700">
                  {t.results[element]}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-200">
                  <div
                    className={`h-full rounded-full ${styles.bar}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="text-sm font-semibold tabular-nums text-zinc-900">
                  {formatNumber(count)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}