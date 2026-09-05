import { describe, expect, it } from 'vitest';
import {
  isAllowedOcrMimeType,
  isRetryableOcrError,
  OCR_MAX_FILE_SIZE,
  OCR_MAX_BASE64_LENGTH,
} from '@/core/ocr';

describe('isAllowedOcrMimeType', () => {
  it('accepte les formats autorisés', () => {
    expect(isAllowedOcrMimeType('image/jpeg')).toBe(true);
    expect(isAllowedOcrMimeType('image/png')).toBe(true);
    expect(isAllowedOcrMimeType('image/webp')).toBe(true);
    expect(isAllowedOcrMimeType('image/gif')).toBe(true);
  });

  it('rejette les autres formats', () => {
    expect(isAllowedOcrMimeType('image/bmp')).toBe(false);
    expect(isAllowedOcrMimeType('application/pdf')).toBe(false);
    expect(isAllowedOcrMimeType('')).toBe(false);
  });
});

describe('isRetryableOcrError', () => {
  it('retourne vrai pour les erreurs côté fournisseur', () => {
    expect(isRetryableOcrError('provider_error')).toBe(true);
    expect(isRetryableOcrError('provider_unavailable')).toBe(true);
    expect(isRetryableOcrError('empty_result')).toBe(true);
  });

  it('retourne faux pour les erreurs de validation', () => {
    expect(isRetryableOcrError('invalid_type')).toBe(false);
    expect(isRetryableOcrError('file_too_large')).toBe(false);
    expect(isRetryableOcrError('invalid_request')).toBe(false);
  });
});

describe('limites OCR', () => {
  it('fixe la taille maximale à 5 Mo', () => {
    expect(OCR_MAX_FILE_SIZE).toBe(5 * 1024 * 1024);
  });

  it('fixe une limite base64 compatible avec 5 Mo', () => {
    expect(OCR_MAX_BASE64_LENGTH).toBeGreaterThan(OCR_MAX_FILE_SIZE);
  });
});