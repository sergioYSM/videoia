'use client';
import { useId } from 'react';
import { Check, Gauge, Sparkles } from 'lucide-react';
import { cx } from './cx';
export type ModelOption = { id: string; name: string; strength: string; speed: 'rápido' | 'medio' | 'lento'; quality: 'buena' | 'alta' | 'máxima'; fromCredits: number; disabledReason?: string };
export function ModelPicker({ models, value, onChange }: { models: ModelOption[]; value: string; onChange: (id: string) => void }) {
  const name = useId();
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold">Modelo</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {models.map((m) => {
          const on = value === m.id; const off = !!m.disabledReason;
          return (
            <label key={m.id} className={cx('relative flex cursor-pointer flex-col gap-1 rounded-lg border bg-surface-raised p-3 transition has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-focus',
              on ? 'border-accent shadow-glow' : 'border-border hover:bg-surface-hover', off && 'cursor-not-allowed opacity-60')}>
              <input type="radio" name={name} value={m.id} checked={on} disabled={off} onChange={() => onChange(m.id)} className="sr-only" />
              <span className="flex items-center justify-between gap-2 font-semibold">{m.name}{on && <Check size={16} className="text-accent" aria-hidden />}</span>
              <span className="text-xs text-text-muted">{m.strength}</span>
              <span className="mt-1 flex flex-wrap gap-2 text-xs text-text-muted">
                <span className="inline-flex items-center gap-1"><Gauge size={12} aria-hidden />{m.speed}</span>
                <span className="inline-flex items-center gap-1"><Sparkles size={12} aria-hidden />calidad {m.quality}</span>
                <span className="tabular ml-auto text-text">desde {m.fromCredits} créditos</span>
              </span>
              {off && <span className="text-xs text-warning">{m.disabledReason}</span>}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
