import { cx } from './cx';
export type LedgerRow = { id: string; at: string; reason: 'plan_grant' | 'purchase' | 'generation' | 'refund' | 'adjustment'; delta: number; balanceAfter: number; note?: string };
const LABEL = { plan_grant: 'Plan mensual', purchase: 'Compra', generation: 'Vídeo', refund: 'Devolución', adjustment: 'Ajuste' };
export function LedgerTable({ rows, loading }: { rows: LedgerRow[]; loading?: boolean }) {
  return (
    <table className="w-full text-left text-sm">
      <caption className="mb-2 text-left text-base font-semibold">Movimientos de créditos</caption>
      <thead className="text-xs text-text-muted"><tr className="border-b border-border"><th scope="col" className="py-2 font-medium">Fecha</th><th scope="col" className="font-medium">Concepto</th><th scope="col" className="text-right font-medium">Créditos</th><th scope="col" className="text-right font-medium">Saldo</th></tr></thead>
      <tbody>
        {loading ? Array.from({ length: 3 }, (_, i) => <tr key={i}><td colSpan={4} className="py-2"><span className="skeleton block h-5 rounded-sm" /></td></tr>)
          : rows.length === 0 ? <tr><td colSpan={4} className="py-6 text-center text-text-muted">Aún no hay movimientos.</td></tr>
          : rows.map((r) => (
            <tr key={r.id} className="border-b border-border last:border-0">
              <td className="tabular py-2 text-text-muted">{new Date(r.at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
              <td>{LABEL[r.reason]}{r.note && <span className="text-text-muted"> · {r.note}</span>}</td>
              <td className={cx('tabular text-right', r.delta > 0 ? 'text-success' : 'text-text')}>{r.delta > 0 ? `+${r.delta}` : `−${-r.delta}`}</td>
              <td className="tabular text-right text-text-muted">{r.balanceAfter}</td>
            </tr>
          ))}
      </tbody>
    </table>
  );
}
