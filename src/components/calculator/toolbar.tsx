'use client';

import { Camera, ImagePlus, Plus } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import type { OcrPanelMode } from '@/components/ocr/ocr-panel';
import { cn } from '@/lib/utils';

export function Toolbar({
  open,
  onToggle,
  onOpenOcr,
}: {
  open: boolean;
  onToggle: () => void;
  onOpenOcr: (mode: OcrPanelMode) => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
      >
        <Plus
          aria-hidden="true"
          className={cn('h-4 w-4 transition-transform', open && 'rotate-45')}
        />
        {t.toolbar.options}
      </button>

      <button
        type="button"
        onClick={() => onOpenOcr('image')}
        title={t.toolbar.importImageHint}
        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-amber-50 hover:text-amber-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
      >
        <ImagePlus aria-hidden="true" className="h-4 w-4" />
        {t.toolbar.importImage}
      </button>
      <button
        type="button"
        onClick={() => onOpenOcr('camera')}
        title={t.toolbar.takePhotoHint}
        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-amber-50 hover:text-amber-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
      >
        <Camera aria-hidden="true" className="h-4 w-4" />
        {t.toolbar.takePhoto}
      </button>
    </div>
  );
}