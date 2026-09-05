'use client';

import { PROFILES } from '@/core/abjad';
import type { CalculationConfig } from '@/types';
import { useLanguage } from '@/contexts/language-context';
import { cn } from '@/lib/utils';
import { Toggle } from '@/components/ui/toggle';

function isEqualConfig(a: CalculationConfig, b: CalculationConfig): boolean {
  return (
    a.method === b.method &&
    a.reduction === b.reduction &&
    a.phoneticMode === b.phoneticMode &&
    a.normalization.convertHamza === b.normalization.convertHamza &&
    a.normalization.convertTamarbuta === b.normalization.convertTamarbuta &&
    a.normalization.convertAlifMaqsura === b.normalization.convertAlifMaqsura &&
    a.normalization.removeTashkeel === b.normalization.removeTashkeel &&
    a.normalization.removeTatweel === b.normalization.removeTatweel
  );
}

export function ConfigPanel({
  config,
  updateConfig,
  updateNormalization,
}: {
  config: CalculationConfig;
  updateConfig: (patch: Partial<CalculationConfig>) => void;
  updateNormalization: (patch: Partial<CalculationConfig['normalization']>) => void;
}) {
  const { t } = useLanguage();

  const activeProfile = (
    ['standard', 'strict', 'phonetic'] as const
  ).find((key) => isEqualConfig(config, PROFILES[key]));

  return (
    <section
      aria-label={t.config.profile}
      className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5"
    >
      <div className="space-y-5">
        {/* Profils */}
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {t.config.profile}
          </h3>
          <div className="flex flex-wrap gap-2" role="group" aria-label={t.config.profile}>
            {(
              ['standard', 'strict', 'phonetic', 'custom'] as const
            ).map((key) => {
              const selected = key === 'custom' ? activeProfile === undefined : activeProfile === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    if (key !== 'custom') {
                      updateConfig(PROFILES[key]);
                    }
                  }}
                  aria-pressed={selected}
                  disabled={key === 'custom'}
                  className={cn(
                    'inline-flex h-8 items-center rounded-full border px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500',
                    selected
                      ? 'border-amber-500 bg-amber-50 text-amber-800'
                      : 'border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-100',
                    key === 'custom' && 'cursor-not-allowed opacity-50'
                  )}
                >
                  {t.config.profiles[key]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Méthode */}
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {t.config.method}
          </h3>
          <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label={t.config.method}>
            {(['classic', 'reduced'] as const).map((method) => {
              const selected = config.method === method;
              return (
                <button
                  key={method}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => updateConfig({ method })}
                  className={cn(
                    'rounded-xl border p-3 text-start transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500',
                    selected
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-zinc-200 bg-white hover:bg-zinc-50'
                  )}
                >
                  <span className="block text-sm font-semibold text-zinc-900">
                    {method === 'classic' ? t.config.grandAbjad : t.config.petitAbjad}
                  </span>
                  <span className="mt-0.5 block text-xs text-zinc-500">
                    {method === 'classic'
                      ? t.config.grandAbjadDesc
                      : t.config.petitAbjadDesc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Réduction + phonétique */}
        <div className="space-y-3 rounded-xl border border-zinc-100 bg-zinc-50/60 p-3">
          <Toggle
            checked={config.reduction}
            onChange={(v) => updateConfig({ reduction: v })}
            label={t.config.reduction}
          />
          <Toggle
            checked={config.phoneticMode}
            onChange={(v) => updateConfig({ phoneticMode: v })}
            label={t.config.phoneticMode}
          />
        </div>

        {/* Filtres de normalisation */}
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {t.config.normalization}
          </h3>
          <div className="space-y-3 rounded-xl border border-zinc-100 bg-zinc-50/60 p-3">
            <Toggle
              checked={config.normalization.convertHamza}
              onChange={(v) => updateNormalization({ convertHamza: v })}
              label={t.config.filters.convertHamza}
            />
            <Toggle
              checked={config.normalization.convertTamarbuta}
              onChange={(v) => updateNormalization({ convertTamarbuta: v })}
              label={t.config.filters.convertTamarbuta}
            />
            <Toggle
              checked={config.normalization.convertAlifMaqsura}
              onChange={(v) => updateNormalization({ convertAlifMaqsura: v })}
              label={t.config.filters.convertAlifMaqsura}
            />
            <Toggle
              checked={config.normalization.removeTashkeel}
              onChange={(v) => updateNormalization({ removeTashkeel: v })}
              label={t.config.filters.removeTashkeel}
            />
            <Toggle
              checked={config.normalization.removeTatweel}
              onChange={(v) => updateNormalization({ removeTatweel: v })}
              label={t.config.filters.removeTatweel}
            />
          </div>
        </div>
      </div>
    </section>
  );
}