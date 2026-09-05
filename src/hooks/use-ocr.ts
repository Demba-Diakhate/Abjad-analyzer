'use client';

import { useCallback, useState } from 'react';
import {
  OCR_MAX_FILE_SIZE,
  isAllowedOcrMimeType,
  type OcrErrorCode,
} from '@/core/ocr';

export type OcrStatus = 'idle' | 'processing' | 'success' | 'error';

interface OcrState {
  status: OcrStatus;
  extractedText: string;
  errorCode: OcrErrorCode | null;
  errorDetail: string;
  fileName: string | null;
  imageDataUrl: string | null;
  lastRequest: { mimeType: string; base64: string } | null;
}

const INITIAL_STATE: OcrState = {
  status: 'idle',
  extractedText: '',
  errorCode: null,
  errorDetail: '',
  fileName: null,
  imageDataUrl: null,
  lastRequest: null,
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const marker = 'base64,';
      const index = result.indexOf(marker);
      resolve(index >= 0 ? result.slice(index + marker.length) : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function useOcr() {
  const [state, setState] = useState<OcrState>(INITIAL_STATE);

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  const recognizeBase64 = useCallback(
    async (mimeType: string, base64: string, preview: string | null = null) => {
      setState({
        status: 'processing',
        extractedText: '',
        errorCode: null,
        errorDetail: '',
        fileName: null,
        imageDataUrl: preview,
        lastRequest: { mimeType, base64 },
      });

      try {
        const response = await fetch('/api/ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mimeType, base64, fileName: '' }),
        });

        const data = (await response.json()) as {
          text?: string;
          error?: string;
          code?: OcrErrorCode;
        };

        if (!response.ok) {
          setState((prev) => ({
            ...prev,
            status: 'error',
            errorCode: data.code ?? 'provider_error',
            errorDetail: data.error ?? '',
          }));
          return;
        }

        setState((prev) => ({
          ...prev,
          status: 'success',
          extractedText: data.text ?? '',
        }));
      } catch {
        setState((prev) => ({
          ...prev,
          status: 'error',
          errorCode: 'provider_error',
          errorDetail: '',
        }));
      }
    },
    []
  );

  const recognizeFile = useCallback(
    async (file: File) => {
      if (!isAllowedOcrMimeType(file.type)) {
        setState((prev) => ({
          ...prev,
          status: 'error',
          errorCode: 'invalid_type',
          errorDetail: '',
          fileName: file.name,
        }));
        return;
      }

      if (file.size > OCR_MAX_FILE_SIZE) {
        setState((prev) => ({
          ...prev,
          status: 'error',
          errorCode: 'file_too_large',
          errorDetail: '',
          fileName: file.name,
        }));
        return;
      }

      try {
        const base64 = await fileToBase64(file);
        await recognizeBase64(file.type, base64, URL.createObjectURL(file));
      } catch {
        setState((prev) => ({
          ...prev,
          status: 'error',
          errorCode: 'provider_error',
          errorDetail: '',
          fileName: file.name,
        }));
      }
    },
    [recognizeBase64]
  );

  const retry = useCallback(async () => {
    const lastRequest = state.lastRequest;
    if (!lastRequest) return;
    await recognizeBase64(lastRequest.mimeType, lastRequest.base64, state.imageDataUrl);
  }, [state.lastRequest, state.imageDataUrl, recognizeBase64]);

  return {
    status: state.status,
    extractedText: state.extractedText,
    errorCode: state.errorCode,
    errorDetail: state.errorDetail,
    fileName: state.fileName,
    imageDataUrl: state.imageDataUrl,
    recognizeBase64,
    recognizeFile,
    retry,
    reset,
  };
}