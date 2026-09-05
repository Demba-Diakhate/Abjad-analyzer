'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils';

export interface ToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description?: string;
}

export function Toggle({ checked, onChange, label, description }: ToggleProps) {
  const labelId = useId();
  const descriptionId = useId();

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p id={labelId} className="text-sm font-medium text-zinc-800">
          {label}
        </p>
        {description ? (
          <p id={descriptionId} className="mt-0.5 text-xs text-zinc-500">
            {description}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        aria-describedby={description ? descriptionId : undefined}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500',
          checked ? 'bg-amber-500' : 'bg-zinc-300'
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
            checked
              ? 'translate-x-[22px] rtl:-translate-x-[22px]'
              : 'translate-x-0.5 rtl:-translate-x-0.5'
          )}
        />
      </button>
    </div>
  );
}