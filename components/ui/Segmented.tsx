'use client';
import { useId } from 'react';
import { cx } from './cx';
export function Segmented<T extends string>({ legend, value, options, onChange }: { legend: string; value: T; options: { value: T; label: string; icon?: React.ReactNode; disabled?: boolean }[]; onChange: (v: T) => void }) {
  const name = useId();
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold">{legend}</legend>
      <div className="inline-flex gap-1 rounded-full bg-surface p-1">
        {options.map((o) => (
          <label key={o.value} className={cx('flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 text-sm transition has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-focus',
            value === o.value ? 'bg-surface-active font-semibold text-text' : 'text-text-muted hover:text-text', o.disabled && 'cursor-not-allowed opacity-50')}>
            <input type="radio" name={name} value={o.value} checked={value === o.value} disabled={o.disabled} onChange={() => onChange(o.value)} className="sr-only" />
            {o.icon}{o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
export function AspectIcon({ aspect }: { aspect: string }) {
  const [w, h] = aspect.split(':').map(Number); const s = 14 / Math.max(w, h);
  return <span aria-hidden className="inline-block rounded-[2px] border border-current" style={{ width: w * s, height: h * s }} />;
}
