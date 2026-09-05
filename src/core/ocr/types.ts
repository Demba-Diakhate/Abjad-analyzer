export const OCR_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export type AllowedOcrMimeType = (typeof OCR_ALLOWED_MIME_TYPES)[number];

export const OCR_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo

export const OCR_MAX_BASE64_LENGTH = 7 * 1024 * 1024; // ~5 Mo binaires encodés en base64

export const OCR_DEFAULT_MAX_DIMENSION = 1600;

export function isAllowedOcrMimeType(mimeType: string): mimeType is AllowedOcrMimeType {
  return (OCR_ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType);
}

export type OcrErrorCode =
  | 'invalid_request'
  | 'invalid_type'
  | 'file_too_large'
  | 'empty_result'
  | 'provider_unavailable'
  | 'provider_error';

const RETRYABLE_OCR_ERRORS: ReadonlySet<OcrErrorCode> = new Set([
  'provider_error',
  'provider_unavailable',
  'empty_result',
]);

export function isRetryableOcrError(code: OcrErrorCode): boolean {
  return RETRYABLE_OCR_ERRORS.has(code);
}

export interface OcrRequest {
  fileName: string;
  mimeType: string;
  base64: string;
}

export interface OcrSuccessResponse {
  text: string;
}

export interface OcrErrorResponse {
  error: string;
  code: OcrErrorCode;
}