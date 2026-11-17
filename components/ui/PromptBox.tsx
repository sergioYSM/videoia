'use client';
import { useId } from 'react';
import { X } from 'lucide-react';
import { cx } from './cx';
export const PROMPT_MAX = 2000;
export function PromptBox({ value, onChange, onSubmit, error, label = 'Describe el vídeo' }: { value: string; onChange: (v: string) => void; onSubmit?: () => void; error?: string; label?: string }) {
  const id = useId();
  const n = value.length, near = n >= PROMPT_MAX * 0.9, over = n > PROMPT_MAX;
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-2 block text-sm font-semibold">{label}</label>
      <div className={cx('relative rounded-lg border bg-surface-raised focus-within:outline focus-within:outline-2 focus-within:outline-focus', error || over ? 'border-danger' : 'border-border-input')}>
        <textarea id={id} value={value} rows={3} onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); onSubmit?.(); } }}
          aria-describedby={`${id}-count ${id}-err`} aria-invalid={!!error || over}
          placeholder="Un faro en un acantilado al atardecer, olas rompiendo, luz cálida"
          style={{ fieldSizing: "content" } as React.CSSProperties} className="block min-w-0 max-h-[200px] min-h-[84px] w-full resize-none bg-transparent px-4 py-3 pr-10 text-base placeholder:text-text-subtle focus:outline-none" />
        {value && <button type="button" onClick={() => onChange('')} aria-label="Borrar descripción" className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:bg-surface-hover hover:text-text"><X size={16} /></button>}
      </div>
      <div className="mt-1 flex justify-between gap-2 text-xs">
        <p id={`${id}-err`} role={error ? 'alert' : undefined} className="text-danger">{error}</p>
        <p id={`${id}-count`} className={cx('tabular shrink-0', over ? 'text-danger' : near ? 'text-warning' : 'text-text-subtle')} aria-live={near ? 'polite' : 'off'}>{n} / {PROMPT_MAX}</p>
      </div>
    </div>
  );
}
