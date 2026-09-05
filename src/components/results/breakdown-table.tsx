'use client';

import type { AbjadResult, CalculationConfig } from '@/types';
import { SHADDA_CHAR } from '@/core/abjad';
import { useLanguage } from '@/contexts/language-context';
import { cn, formatNumber } from '@/lib/utils';
import { Card } from '@/components/ui/card';

function explanationLabel(explanation: string | undefined, t: ReturnType<typeof useLanguage>['t']) {
  if (!explanation) return t.results.counted;
  if (explanation.includes('Tatweel')) return t.results.tatweelRemoved;
  return t.results.nonAbjad;
}

export function BreakdownTable({
  result,
  config,
}: {
  result: AbjadResult;
  config: CalculationConfig;
}) {
  const { t } = useLanguage();

  if (result.breakdown.length === 0) {
    return null;
  }

  return (
    <Card className="p-5">
      <h3 className="mb-3 text-sm font-semibold text-zinc-800">
        {t.results.breakdown}
      </h3>
      <div className="max-h-[320px] overflow-auto rounded-xl border border-zinc-100">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              <th
                scope="col"
                className="sticky top-0 border-b border-zinc-100 bg-zinc-50 px-4 py-2 text-start"
              >
                {t.results.letter}
              </th>
              <th
                scope="col"
                className="sticky top-0 border-b border-zinc-100 bg-zinc-50 px-4 py-2 text-start"
              >
                {t.results.status}
              </th>
              <th
                scope="col"
                className="sticky top-0 border-b border-zinc-100 bg-zinc-50 px-4 py-2 text-end"
              >
                {t.results.value}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {result.breakdown.map((item) => {
              const label = explanationLabel(item.explanation, t);
              const shadda = item.char.includes(SHADDA_CHAR);
              return (
                <tr
                  key={item.id}
                  className={cn('text-start', item.ignored && 'bg-zinc-50/60')}
                >
                  <td
                    className={cn(
                      'font-arabic px-4 py-2 align-top text-xl leading-none',
                      item.ignored ? 'text-zinc-300 line-through' : 'text-zinc-900'
                    )}
                  >
                    {item.char}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className={cn(
                          'truncate text-xs',
                          item.ignored ? 'text-zinc-400' : 'text-zinc-500'
                        )}
                        title={item.explanation}
                      >
                        {label}
                      </span>
                      {shadda && config.phoneticMode && (
                        <span className="shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                          {t.results.shaddaLabel}
                        </span>
                      )}
                    </div>
                  </td>
                  <td
                    className="px-4 py-2 text-end align-top font-semibold tabular-nums text-zinc-900"
                  >
                    {item.ignored ? formatNumber(0) : formatNumber(item.value)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}