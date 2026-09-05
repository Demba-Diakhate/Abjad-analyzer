import { NextResponse } from 'next/server';
import { performOcr } from '@/lib/gemini';
import {
  OCR_MAX_BASE64_LENGTH,
  isAllowedOcrMimeType,
  type OcrErrorResponse,
  type OcrRequest,
  type OcrSuccessResponse,
} from '@/core/ocr/types';

export const runtime = 'nodejs';

export async function POST(
  request: Request
): Promise<NextResponse<OcrSuccessResponse | OcrErrorResponse>> {
  let body: OcrRequest;
  try {
    body = (await request.json()) as OcrRequest;
  } catch {
    return NextResponse.json(
      { error: 'Requête invalide.', code: 'invalid_request' },
      { status: 400 }
    );
  }

  const { mimeType, base64 } = body;

  if (!base64 || typeof base64 !== 'string' || base64.length === 0) {
    return NextResponse.json(
      { error: 'Aucune donnée d’image fournie.', code: 'invalid_request' },
      { status: 400 }
    );
  }

  if (typeof mimeType !== 'string' || !isAllowedOcrMimeType(mimeType)) {
    return NextResponse.json(
      { error: 'Format d’image non pris en charge.', code: 'invalid_type' },
      { status: 415 }
    );
  }

  if (base64.length > OCR_MAX_BASE64_LENGTH) {
    return NextResponse.json(
      { error: 'Fichier trop volumineux (5 Mo maximum).', code: 'file_too_large' },
      { status: 413 }
    );
  }

  const result = await performOcr(base64, mimeType);

  if (!result.ok) {
    const status = result.code === 'provider_unavailable' ? 503 : 502;
    return NextResponse.json(
      { error: 'Le service OCR a échoué.', code: result.code },
      { status }
    );
  }

  return NextResponse.json({ text: result.text });
}