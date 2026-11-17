import { Check } from 'lucide-react';
import { Button } from './Button';
import { cx } from './cx';
export type Plan = { id: string; name: string; priceEur: number; credits: number; videosApprox: number; features: string[]; recommended?: boolean };
export function PlanCard({ plan, current, onChoose }: { plan: Plan; current?: boolean; onChoose: () => void }) {
  return (
    <section aria-labelledby={`plan-${plan.id}`} className={cx('relative flex flex-col gap-3 rounded-xl border bg-surface p-5', plan.recommended ? 'border-accent' : 'border-border')}>
      {plan.recommended && <span className="absolute -top-3 left-5 rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-on-accent">Recomendado</span>}
      <h3 id={`plan-${plan.id}`} className="text-lg font-semibold">{plan.name}</h3>
      <p><span className="text-xl font-bold tabular">{plan.priceEur} €</span><span className="text-text-muted"> al mes</span></p>
      <p className="text-sm text-text-muted"><span className="tabular text-text">{plan.credits}</span> créditos al mes · unos {plan.videosApprox} vídeos de 5 s</p>
      <ul className="flex flex-col gap-1.5 text-sm">{plan.features.map((f) => <li key={f} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-success" aria-hidden />{f}</li>)}</ul>
      <Button variant={plan.recommended ? 'primary' : 'secondary'} className="mt-auto" disabled={current} onClick={onChoose}>{current ? 'Tu plan' : `Elegir ${plan.name}`}</Button>
    </section>
  );
}
