import { useAsync } from '@/hooks/use-async';
import { dashboardService } from '@/services/dashboard-service';
import { KpiCard } from '@/components/common/KpiCard';

export function KpiRow() {
  const summary = useAsync(() => dashboardService.getSummary());

  if (summary.state === 'success' && summary.data) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summary.data.kpis.map((kpi) => (
          <KpiCard key={kpi.id} data={kpi} state={summary.state} error={summary.error} />
        ))}
      </div>
    );
  }

  // Loading / error / empty: render four shells so layout stays stable.
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <KpiCard key={i} data={null} state={summary.state} error={summary.error} />
      ))}
    </div>
  );
}
