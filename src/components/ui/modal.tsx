'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

export function Modal({
  open,
  onClose,
  labelledBy,
  children,
}: {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  children: ReactNode;
}) {
  const { t } = useLanguage();
  const panelRef = useRef<HTMLDivElement>(null);

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
        'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
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
        aria-labelledby={labelledBy}
        className="max-h-[85vh] w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl focus:outline-none"
      >
        <div className="flex items-center justify-between gap-2 border-b border-zinc-100 px-5 py-4">
          <h2 id={labelledBy} className="text-base font-semibold text-zinc-900">
            {t.toolbar.options}
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
        <div className="max-h-[70vh] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}