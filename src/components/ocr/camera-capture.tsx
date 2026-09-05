'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera as CameraIcon, RefreshCw, VideoOff } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { OCR_DEFAULT_MAX_DIMENSION } from '@/core/ocr';

type CaptureStatus = 'starting' | 'live' | 'error';

export function CameraCapture({
  onCapture,
}: {
  onCapture: (base64: string) => void;
}) {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<CaptureStatus>('starting');
  const [errorKey, setErrorKey] = useState<'denied' | 'notFound' | 'generic' | null>(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const start = useCallback(async () => {
    setErrorKey(null);
    stopStream();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play();
      }
      setStatus('live');
    } catch (err) {
      const name = (err as DOMException | null)?.name;
      setErrorKey(
        name === 'NotAllowedError'
          ? 'denied'
          : name === 'NotFoundError'
            ? 'notFound'
            : 'generic'
      );
      setStatus('error');
    }
  }, [stopStream]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      void start();
    });
    return () => {
      cancelAnimationFrame(id);
      stopStream();
    };
  }, [start, stopStream]);

  const capture = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;
    const scale = Math.min(
      OCR_DEFAULT_MAX_DIMENSION / video.videoWidth,
      OCR_DEFAULT_MAX_DIMENSION / video.videoHeight,
      1
    );
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) return;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    onCapture(canvas.toDataURL('image/jpeg', 0.85));
  }, [onCapture]);

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
        <video
          ref={videoRef}
          playsInline
          muted
          className={status === 'live' ? 'h-full w-full object-cover' : 'hidden'}
        />
        {status === 'starting' && (
          <div
            role="status"
            className="absolute inset-0 grid place-items-center text-sm text-zinc-500"
          >
            <span className="flex items-center gap-2">
              <RefreshCw aria-hidden="true" className="h-4 w-4 animate-spin" />
              {t.camera.starting}
            </span>
          </div>
        )}
        {status === 'error' && (
          <div
            role="alert"
            className="absolute inset-0 grid place-items-center gap-2 text-center"
          >
            <VideoOff aria-hidden="true" className="h-6 w-6 text-zinc-400" />
            <p className="px-4 text-sm text-zinc-600">
              {errorKey === 'denied'
                ? t.camera.errorDenied
                : errorKey === 'notFound'
                  ? t.camera.errorNotFound
                  : t.camera.errorGeneric}
            </p>
          </div>
        )}
      </div>
      <p className="text-xs text-zinc-500">{t.camera.startInstr}</p>
      <div className="flex items-center justify-center gap-2">
        {status === 'live' ? (
          <button
            type="button"
            onClick={capture}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-amber-500 px-5 text-sm font-medium text-amber-950 transition-colors hover:bg-amber-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
          >
            <CameraIcon aria-hidden="true" className="h-4 w-4" />
            {t.camera.capture}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void start()}
            disabled={status === 'starting'}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-zinc-300 bg-white px-5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 disabled:cursor-not-allowed disabled:text-zinc-400"
          >
            <RefreshCw aria-hidden="true" className="h-4 w-4" />
            {t.camera.retake}
          </button>
        )}
      </div>
    </div>
  );
}