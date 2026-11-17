'use client';
import { useRef } from 'react';
import { Heart } from 'lucide-react';
import { cx } from './cx';
export function VideoTile({ prompt, poster, src, duration, aspect = '9 / 16', favourite, onToggleFavourite, onOpen }: { prompt: string; poster: string; src?: string; duration: number; aspect?: string; favourite?: boolean; onToggleFavourite?: () => void; onOpen: () => void }) {
  const v = useRef<HTMLVideoElement>(null);
  const play = () => { if (!matchMedia('(prefers-reduced-motion: reduce)').matches) v.current?.play().catch(() => {}); };
  const stop = () => { if (v.current) { v.current.pause(); v.current.currentTime = 0; } };
  return (
    <div className="group relative overflow-hidden rounded-md bg-surface-raised" style={{ aspectRatio: aspect }} onMouseEnter={play} onMouseLeave={stop}>
      <button type="button" onClick={onOpen} onFocus={play} onBlur={stop} aria-label={`Ver vídeo: ${prompt}`} className="absolute inset-0 rounded-md focus-visible:outline-offset-[-2px]">
        <span aria-hidden className="absolute inset-0" style={{ background: poster }} />
        {src && <video ref={v} src={src} muted loop playsInline preload="none" aria-hidden className="absolute inset-0 h-full w-full object-cover" />}
      </button>
      <span className="tabular pointer-events-none absolute bottom-1.5 left-1.5 rounded-sm bg-scrim/70 px-1.5 py-0.5 text-xs">{duration} s</span>
      {onToggleFavourite && <button type="button" onClick={onToggleFavourite} aria-pressed={!!favourite} aria-label="Favorito"
        className={cx('absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-scrim/70 transition hover:bg-scrim', favourite ? 'text-danger' : 'text-text opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100')}>
        <Heart size={16} fill={favourite ? 'currentColor' : 'none'} aria-hidden />
      </button>}
    </div>
  );
}
