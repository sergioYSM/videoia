'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Coins, CreditCard, LayoutGrid, Wand2, Wallet } from 'lucide-react';
import { cx } from './cx';
const NAV = [{ href: '/crear', label: 'Crear', icon: Wand2 }, { href: '/galeria', label: 'Galería', icon: LayoutGrid }, { href: '/creditos', label: 'Créditos', icon: Wallet }, { href: '/planes', label: 'Planes', icon: CreditCard }];
export function AppShell({ balance, children }: { balance: number; children: React.ReactNode }) {
  const path = usePathname();
  const items = NAV.map((n) => { const on = path.startsWith(n.href); const I = n.icon; return { ...n, on, I }; });
  return (
    <div className="min-h-screen md:pl-sidebar">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:text-on-accent">Saltar al contenido</a>
      <aside className="fixed inset-y-0 left-0 hidden w-sidebar flex-col gap-1 border-r border-border bg-surface p-3 md:flex">
        <Link href="/" className="mb-4 px-3 py-2 text-lg font-bold">videoia</Link>
        <nav aria-label="Principal" className="flex flex-col gap-1">
          {items.map(({ href, label, on, I }) => <Link key={href} href={href} aria-current={on ? 'page' : undefined} className={cx('flex h-10 items-center gap-3 rounded-md px-3 text-sm', on ? 'bg-surface-active font-semibold text-text' : 'text-text-muted hover:bg-surface-hover hover:text-text')}><I size={18} aria-hidden />{label}</Link>)}
        </nav>
      </aside>
      <header className="sticky top-0 z-30 flex h-topbar items-center justify-between gap-2 border-b border-border bg-bg/90 px-4 backdrop-blur">
        <span className="font-bold md:hidden">videoia</span>
        <Link href="/creditos" className="ml-auto flex h-9 items-center gap-2 rounded-full bg-surface-raised px-3 text-sm hover:bg-surface-hover" aria-label={`Tienes ${balance} créditos`}><Coins size={16} className="text-accent" aria-hidden /><span className="tabular font-semibold">{balance}</span></Link>
      </header>
      <main id="main" className="mx-auto max-w-content px-4 py-6 pb-24 md:pb-6">{children}</main>
      <nav aria-label="Principal" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-border bg-surface md:hidden">
        {items.map(({ href, label, on, I }) => <Link key={href} href={href} aria-current={on ? 'page' : undefined} className={cx('flex h-14 flex-col items-center justify-center gap-0.5 text-xs', on ? 'text-text' : 'text-text-muted')}><I size={20} aria-hidden />{label}</Link>)}
      </nav>
    </div>
  );
}
