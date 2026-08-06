import type { ReactNode } from 'react';

export function Surface({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-slate-700/70 bg-slate-900/70 shadow-[0_18px_55px_rgba(2,8,23,0.24)] ${className}`}>
      {children}
    </section>
  );
}

export function SurfaceHeader({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
        <p className="mt-1 text-xs text-slate-400">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function StatusChip({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'good' | 'warn' | 'bad' | 'info' }) {
  const tones = {
    neutral: 'border-slate-700 bg-slate-800/70 text-slate-300',
    good: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    warn: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    bad: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
    info: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
  } as const;

  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${tones[tone]}`}>{children}</span>;
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center px-6 py-10 text-center">
      <div className="mb-4 h-12 w-12 rounded-2xl border border-sky-500/20 bg-sky-500/10 shadow-[0_0_32px_rgba(14,165,233,0.12)]" />
      <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
      <p className="mt-2 max-w-xl text-xs leading-5 text-slate-400">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function MetricCard({ label, value, detail, tone = 'neutral' }: { label: string; value: string; detail: string; tone?: 'neutral' | 'good' | 'warn' | 'info' }) {
  const accent = {
    neutral: 'text-slate-100',
    good: 'text-emerald-300',
    warn: 'text-amber-300',
    info: 'text-sky-300',
  } as const;

  return (
    <div className="rounded-xl border border-slate-700/70 bg-gradient-to-br from-slate-900 to-slate-950 p-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className={`mt-3 text-2xl font-semibold ${accent[tone]}`}>{value}</p>
      <p className="mt-1 text-xs text-slate-400">{detail}</p>
    </div>
  );
}

export const primaryButton = 'inline-flex items-center justify-center rounded-lg border border-sky-500/40 bg-sky-500/10 px-3.5 py-2 text-xs font-medium text-sky-200 transition hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-50';
export const secondaryButton = 'inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800';
export const controlClass = 'h-9 rounded-lg border border-slate-700 bg-slate-950/80 px-3 text-xs text-slate-300 outline-none transition focus:border-sky-500/60';
