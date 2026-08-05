import { ArrowRight, ArrowDown, ArrowUp, Minus, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import type { LoadingState } from '@/types/domain';
import type { KpiCardData } from '@/types/domain';

const trendIcon = {
  up: ArrowUp,
  down: ArrowDown,
  flat: Minus,
};

const trendColor = {
  up: 'var(--success)',
  down: 'var(--critical)',
  flat: 'var(--text-muted)',
};

interface KpiCardProps {
  data: KpiCardData | null;
  state: LoadingState;
  error?: string | null;
}

export function KpiCard({ data, state, error }: KpiCardProps) {
  const navigate = useNavigate();

  if (state === 'loading') {
    return <KpiShell><Skeleton className="h-full w-full" /></KpiShell>;
  }

  if (state === 'error') {
    return (
      <KpiShell>
        <div className="flex h-full flex-col items-start justify-between gap-2 p-4">
          <div className="text-muted-app text-xs">—</div>
          <div className="text-primary-app text-sm font-semibold">Unavailable</div>
          <div className="text-[var(--critical)] flex items-center gap-1.5 text-xs">
            <AlertCircle className="h-3.5 w-3.5" />
            <span className="truncate">{error ?? 'Failed to load'}</span>
          </div>
        </div>
      </KpiShell>
    );
  }

  if (state === 'empty' || !data) {
    return (
      <KpiShell>
        <div className="flex h-full flex-col items-start justify-center gap-1 p-4">
          <div className="text-muted-app text-xs">—</div>
          <div className="text-muted-app text-sm">No data</div>
        </div>
      </KpiShell>
    );
  }

  const TrendIcon = data.trend ? trendIcon[data.trend] : undefined;
  const trendCol = data.trend ? trendColor[data.trend] : undefined;

  return (
    <KpiShell>
      <button
        type="button"
        onClick={() => navigate(data.href)}
        className="group flex h-full w-full flex-col items-start justify-between gap-2 p-4 text-left transition-colors hover:bg-hover-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--simulation)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-surface)]"
        aria-label={`${data.label}: ${data.value}. ${data.status}. Open details.`}
      >
        <div className="flex w-full items-center justify-between">
          <span className="text-muted-app text-[11px] font-medium uppercase tracking-wide">
            {data.label}
          </span>
          <ArrowRight className="text-muted-app h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-primary-app font-mono text-xl font-semibold tracking-tight">
            {data.value}
          </span>
          {TrendIcon && (
            <TrendIcon className="h-4 w-4" style={{ color: trendCol }} aria-hidden />
          )}
        </div>
        <div className="text-secondary-app w-full text-xs">{data.status}</div>
        <div className="text-muted-app font-mono w-full truncate text-[10px]">{data.source}</div>
      </button>
    </KpiShell>
  );
}

function KpiShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'bg-surface border-app overflow-hidden rounded-lg border',
      )}
    >
      {children}
    </div>
  );
}
