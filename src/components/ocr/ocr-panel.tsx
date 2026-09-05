'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Camera,
  FileUp,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  ScanText,
  X,
} from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { useOcr } from '@/hooks/use-ocr';
import { isRetryableOcrError, type OcrErrorCode } from '@/core/ocr';
import type { HistorySource } from '@/types';
import type { Dictionary } from '@/i18n/fr';
import { CameraCapture } from './camera-capture';
import { cn } from '@/lib/utils';

export type OcrPanelMode = 'image' | 'camera';

const OCR_ERROR_KEYS: Record<OcrErrorCode, keyof Dictionary['ocr']['errors']> = {
  invalid_request: 'invalid_request',
  invalid_type: 'invalid_type',
  file_too_large: 'file_too_large',
  empty_result: 'empty_result',
  provider_unavailable: 'provider_unavailable',
  provider_error: 'provider_error',
};

function ResultCorrection({
  initialText,
  onApply,
}: {
  initialText: string;
  onApply: (text: string) => void;
}) {
  const { t } = useLanguage();
  const [edited, setEdited] = useState(initialText);

  return (
    <div className="space-y-2">
      <label
        htmlFor="ocr-result"
        className="block text-sm font-medium text-zinc-700"
      >
        {t.ocr.resultLabel}
      </label>
      <textarea
        id="ocr-result"
        value={edited}
        onChange={(e) => setEdited(e.target.value)}
        dir="rtl"
        rows={5}
        spellCheck={false}
        className="font-arabic w-full resize-y rounded-xl border border-zinc-200 bg-white px-3 py-2 text-lg leading-relaxed text-zinc-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30"
      />
      <p className="text-xs text-zinc-500">{t.ocr.correctionHint}</p>
      <button
        type="button"
        onClick={() => onApply(edited)}
        className="inline-flex h-9 items-center gap-1.5 rounded-full bg-amber-500 px-5 text-sm font-medium text-amber-950 transition-colors hover:bg-amber-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
      >
        <ScanText aria-hidden="true" className="h-4 w-4" />
        {t.ocr.apply}
      </button>
    </div>
  );
}

export function OcrPanel({
  open,
  initialMode,
  onClose,
  onApply,
}: {
  open: boolean;
  initialMode: OcrPanelMode;
  onClose: () => void;
  onApply: (text: string, source: HistorySource) => void;
}) {
  const { t } = useLanguage();
  const ocr = useOcr();
  const { reset: resetOcr } = ocr;
  const [activeTab, setActiveTab] = useState<OcrPanelMode>(initialMode);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const appliedRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      appliedRef.current = false;
      setActiveTab(initialMode);
      resetOcr();
    });
    return () => cancelAnimationFrame(id);
  }, [open, initialMode, resetOcr]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const raf = requestAnimationFrame(() => panelRef.current?.focus());
    return () => {
      cancelAnimationFrame(raf);
      previous?.focus?.();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const container = panelRef.current;
    if (!container) return;
    const onTab = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const focusable = container.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onTab);
    return () => window.removeEventListener('keydown', onTab);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    void ocr.recognizeFile(file);
  };

  const handleApply = (text: string) => {
    if (appliedRef.current) return;
    appliedRef.current = true;
    onApply(text, activeTab === 'camera' ? 'camera' : 'ocr');
    onClose();
  };

  const errorMessage =
    ocr.errorCode && OCR_ERROR_KEYS[ocr.errorCode]
      ? t.ocr.errors[OCR_ERROR_KEYS[ocr.errorCode]]
      : ocr.errorDetail;

  const showResult = ocr.status === 'success';
  const showError = ocr.status === 'error';
  const showPreview = Boolean(ocr.imageDataUrl) && (showResult || ocr.status === 'processing');

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-zinc-900/50 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ocr-dialog-title"
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl focus:outline-none"
      >
        <div className="flex items-center justify-between gap-2 border-b border-zinc-100 px-5 py-4">
          <h2 id="ocr-dialog-title" className="text-base font-semibold text-zinc-900">
            {t.ocr.dialogLabel}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.common.close}
            className="grid h-8 w-8 place-items-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 focus-visible:outline-2 focus-visible:outline-amber-500"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-1 px-5 pt-4">
          <button
            type="button"
            onClick={() => setActiveTab('image')}
            aria-pressed={activeTab === 'image'}
            className={cn(
              'inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-amber-500',
              activeTab === 'image'
                ? 'bg-amber-50 text-amber-800'
                : 'text-zinc-600 hover:bg-zinc-100'
            )}
          >
            <ImageIcon aria-hidden="true" className="h-4 w-4" />
            {t.ocr.tabImage}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('camera')}
            aria-pressed={activeTab === 'camera'}
            className={cn(
              'inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-amber-500',
              activeTab === 'camera'
                ? 'bg-amber-50 text-amber-800'
                : 'text-zinc-600 hover:bg-zinc-100'
            )}
          >
            <Camera aria-hidden="true" className="h-4 w-4" />
            {t.ocr.tabCamera}
          </button>
        </div>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto p-5">
          {ocr.status === 'processing' && (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 py-8 text-sm text-zinc-600">
              <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin text-amber-500" />
              {t.ocr.processing}
            </div>
          )}

          {showError && (
            <div
              className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4"
              role="alert"
            >
              <p className="text-sm font-medium text-red-700">{t.ocr.errorTitle}</p>
              <p className="text-sm text-red-600">{errorMessage}</p>
              {ocr.errorCode && isRetryableOcrError(ocr.errorCode) && (
                <button
                  type="button"
                  onClick={() => void ocr.retry()}
                  className="inline-flex h-8 items-center gap-1.5 rounded-full border border-red-300 bg-white px-4 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 focus-visible:outline-2 focus-visible:outline-red-500"
                >
                  <RefreshCw aria-hidden="true" className="h-4 w-4" />
                  {t.ocr.retry}
                </button>
              )}
            </div>
          )}

          {showPreview && (
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                {t.ocr.previewLabel}
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element -- aperçu local via data URL (blob du fichier/caméra), non optimisable */}
              <img
                src={ocr.imageDataUrl ?? ''}
                alt=""
                className="max-h-56 w-full rounded-xl border border-zinc-200 object-contain"
              />
            </div>
          )}

          {showResult && ocr.extractedText && (
            <ResultCorrection
              initialText={ocr.extractedText}
              onApply={handleApply}
            />
          )}

          {!showResult && !showError && ocr.status !== 'processing' && (
            activeTab === 'camera' ? (
              <CameraCapture
                onCapture={(base64) =>
                  void ocr.recognizeBase64('image/jpeg', base64, base64)
                }
              />
            ) : (
              <div
                role="button"
                tabIndex={0}
                aria-label={t.ocr.dropzone}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  handleFile(e.dataTransfer.files?.[0]);
                }}
                className={cn(
                  'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors focus-visible:outline-2 focus-visible:outline-amber-500',
                  dragging
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-zinc-300 bg-zinc-50 hover:border-amber-400 hover:bg-amber-50/40'
                )}
              >
                <FileUp
                  aria-hidden="true"
                  className={cn('h-8 w-8', dragging ? 'text-amber-500' : 'text-zinc-400')}
                />
                <p className="text-sm font-medium text-zinc-700">
                  {dragging ? t.ocr.dropzoneActive : t.ocr.dropzone}
                </p>
                <p className="text-xs text-zinc-500">{t.ocr.supportedTypes}</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  onChange={(e) => {
                    handleFile(e.target.files?.[0]);
                    e.target.value = '';
                  }}
                />
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}