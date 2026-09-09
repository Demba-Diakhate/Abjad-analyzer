import * as Tesseract from 'tesseract.js';
import type { OcrErrorCode } from '@/core/ocr';

export type OcrProviderResult =
  | { ok: true; text: string }
  | { ok: false; code: OcrErrorCode };

const MAX_IMAGE_DIMENSION = 1600;

let workerPromise: Promise<Tesseract.Worker> | null = null;

function getWorker(): Promise<Tesseract.Worker> {
  if (!workerPromise) {
    workerPromise = Tesseract.createWorker(['ara', 'eng']);
  }
  return workerPromise;
}

function toDataUrl(mimeType: string, base64: string): string {
  return base64.startsWith('data:image/')
    ? base64
    : `data:${mimeType};base64,${base64}`;
}

function loadImage(image: HTMLImageElement, dataUrl: string): Promise<void> {
  return new Promise((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error('load failed'));
    image.src = dataUrl;
  });
}

async function prepareImage(dataUrl: string): Promise<string> {
  const image = new Image();
  await loadImage(image, dataUrl);

  const scale = Math.min(
    1,
    MAX_IMAGE_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight)
  );
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('canvas unavailable');
  }
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  return canvas.toDataURL('image/jpeg', 0.9);
}

export async function performClientOcr(
  mimeType: string,
  base64: string
): Promise<OcrProviderResult> {
  let worker: Tesseract.Worker;
  try {
    worker = await getWorker();
  } catch {
    workerPromise = null;
    return { ok: false, code: 'provider_unavailable' };
  }

  try {
    const prepared = await prepareImage(toDataUrl(mimeType, base64));
    const { data } = await worker.recognize(prepared);
    const text = (data.text ?? '').trim();
    if (text.length === 0) {
      return { ok: false, code: 'empty_result' };
    }
    return { ok: true, text };
  } catch {
    return { ok: false, code: 'provider_error' };
  }
}