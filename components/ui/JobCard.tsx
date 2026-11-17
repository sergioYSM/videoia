'use client';
import { useEffect, useState } from 'react';
import { AlertTriangle, RotateCcw, X } from 'lucide-react';
import { Button } from './Button';
export type JobStatus = 'queued' | 'running' | 'failed' | 'cancelled';
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
export function JobCard({ prompt, model, preset, status, startedAt, poster, onCancel, onRetry, refunded }: { prompt: string; model: string; preset?: string; status: JobStatus; startedAt?: number; poster?: string; onCancel?: () => void; onRetry?: () => void; refunded?: number }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { if (status !== 'running') return; const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, [status]);
  const elapsed = startedAt ? Math.max(0, Math.round((now - startedAt) / 1000)) : 0;
  return (
    <article className="flex gap-3 rounded-lg bg-surface-raised p-3" aria-label={`Generación: ${prompt}`}>
      <div aria-hidden className="h-20 w-14 shrink-0 rounded-md bg-surface-active" style={poster ? { background: poster } : undefined} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{prompt}</p>
        <p className="truncate text-xs text-text-muted">{model}{preset ? ` · ${preset}` : ''}</p>
        <div role="status" className="mt-2 text-sm">
          {status === 'queued' && <span className="text-text-muted">En cola…</span>}
          {status === 'running' && <>
            <span className="tabular text-text-muted">Generando · {fmt(elapsed)}</span>
            <span className="relative mt-2 block h-1 overflow-hidden rounded-full bg-surface-active"><span className="indeterminate absolute inset-y-0 w-2/5 rounded-full bg-accent" /></span>
          </>}
          {status === 'failed' && <span className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-danger"><AlertTriangle size={14} aria-hidden />No se ha podido generar</span>
            {refunded ? <span className="rounded-full bg-surface-active px-2 py-0.5 text-xs text-success">{refunded} créditos devueltos</span> : null}
          </span>}
          {status === 'cancelled' && <span className="text-text-muted">Cancelado · créditos devueltos</span>}
        </div>
      </div>
      <div className="flex shrink-0 flex-col gap-1">
        {(status === 'queued') && onCancel && <Button variant="ghost" size="sm" onClick={onCancel} aria-label="Cancelar generación"><X size={14} aria-hidden />Cancelar</Button>}
        {status === 'failed' && onRetry && <Button variant="secondary" size="sm" onClick={onRetry}><RotateCcw size={14} aria-hidden />Reintentar</Button>}
      </div>
    </article>
  );
}
