'use client';
import { create } from 'zustand';
import { useEffect, useRef } from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
type Kind = 'info' | 'success' | 'error'; type T = { id: number; kind: Kind; text: string };
export const useToasts = create<{ list: T[]; push: (kind: Kind, text: string) => void; drop: (id: number) => void }>((set) => ({
  list: [], push: (kind, text) => set((s) => ({ list: [...s.list.slice(-2), { id: Date.now() + Math.random(), kind, text }] })), drop: (id) => set((s) => ({ list: s.list.filter((t) => t.id !== id) })),
}));
const ICON = { info: Info, success: CheckCircle2, error: AlertTriangle };
function One({ t }: { t: T }) {
  const drop = useToasts((s) => s.drop); const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const start = () => { timer.current = setTimeout(() => drop(t.id), 5000); }; const pause = () => clearTimeout(timer.current);
  useEffect(() => { start(); return pause; // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const I = ICON[t.kind];
  return (
    <div role={t.kind === 'error' ? 'alert' : 'status'} onMouseEnter={pause} onMouseLeave={start} onFocus={pause} onBlur={start}
      className="flex items-center gap-3 rounded-lg bg-surface-raised px-4 py-3 text-sm shadow-pop">
      <I size={18} aria-hidden className={t.kind === 'error' ? 'text-danger' : t.kind === 'success' ? 'text-success' : 'text-accent'} />
      <span className="flex-1">{t.text}</span>
      <button type="button" onClick={() => drop(t.id)} aria-label="Cerrar aviso" className="flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:bg-surface-hover hover:text-text"><X size={16} /></button>
    </div>
  );
}
export function Toaster() {
  const list = useToasts((s) => s.list);
  return <div className="fixed inset-x-4 bottom-20 z-50 mx-auto flex max-w-sm flex-col gap-2 md:bottom-6">{list.map((t) => <One key={t.id} t={t} />)}</div>;
}
