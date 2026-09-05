export interface NormalizationConfig {
  convertHamza: boolean;
  convertTamarbuta: boolean;
  convertAlifMaqsura: boolean;
  removeTashkeel: boolean;
  removeTatweel: boolean;
}

export type CalculationMethod = 'classic' | 'reduced';

export interface CalculationConfig {
  method: CalculationMethod;
  reduction: boolean;
  phoneticMode: boolean;
  normalization: NormalizationConfig;
}

export interface LetterBreakdown {
  id: string;
  char: string;
  normalizedChar: string;
  value: number;
  position: number;
  ignored: boolean;
  explanation?: string;
}

export type ElementType = 'fire' | 'earth' | 'air' | 'water';

export interface ElementDistribution {
  fire: number;
  earth: number;
  air: number;
  water: number;
}

export interface MethodDetails {
  id: string;
  name: string;
  description: string;
}

export interface AbjadResult {
  originalText: string;
  normalizedText: string;
  totalValue: number;
  reducedValue?: number;
  breakdown: LetterBreakdown[];
  methodDetails: MethodDetails;
  elementDistribution?: ElementDistribution;
  timestamp: number;
}

export type HistorySource = 'manual' | 'ocr' | 'camera';

export interface HistoryRecord {
  id: string;
  title: string;
  result: AbjadResult;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  favorite: boolean;
  source: HistorySource;
  calculationConfig: CalculationConfig;
}
