'use client';
import { useId, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { cx } from './cx';
export const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export function checkImage(f: File): string | null {
  if (!TYPES.includes(f.type)) return 'Usa una imagen JPG, PNG o WebP.';
  if (f.size > MAX_IMAGE_BYTES) return 'La imagen pesa más de 20 MB.';
  return null;
}
export function ImageDropzone({ preview, aspect = '9 / 16', onFile, onClear, uploading, progress, error }: { preview?: string; aspect?: string; onFile: (f: File) => void; onClear: () => void; uploading?: boolean; progress?: number; error?: string }) {
  const id = useId(); const [over, setOver] = useState(false);
  if (preview) return (
    <div className="relative w-40 overflow-hidden rounded-lg bg-surface-raised" style={{ aspectRatio: aspect }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={preview} alt="Imagen de partida" className="h-full w-full object-cover" />
      {uploading && <progress value={progress} max={1} aria-label="Subiendo imagen" className="absolute inset-x-2 bottom-2 h-1 w-[calc(100%-1rem)] accent-accent" />}
      <button type="button" onClick={onClear} aria-label="Quitar imagen" className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-scrim/70 text-text hover:bg-scrim"><X size={16} /></button>
    </div>
  );
  return (
    <div>
      <div onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files[0]; if (f) onFile(f); }}
        className={cx('flex flex-col items-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center transition', over ? 'border-accent bg-surface-hover' : error ? 'border-danger' : 'border-border-input')}>
        <ImagePlus size={24} className="text-text-muted" aria-hidden />
        <p className="text-sm text-text-muted">Arrastra una imagen o</p>
        <label htmlFor={id} className="cursor-pointer rounded-md bg-surface-raised px-3 py-2 text-sm font-semibold hover:bg-surface-hover focus-within:outline focus-within:outline-2 focus-within:outline-focus">
          Elegir imagen
          <input id={id} type="file" accept={TYPES.join(',')} className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ''; }} />
        </label>
        <p className="text-xs text-text-subtle">JPG, PNG o WebP, hasta 20 MB. Opcional.</p>
      </div>
      {error && <p role="alert" className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
