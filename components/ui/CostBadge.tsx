import Link from 'next/link';
import { Coins } from 'lucide-react';
import { cx } from './cx';
export function CostBadge({ cost, balance }: { cost: number; balance: number }) {
  const short = cost > balance; const low = !short && balance - cost < balance * 0.1;
  return (
    <p aria-live="polite" className={cx('flex flex-wrap items-center gap-x-2 gap-y-1 text-sm', short ? 'text-danger' : low ? 'text-warning' : 'text-text-muted')}>
      <Coins size={16} aria-hidden />
      <span className="tabular">Cuesta <strong className="text-text">{cost}</strong> créditos · te quedan {balance}</span>
      {short && <Link href="/planes" className="font-semibold underline underline-offset-2">Comprar créditos</Link>}
    </p>
  );
}
