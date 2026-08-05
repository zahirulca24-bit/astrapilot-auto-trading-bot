import { useState } from 'react';
import { Database, RotateCw } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { EquityChart } from './EquityChart';
import { useAsync } from '@/hooks/use-async';
import { dashboardService } from '@/services/dashboard-service';
import type { TimeRange } from '@/types/domain';

const RANGES: TimeRange[] = ['1D', '1W', '1M', '3M', 'ALL'];

export function EquityChartSection() {
  const [range, setRange] = useState<TimeRange>('1M');
  const portfolio = useAsync(() => dashboardService.getPortfolio(range), [range]);

  return (
    <section
      aria-label="Equity and drawdown chart"
      className="bg-surface border-app flex flex-col rounded-lg border"
    >
      <header className="border-app flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5">
        <div className="flex items-center gap-2">
          <h2 className="text-primary-app text-sm font-semibold">Equity &amp; Drawdown</h2>
          <span className="text-muted-app bg-elevated inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px]">
            <Database className="h-3 w-3" />
            {portfolio.data?.source ?? '—'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-elevated flex items-center rounded-md border border-app p-0.5">
            {RANGES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                aria-pressed={range === r}
                className={cn(
                  'rounded px-2 py-0.5 text-xs font-medium transition-colors',
                  range === r
                    ? 'bg-hover-surface text-primary-app'
                    : 'text-muted-app hover:text-secondary-app',
                )}
              >
                {r}
              </button>
            ))}
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Reload chart"
            onClick={portfolio.reload}
            className="text-muted-app hover:text-primary-app hover:bg-hover-surface h-7 w-7"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </header>

      <div className="relative p-2">
        {portfolio.data && (
          <div
            className="text-muted-app pointer-events-none absolute right-4 top-4 z-10 select-none text-[10px] font-semibold uppercase tracking-widest opacity-30"
            aria-hidden
          >
            {portfolio.data.watermark}
          </div>
        )}
        <EquityChart
          equitySeries={portfolio.data?.equitySeries ?? []}
          drawdownSeries={portfolio.data?.drawdownSeries ?? []}
          state={portfolio.state}
          error={portfolio.error}
          onRetry={portfolio.reload}
        />
      </div>

      <footer className="border-app text-muted-app flex items-center justify-between border-t px-4 py-1.5 text-[11px]">
        <span className="flex items-center gap-3">
          <LegendDot color="var(--simulation)" label="Equity" />
          <LegendDot color="var(--critical)" label="Drawdown" />
        </span>
        <span className="font-mono">{range}</span>
      </footer>
    </section>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} aria-hidden />
      {label}
    </span>
  );
}
