'use client';

import type { AbjadResult, CalculationConfig } from '@/types';
import { BreakdownTable } from './breakdown-table';

export function ResultDashboard({
  result,
  config,
}: {
  result: AbjadResult;
  config: CalculationConfig;
}) {
  return <BreakdownTable result={result} config={config} />;
}