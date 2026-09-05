import {
  GoogleGenAI,
  createPartFromBase64,
  createPartFromText,
  createUserContent,
} from '@google/genai';
import type { OcrErrorCode } from '@/core/ocr/types';

const DEFAULT_MODEL = 'gemini-3.6-flash';

const OCR_PROMPT = [
  'You are an Arabic text recognition engine.',
  'Transcribe exactly the Arabic text visible in the image, from right to left.',
  'Preserve diacritical marks (tashkeel) and tatweel when they are clearly visible.',
  'Keep letter spacing and line breaks as faithful as possible.',
  'If nothing but non-text appears, output nothing.',
  'Do not describe the image, do not comment, do not translate.',
  'Output only the transcribed text and nothing else.',
].join('\n');

export type OcrProviderResult =
  | { ok: true; text: string }
  | { ok: false; code: OcrErrorCode };

export async function performOcr(
  base64: string,
  mimeType: string
): Promise<OcrProviderResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;

  if (!apiKey) {
    return { ok: false, code: 'provider_unavailable' };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model,
      contents: createUserContent([
        createPartFromBase64(base64, mimeType),
        createPartFromText(OCR_PROMPT),
      ]),
      config: { temperature: 0 },
    });

    const text = response.text?.trim() ?? '';
    if (text.length === 0) {
      return { ok: false, code: 'empty_result' };
    }

    return { ok: true, text };
  } catch {
    return { ok: false, code: 'provider_error' };
  }
}