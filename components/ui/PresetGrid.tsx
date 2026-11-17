'use client';
import { useId, useMemo, useRef, useState } from 'react';
import { Check, Search } from 'lucide-react';
import { cx } from './cx';
export type Preset = { id: string; name: string; category: string; preview?: string; poster: string };
function PresetCard({ p, name, checked, onChange }: { p: Preset; name: string; checked: boolean; onChange: () => void }) {
  const v = useRef<HTMLVideoElement>(null);
  const play = () => { if (!matchMedia('(prefers-reduced-motion: reduce)').matches) v.current?.play().catch(() => {}); };
  const stop = () => { if (v.current) { v.current.pause(); v.current.currentTime = 0; } };
  return (
    <label onMouseEnter={play} onMouseLeave={stop} onFocus={play} onBlur={stop}
      className={cx('group relative aspect-[3/4] cursor-pointer overflow-hidden rounded-md border-2 transition has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-focus', checked ? 'border-accent' : 'border-transparent')}>
      <input type="radio" name={name} value={p.id} checked={checked} onChange={onChange} className="sr-only" />
      <span aria-hidden className="absolute inset-0" style={{ background: p.poster }} />
      {p.preview && <video ref={v} src={p.preview} muted loop playsInline preload="none" aria-hidden className="absolute inset-0 h-full w-full object-cover" />}
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-scrim to-transparent px-2 pb-2 pt-6 text-sm font-semibold">{p.name}</span>
      {checked && <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-on-accent"><Check size={14} aria-hidden /></span>}
    </label>
  );
}
export function PresetGrid({ presets, value, onChange }: { presets: Preset[]; value: string; onChange: (id: string) => void }) {
  const name = useId(); const searchId = useId();
  const cats = useMemo(() => ['Todos', ...new Set(presets.map((p) => p.category))], [presets]);
  const [cat, setCat] = useState('Todos'); const [q, setQ] = useState('');
  const list = presets.filter((p) => (cat === 'Todos' || p.category === cat) && p.name.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold">Movimiento de cámara</legend>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <label htmlFor={searchId} className="flex h-9 items-center gap-2 rounded-full border border-border-input bg-surface px-3 focus-within:outline focus-within:outline-2 focus-within:outline-focus">
          <Search size={14} className="text-text-muted" aria-hidden /><span className="sr-only">Buscar movimiento</span>
          <input id={searchId} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar movimiento" className="w-36 bg-transparent text-sm placeholder:text-text-subtle focus:outline-none" />
        </label>
        <div role="group" aria-label="Categoría" className="flex flex-wrap gap-1">
          {cats.map((c) => <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(c)} className={cx('h-8 rounded-full px-3 text-xs', cat === c ? 'bg-surface-active font-semibold text-text' : 'text-text-muted hover:bg-surface-hover')}>{c}</button>)}
        </div>
      </div>
      {list.length ? <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-8">{list.map((p) => <PresetCard key={p.id} p={p} name={name} checked={value === p.id} onChange={() => onChange(p.id)} />)}</div>
        : <p className="py-6 text-center text-sm text-text-muted">Ningún movimiento con «{q}».</p>}
    </fieldset>
  );
}
