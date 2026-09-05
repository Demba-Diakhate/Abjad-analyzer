'use client';

import { useRef, useState } from 'react';
import { useEffect } from 'react';
import { Check, Loader2, Save } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { useAbjad } from '@/hooks/use-abjad';
import { useHistory } from '@/hooks/use-history';
import type { HistorySource } from '@/types';
import { TextInput } from './text-input';
import { Toolbar } from './toolbar';
import { ConfigPanel } from './config-panel';
import { OcrPanel, type OcrPanelMode } from '@/components/ocr/ocr-panel';
import { ResultDashboard } from '@/components/results/result-dashboard';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function AbjadWorkbench() {
  const { t } = useLanguage();
  const abjad = useAbjad();
  const { restoreFromHistory } = abjad;
  const history = useHistory();
  const [configOpen, setConfigOpen] = useState(false);
  const [ocrOpen, setOcrOpen] = useState(false);
  const [ocrMode, setOcrMode] = useState<OcrPanelMode>('image');
  const [source, setSource] = useState<HistorySource>('manual');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => restoreFromHistory());
    return () => cancelAnimationFrame(id);
  }, [restoreFromHistory]);

  const canSave = Boolean(abjad.result);

  const openOcr = (mode: OcrPanelMode) => {
    setOcrMode(mode);
    setOcrOpen(true);
  };

  const handleOcrApply = (text: string, kind: HistorySource) => {
    if (text.trim().length === 0) return;
    abjad.setText(text);
    setSource(kind);
  };

  const handleTextChange = (value: string) => {
    abjad.setText(value);
    setSource('manual');
  };

  const handleSave = async () => {
    if (!abjad.result || abjad.text.trim().length === 0) return;
    try {
      setSaveState('saving');
      const title =
        abjad.text.trim().split(/\s+/).slice(0, 5).join(' ').slice(0, 40) ||
        t.appName;
      await history.addRecord({
        title,
        result: abjad.result,
        calculationConfig: abjad.config,
        source,
      });
      setSaveState('saved');
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => setSaveState('idle'), 2000);
    } catch {
      setSaveState('idle');
    }
  };

  return (
    <main id="main-content" className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
          {t.home.title}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">{t.home.subtitle}</p>
      </div>

      <div className="space-y-4">
        <TextInput value={abjad.text} onChange={handleTextChange} />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Toolbar
            open={configOpen}
            onToggle={() => setConfigOpen((v) => !v)}
            onOpenOcr={openOcr}
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave || saveState === 'saving'}
            className={cn(
              'inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500',
              saveState === 'saved'
                ? 'bg-emerald-600 text-emerald-50 hover:bg-emerald-700'
                : 'bg-amber-500 text-amber-950 hover:bg-amber-600',
              !canSave && 'cursor-not-allowed bg-zinc-300 text-zinc-500'
            )}
          >
            {saveState === 'saving' ? (
              <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
            ) : saveState === 'saved' ? (
              <Check aria-hidden="true" className="h-4 w-4" />
            ) : (
              <Save aria-hidden="true" className="h-4 w-4" />
            )}
            {saveState === 'saving'
              ? t.home.saving
              : saveState === 'saved'
                ? t.home.saved
                : t.home.save}
          </button>
        </div>

        {configOpen && (
          <ConfigPanel
            config={abjad.config}
            updateConfig={abjad.updateConfig}
            updateNormalization={abjad.updateNormalization}
          />
        )}

        {abjad.isCalculating && <span className="sr-only" aria-live="polite">…</span>}

        {abjad.result ? (
          <ResultDashboard result={abjad.result} config={abjad.config} />
        ) : (
          <Card className="flex min-h-[160px] flex-col items-center justify-center gap-2 p-8 text-center">
            <p className="text-lg font-arabic font-medium text-zinc-700">
              {t.home.emptyHint}
            </p>
            <p className="font-arabic text-sm text-zinc-500">{t.appName}</p>
          </Card>
        )}
      </div>

      <OcrPanel
        open={ocrOpen}
        initialMode={ocrMode}
        onClose={() => setOcrOpen(false)}
        onApply={handleOcrApply}
      />
    </main>
  );
}