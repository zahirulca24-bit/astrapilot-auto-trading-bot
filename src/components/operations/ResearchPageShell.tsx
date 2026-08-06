import type { ReactNode } from 'react';

import { PageHeader } from '@/components/common/PageHeader';

type Metric = { label: string; value: string; detail: string };

type ResearchPageShellProps = {
  title: string;
  description: string;
  metrics: Metric[];
  controls: ReactNode;
  panelTitle: string;
  panelDescription: string;
  columns: string[];
  footer?: ReactNode;
  content?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
};

export function ResearchPageShell({
  title,
  description,
  metrics,
  controls,
  panelTitle,
  panelDescription,
  columns,
  footer,
  content,
  emptyTitle = 'No verified records available',
  emptyDescription = 'This screen is connected to the approved workflow, but its backend contract is not connected yet. Records appear only after the relevant service and validated data are available.',
}: ResearchPageShellProps) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <section key={metric.label} className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">{metric.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-100">{metric.value}</p>
            <p className="mt-1 text-xs text-slate-400">{metric.detail}</p>
          </section>
        ))}
      </div>

      <section className="mt-4 rounded-xl border border-slate-800 bg-slate-900/55 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">{panelTitle}</h2>
            <p className="mt-1 text-xs text-slate-400">{panelDescription}</p>
          </div>
          <div className="flex flex-wrap gap-2">{controls}</div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-lg border border-slate-800">
          <div className="grid min-w-[760px] bg-slate-950/65 px-4 py-3" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(120px, 1fr))` }}>
            {columns.map((column) => <span key={column} className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{column}</span>)}
          </div>
          {content ?? (
            <div className="flex min-h-48 min-w-[760px] items-center justify-center bg-slate-900/45 px-6 py-10 text-center">
              <div>
                <p className="text-sm font-medium text-slate-200">{emptyTitle}</p>
                <p className="mx-auto mt-2 max-w-xl text-xs leading-5 text-slate-400">{emptyDescription}</p>
              </div>
            </div>
          )}
        </div>
        {footer ? <div className="mt-4">{footer}</div> : null}
      </section>
    </>
  );
}

export function FilterButton({ children, primary = false, disabled = true, onClick }: { children: ReactNode; primary?: boolean; disabled?: boolean; onClick?: () => void }) {
  const enabledClass = primary
    ? 'bg-blue-500 text-white hover:bg-blue-400'
    : 'border border-slate-700 bg-slate-950/60 text-slate-300 hover:border-slate-600';
  const disabledClass = 'cursor-not-allowed border border-slate-800 bg-slate-950/30 text-slate-600';

  return (
    <button
      type="button"
      disabled={disabled}
      aria-disabled={disabled}
      onClick={onClick}
      title={disabled ? 'Unavailable until the required backend contract is connected' : undefined}
      className={`rounded-lg px-3 py-2 text-xs font-semibold ${disabled ? disabledClass : enabledClass}`}
    >
      {children}
    </button>
  );
}
