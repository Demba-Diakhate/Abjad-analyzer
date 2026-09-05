'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { calculateAbjad, DEFAULT_CALCULATION_CONFIG } from '@/core/abjad';
import type { AbjadResult, CalculationConfig, NormalizationConfig } from '@/types';

const DEBOUNCE_THRESHOLD = 10_000;
const DEBOUNCE_MS = 150;
const OPEN_RECORD_KEY = 'abjad:open-record';

interface OpenRecord {
  text: string;
  config?: Partial<CalculationConfig>;
}

function readOpenRecord(): OpenRecord | null {
  try {
    const raw = sessionStorage.getItem(OPEN_RECORD_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(OPEN_RECORD_KEY);
    const data = JSON.parse(raw) as Partial<OpenRecord>;
    return {
      text: typeof data.text === 'string' ? data.text : '',
      config: data.config,
    };
  } catch {
    /* sessionStorage indisponible ou donnée corrompue : ignorer */
    return null;
  }
}

export function useAbjad() {
  const [text, setText] = useState('');
  const [config, setConfig] = useState<CalculationConfig>(() => ({
    ...DEFAULT_CALCULATION_CONFIG,
  }));
  const [result, setResult] = useState<AbjadResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const configRef = useRef(config);
  const textRef = useRef(text);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    textRef.current = text;
  }, [text]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  const compute = useCallback((value: string, cfg: CalculationConfig) => {
    setResult(calculateAbjad({ text: value, config: cfg }));
    setIsCalculating(false);
  }, []);

  const schedule = useCallback(
    (value: string, cfg: CalculationConfig) => {
      if (timerRef.current) clearTimeout(timerRef.current);

      if (value.length === 0) {
        setResult(null);
        setIsCalculating(false);
        return;
      }

      setIsCalculating(true);
      if (value.length > DEBOUNCE_THRESHOLD) {
        timerRef.current = setTimeout(() => {
          timerRef.current = null;
          compute(value, cfg);
        }, DEBOUNCE_MS);
      } else {
        compute(value, cfg);
      }
    },
    [compute]
  );

  const handleTextChange = useCallback(
    (value: string) => {
      setText(value);
      schedule(value, configRef.current);
    },
    [schedule]
  );

  const updateConfig = useCallback(
    (patch: Partial<CalculationConfig>) => {
      const next = { ...configRef.current, ...patch };
      setConfig(next);
      schedule(textRef.current, next);
    },
    [schedule]
  );

  const updateNormalization = useCallback(
    (patch: Partial<NormalizationConfig>) => {
      const current = configRef.current;
      const next = {
        ...current,
        normalization: { ...current.normalization, ...patch },
      };
      setConfig(next);
      schedule(textRef.current, next);
    },
    [schedule]
  );

  const restoreFromHistory = useCallback(() => {
    const record = readOpenRecord();
    if (!record) return;
    if (record.text) setText(record.text);
    const nextConfig: CalculationConfig = record.config
      ? { ...DEFAULT_CALCULATION_CONFIG, ...record.config }
      : configRef.current;
    if (record.config) setConfig(nextConfig);
    schedule(record.text, nextConfig);
  }, [schedule]);

  return {
    text,
    setText: handleTextChange,
    restoreFromHistory,
    config,
    updateConfig,
    updateNormalization,
    result,
    isCalculating,
  };
}