'use client';

import { useMemo } from 'react';
import type { AbjadResult, CalculationConfig } from '@/types';
import { useLanguage } from '@/contexts/language-context';
import { formatNumber } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { TextComparison } from './text-comparison';
import { ElementDistribution } from './element-distribution';
import { BreakdownTable } from './breakdown-table';

export function ResultDashboard({
  result,
  config,
}: {
  result: AbjadResult;
  config: CalculationConfig;
}) {
  const { t } = useLanguage();

  const activeFilters = useMemo(
    () => Object.values(config.normalization).filter(Boolean).length,
    [config.normalization]
  );
  const effectiveLetters = result.breakdown.filter((b) => !b.ignored).length;
  const ignoredChars = result.breakdown.length - effectiveLetters;

  return (
    <div className="space-y-4">
      <p className="sr-only" aria-live="polite">
        {t.results.totalValue} : {formatNumber(result.totalValue)}
        {result.reducedValue !== undefined &&
          `, ${t.results.reduction} : ${formatNumber(result.reducedValue)}`}
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {t.results.totalValue}
          </p>
          <p className="font-arabic mt-1 text-4xl font-bold tabular-nums text-zinc-900">
            {formatNumber(result.totalValue)}
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {t.results.reduction}
          </p>
          <p className="font-arabic mt-1 text-4xl font-bold tabular-nums text-zinc-900">
            {result.reducedValue !== undefined
              ? formatNumber(result.reducedValue)
              : t.results.notAvailable}
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {t.results.method}
          </p>
          <p className="mt-3 text-lg font-semibold text-zinc-900">
            {t.results.methods[result.methodDetails.id as keyof typeof t.results.methods] ??
              result.methodDetails.name}
          </p>
          <p className="mt-1 text-xs text-zinc-500">{result.methodDetails.description}</p>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {t.results.stats}
          </p>
          <dl className="mt-2 space-y-1 text-sm">
            <div className="flex items-center justify-between gap-2">
              <dt className="text-zinc-500">{t.results.effectiveLetters}</dt>
              <dd className="font-semibold tabular-nums text-zinc-900">
                {formatNumber(effectiveLetters)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-zinc-500">{t.results.ignoredChars}</dt>
              <dd className="font-semibold tabular-nums text-zinc-900">
                {formatNumber(ignoredChars)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-zinc-500">{t.results.activeFilters}</dt>
              <dd className="font-semibold tabular-nums text-zinc-900">
                {formatNumber(activeFilters)}
              </dd>
            </div>
          </dl>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold text-zinc-800">
            {t.results.comparison}
          </h3>
          <TextComparison text={result.originalText} config={config} />
        </Card>

        <Card className="p-5">
          <ElementDistribution result={result} />
        </Card>
      </div>

      <BreakdownTable result={result} config={config} />
    </div>
  );
}