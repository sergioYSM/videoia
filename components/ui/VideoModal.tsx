'use client';
import { useEffect, useRef, useState } from 'react';
import { Copy, Download, Film, RotateCcw, Trash2, X } from 'lucide-react';
import { Button } from './Button';
export type VideoDetail = { id: string; prompt: string; model: string; preset?: string; aspect: string; duration: number; seed: number; cost: number; src?: string; poster: string };
export function VideoModal({ video, onClose, onRegenerate, onCopySettings, onDelete }: { video: VideoDetail | null; onClose: () => void; onRegenerate: () => void; onCopySettings: () => void; onDelete: () => void }) {
  const d = useRef<HTMLDialogElement>(null); const [confirm, setConfirm] = useState(false);
  useEffect(() => { const el = d.current; if (!el) return; if (video && !el.open) { setConfirm(false); el.showModal(); } if (!video && el.open) el.close(); }, [video]);
  const rows: [string, string][] = video ? [['Modelo', video.model], ['Movimiento', video.preset ?? 'Ninguno'], ['Formato', video.aspect], ['Duración', `${video.duration} s`], ['Semilla', String(video.seed)], ['Coste', `${video.cost} créditos`]] : [];
  return (
    <dialog ref={d} onClose={onClose} aria-labelledby="vm-title" className="m-auto w-[min(960px,calc(100vw-32px))] rounded-xl bg-surface p-0 text-text shadow-pop">
      {video && <div className="grid gap-4 p-4 md:grid-cols-[1fr_300px]">
        <div className="flex max-h-[70vh] items-center justify-center overflow-hidden rounded-lg bg-scrim">
          {video.src ? <video src={video.src} controls autoPlay playsInline className="max-h-[70vh] w-full" poster={undefined} />
            : <div aria-label="Vista previa" role="img" className="h-[70vh] max-w-full" style={{ aspectRatio: video.aspect.replace(':', ' / '), background: video.poster }} />}
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <h2 id="vm-title" className="text-base font-semibold">{video.prompt}</h2>
            <button type="button" onClick={onClose} aria-label="Cerrar" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-text-muted hover:bg-surface-hover hover:text-text"><X size={18} /></button>
          </div>
          <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">{rows.map(([k, v]) => <div key={k} className="contents"><dt className="text-text-muted">{k}</dt><dd className="tabular">{v}</dd></div>)}</dl>
          <div className="mt-auto grid gap-2">
            <Button onClick={() => video.src && window.open(video.src)}><Download size={16} aria-hidden />Descargar</Button>
            <Button variant="secondary" onClick={onRegenerate}><RotateCcw size={16} aria-hidden />Regenerar ({video.cost} créditos)</Button>
            <Button variant="secondary" onClick={onCopySettings}><Copy size={16} aria-hidden />Usar estos ajustes</Button>
            <Button variant="secondary"><Film size={16} aria-hidden />Abrir en el editor</Button>
            {confirm ? <div role="group" aria-label="Confirmar borrado" className="flex gap-2"><Button variant="danger" className="flex-1" onClick={onDelete}>Eliminar para siempre</Button><Button variant="ghost" onClick={() => setConfirm(false)}>No</Button></div>
              : <Button variant="ghost" onClick={() => setConfirm(true)}><Trash2 size={16} aria-hidden />Eliminar</Button>}
          </div>
        </div>
      </div>}
    </dialog>
  );
}
