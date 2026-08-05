import { useNavigate } from 'react-router-dom';

import { DataTable, type Column } from '@/components/common/DataTable';
import { GradeBadge, StatusBadge } from '@/components/common/StatusBadge';
import { useAsync } from '@/hooks/use-async';
import { dashboardService } from '@/services/dashboard-service';
import type { SignalSummary } from '@/types/domain';

const columns: Column<SignalSummary>[] = [
  {
    key: 'grade',
    header: 'Grade',
    cell: (s) => <GradeBadge grade={s.grade} />,
    className: 'w-16',
  },
  {
    key: 'symbol',
    header: 'Symbol',
    cell: (s) => <span className="text-primary-app font-mono font-medium">{s.symbol}</span>,
  },
  {
    key: 'strategy',
    header: 'Strategy',
    cell: (s) => <span className="text-secondary-app">{s.strategy}</span>,
  },
  {
    key: 'rr',
    header: 'RR',
    cell: (s) => s.rr.toFixed(1),
    align: 'right',
  },
  {
    key: 'status',
    header: 'Status',
    cell: (s) => <StatusBadge tone={statusTone(s.status)} dot>{s.status}</StatusBadge>,
    className: 'w-28',
  },
];

function statusTone(status: SignalSummary['status']) {
  switch (status) {
    case 'Risk Review':
      return 'warning' as const;
    case 'Watch Only':
      return 'neutral' as const;
    case 'New':
      return 'info' as const;
    case 'Stale':
      return 'neutral' as const;
  }
}

export function RecentSignalsTable() {
  const signals = useAsync(() => dashboardService.getRecentSignals());
  const navigate = useNavigate();

  return (
    <section
      aria-label="Recent signals"
      className="bg-surface border-app flex flex-col rounded-lg border"
    >
      <header className="border-app flex items-center justify-between border-b px-4 py-2.5">
        <h2 className="text-primary-app text-sm font-semibold">Recent Signals</h2>
        <span className="text-muted-app text-[11px]">
          A+ · A · B+ only — no execution controls
        </span>
      </header>

      <div className="p-2">
        <DataTable
          columns={columns}
          rows={signals.data ?? []}
          rowKey={(s) => s.id}
          state={signals.state}
          error={signals.error}
          emptyTitle="No recent signals"
          emptyDescription="Signals graded below B+ are excluded from this view."
          onRetry={signals.reload}
          onRowClick={() => navigate('/app/signals')}
          mobileCard={(s) => (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <GradeBadge grade={s.grade} />
                <StatusBadge tone={statusTone(s.status)} dot>
                  {s.status}
                </StatusBadge>
              </div>
              <div className="text-primary-app font-mono text-sm font-medium">{s.symbol}</div>
              <div className="text-muted-app text-xs">{s.strategy}</div>
              <div className="text-secondary-app text-xs">
                RR <span className="font-mono">{s.rr.toFixed(1)}</span>
              </div>
            </div>
          )}
        />
      </div>
    </section>
  );
}
