export function EmptyState({ icon, title, help, action }: { icon: React.ReactNode; title: string; help: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border px-6 py-12 text-center">
      <span className="text-text-muted" aria-hidden>{icon}</span>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="max-w-sm text-sm text-text-muted">{help}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
