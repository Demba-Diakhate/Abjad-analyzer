'use client';

import { useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { isArabicText } from '@/lib/utils';

export function TextInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { t, dir } = useLanguage();
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  const textDirection =
    value === '' ? dir : isArabicText(value) ? 'rtl' : 'ltr';

  return (
    <div className="relative">
      <label htmlFor="abjad-text" className="sr-only">
        {t.home.textareaLabel}
      </label>
      <textarea
        ref={ref}
        id="abjad-text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        dir={textDirection}
        rows={6}
        spellCheck={false}
        placeholder={t.home.placeholder}
        className={`font-arabic w-full resize-y rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-2xl leading-relaxed text-zinc-900 shadow-sm outline-none transition-shadow placeholder:text-zinc-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 sm:px-5 ${
          focused ? 'ring-2 ring-amber-500/30' : ''
        }`}
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => {
            onChange('');
            ref.current?.focus();
          }}
          aria-label={t.home.clear}
          title={t.home.clear}
          className="absolute end-3 top-3 grid h-7 w-7 place-items-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 focus-visible:outline-2 focus-visible:outline-amber-500"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
      <p className="mt-2 text-xs text-zinc-500" aria-live="polite">
        {t.home.charCount.replace('{count}', String(value.length))}
      </p>
    </div>
  );
}