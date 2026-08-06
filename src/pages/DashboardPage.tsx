import { PageHeader } from '@/components/common/PageHeader';
import { MetricCard } from '@/components/common/OperationalPage';
import { KpiRow } from '@/components/dashboard/KpiRow';
import { EquityChartSection } from '@/components/dashboard/EquityChartSection';
import { RecentSignalsTable } from '@/components/dashboard/RecentSignalsTable';
import { RequiredActionsSection } from '@/components/dashboard/RequiredActionsSection';
import { useApiResource } from '@/hooks/useApiResource';
import { api, backendBaseUrl } from '@/lib/api';

export function DashboardPage() {
  const summary = useApiResource(api.dashboardSummary, Boolean(backendBaseUrl));
  const data = summary.data;

  return (
    <>
      <PageHeader title="Dashboard" description={summary.state === 'success' ? 'Verified research and market-data aggregates.' : 'Offline research & local paper simulation overview.'} />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Approved datasets" value={data ? String(data.datasets.approved) : '—'} detail={summary.error ?? 'Backend aggregate'} />
        <MetricCard label="Validated rows" value={data ? data.datasets.validatedRows.toLocaleString() : '—'} detail="Approved registry rows" tone="info" />
        <MetricCard label="Active symbols" value={data ? String(data.marketData.activeSymbols) : '—'} detail={data?.marketData.lastTickerAt ? `Ticker ${new Date(data.marketData.lastTickerAt).toLocaleString()}` : 'No ticker timestamp'} />
        <MetricCard label="Simulation" value={data?.simulation.available ? 'Available' : 'Unavailable'} detail={data?.simulation.reason ?? (summary.state === 'loading' ? 'Loading summary' : 'No verified response')} tone={data?.simulation.available ? 'info' : 'warn'} />
      </div>

      <div className="mt-4"><KpiRow /></div>
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8"><EquityChartSection /></div>
        <div className="lg:col-span-4"><RequiredActionsSection /></div>
      </div>
      <div className="mt-4"><RecentSignalsTable /></div>
    </>
  );
}
