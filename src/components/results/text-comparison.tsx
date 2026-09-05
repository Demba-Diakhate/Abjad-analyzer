'use client';

import { normalizeText } from '@/core/abjad';
import type { CalculationConfig } from '@/types';
import { useLanguage } from '@/contexts/language-context';

const REASON_LABEL: Record<string, 'convertHamza' | 'convertTamarbuta' | 'convertAlifMaqsura' | 'removeTashkeel' | 'removeTatweel'> = {
  hamza: 'convertHamza',
  tamarbuta: 'convertTamarbuta',
  alifmaqsura: 'convertAlifMaqsura',
  tashkeel: 'removeTashkeel',
  tatweel: 'removeTatweel',
};

export function TextComparison({
  text,
  config,
}: {
  text: string;
  config: CalculationConfig;
}) {
  const { t, dir } = useLanguage();
  const { normalized, changes } = normalizeText(text, {
    config: config.normalization,
    preserveShadda: config.phoneticMode,
  });

  const changeMap = new Map<number, (typeof changes)[number]>();
  for (const change of changes) {
    changeMap.set(change.index, change);
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="mb-1 text-xs font-medium text-zinc-500">
          {t.results.originalText}
        </p>
        <div
          dir={dir}
          className="font-arabic min-h-[56px] rounded-xl border border-zinc-100 bg-zinc-50 p-3 text-xl leading-relaxed text-zinc-800"
        >
          {Array.from(text)
            .map((char, index) => {
              const change = changeMap.get(index);
              if (!change) {
                return <span key={index}>{char}</span>;
              }
              const reasonKey = REASON_LABEL[change.reason]
                ? t.config.filters[REASON_LABEL[change.reason]]
                : t.results.ignored;
              return (
                <mark
                  key={index}
                  title={`${t.results.ignored} · ${reasonKey}`}
                  className="rounded-sm bg-amber-100 px-0.5 text-amber-900"
                >
                  {char}
                </mark>
              );
            })}
        </div>
      </div>

      <div>
        <p className="mb-1 text-xs font-medium text-zinc-500">
          {t.results.normalizedText}
        </p>
        <div
          dir={dir}
          className="font-arabic min-h-[56px] rounded-xl border border-amber-200 bg-amber-50/40 p-3 text-xl leading-relaxed text-zinc-800"
        >
          {normalized.length === 0
            ? t.results.notAvailable
            : normalized
                .split('')
                .map((char, index) => <span key={index}>{char}</span>)}
        </div>
      </div>
    </div>
  );
}